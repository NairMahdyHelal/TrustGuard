import { Redis } from "@upstash/redis";

let redisClient: Redis | null | undefined;

function createRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  return new Redis({
    url,
    token,
  });
}

export function getRedis() {
  if (redisClient === undefined) {
    redisClient = createRedisClient();
  }

  return redisClient;
}

export async function rateLimitByKey(
  key: string,
  limit: number,
  windowSeconds: number,
) {
  const redis = getRedis();

  if (!redis) {
    return {
      allowed: true,
      remaining: limit,
      resetInSeconds: windowSeconds,
      bypassed: true,
    };
  }

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    resetInSeconds: windowSeconds,
    bypassed: false,
  };
}
