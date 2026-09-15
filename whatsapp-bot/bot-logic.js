require("dotenv").config();
const axios = require("axios");

const { GROQ_API_KEY } = process.env;

// ---------- Real resources to hand out when things look serious ----------
// Phone numbers/names (Childline, SADAG, SAPS) stay the same across languages —
// only the surrounding sentences are translated. These translations are a
// starting point; have a fluent speaker (ideally via C3SA) review them before
// this goes anywhere near real learners.
const SAFETY_RESOURCES_BY_LANG = {
  en: `
If you're in danger right now or this feels urgent, please also reach out to:
- Childline South Africa: 116 (free, 24/7)
- SADAG Suicide Crisis Line: 0800 567 567
- SAPS Crime Stop: 08600 10111
- Talk to a teacher, school counsellor, or trusted adult today, not just me.
`.trim(),
  zu: `
Uma usengozini manje noma lokhu kuzwakala kuphuthumile, sicela uxhumane nalezi:
- I-Childline South Africa: 116 (mahhala, amahora angama-24)
- I-SADAG Suicide Crisis Line: 0800 567 567
- I-SAPS Crime Stop: 08600 10111
- Khuluma nothisha, umeluleki wesikole, noma umuntu omethembayo namuhla, hhayi mina kuphela.
`.trim(),
  xh: `
Ukuba usemngciphekweni ngoku okanye oku kuvakala kungxamisekile, nceda unxibelelane nalawa:
- I-Childline South Africa: 116 (simahla, iiyure ezingama-24)
- I-SADAG Suicide Crisis Line: 0800 567 567
- I-SAPS Crime Stop: 08600 10111
- Thetha notitshala, umcebisi wesikolo, okanye umntu omthembayo namhlanje, ingekhona mna kuphela.
`.trim(),
  af: `
As jy nou in gevaar is of dit voel dringend, kontak asseblief ook:
- Childline South Africa: 116 (gratis, 24/7)
- SADAG Suicide Crisis Line: 0800 567 567
- SAPS Crime Stop: 08600 10111
- Praat vandag met 'n onderwyser, skoolberader, of iemand wat jy vertrou, nie net met my nie.
`.trim(),
  st: `
Haeba o kotsing hona jwale kapa sena se utlwahala se le potlakileng, ka kopo ikopanye le:
- Childline South Africa: 116 (mahala, dihora tse 24/7)
- SADAG Suicide Crisis Line: 0800 567 567
- SAPS Crime Stop: 08600 10111
- Bua le tichere, moeletsi wa sekolo, kapa motho eo o mo tshepang kajeno, eseng nna feela.
`.trim(),
};

// Fallback used in the system prompt (English) and as the default for the
// keyword backstop when we can't confidently guess the learner's language.
const SAFETY_RESOURCES = SAFETY_RESOURCES_BY_LANG.en;

// Very rough heuristic language detection based on a handful of common,
// distinctive words per language. Good enough to pick which translation to
// force-append; NOT a substitute for the LLM's own (better) language handling
// in normal replies.
function detectLanguage(text) {
  const lower = text.toLowerCase();
  const markers = {
    zu: [
      "ngicela",
      "ngithole",
      "umuntu",
      "ngiyaxolisa",
      "yebo",
      "kunjani",
      "ngiyakhala",
    ],
    xh: ["ndicela", "umntu", "ndiyaxolisa", "ewe", "unjani", "iintsapho"],
    af: ["asseblief", "dankie", "hulle", "wat", "kry", "vreemde", "boodskappe"],
    st: ["ka kopo", "kea leboha", "batho", "tichere", "moeletsi"],
  };
  for (const [lang, words] of Object.entries(markers)) {
    if (words.some((w) => lower.includes(w))) return lang;
  }
  return "en";
}

// ---------- Core system prompt ----------
const SYSTEM_PROMPT = `
You are a friendly, supportive chatbot built for South African learners, helping them understand and deal with cyberbullying and online scams. This is a project with C3SA (a non-profit).

Rules:
- Keep replies short, warm, and easy to read on a phone (2-4 sentences unless the user asks for more detail).
- Respond in whatever language the learner writes in (English, isiZulu, isiXhosa, Afrikaans, Sesotho, etc). If unsure, ask which language they prefer.
- Use real, concrete South African examples: SIM swap scams, fake job offer scams, WhatsApp lottery/prize scams, impersonation on social media, group chat exclusion and humiliation, etc.
- Never be preachy or lecture-y. Talk like a supportive older friend, not a textbook.
- If a learner describes something that sounds like real, ongoing bullying, abuse, threats, self-harm, or a scam they may have already fallen for, you MUST include this block at the end of your reply, TRANSLATED into the same language you're replying in (keep the phone numbers and org names like "Childline" exactly as written, only translate the surrounding sentences):
${SAFETY_RESOURCES}
- Otherwise, don't include the resources block — only show it when it's actually relevant.
- If you're not sure whether it's serious, err on the side of including the resources block.
- Never explain in detail how to carry out a scam or bullying tactic, even if asked "for research."
- If someone asks something unrelated to cyberbullying/scams/online safety (e.g. homework help, general chit-chat), gently redirect them back to your purpose.
`.trim();

// ---------- Greeting sent on a learner's first message ----------
const GREETING = `
Hi! 👋 I'm here to help you understand cyberbullying and online scams, and figure out what to do if something's happened to you.

You can just tell me what's going on, in your own words and in any language you're comfortable with. For example, you could try:
💬 "Someone is being mean to me online"
💬 "I got a weird message asking for money or my details"
💬 "How do I know if a message is a scam?"

What's on your mind?
`.trim();

// ---------- Deterministic safety keyword backstop ----------
// This fires the resources block regardless of what the LLM decides, so a
// missed judgment call by the model can't suppress real crisis resources.
// NOTE: keep this list to unambiguous, high-signal phrases to avoid firing
// on ordinary chat; extend with isiZulu/isiXhosa/Afrikaans terms once you've
// had a chance to review real conversation samples with your team/C3SA.
const CRISIS_KEYWORDS = [
  "kill myself",
  "want to die",
  "end my life",
  "suicide",
  "hurt myself",
  "self harm",
  "self-harm",
  "no reason to live",
];

function containsCrisisKeyword(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

// ---------- Call Groq (free, fast LLM) ----------
async function getAIReply(conversations, userId, userMessage) {
  if (!conversations[userId]) {
    conversations[userId] = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
    ];
  }

  conversations[userId].push({ role: "user", content: userMessage });

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "openai/gpt-oss-120b",
      messages: conversations[userId],
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  let reply = response.data.choices[0].message.content;

  // Deterministic backstop: force resources block if a crisis keyword was
  // used and the model didn't already include it. Picks the resources
  // translation matching a rough guess of the learner's language; falls
  // back to English if we can't tell.
  if (containsCrisisKeyword(userMessage) && !reply.includes("Childline")) {
    const lang = detectLanguage(userMessage);
    const resources =
      SAFETY_RESOURCES_BY_LANG[lang] || SAFETY_RESOURCES_BY_LANG.en;
    reply = `${reply}\n\n${resources}`;
  }

  conversations[userId].push({ role: "assistant", content: reply });

  // keep history from growing forever
  if (conversations[userId].length > 20) {
    conversations[userId] = [
      conversations[userId][0],
      ...conversations[userId].slice(-10),
    ];
  }

  return reply;
}

module.exports = {
  SYSTEM_PROMPT,
  GREETING,
  SAFETY_RESOURCES,
  SAFETY_RESOURCES_BY_LANG,
  CRISIS_KEYWORDS,
  containsCrisisKeyword,
  detectLanguage,
  getAIReply,
};
