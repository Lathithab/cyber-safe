require("dotenv").config();
const axios = require("axios");
const franc = require("franc");

const { GROQ_API_KEY } = process.env;

//  Emergency contacts, in each language //
const SAFETY_RESOURCES_BY_LANG = {
  en: `
If you're in danger right now or this feels urgent, please also reach out to:
- Childline South Africa: 116 (free, 24/7)
- SADAG Suicide Crisis Line: 0800 567 567
- SAPS Crime Stop: 08600 10111
- Talk to a teacher, school counsellor, or trusted adult today, not just me.
`.trim(),
  af: `
As jy nou in gevaar is of dit voel dringend, kontak asseblief ook:
- Childline South Africa: 116 (gratis, 24/7)
- SADAG Suicide Crisis Line: 0800 567 567
- SAPS Crime Stop: 08600 10111
- Praat vandag met 'n onderwyser, skoolberader, of iemand wat jy vertrou, nie net met my nie.
`.trim(),
  nso: `
Ge o le kotsing bjale goba se se kwagala se potlakile, hle ikgokaganye le:
- Childline South Africa: 116 (mahala, diiri tše 24/7)
- SADAG Suicide Crisis Line: 0800 567 567
- SAPS Crime Stop: 08600 10111
- Bolela le morutiši, moeletši wa sekolo, goba motho yo o mo tshepago lehono, e sego nna fela.
`.trim(),
  xh: `
Ukuba usemngciphekweni ngoku okanye oku kuvakala kungxamisekile, nceda unxibelelane nalawa:
- I-Childline South Africa: 116 (simahla, iiyure ezingama-24)
- I-SADAG Suicide Crisis Line: 0800 567 567
- I-SAPS Crime Stop: 08600 10111
- Thetha notitshala, umcebisi wesikolo, okanye umntu omthembayo namhlanje, ingekhona mna kuphela.
`.trim(),
  zu: `
Uma usengozini manje noma lokhu kuzwakala kuphuthumile, sicela uxhumane nalezi:
- I-Childline South Africa: 116 (mahhala, amahora angama-24)
- I-SADAG Suicide Crisis Line: 0800 567 567
- I-SAPS Crime Stop: 08600 10111
- Khuluma nothisha, umeluleki wesikole, noma umuntu omethembayo namuhla, hhayi mina kuphela.
`.trim(),
  st: `
Haeba o kotsing hona jwale kapa sena se utlwahala se le potlakileng, ka kopo ikopanye le:
- Childline South Africa: 116 (mahala, dihora tse 24/7)
- SADAG Suicide Crisis Line: 0800 567 567
- SAPS Crime Stop: 08600 10111
- Bua le tichere, moeletsi wa sekolo, kapa motho eo o mo tshepang kajeno, eseng nna feela.
`.trim(),
};

// The English version goes into the AI's instructions.
const SAFETY_RESOURCES = SAFETY_RESOURCES_BY_LANG.en;

// ---------- Guessing the language (only used if the learner never chose one) ----------
const FRANC_TO_LANG_KEY = {
  eng: "en",
  afr: "af",
  nso: "nso",
  xho: "xh",
  zul: "zu",
  sot: "st",
};

function detectLanguage(text) {
  const code = franc(text, { only: Object.keys(FRANC_TO_LANG_KEY) });
  return FRANC_TO_LANG_KEY[code] || "en";
}

// ---------- Instructions for the AI ----------
const SYSTEM_PROMPT = `
You are a friendly, supportive chatbot built for South African learners, helping them understand and deal with cyberbullying and online scams. This is a project with C3SA (a non-profit).

Rules:
- Keep replies short, warm, and easy to read on a phone (2-4 sentences unless the user asks for more detail).
- Respond in whatever language the learner writes in. The bot officially supports English, Afrikaans, Sepedi and isiXhosa. If they write in another South African language (for example isiZulu or Sesotho), reply in it as best you can and suggest they pick one of the four supported languages for the best help. If unsure, ask which language they prefer.
- Use real, concrete South African examples: SIM swap scams, fake job offer scams, WhatsApp lottery/prize scams, impersonation on social media, group chat exclusion and humiliation, etc.
- Never be preachy or lecture-y. Talk like a supportive older friend, not a textbook.
- If a learner describes something that sounds like real, ongoing bullying, abuse, threats, self-harm, or a scam they may have already fallen for, you MUST include this block at the end of your reply, TRANSLATED into the same language you're replying in (keep the phone numbers and org names like "Childline" exactly as written, only translate the surrounding sentences):
${SAFETY_RESOURCES}
- Otherwise, don't include the resources block — only show it when it's actually relevant.
- If you're not sure whether it's serious, err on the side of including the resources block.
- Never explain in detail how to carry out a scam or bullying tactic, even if asked "for research."
- If someone asks something unrelated to cyberbullying/scams/online safety (e.g. homework help, general chit-chat), gently redirect them back to your purpose.
`.trim();

// ---------- Safety net ----------
// If a learner uses one of these phrases, we always add the emergency
// contacts, even if the AI forgot to.
const CRISIS_KEYWORDS = [
  // English
  "kill myself",
  "want to die",
  "end my life",
  "suicide",
  "hurt myself",
  "self harm",
  "self-harm",
  "no reason to live",
  // Afrikaans
  "selfmoord",
  "wil doodgaan",
  "maak myself dood",
  "myself seermaak",
  // isiXhosa and isiZulu
  "ukuzibulala",
  "ndifuna ukufa",
  "ngifuna ukufa",
  // Sepedi and Sesotho
  "ipolaya",
  "ke nyaka go hwa",
  "ke batla ho shwa",
];

function containsCrisisKeyword(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword));
}

// Longest message we send to the AI. Longer ones are shortened so one huge
// paste cannot run up the bill. (The safety check below still reads the whole
// message, so a crisis phrase at the very end is never missed.)
const MAX_USER_CHARS = 1500;

// ---------- Ask the AI (Groq) for a reply ----------
async function getAIReply(conversations, userId, userMessage, chosenLanguage) {
  // Start a new conversation with the AI's instructions.
  if (!conversations[userId]) {
    conversations[userId] = [{ role: "system", content: SYSTEM_PROMPT }];
  }

  conversations[userId].push({
    role: "user",
    content: userMessage.slice(0, MAX_USER_CHARS),
  });

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
      timeout: 15000,
    },
  );

  let reply = response.data.choices[0].message.content;

  // Safety net: add the emergency contacts if a crisis phrase was used and
  // the AI didn't include them. Use the learner's chosen language, or guess.
  if (containsCrisisKeyword(userMessage) && !reply.includes("Childline")) {
    const lang = chosenLanguage || detectLanguage(userMessage);
    const resources =
      SAFETY_RESOURCES_BY_LANG[lang] || SAFETY_RESOURCES_BY_LANG.en;
    reply = `${reply}\n\n${resources}`;
  }

  conversations[userId].push({ role: "assistant", content: reply });

  // Keep the instructions plus the last 10 messages, so the history doesn't grow forever.
  if (conversations[userId].length > 20) {
    conversations[userId] = [
      conversations[userId][0],
      ...conversations[userId].slice(-10),
    ];
  }

  return reply;
}

module.exports = {
  MAX_USER_CHARS,
  SYSTEM_PROMPT,
  SAFETY_RESOURCES,
  SAFETY_RESOURCES_BY_LANG,
  CRISIS_KEYWORDS,
  containsCrisisKeyword,
  detectLanguage,
  getAIReply,
};
