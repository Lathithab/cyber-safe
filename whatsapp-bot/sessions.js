// Clears out learners who have gone quiet, so chat text does not sit in the
// bot's memory and the bot's memory does not grow forever.
//
//  - After chatTimeoutMs of silence the chat messages are deleted.
//  - After forgetAfterMs of silence everything about that learner is
//    forgotten (language choice, greeting, last-seen time).
//
// `state` holds the bot's maps, each keyed by the learner's phone number.
function pruneIdle(state, now, { chatTimeoutMs, forgetAfterMs }) {
  const { conversations, hasGreeted, languagePrefs, lastSeen, sessionEnded } =
    state;
  const keys = new Set([
    ...Object.keys(conversations),
    ...Object.keys(hasGreeted),
    ...Object.keys(languagePrefs),
    ...Object.keys(lastSeen),
    ...Object.keys(sessionEnded),
  ]);

  let chatsCleared = 0;
  let learnersForgotten = 0;

  for (const key of keys) {
    const idle = now - (lastSeen[key] ?? 0);

    if (idle > forgetAfterMs) {
      delete conversations[key];
      delete hasGreeted[key];
      delete languagePrefs[key];
      delete lastSeen[key];
      delete sessionEnded[key];
      learnersForgotten += 1;
    } else if (idle > chatTimeoutMs && conversations[key]) {
      delete conversations[key];
      chatsCleared += 1;
    }
  }

  return { chatsCleared, learnersForgotten };
}

module.exports = { pruneIdle };
