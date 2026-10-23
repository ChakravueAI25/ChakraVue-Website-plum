/**
 * A per-visitor sliding-window limit, kept in memory. Enough for one server
 * process; behind several instances, move the counts to a shared store.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();

  // Forget idle visitors so the map can't grow without bound.
  setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [key, times] of hits) if (times[times.length - 1] < cutoff) hits.delete(key);
  }, windowMs).unref();

  /** Records a hit; returns the seconds to wait if the visitor is over the limit, otherwise 0. */
  return function hit(key: string) {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((time) => time > now - windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return Math.ceil((recent[0] + windowMs - now) / 1000);
    }
    recent.push(now);
    hits.set(key, recent);
    return 0;
  };
}
