import type { FastifyReply, FastifyRequest } from "fastify";

type RateLimitOptions = {
  limit: number;
  windowMs: number;
  maxEntries?: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

/**
 * A small, bounded in-memory limiter for this single backend process.
 * It deliberately does not retain request contents or write client IPs to disk.
 * A shared store (Redis, etc.) should replace this when the API is scaled out.
 */
export function createRateLimiter({ limit, windowMs, maxEntries = 10_000 }: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();

  return function consume(request: FastifyRequest, reply: FastifyReply, scope = request.url.split("?")[0]) {
    const now = Date.now();

    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }

    const key = `${request.ip}:${scope}`;
    const current = buckets.get(key);
    const bucket = current && current.resetAt > now
      ? current
      : { count: 0, resetAt: now + windowMs };

    if (!current && buckets.size >= maxEntries) {
      reply.header("Retry-After", String(Math.max(1, Math.ceil(windowMs / 1000))));
      reply.code(429).send({ error: "Too many requests. Please try again shortly." });
      return false;
    }

    if (bucket.count >= limit) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      reply.header("Retry-After", String(retryAfter));
      reply.header("X-RateLimit-Limit", String(limit));
      reply.header("X-RateLimit-Remaining", "0");
      reply.code(429).send({ error: "Too many requests. Please try again shortly." });
      return false;
    }

    bucket.count += 1;
    buckets.set(key, bucket);
    reply.header("X-RateLimit-Limit", String(limit));
    reply.header("X-RateLimit-Remaining", String(Math.max(0, limit - bucket.count)));
    reply.header("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));
    return true;
  };
}
