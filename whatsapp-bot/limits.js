// A simple per-person rate limiter, so one person cannot run up the Groq and
// WhatsApp bill by flooding the bot. It remembers recent message times in
// memory only (like the rest of the bot's state).

// check(key) returns:
//   "ok"      - go ahead
//   "warn"    - this is the first message over the limit: tell them to slow down
//   "blocked" - still over the limit: stay quiet (replying would cost money too)
function createRateLimiter({ max, windowMs, now = Date.now }) {
  const hits = new Map(); // key -> recent message times
  const warned = new Set(); // keys already told to slow down

  function recentHits(key, time) {
    return (hits.get(key) || []).filter((t) => t > time - windowMs);
  }

  return {
    check(key) {
      const time = now();
      const recent = recentHits(key, time);

      if (recent.length >= max) {
        hits.set(key, recent);
        if (warned.has(key)) return "blocked";
        warned.add(key);
        return "warn";
      }

      recent.push(time);
      hits.set(key, recent);
      warned.delete(key);
      return "ok";
    },

    // Forget people who have been quiet, so memory does not grow forever.
    prune() {
      const time = now();
      for (const key of [...hits.keys()]) {
        if (recentHits(key, time).length === 0) {
          hits.delete(key);
          warned.delete(key);
        }
      }
    },

    size() {
      return hits.size;
    },
  };
}

module.exports = { createRateLimiter };
