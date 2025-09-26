import { NextRequest, NextResponse } from 'next/server';
import log from '@/lib/logger';
import { ApiError } from './error-handler';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  message?: string; // Custom error message
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
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
        operation: 'rate_limit_cleanup',
      });
    }
  }

  private getKey(request: NextRequest, keyGenerator?: (req: NextRequest) => string): string {
    if (keyGenerator) {
      return keyGenerator(request);
    }

    // Default key generation based on IP and user agent
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const path = request.nextUrl.pathname;
    
    return `${ip}:${userAgent}:${path}`;
  }

  check(config: RateLimitConfig, request: NextRequest): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    totalHits: number;
  } {
    const key = this.getKey(request, config.keyGenerator);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let entry = this.store.get(key);

    // Create new entry if it doesn't exist or if window has reset
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false,
      };
      this.store.set(key, entry);
    }

    // Increment count
    entry.count++;

    const allowed = entry.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entry.count);
    const resetTime = entry.resetTime;

    // Log rate limit events
    if (!allowed && !entry.blocked) {
      entry.blocked = true;
      log.warn('Rate limit exceeded', {
        key,
        count: entry.count,
        maxRequests: config.maxRequests,
        windowMs: config.windowMs,
        path: request.nextUrl.pathname,
        method: request.method,
        operation: 'rate_limit_exceeded',
      });
    } else if (allowed && entry.blocked) {
      entry.blocked = false;
      log.info('Rate limit reset', {
        key,
        operation: 'rate_limit_reset',
      });
    }

    return {
      allowed,
      remaining,
      resetTime,
      totalHits: entry.count,
    };
  }

  getStats(): {
    totalKeys: number;
    activeWindows: number;
    blockedKeys: number;
  } {
    const now = Date.now();
    let activeWindows = 0;
    let blockedKeys = 0;

    for (const entry of this.store.values()) {
      if (now <= entry.resetTime) {
        activeWindows++;
        if (entry.blocked) {
          blockedKeys++;
        }
      }
    }

    return {
      totalKeys: this.store.size,
      activeWindows,
      blockedKeys,
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

// Global rate limiter instance
const rateLimiter = new RateLimiter();

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // General API endpoints
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests, please try again later',
  },
  
  // Authentication endpoints
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later',
  },
  
  // Review approval endpoints
  REVIEW_APPROVAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many review approval requests, please slow down',
  },
  
  // Listings endpoints
  LISTINGS: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many listing requests, please try again later',
  },
  
  // Reviews endpoints
  REVIEWS: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    message: 'Too many review requests, please try again later',
  },
  
  // Stats endpoints
  STATS: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many statistics requests, please try again later',
  },
} as const;

// Rate limiting middleware
export function withRateLimit(config: RateLimitConfig) {
  return function (handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
    return async function (request: NextRequest, ...args: any[]): Promise<NextResponse> {
      const result = rateLimiter.check(config, request);

      if (!result.allowed) {
        log.warn('Rate limit exceeded', {
          path: request.nextUrl.pathname,
          method: request.method,
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          userAgent: request.headers.get('user-agent'),
          count: result.totalHits,
          maxRequests: config.maxRequests,
          windowMs: config.windowMs,
          operation: 'rate_limit_middleware',
        });

        const response = NextResponse.json(
          {
            success: false,
            error: config.message || 'Rate limit exceeded',
            message: config.message || 'Too many requests, please try again later',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          },
          { status: 429 }
        );

        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
        response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
        response.headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString());

        return response;
      }

      // Add rate limit headers to successful responses
      const response = await handler(request, ...args);
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

      return response;
    };
  };
}

// Utility function to get rate limit status
export function getRateLimitStatus(request: NextRequest, config: RateLimitConfig) {
  return rateLimiter.check(config, request);
}

// Utility function to get rate limiter stats
export function getRateLimiterStats() {
  return rateLimiter.getStats();
}

// Cleanup function for graceful shutdown
export function destroyRateLimiter() {
  rateLimiter.destroy();
}
