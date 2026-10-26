require("dotenv").config();
const express = require("express");
const axios = require("axios");
const {
  SYSTEM_PROMPT,
  SAFETY_RESOURCES_BY_LANG,
  containsCrisisKeyword,
  getAIReply,
} = require("./bot-logic");
const { getCommand } = require("./commands");
const { verifySignature } = require("./security");
const { createRateLimiter } = require("./limits");
const { pruneIdle } = require("./sessions");

const {
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID,
  VERIFY_TOKEN,
  APP_SECRET,
  STAFF_WHATSAPP,
  STAFF_TEMPLATE_NAME,
  STAFF_TEMPLATE_LANG = "en",
  WHATSAPP_API_BASE = "https://graph.facebook.com/v20.0",
  ALLOW_UNSIGNED_WEBHOOKS,
  PORT = 3000,
} = process.env;

// Fail closed: without APP_SECRET we cannot tell Meta's messages from anyone
// else's, so refuse to start. For local testing only, set
// ALLOW_UNSIGNED_WEBHOOKS=true to skip the signature check.
const allowUnsigned = ALLOW_UNSIGNED_WEBHOOKS === "true";
if (!APP_SECRET && !allowUnsigned) {
  console.error(
    "APP_SECRET is not set. Add it in your host's environment settings (Render), " +
      "or set ALLOW_UNSIGNED_WEBHOOKS=true for local testing only.",
  );
  process.exit(1);
}

const app = express();
// Keep an exact copy of each incoming message so we can check Meta's signature.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

// Key constants
const conversations = {}; // chat history for each learner
const hasGreeted = {}; // learners we've already greeted
const languagePrefs = {}; // each learner's chosen language, e.g. "xh"
const lastSeen = {}; // when each learner last sent a message
const sessionEnded = {}; // learners who tapped "End chat"

// At most 30 typed messages per person in any 10 minutes. Buttons, commands and
// anything mentioning a crisis are never limited, so nobody in trouble is cut off.
const limiter = createRateLimiter({ max: 30, windowMs: 10 * 60 * 1000 });
setInterval(() => limiter.prune(), 10 * 60 * 1000).unref();

// If a learner is quiet for this long, their next message starts a new chat.
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// Quiet learners are cleared out of memory: chat messages after 30 minutes,
// everything else (language choice, phone number) after 24 hours.
const FORGET_AFTER_MS = 24 * 60 * 60 * 1000;
setInterval(
  () =>
    pruneIdle(
      { conversations, hasGreeted, languagePrefs, lastSeen, sessionEnded },
      Date.now(),
      { chatTimeoutMs: SESSION_TIMEOUT_MS, forgetAfterMs: FORGET_AFTER_MS },
    ),
  5 * 60 * 1000,
).unref();

// WhatsApp sometimes sends the same message twice. Remember recent message IDs so we only reply once.
const seenMessageIds = new Map();
const MAX_SEEN_MESSAGE_IDS = 1000;

function isDuplicateMessage(messageId) {
  if (!messageId) return false;
  if (seenMessageIds.has(messageId)) return true;
  seenMessageIds.set(messageId, true);
  if (seenMessageIds.size > MAX_SEEN_MESSAGE_IDS) {
    seenMessageIds.delete(seenMessageIds.keys().next().value);
  }
  return false;
}

// Language
const LANGUAGES = {
  en: "English",
  af: "Afrikaans",
  nso: "Sepedi",
  xh: "isiXhosa",
};

// Button text
const TEXT = {
  en: {
    chooseButton: "Choose language",
    welcome:
      'Great, we\'ll chat in English. 👋\n\nI\'m here to help with cyberbullying and online scams. Tell me what\'s going on in your own words, or tap a button below.\n\nYou can type "menu", "change language" or "talk to a person" any time.',
    menu: "What would you like help with? Tap a button, or just type your question.",
    btnCheck: "Check a message",
    btnBullying: "Bullying help",
    btnHelp: "Get help now",
    checkPrompt:
      "Copy and paste the message you're unsure about (or type what it said), and I'll help you check if it's a scam.",
    bullyingQuestion: "Someone is bullying me online. Can you help me?",
    textOnly:
      'Sorry, I can only read typed messages for now. Please type your question, or type "menu".',
    restart:
      "Okay, let's start fresh. I won't use anything from our earlier chat.",
    handoffAsk:
      "I can ask someone from C3SA to contact you on this WhatsApp number. They aren't available 24/7, so if you're in danger right now, tap Get help now.\n\nShould they contact you?",
    btnYes: "Yes, contact me",
    btnNo: "No thanks",
    handoffDone:
      "Thank you. Someone from C3SA will contact you. You can keep chatting with me in the meantime.",
    handoffFailed:
      "I couldn't reach the C3SA team just now, so no one has been told yet. If you need help right away, tap Get help now or call Childline on 116 (free, 24/7). You can also try again a bit later.",
    handoffNo:
      'No problem. I\'m still here if you want to chat. Type "menu" any time.',
    error:
      "Sorry, I'm having trouble replying right now. Please try again in a moment.",
    btnMenu: "Menu",
    btnEnd: "End chat",
    welcomeBack:
      "Welcome back! 👋 What would you like help with? Tap a button, or just type your question.",
    rateLimited:
      "You're sending messages very quickly, so I need to pause for a few minutes. If you're in danger right now, tap Get help now or call Childline on 116 (free, 24/7).",
    goodbye:
      "Thanks for chatting. 💛 Our chat has ended and I've cleared it. If you need anything, just send a message to start again.\n\nIf you're ever in danger, call Childline on 116 (free, 24/7).",
  },
  af: {
    chooseButton: "Kies taal",
    welcome:
      'Welkom, ons gesels in Afrikaans. 👋\n\nEk is hier om jou te help met kuberboelie en aanlyn-swendelary. Vertel my in jou eie woorde wat aangaan, of tik op \'n knoppie hieronder.\n\nJy kan enige tyd "spyskaart", "verander taal" of "praat met iemand" tik.',
    menu: "Waarmee wil jy hulp hê? Tik op 'n knoppie, of tik net jou vraag.",
    btnCheck: "Kyk na 'n boodskap",
    btnBullying: "Hulp met boelie",
    btnHelp: "Kry nou hulp",
    checkPrompt:
      "Kopieer en plak die boodskap waaroor jy onseker is (of tik wat dit gesê het), en ek sal jou help kyk of dit 'n swendelary is.",
    bullyingQuestion: "Iemand boelie my aanlyn. Kan jy my help?",
    textOnly:
      'Jammer, ek kan nog net getikte boodskappe lees. Tik asseblief jou vraag, of tik "spyskaart".',
    restart:
      "Reg, ons begin van voor af. Ek sal niks van ons vorige gesprek gebruik nie.",
    handoffAsk:
      "Ek kan iemand van C3SA vra om jou op hierdie WhatsApp-nommer te kontak. Hulle is nie 24/7 beskikbaar nie, so as jy nou in gevaar is, tik op Kry nou hulp.\n\nMoet hulle jou kontak?",
    btnYes: "Ja, kontak my",
    btnNo: "Nee dankie",
    handoffDone:
      "Dankie. Iemand van C3SA sal jou kontak. Jy kan intussen verder met my gesels.",
    handoffFailed:
      "Ek kon nie nou by die C3SA-span uitkom nie, so niemand is nog ingelig nie. As jy dadelik hulp nodig het, tik op Kry nou hulp of bel Childline by 116 (gratis, 24/7). Jy kan ook later weer probeer.",
    handoffNo:
      'Geen probleem nie. Ek is steeds hier as jy wil gesels. Tik enige tyd "spyskaart".',
    error:
      "Jammer, ek sukkel nou om te antwoord. Probeer asseblief weer oor 'n rukkie.",
    btnMenu: "Spyskaart",
    btnEnd: "Beëindig gesprek",
    welcomeBack:
      "Welkom terug! 👋 Waarmee wil jy hulp hê? Tik op 'n knoppie, of tik net jou vraag.",
    rateLimited:
      "Jy stuur boodskappe baie vinnig, so ek moet vir 'n paar minute stilhou. As jy nou in gevaar is, tik op Kry nou hulp of bel Childline by 116 (gratis, 24/7).",
    goodbye:
      "Dankie dat jy met my gesels het. 💛 Ons gesprek is verby en ek het dit uitgevee. Stuur net 'n boodskap as jy weer hulp nodig het.\n\nAs jy ooit in gevaar is, bel Childline by 116 (gratis, 24/7).",
  },
  nso: {
    chooseButton: "Kgetha polelo",
    welcome:
      'Go lokile, re tla bolela ka Sepedi. 👋\n\nKe fa go go thuša ka go tshwenywa inthaneteng (cyberbullying) le bomenetša bja inthaneteng (scams). Mpotše seo se diregago ka mantšu a gago, goba o kgotle konopo ye e lego ka fase.\n\nO ka ngwala "menyu", "fetola polelo" goba "bolela le motho" nako efe goba efe.',
    menu: "O nyaka thušo ka eng? Kgotla konopo, goba o ngwale potšišo ya gago.",
    btnCheck: "Lekola molaetša",
    btnBullying: "Ke a tshwenywa",
    btnHelp: "Hwetša thušo bjale",
    checkPrompt:
      "Kopiša o kgomaretše molaetša wo o sa o kwešišego gabotse (goba o ngwale seo o se bolelago), ke tla go thuša go lekola ge e le bomenetša.",
    bullyingQuestion:
      "Go na le motho yo a ntshwenyago inthaneteng. O ka nthuša?",
    textOnly:
      'Tshwarelo, gabjale ke kgona go bala fela melaetša ye e ngwadilwego. Hle ngwala potšišo ya gago, goba o ngwale "menyu".',
    restart:
      "Go lokile, a re thome gape. Nka se šomiše selo go tšwa poledišanong ya rena ya pele.",
    handoffAsk:
      "Nka kgopela motho wa C3SA gore a ikgokaganye le wena go nomoro ye ya WhatsApp. Ga ba hwetšagale diiri tše 24 ka letšatši, ka gona ge o le kotsing bjale, kgotla Hwetša thušo bjale.\n\nNa ba ikgokaganye le wena?",
    btnYes: "Ee, ka kgopelo",
    btnNo: "Aowa, ke a leboga",
    handoffDone:
      "Ke a leboga. Motho wa C3SA o tla ikgokaganya le wena. O ka tšwela pele o bolela le nna ka nako ye.",
    handoffFailed:
      "Ga ke a kgona go fihla sehlopha sa C3SA ga bjale, ka gona ga go yo a tsebišitšwego. Ge o hloka thušo ka pela, kgotla Hwetša thušo bjale goba o letšetše Childline go 116 (mahala, 24/7). O ka leka gape ka morago.",
    handoffNo:
      'Ga go na bothata. Ke sa le fa ge o nyaka go bolela. Ngwala "menyu" nako efe goba efe.',
    error:
      "Tshwarelo, ke na le bothata bja go araba gabjale. Hle leka gape ka morago ga nakwana.",
    btnMenu: "Menyu",
    btnEnd: "Fetša poledišano",
    welcomeBack:
      "O amogelwa gape! 👋 O nyaka thušo ka eng? Kgotla konopo, goba o ngwale potšišo ya gago.",
    rateLimited:
      "O romela melaetša ka lebelo kudu, ka gona ke swanetše go ema metsotso e se mekae. Ge o le kotsing bjale, kgotla Hwetša thušo bjale goba o letšetše Childline go 116 (mahala, 24/7).",
    goodbye:
      "Ke a leboga ge o boletše le nna. 💛 Poledišano ya rena e fedile gomme ke e phumotše. Ge o nyaka thušo gape, romela molaetša fela.\n\nGe o ka ba kotsing, letšetša Childline go 116 (mahala, 24/7).",
  },
  xh: {
    chooseButton: "Khetha ulwimi",
    welcome:
      'Kulungile, siza kuncokola ngesiXhosa. 👋\n\nNdilapha ukukunceda ngokuxhatshazwa kwi-intanethi (cyberbullying) nobuqhophololo kwi-intanethi (scams). Ndixelele okwenzekayo ngamazwi akho, okanye ucofe iqhosha elingezantsi.\n\nUngabhala "imenyu", "tshintsha ulwimi" okanye "thetha nomntu" nangaliphi na ixesha.',
    menu: "Ufuna uncedo ngantoni? Cofa iqhosha, okanye ubhale umbuzo wakho.",
    btnCheck: "Jonga umyalezo",
    btnBullying: "Ndiyaxhatshazwa",
    btnHelp: "Fumana uncedo ngoku",
    checkPrompt:
      "Khuphela uncamathisele umyalezo ongaqinisekanga ngawo (okanye ubhale ukuba wawuthini), ndiza kukunceda ujonge ukuba bubuqhophololo na.",
    bullyingQuestion: "Kukho umntu ondixhaphazayo kwi-intanethi. Ungandinceda?",
    textOnly:
      'Uxolo, okwangoku ndikwazi ukufunda kuphela imiyalezo ebhaliweyo. Nceda ubhale umbuzo wakho, okanye ubhale "imenyu".',
    restart:
      "Kulungile, masiqale kwakhona. Andizukusebenzisa nto kwincoko yethu yangaphambili.",
    handoffAsk:
      "Ndingacela umntu waseC3SA ukuba aqhagamshelane nawe kule nombolo ye-WhatsApp. Abafumaneki iiyure ezingama-24 yonke imihla, ngoko ukuba usengozini ngoku, cofa Fumana uncedo ngoku.\n\nNgaba bafanele baqhagamshelane nawe?",
    btnYes: "Ewe, ndiqhagamshele",
    btnNo: "Hayi, enkosi",
    handoffDone:
      "Enkosi. Umntu waseC3SA uza kuqhagamshelana nawe. Ungaqhubeka uncokola nam okwangoku.",
    handoffFailed:
      "Andikwazanga ukufikelela iqela le-C3SA ngoku, ngoko akukho mntu ulwazisiweyo okwangoku. Ukuba ufuna uncedo ngokukhawuleza, cofa Fumana uncedo ngoku okanye utsalele iChildline ku-116 (simahla, 24/7). Unokuzama kwakhona kamva.",
    handoffNo:
      'Akukho ngxaki. Ndisekhona ukuba ufuna ukuncokola. Bhala "imenyu" nangaliphi na ixesha.',
    error:
      "Uxolo, ndinengxaki yokuphendula ngoku. Nceda uzame kwakhona emva kwexeshana.",
    btnMenu: "Imenyu",
    btnEnd: "Gqiba incoko",
    welcomeBack:
      "Wamkelekile kwakhona! 👋 Ufuna uncedo ngantoni? Cofa iqhosha, okanye ubhale umbuzo wakho.",
    rateLimited:
      "Uthumela imiyalezo ngokukhawuleza kakhulu, ngoko kufuneka ndime imizuzu embalwa. Ukuba usengozini ngoku, cofa Fumana uncedo ngoku okanye utsalele iChildline ku-116 (simahla, 24/7).",
    goodbye:
      "Enkosi ngokuncokola nam. 💛 Incoko yethu iphelile kwaye ndiyicimile. Ukuba ufuna uncedo kwakhona, thumela nje umyalezo.\n\nUkuba ukhe usengozini, tsalela iChildline ku-116 (simahla, 24/7).",
  },
};

// The first message, before we know their language, greets them in all four.
const CHOOSE_LANGUAGE_TEXT =
  "Hi! Hallo! Thobela! Molo! 👋\nI'm CyberBot. Which language would you like to chat in?";

// Get a sentence in the learner's language (English if they haven't chosen).
function t(from, key) {
  const lang = languagePrefs[from] || "en";
  return TEXT[lang][key];
}

// Save the learner's language and tell the AI to use it.
function setLanguage(from, code) {
  languagePrefs[from] = code;
  const name = LANGUAGES[code];
  const prompt = `${SYSTEM_PROMPT}\n\nThe learner chose ${name}. Reply in ${name} by default, but if they write in another language, reply in that language.`;
  if (!conversations[from])
    conversations[from] = [{ role: "system", content: prompt }];
  else conversations[from][0] = { role: "system", content: prompt };
}

// Forget the chat history but keep the learner's language.
function clearChat(from) {
  delete conversations[from];
  if (languagePrefs[from]) setLanguage(from, languagePrefs[from]);
}

// ---------- Checking messages really come from WhatsApp ----------
// Meta signs every real message with our App Secret (see security.js).
// We reject anything else.
function isFromMeta(req) {
  if (!APP_SECRET) return allowUnsigned; // local testing only
  return verifySignature(
    req.rawBody,
    req.get("x-hub-signature-256"),
    APP_SECRET,
  );
}

// ---------- Sending messages ----------
async function callWhatsApp(payload) {
  await axios.post(
    `${WHATSAPP_API_BASE}/${PHONE_NUMBER_ID}/messages`,
    { messaging_product: "whatsapp", ...payload },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    },
  );
}

function sendText(to, text) {
  return callWhatsApp({ to, text: { body: text } });
}

// A pre-approved WhatsApp template message. Meta only delivers plain text to
// someone who messaged the bot in the last 24 hours, so a staff member who has
// not chatted with the bot recently can only be reached with a template.
function sendTemplate(to, name, language, bodyValues) {
  return callWhatsApp({
    to,
    type: "template",
    template: {
      name,
      language: { code: language },
      components: [
        {
          type: "body",
          parameters: bodyValues.map((value) => ({ type: "text", text: value })),
        },
      ],
    },
  });
}

// A message with up to 3 buttons underneath.
function sendButtons(to, bodyText, buttons) {
  return callWhatsApp({
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      action: {
        buttons: buttons.map((b) => ({
          type: "reply",
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  });
}

// The main menu. You can put your own text above the buttons.
function sendMenu(to, bodyText = t(to, "menu")) {
  return sendButtons(to, bodyText, [
    { id: "CHECK_MESSAGE", title: t(to, "btnCheck") },
    { id: "BULLYING", title: t(to, "btnBullying") },
    { id: "GET_HELP", title: t(to, "btnHelp") },
  ]);
}

// Send a reply with "Menu" and "End chat" buttons underneath, so the learner
// can always go back to the menu or finish. WhatsApp only allows 1024
// characters above buttons, so very long replies go as plain text.
function sendWithOptions(to, text) {
  if (text.length > 1000) return sendText(to, text);
  return sendButtons(to, text, [
    { id: "MENU", title: t(to, "btnMenu") },
    { id: "END", title: t(to, "btnEnd") },
  ]);
}

// Start a new chat: the menu if we know their language, otherwise the language picker.
function sendFreshStart(to) {
  if (languagePrefs[to]) return sendMenu(to, t(to, "welcomeBack"));
  return sendLanguageList(to);
}

// The language picker.
function sendLanguageList(to) {
  return callWhatsApp({
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: CHOOSE_LANGUAGE_TEXT },
      action: {
        button: t(to, "chooseButton"),
        sections: [
          {
            title: "Languages",
            rows: Object.entries(LANGUAGES).map(([code, name]) => ({
              id: `LANG_${code}`,
              title: name,
            })),
          },
        ],
      },
    },
  });
}

// Let a C3SA staff member know a learner wants to talk to a person.
// Returns true only if the message was really sent, so we never tell a
// learner "someone will contact you" when nobody was told.
async function notifyStaff(learnerPhone) {
  if (!STAFF_WHATSAPP) {
    console.warn(
      "A learner asked for a person, but STAFF_WHATSAPP is not set on Render.",
    );
    return false;
  }

  try {
    if (STAFF_TEMPLATE_NAME) {
      await sendTemplate(STAFF_WHATSAPP, STAFF_TEMPLATE_NAME, STAFF_TEMPLATE_LANG, [
        `+${learnerPhone}`,
      ]);
    } else {
      await sendText(
        STAFF_WHATSAPP,
        `CyberSafe bot: a learner has asked to speak to a person. Please contact them on WhatsApp: +${learnerPhone}`,
      );
    }
    return true;
  } catch (err) {
    // Log Meta's error code only (it explains the problem without the number).
    const meta = err.response?.data?.error;
    console.error(
      "Could not notify C3SA staff:",
      meta ? `code ${meta.code}: ${meta.message}` : err.message,
    );
    return false;
  }
}

// ---------- What happens for each button, list choice or typed command ----------
async function handleAction(from, action) {
  // They picked a language from the list.
  if (action.startsWith("LANG_")) {
    const code = action.slice(5);
    if (!LANGUAGES[code]) return sendLanguageList(from);
    setLanguage(from, code);
    return sendMenu(from, t(from, "welcome"));
  }

  switch (action) {
    case "MENU":
      return sendMenu(from);

    case "RESET":
      clearChat(from);
      return sendMenu(from, `${t(from, "restart")}\n\n${t(from, "menu")}`);

    case "LANGUAGE":
      return sendLanguageList(from);

    case "CHECK_MESSAGE":
      return sendText(from, t(from, "checkPrompt"));

    case "BULLYING": {
      const reply = await getAIReply(
        conversations,
        from,
        t(from, "bullyingQuestion"),
        languagePrefs[from],
      );
      return sendWithOptions(from, reply);
    }

    case "GET_HELP": {
      // Always the real emergency numbers, straight away. The AI is not involved.
      const lang = languagePrefs[from] || "en";
      return sendWithOptions(from, SAFETY_RESOURCES_BY_LANG[lang]);
    }

    case "HANDOFF":
      return sendButtons(from, t(from, "handoffAsk"), [
        { id: "HANDOFF_YES", title: t(from, "btnYes") },
        { id: "HANDOFF_NO", title: t(from, "btnNo") },
        { id: "GET_HELP", title: t(from, "btnHelp") },
      ]);

    case "HANDOFF_YES": {
      const notified = await notifyStaff(from);
      return sendText(from, t(from, notified ? "handoffDone" : "handoffFailed"));
    }

    case "HANDOFF_NO":
      return sendText(from, t(from, "handoffNo"));

    case "END":
      // Finish the chat. Their next message starts a new one.
      clearChat(from);
      sessionEnded[from] = true;
      return sendText(from, t(from, "goodbye"));

    default:
      return sendMenu(from);
  }
}

// ---------- Meta checks our webhook once during setup ----------
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// ---------- Incoming messages ----------
app.post("/webhook", async (req, res) => {
  if (!isFromMeta(req)) {
    console.warn("Blocked a message that did not come from WhatsApp");
    return res.sendStatus(401);
  }

  // Tell Meta "got it" straight away, otherwise it sends the message again.
  res.sendStatus(200);

  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return; // a delivery update, not a message
  if (isDuplicateMessage(message.id)) return;

  const from = message.from; // the learner's phone number
  const text = message.text?.body?.trim(); // what they typed
  const choice =
    message.interactive?.button_reply?.id ||
    message.interactive?.list_reply?.id; // what they tapped

  // We don't log phone numbers or messages. These are learners' private chats.
  console.log("Message received");

  try {
    // Photos, voice notes, stickers and so on.
    if (!text && !choice) {
      await sendText(from, t(from, "textOnly"));
      return;
    }

    // Slow down anyone sending typed messages very fast (see limiter above).
    if (!choice && !getCommand(text) && !containsCrisisKeyword(text)) {
      const state = limiter.check(from);
      if (state === "warn") {
        await sendText(from, t(from, "rateLimited"));
        return;
      }
      if (state === "blocked") return;
    }

    // Is this the start of a new chat? (They tapped "End chat", or were quiet for 30 minutes.)
    const now = Date.now();
    const isNewSession =
      hasGreeted[from] &&
      (sessionEnded[from] || now - (lastSeen[from] || 0) > SESSION_TIMEOUT_MS);
    lastSeen[from] = now;

    if (isNewSession) {
      sessionEnded[from] = false;
      clearChat(from);

      // They tapped a button or typed a command: just do it.
      // Otherwise, show the menu again (and answer first if they asked something).
      if (!choice && !getCommand(text)) {
        if (text.split(/\s+/).length > 2) {
          const reply = await getAIReply(
            conversations,
            from,
            text,
            languagePrefs[from],
          );
          await sendText(from, reply);
        }
        await sendFreshStart(from);
        return;
      }
    }

    // A new learner: ask which language they'd like.
    if (!hasGreeted[from]) {
      hasGreeted[from] = true;

      // They just said "hi", so only ask for their language.
      if (!choice && text.split(/\s+/).length <= 2) {
        await sendLanguageList(from);
        return;
      }

      // They asked a real question. Answer it first so nobody in trouble has
      // to wait, then ask for their language.
      if (!choice && !getCommand(text)) {
        const reply = await getAIReply(
          conversations,
          from,
          text,
          languagePrefs[from],
        );
        await sendText(from, reply);
        await sendLanguageList(from);
        return;
      }
    }

    // A button, a list choice, or a typed command.
    const action = choice || getCommand(text);
    if (action) {
      await handleAction(from, action);
      return;
    }

    // Anything else goes to the AI.
    const reply = await getAIReply(
      conversations,
      from,
      text,
      languagePrefs[from],
    );
    await sendWithOptions(from, reply);
  } catch (err) {
    console.error("Error handling message:", err.response?.data || err.message);
    // Never leave a learner with silence.
    await sendText(from, t(from, "error")).catch((sendErr) =>
      console.error(
        "Error sending the fallback message:",
        sendErr.response?.data || sendErr.message,
      ),
    );
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
