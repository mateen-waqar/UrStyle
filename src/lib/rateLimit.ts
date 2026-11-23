// In-memory sliding-window rate limiter for sensitive API routes
// Suitable for single-instance or serverless cold-start protection

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record: RateLimitRecord, key: string) => {
      record.timestamps = record.timestamps.filter((ts: number) => now - ts < 60_000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    });
  }, 300_000);
}

export interface RateLimitOptions {
  limit: number;      // Maximum allowed requests
  windowMs: number;   // Window in milliseconds (e.g. 60,000 for 1 minute)
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 30, windowMs: 60_000 }
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier) || { timestamps: [] };

  // Remove timestamps outside window
  record.timestamps = record.timestamps.filter((ts: number) => now - ts < options.windowMs);

  if (record.timestamps.length >= options.limit) {
    const oldest = record.timestamps[0];
    const resetMs = options.windowMs - (now - oldest);
    return { allowed: false, remaining: 0, resetMs: Math.max(0, resetMs) };
  }

  record.timestamps.push(now);
  rateLimitStore.set(identifier, record);

  return {
    allowed: true,
    remaining: options.limit - record.timestamps.length,
    resetMs: options.windowMs,
  };
}
