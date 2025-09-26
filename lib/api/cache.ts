import log from '@/lib/logger';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  maxAge?: number; // Maximum age in milliseconds
}

export class MemoryCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly defaultTtl: number;
  private readonly maxSize: number;
  private readonly maxAge: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: CacheOptions = {}) {
    this.defaultTtl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 1000; // 1000 entries default
    this.maxAge = options.maxAge || 60 * 60 * 1000; // 1 hour default

    // Start cleanup interval
    this.startCleanup();
  }

  private startCleanup(): void {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      const isExpired = now - entry.timestamp > entry.ttl;
      const isTooOld = now - entry.timestamp > this.maxAge;

      if (isExpired || isTooOld) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      log.debug('Cache cleanup completed', {
        cleaned,
        remaining: this.cache.size,
        operation: 'cache_cleanup',
      });
    }
  }

  private evictOldest(): void {
    if (this.cache.size === 0) return;

    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      log.debug('Evicted oldest cache entry', {
        key: oldestKey,
        operation: 'cache_eviction',
      });
    }
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entryTtl = ttl || this.defaultTtl;

    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: entryTtl,
      hits: 0,
      lastAccessed: now,
    });

    log.debug('Cache entry set', {
      key,
      ttl: entryTtl,
      size: this.cache.size,
      operation: 'cache_set',
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    const now = Date.now();

    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      log.debug('Cache entry expired', {
        key,
        age: now - entry.timestamp,
        ttl: entry.ttl,
        operation: 'cache_expired',
      });
      return null;
    }

    // Update access statistics
    entry.hits++;
    entry.lastAccessed = now;

    log.debug('Cache hit', {
      key,
      hits: entry.hits,
      age: now - entry.timestamp,
      operation: 'cache_hit',
    });

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      log.debug('Cache entry deleted', {
        key,
        operation: 'cache_delete',
      });
    }
    return deleted;
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    log.info('Cache cleared', {
      clearedEntries: size,
      operation: 'cache_clear',
    });
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{
      key: string;
      age: number;
      hits: number;
      ttl: number;
    }>;
  } {
    const now = Date.now();
    let totalHits = 0;
    const entries: Array<{
      key: string;
      age: number;
      hits: number;
      ttl: number;
    }> = [];

    for (const [key, entry] of this.cache.entries()) {
      totalHits += entry.hits;
      entries.push({
        key,
        age: now - entry.timestamp,
        hits: entry.hits,
        ttl: entry.ttl,
      });
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
      entries: entries.sort((a, b) => b.hits - a.hits),
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Global cache instances for different data types
export const listingsCache = new MemoryCache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 500,
});

export const reviewsCache = new MemoryCache({
  ttl: 2 * 60 * 1000, // 2 minutes
  maxSize: 1000,
});

export const statsCache = new MemoryCache({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 100,
});

export const propertyCache = new MemoryCache({
  ttl: 15 * 60 * 1000, // 15 minutes
  maxSize: 200,
});

// Cache key generators
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as Record<string, any>);

  return `${prefix}:${JSON.stringify(sortedParams)}`;
}

export function generateListingsCacheKey(filters: Record<string, any>): string {
  return generateCacheKey('listings', filters);
}

export function generateReviewsCacheKey(filters: Record<string, any>): string {
  return generateCacheKey('reviews', filters);
}

export function generateStatsCacheKey(): string {
  return 'stats:global';
}

export function generatePropertyCacheKey(id: string, options: Record<string, any> = {}): string {
  return generateCacheKey(`property:${id}`, options);
}

// Cache middleware for API routes
export function withCache<T extends any[]>(
  cache: MemoryCache,
  keyGenerator: (...args: T) => string,
  options?: { ttl?: number }
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: T) {
      const cacheKey = keyGenerator(...args);
      
      // Try to get from cache first
      const cached = cache.get(cacheKey);
      if (cached) {
        log.debug('Cache hit in middleware', {
          key: cacheKey,
          method: propertyName,
          operation: 'cache_middleware_hit',
        });
        return cached;
      }

      // Execute the original method
      const result = await method.apply(this, args);

      // Cache the result
      cache.set(cacheKey, result, options?.ttl);

      log.debug('Cache miss in middleware', {
        key: cacheKey,
        method: propertyName,
        operation: 'cache_middleware_miss',
      });

      return result;
    };

    return descriptor;
  };
}




