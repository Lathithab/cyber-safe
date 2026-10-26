const test = require("node:test");
const assert = require("node:assert/strict");
const { pruneIdle } = require("../sessions");

const MIN = 60 * 1000;
const limits = { chatTimeoutMs: 30 * MIN, forgetAfterMs: 24 * 60 * MIN };

function freshState() {
  return {
    conversations: {},
    hasGreeted: {},
    languagePrefs: {},
    lastSeen: {},
    sessionEnded: {},
  };
}

function addLearner(state, id, lastSeenAt) {
  state.conversations[id] = [{ role: "user", content: "private message" }];
  state.hasGreeted[id] = true;
  state.languagePrefs[id] = "xh";
  state.lastSeen[id] = lastSeenAt;
  state.sessionEnded[id] = false;
}

test("active learners are left alone", () => {
  const state = freshState();
  addLearner(state, "27820000001", 100 * MIN);
  const result = pruneIdle(state, 110 * MIN, limits);
  assert.deepEqual(result, { chatsCleared: 0, learnersForgotten: 0 });
  assert.ok(state.conversations["27820000001"]);
});

test("after 30 minutes of silence the chat messages are deleted but the language is kept", () => {
  const state = freshState();
  addLearner(state, "27820000001", 0);
  const result = pruneIdle(state, 31 * MIN, limits);
  assert.equal(result.chatsCleared, 1);
  assert.equal(state.conversations["27820000001"], undefined);
  assert.equal(state.languagePrefs["27820000001"], "xh");
});

test("after 24 hours of silence everything about the learner is forgotten", () => {
  const state = freshState();
  addLearner(state, "27820000001", 0);
  const result = pruneIdle(state, 25 * 60 * MIN, limits);
  assert.equal(result.learnersForgotten, 1);
  for (const map of Object.values(state)) {
    assert.deepEqual(Object.keys(map), []);
  }
});

test("only quiet learners are removed", () => {
  const state = freshState();
  addLearner(state, "quiet", 0);
  addLearner(state, "active", 60 * MIN);
  pruneIdle(state, 61 * MIN, limits);
  assert.equal(state.conversations.quiet, undefined);
  assert.ok(state.conversations.active);
});

test("entries with no last-seen time are cleaned up too", () => {
  const state = freshState();
  state.hasGreeted["orphan"] = true;
  // The bot uses the real clock, so "now" is always far past 24 hours.
  const result = pruneIdle(state, 25 * 60 * MIN, limits);
  assert.equal(result.learnersForgotten, 1);
  assert.equal(state.hasGreeted.orphan, undefined);
});
