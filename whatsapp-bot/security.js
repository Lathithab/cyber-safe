const crypto = require("crypto");

// Checks that a webhook request really came from Meta.
// Meta sends an HMAC-SHA256 of the exact request body, signed with our App
// Secret, in the x-hub-signature-256 header ("sha256=<hex>").
// Returns false (never throws) if anything is missing or does not match.
function verifySignature(rawBody, signatureHeader, appSecret) {
  if (!appSecret || !signatureHeader || !rawBody) return false;

  const expected =
    "sha256=" +
    crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

  const received = Buffer.from(signatureHeader);
  const wanted = Buffer.from(expected);

  // timingSafeEqual needs equal lengths, and avoids leaking where they differ.
  return (
    received.length === wanted.length &&
    crypto.timingSafeEqual(received, wanted)
  );
}

module.exports = { verifySignature };
