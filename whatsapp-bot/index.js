require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const {
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID,
  VERIFY_TOKEN,
  GROQ_API_KEY,
  PORT = 3000,
} = process.env;

// simple in-memory conversation store: { [userPhone]: [{role, content}, ...] }
const conversations = {};
// tracks whether a user has already gotten the intro message
const hasGreeted = {};

// ---------- Real resources to hand out when things look serious ----------
const SAFETY_RESOURCES = `
If you're in danger right now or this feels urgent, please also reach out to:
- Childline South Africa: 116 (free, 24/7)
- SAPS Crime Stop: 08600 10111
- Talk to a teacher, school counsellor, or trusted adult today, not just me.
`.trim();

// ---------- Core system prompt ----------
const SYSTEM_PROMPT = `
You are a friendly, supportive chatbot built for South African learners, helping them understand and deal with cyberbullying and online scams. This is a project with C3SA (a non-profit).

Rules:
- Keep replies short, warm, and easy to read on a phone (2-4 sentences unless the user asks for more detail).
- Respond in whatever language the learner writes in (English, isiZulu, isiXhosa, Afrikaans, Sesotho, etc). If unsure, ask which language they prefer.
- Use real, concrete South African examples: SIM swap scams, fake job offer scams, WhatsApp lottery/prize scams, impersonation on social media, group chat exclusion and humiliation, etc.
- Never be preachy or lecture-y. Talk like a supportive older friend, not a textbook.
- If a learner describes something that sounds like real, ongoing bullying, abuse, threats, or a scam they may have already fallen for, you MUST include this exact block at the end of your reply, unmodified:
${SAFETY_RESOURCES}
- Otherwise, don't include the resources block — only show it when it's actually relevant.
- If you're not sure whether it's serious, err on the side of including the resources block.
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

// ---------- 1. Webhook verification (Meta calls this once when you set up the webhook) ----------
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

// ---------- 2. Incoming messages ----------
app.post("/webhook", async (req, res) => {
  // Always respond 200 fast so Meta doesn't retry
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) return; // could be a status update, not a message

    const from = message.from; // sender's phone number
    const text = message.text?.body;

    if (!text) return; // skip non-text messages for MVP

    console.log(`Message from ${from}: ${text}`);

    if (!hasGreeted[from]) {
      hasGreeted[from] = true;
      await sendWhatsAppMessage(from, GREETING);
      // still let their first real message get a proper AI reply too
    }

    const reply = await getAIReply(from, text);
    await sendWhatsAppMessage(from, reply);
  } catch (err) {
    console.error("Error handling webhook:", err.response?.data || err.message);
  }
});

// ---------- 3. Call Groq (free, fast LLM) ----------
async function getAIReply(userId, userMessage) {
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
      model: "llama-3.3-70b-versatile",
      messages: conversations[userId],
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const reply = response.data.choices[0].message.content;
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

// ---------- 4. Send message back via WhatsApp Cloud API ----------
async function sendWhatsAppMessage(to, text) {
  await axios.post(
    `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));