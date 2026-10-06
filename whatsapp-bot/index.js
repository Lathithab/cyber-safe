require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { GREETING, getAIReply } = require("./bot-logic");

const app = express();
app.use(express.json());

const {
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID,
  VERIFY_TOKEN,
  PORT = 3000,
} = process.env;

// simple in-memory conversation store: { [userPhone]: [{role, content}, ...] }
const conversations = {};
// tracks whether a user has already gotten the intro message
const hasGreeted = {};

// WhatsApp can redeliver the same webhook event (e.g. if it doesn't get a
// clean ack in time); track recently seen message IDs so we don't process
// (and reply to) the same message twice. Map preserves insertion order so
// we can evict the oldest entries once it grows too large.
const seenMessageIds = new Map();
const MAX_SEEN_MESSAGE_IDS = 1000;

function isDuplicateMessage(messageId) {
  if (!messageId) return false;
  if (seenMessageIds.has(messageId)) return true;

  seenMessageIds.set(messageId, true);
  if (seenMessageIds.size > MAX_SEEN_MESSAGE_IDS) {
    const oldestKey = seenMessageIds.keys().next().value;
    seenMessageIds.delete(oldestKey);
  }
  return false;
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
  // Always respond 200 fast so Meta doesn't retry
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) return; // could be a status update, not a message

    if (isDuplicateMessage(message.id)) {
      console.log(`Skipping duplicate message ${message.id}`);
      return;
    }

    const from = message.from; // sender's phone number
    const text = message.text?.body;

    if (!text) return; // skip non-text messages for MVP

    console.log(`Message from ${from}: ${text}`);

    if (!hasGreeted[from]) {
      hasGreeted[from] = true;
      await sendWhatsAppMessage(from, GREETING);
      // still let their first real message get a proper AI reply too
    }

    try {
      const reply = await getAIReply(conversations, from, text);
      await sendWhatsAppMessage(from, reply);
    } catch (err) {
      console.error("Error getting/sending AI reply:", err.response?.data || err.message);
      // let the user know something went wrong instead of leaving them with silence
      await sendWhatsAppMessage(
        from,
        "Sorry, I'm having trouble replying right now. Please try again in a moment.",
      ).catch((sendErr) =>
        console.error("Error sending fallback message:", sendErr.response?.data || sendErr.message),
      );
    }
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
      timeout: 10000,
    },
  );
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
