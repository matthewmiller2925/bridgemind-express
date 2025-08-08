import { Request } from 'express';

interface RateLimitRecord {
  count: number;
  first: number;
}

// In-memory rate limiter (per-instance)
const ipHits = new Map<string, RateLimitRecord>();

/**
 * Extracts client IP from request
 */
export function getClientIp(req: Request): string {
  const forwarded = (req.headers['x-forwarded-for'] as string) || '';
  const ip = forwarded.split(',')[0]?.trim() || 
             req.socket.remoteAddress || 
             'unknown';
  return ip;
}

/**
 * Checks if the IP address has exceeded the rate limit
 */
export function checkRateLimit(ip: string): boolean {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '600000'); // 10 minutes default
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'); // 5 requests default
  
  const now = Date.now();
  const record = ipHits.get(ip);
  
  if (!record) {
    ipHits.set(ip, { count: 1, first: now });
    return true;
  }
  
  // Reset window if expired
  if (now - record.first > windowMs) {
    ipHits.set(ip, { count: 1, first: now });
    return true;
  }
  
  // Check if limit exceeded
  if (record.count >= maxRequests) {
    return false;
  }
  
  // Increment counter
  record.count += 1;
  return true;
}

/**
 * Cleanup old rate limit records periodically
 */
export function cleanupRateLimitRecords(): void {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '600000');
  const now = Date.now();
  
  for (const [ip, record] of ipHits.entries()) {
    if (now - record.first > windowMs * 2) {
      ipHits.delete(ip);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupRateLimitRecords, 60 * 60 * 1000);
