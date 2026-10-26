// End-to-end test of "Talk to a person". It starts the real bot and a fake
// WhatsApp server, taps the "Yes" button as a learner, and checks what the
// bot sends to the staff member and to the learner. No real WhatsApp, Groq or
// internet access is used.
const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const { spawn } = require("node:child_process");

const STAFF = "27820000099";
const LEARNER = "27820000001";

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

// A pretend WhatsApp server that records everything the bot sends. Numbers in
// `rejectNumbers` get the kind of error Meta returns when a plain text message
// is sent outside the 24-hour window.
async function startFakeWhatsApp(rejectNumbers = []) {
  const sent = [];
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const payload = JSON.parse(body || "{}");
      sent.push(payload);
      res.setHeader("content-type", "application/json");
      if (rejectNumbers.includes(payload.to)) {
        res.statusCode = 400;
        res.end(
          JSON.stringify({
            error: { code: 131047, message: "Re-engagement message required" },
          }),
        );
      } else {
        res.end(JSON.stringify({ messages: [{ id: "fake" }] }));
      }
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { server, sent, port: server.address().port };
}

async function startBot(fakePort, extraEnv = {}) {
  const port = await freePort();
  const env = { ...process.env };
  delete env.STAFF_WHATSAPP;
  delete env.STAFF_TEMPLATE_NAME;
  delete env.APP_SECRET;
  Object.assign(env, {
    ALLOW_UNSIGNED_WEBHOOKS: "true",
    GROQ_API_KEY: "test-key",
    WHATSAPP_TOKEN: "test-token",
    PHONE_NUMBER_ID: "123",
    WHATSAPP_API_BASE: `http://127.0.0.1:${fakePort}`,
    PORT: String(port),
    ...extraEnv,
  });

  const child = spawn(process.execPath, ["index.js"], {
    cwd: path.join(__dirname, ".."),
    env,
    stdio: "ignore",
  });

  // Wait until the bot is accepting connections.
  for (let i = 0; i < 50; i += 1) {
    const up = await new Promise((resolve) => {
      const socket = net.connect(port, "127.0.0.1");
      socket.on("connect", () => {
        socket.destroy();
        resolve(true);
      });
      socket.on("error", () => resolve(false));
    });
    if (up) return { child, port };
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  child.kill();
  throw new Error("The bot did not start");
}

async function tapButton(port, from, buttonId) {
  await fetch(`http://127.0.0.1:${port}/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    id: `msg-${Math.random()}`,
                    from,
                    interactive: { button_reply: { id: buttonId } },
                  },
                ],
              },
            },
          ],
        },
      ],
    }),
  });
}

async function waitFor(condition, ms = 4000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (condition()) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return condition();
}

const textsSentTo = (sent, to) =>
  sent.filter((m) => m.to === to && m.text).map((m) => m.text.body);

async function scenario(options, run) {
  const fake = await startFakeWhatsApp(options.rejectNumbers);
  const bot = await startBot(fake.port, options.env);
  try {
    await run(fake, bot);
  } finally {
    bot.child.kill();
    fake.server.close();
  }
}

test("staff are told and the learner is promised a call back", async () => {
  await scenario({ env: { STAFF_WHATSAPP: STAFF } }, async (fake, bot) => {
    await tapButton(bot.port, LEARNER, "HANDOFF_YES");
    assert.ok(await waitFor(() => textsSentTo(fake.sent, LEARNER).length === 1));

    const staffTexts = textsSentTo(fake.sent, STAFF);
    assert.equal(staffTexts.length, 1);
    assert.ok(staffTexts[0].includes(`+${LEARNER}`));
    assert.match(textsSentTo(fake.sent, LEARNER)[0], /will contact you/);
  });
});

test("if WhatsApp rejects the staff message, the learner is told honestly", async () => {
  await scenario(
    { env: { STAFF_WHATSAPP: STAFF }, rejectNumbers: [STAFF] },
    async (fake, bot) => {
      await tapButton(bot.port, LEARNER, "HANDOFF_YES");
      assert.ok(await waitFor(() => textsSentTo(fake.sent, LEARNER).length === 1));

      const reply = textsSentTo(fake.sent, LEARNER)[0];
      assert.match(reply, /no one has been told/);
      assert.match(reply, /116/);
      assert.doesNotMatch(reply, /will contact you/);
    },
  );
});

test("with no staff number set, the learner is not promised a call back", async () => {
  await scenario({ env: {} }, async (fake, bot) => {
    await tapButton(bot.port, LEARNER, "HANDOFF_YES");
    assert.ok(await waitFor(() => textsSentTo(fake.sent, LEARNER).length === 1));

    assert.match(textsSentTo(fake.sent, LEARNER)[0], /no one has been told/);
    assert.equal(textsSentTo(fake.sent, STAFF).length, 0);
  });
});

test("with a template name set, staff are sent the template with the learner's number", async () => {
  await scenario(
    { env: { STAFF_WHATSAPP: STAFF, STAFF_TEMPLATE_NAME: "handoff_request" } },
    async (fake, bot) => {
      await tapButton(bot.port, LEARNER, "HANDOFF_YES");
      assert.ok(await waitFor(() => textsSentTo(fake.sent, LEARNER).length === 1));

      const toStaff = fake.sent.filter((m) => m.to === STAFF);
      assert.equal(toStaff.length, 1);
      assert.equal(toStaff[0].type, "template");
      assert.equal(toStaff[0].template.name, "handoff_request");
      assert.equal(
        toStaff[0].template.components[0].parameters[0].text,
        `+${LEARNER}`,
      );
      assert.match(textsSentTo(fake.sent, LEARNER)[0], /will contact you/);
    },
  );
});
