require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const axios = require("axios");
const { GREETING, getAIReply } = require("./bot-logic");

const app = express();
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

const {
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID,
  VERIFY_TOKEN,
  APP_SECRET,
  PORT = 3000,
} = process.env;

if (!APP_SECRET) {
  console.warn(
    "WARNING: APP_SECRET is not set — webhook signature verification is disabled.",
  );
}

// simple in-memory conversation store: { [userPhone]: [{role, content}, ...] }
const conversations = {};
// tracks whether a user has already gotten the intro message
const hasGreeted = {};

function isValidSignature(req) {
  if (!APP_SECRET) return true; // can't verify without the secret; demo mode

  const header = req.get("x-hub-signature-256") || "";
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", APP_SECRET).update(req.rawBody).digest("hex");

  const headerBuf = Buffer.from(header);
  const expectedBuf = Buffer.from(expected);
  if (headerBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(headerBuf, expectedBuf);
}

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
  if (!isValidSignature(req)) {
    return res.sendStatus(403);
  }

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

    const last4 = from ? from.slice(-4) : "????";
    console.log(`Message from ***${last4}: ${text.length} chars`);

    if (!hasGreeted[from]) {
      hasGreeted[from] = true;
      await sendWhatsAppMessage(from, GREETING);
      // still let their first real message get a proper AI reply too
    }

    const reply = await getAIReply(conversations, from, text);
    await sendWhatsAppMessage(from, reply);
  } catch (err) {
    console.error("Error handling webhook:", err.response?.data || err.message);
  }
});

// ---------- 3. Send message back via WhatsApp Cloud API ----------
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
    },
  );
}

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
