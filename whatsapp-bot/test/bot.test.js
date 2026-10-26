// Run with: npm test   (uses Node's built-in test runner, no extra packages)
// None of these tests call Groq or WhatsApp, so they need no API keys.
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

process.env.GROQ_API_KEY = "test-key"; // bot-logic reads this at load time
const {
  containsCrisisKeyword,
  detectLanguage,
  SAFETY_RESOURCES_BY_LANG,
} = require("../bot-logic");
const { getCommand } = require("../commands");
const { verifySignature } = require("../security");

// ---------- Crisis safety net ----------
test("crisis phrases are caught in every supported language", () => {
  const phrases = [
    "I want to kill myself",
    "Ek wil doodgaan",
    "Ndifuna ukufa",
    "Ngifuna ukufa",
    "ke nyaka go hwa",
    "ke batla ho shwa",
  ];
  for (const phrase of phrases) {
    assert.equal(containsCrisisKeyword(phrase), true, phrase);
  }
});

test("crisis detection ignores case", () => {
  assert.equal(containsCrisisKeyword("I WANT TO DIE"), true);
});

test("ordinary messages do not trigger the crisis block", () => {
  assert.equal(containsCrisisKeyword("Is this prize message a scam?"), false);
  assert.equal(containsCrisisKeyword("This homework is killing me"), false);
});

test("every language has the Childline number in its safety text", () => {
  for (const [lang, text] of Object.entries(SAFETY_RESOURCES_BY_LANG)) {
    assert.ok(text.includes("116"), `${lang} is missing Childline 116`);
    assert.ok(text.includes("0800 567 567"), `${lang} is missing SADAG`);
  }
});

// ---------- Language guess ----------
test("detectLanguage falls back to English when unsure", () => {
  assert.equal(detectLanguage("ok"), "en");
});

test("detectLanguage recognises Afrikaans", () => {
  assert.equal(
    detectLanguage("Ek kry vreemde boodskappe wat vra vir my bankbesonderhede"),
    "af",
  );
});

// ---------- Typed commands ----------
test("getCommand matches commands in each language, ignoring case and spaces", () => {
  assert.equal(getCommand("  MENU "), "MENU");
  assert.equal(getCommand("spyskaart"), "MENU");
  assert.equal(getCommand("Imenyu"), "MENU");
  assert.equal(getCommand("verander taal"), "LANGUAGE");
  assert.equal(getCommand("bolela le motho"), "HANDOFF");
  assert.equal(getCommand("ndigqibile"), "END");
});

test("getCommand returns null for normal chat", () => {
  assert.equal(getCommand("someone is bullying me"), null);
});

// ---------- Webhook signature (is this really from Meta?) ----------
const secret = "super-secret";
const body = Buffer.from('{"entry":[]}');
const goodSig =
  "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");

test("a correctly signed request is accepted", () => {
  assert.equal(verifySignature(body, goodSig, secret), true);
});

test("a tampered body is rejected", () => {
  assert.equal(verifySignature(Buffer.from('{"entry":[1]}'), goodSig, secret), false);
});

test("a signature made with the wrong secret is rejected", () => {
  const forged =
    "sha256=" + crypto.createHmac("sha256", "other").update(body).digest("hex");
  assert.equal(verifySignature(body, forged, secret), false);
});

test("a missing signature or missing secret is rejected (fails closed)", () => {
  assert.equal(verifySignature(body, undefined, secret), false);
  assert.equal(verifySignature(body, goodSig, undefined), false);
  assert.equal(verifySignature(undefined, goodSig, secret), false);
});

test("a garbage signature of the wrong length is rejected without throwing", () => {
  assert.equal(verifySignature(body, "sha256=abc", secret), false);
});

// ---------- Rate limiter ----------
const { createRateLimiter } = require("../limits");

test("rate limiter allows up to the limit, warns once, then stays quiet", () => {
  let time = 0;
  const limiter = createRateLimiter({ max: 3, windowMs: 1000, now: () => time });
  assert.equal(limiter.check("a"), "ok");
  assert.equal(limiter.check("a"), "ok");
  assert.equal(limiter.check("a"), "ok");
  assert.equal(limiter.check("a"), "warn"); // first message over the limit
  assert.equal(limiter.check("a"), "blocked");
  assert.equal(limiter.check("a"), "blocked");
});

test("rate limiter is per person", () => {
  let time = 0;
  const limiter = createRateLimiter({ max: 1, windowMs: 1000, now: () => time });
  assert.equal(limiter.check("a"), "ok");
  assert.equal(limiter.check("a"), "warn");
  assert.equal(limiter.check("b"), "ok"); // someone else is unaffected
});

test("rate limiter lets people back in once the window has passed", () => {
  let time = 0;
  const limiter = createRateLimiter({ max: 1, windowMs: 1000, now: () => time });
  assert.equal(limiter.check("a"), "ok");
  assert.equal(limiter.check("a"), "warn");
  time = 1500;
  assert.equal(limiter.check("a"), "ok");
  assert.equal(limiter.check("a"), "warn"); // and they can be warned again
});

test("rate limiter forgets quiet people when pruned", () => {
  let time = 0;
  const limiter = createRateLimiter({ max: 5, windowMs: 1000, now: () => time });
  limiter.check("a");
  limiter.check("b");
  assert.equal(limiter.size(), 2);
  time = 5000;
  limiter.prune();
  assert.equal(limiter.size(), 0);
});

// ---------- Long messages ----------
test("long messages are shortened for the AI but crisis words at the end are still caught", async () => {
  const { getAIReply, MAX_USER_CHARS } = require("../bot-logic");
  const axios = require("axios");
  let sentToAI = "";
  const realPost = axios.post;
  axios.post = async (_url, body) => {
    sentToAI = body.messages[body.messages.length - 1].content;
    return { data: { choices: [{ message: { content: "I'm here for you." } }] } };
  };
  try {
    const long = "x".repeat(MAX_USER_CHARS + 500) + " I want to die";
    const reply = await getAIReply({}, "user1", long, "en");
    assert.equal(sentToAI.length, MAX_USER_CHARS); // AI only saw the capped text
    assert.ok(reply.includes("Childline"), "emergency numbers were still added");
  } finally {
    axios.post = realPost;
  }
});
