import type { RateLimitConfig, RateLimitResult } from '@/lib/types/api';
import { getLogger } from './simple-logger.service';

const log = getLogger('rate-limit');

// Rate limit store interface
interface RateLimitStore {
  readonly count: number;
  readonly resetTime: number;
  readonly firstRequest: number;
}

// Simple in-memory rate limiter
class SimpleRateLimiter {
  private store = new Map<string, RateLimitStore>();
  private readonly config: RateLimitConfig;
  private readonly name: string;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(name: string, config: RateLimitConfig) {
    this.name = name;
    this.config = config;

    // Start cleanup interval
    this.startCleanup();

    log.info('SimpleRateLimiter initialized', {
      limiter: this.name,
      windowMs: config.windowMs,
      max: config.max,
      operation: 'rate_limiter_init',
    });
  }

  private startCleanup(): void {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      log.debug('Rate limiter cleanup completed', {
        cleaned,
        remaining: this.store.size,
        operation: 'rate_limiter_cleanup',
      });
    }
  }

  private getKey(identifier: string): string {
    return `${this.name}:${identifier}`;
  }

  private getWindowStart(now: number): number {
    return Math.floor(now / this.config.windowMs) * this.config.windowMs;
  }

  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const key = this.getKey(identifier);
    const windowStart = this.getWindowStart(now);
    const windowEnd = windowStart + this.config.windowMs;

    const entry = this.store.get(key);

    if (!entry || entry.resetTime <= now) {
      // No entry or window has expired, create new entry
      const newEntry: RateLimitStore = {
        count: 1,
        resetTime: windowEnd,
        firstRequest: now,
      };

      this.store.set(key, newEntry);

      log.debug('Rate limit check - new window', {
        identifier,
        count: 1,
        resetTime: windowEnd,
        operation: 'rate_limit_new_window',
      });

      return {
        allowed: true,
        limit: this.config.max,
        remaining: this.config.max - 1,
        resetTime: windowEnd,
        retryAfter: null,
      };
    }

    // Entry exists and is within window
    if (entry.count >= this.config.max) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      log.warn('Rate limit exceeded', {
        identifier,
        count: entry.count,
        limit: this.config.max,
        resetTime: entry.resetTime,
        retryAfter,
        operation: 'rate_limit_exceeded',
      });

      return {
        allowed: false,
        limit: this.config.max,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter,
      };
    }

    // Increment count
    const updatedEntry: RateLimitStore = {
      ...entry,
      count: entry.count + 1,
    };

    this.store.set(key, updatedEntry);

    log.debug('Rate limit check - allowed', {
      identifier,
      count: updatedEntry.count,
      remaining: this.config.max - updatedEntry.count,
      operation: 'rate_limit_allowed',
    });

    return {
      allowed: true,
      limit: this.config.max,
      remaining: this.config.max - updatedEntry.count,
      resetTime: entry.resetTime,
      retryAfter: null,
    };
  }

  reset(identifier: string): boolean {
    const key = this.getKey(identifier);
    const deleted = this.store.delete(key);

    if (deleted) {
      log.info('Rate limit reset', {
        identifier,
        operation: 'rate_limit_reset',
      });
    }

    return deleted;
  }

  getStats(identifier: string): RateLimitResult | null {
    const now = Date.now();
    const key = this.getKey(identifier);
    const entry = this.store.get(key);

    if (!entry || entry.resetTime <= now) {
      return null;
    }

    return {
      allowed: entry.count < this.config.max,
      limit: this.config.max,
      remaining: Math.max(0, this.config.max - entry.count),
      resetTime: entry.resetTime,
      retryAfter: entry.count >= this.config.max ? Math.ceil((entry.resetTime - now) / 1000) : null,
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Rate limit configurations
const rateLimitConfigs = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per window
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  listings: {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: 'Too many listing requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  reviews: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: 'Too many review requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  stats: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
    message: 'Too many stats requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
  },
} as const;

// Global rate limiter instances
export const apiRateLimiter = new SimpleRateLimiter('api', rateLimitConfigs.api);
export const authRateLimiter = new SimpleRateLimiter('auth', rateLimitConfigs.auth);
export const listingsRateLimiter = new SimpleRateLimiter('listings', rateLimitConfigs.listings);
export const reviewsRateLimiter = new SimpleRateLimiter('reviews', rateLimitConfigs.reviews);
export const statsRateLimiter = new SimpleRateLimiter('stats', rateLimitConfigs.stats);

// Helper function to get client identifier
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback to a default identifier
  return 'unknown';
}

// Rate limit middleware factory
export function createRateLimitMiddleware(limiter: SimpleRateLimiter) {
  return async (request: Request): Promise<Response | null> => {
    try {
      const identifier = getClientIdentifier(request);
      const result = limiter.check(identifier);

      if (!result.allowed) {
        const response = new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'Too many requests, please try again later.',
            retryAfter: result.retryAfter,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': result.retryAfter?.toString() || '60',
              'X-RateLimit-Limit': result.limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            },
          }
        );

        log.warn('Rate limit exceeded', {
          identifier,
          limit: result.limit,
          remaining: result.remaining,
          retryAfter: result.retryAfter,
          operation: 'rate_limit_middleware',
        });

        return response;
      }

      // Add rate limit headers to successful responses
      return null; // Continue processing
    } catch (error) {
      log.error('Rate limit middleware error', {
        error: error instanceof Error ? error.message : String(error),
        operation: 'rate_limit_middleware_error',
      });

      // On error, allow the request to proceed
      return null;
    }
  };
}

// General rate limiter for common use cases
export const generalRateLimit = createRateLimitMiddleware(apiRateLimiter);

// Cleanup function for graceful shutdown
export function destroyAllRateLimiters(): void {
  apiRateLimiter.destroy();
  authRateLimiter.destroy();
  listingsRateLimiter.destroy();
  reviewsRateLimiter.destroy();
  statsRateLimiter.destroy();
  
  log.info('All rate limiters destroyed', {
    operation: 'rate_limiter_cleanup',
  });
}