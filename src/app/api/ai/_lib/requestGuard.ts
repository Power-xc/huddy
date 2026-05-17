import { aiRequestMaxBodyBytes } from "@shared/config/practiceLimits";
import { jsonError } from "./json";

type RateBucket = {
  count: number;
  resetAt: number;
};

const windowMs = 60_000;
const fallbackLimit = 24;
const buckets = new Map<string, RateBucket>();

const getLimit = (): number => {
  const configuredLimit = Number(process.env.HUDDY_AI_RATE_LIMIT_PER_MINUTE);

  return Number.isFinite(configuredLimit) && configuredLimit > 0
    ? Math.floor(configuredLimit)
    : fallbackLimit;
};

const getClientKey = (request: Request): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim();

  return (
    clientIp ||
    request.headers.get("x-real-ip") ||
    request.headers.get("host") ||
    "unknown"
  );
};

const getAllowedOrigins = (request: Request): Set<string> => {
  const configuredOrigins = (process.env.HUDDY_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const host = request.headers.get("host");
  const origins = new Set(configuredOrigins);

  if (host) {
    origins.add(`https://${host}`);
    origins.add(`http://${host}`);
  }

  return origins;
};

const isAllowedOrigin = (request: Request): boolean => {
  const origin = request.headers.get("origin");

  if (!origin) {
    return (
      process.env.NODE_ENV !== "production" ||
      request.headers.get("sec-fetch-site") === "same-origin"
    );
  }

  return getAllowedOrigins(request).has(origin);
};

const checkRateLimit = (request: Request): Response | null => {
  const now = Date.now();
  const key = getClientKey(request);
  const currentBucket = buckets.get(key);
  const activeBucket =
    currentBucket && currentBucket.resetAt > now
      ? currentBucket
      : { count: 0, resetAt: now + windowMs };

  activeBucket.count += 1;
  buckets.set(key, activeBucket);

  if (buckets.size > 500) {
    for (const [bucketKey, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) {
        buckets.delete(bucketKey);
      }
    }
  }

  if (activeBucket.count > getLimit()) {
    return jsonError("Too many requests", 429);
  }

  return null;
};

export const guardAiRequest = (request: Request): Response | null => {
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (contentLength > aiRequestMaxBodyBytes) {
    return jsonError("Request body too large", 413);
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonError("Unsupported content type", 415);
  }

  if (!isAllowedOrigin(request)) {
    return jsonError("Forbidden origin", 403);
  }

  return checkRateLimit(request);
};
