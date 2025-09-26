import type { CacheEntry, CacheStrategy } from '@/lib/types/api';
import log from '@/lib/logger';

// Cache configuration
interface CacheConfig {
  readonly strategy: CacheStrategy;
  readonly ttl: number; // Time to live in seconds
  readonly maxSize: number; // Maximum number of entries
  readonly checkPeriod: number; // Check period in seconds
}

// Cache statistics
interface CacheStats {
  readonly size: number;
  readonly maxSize: number;
  readonly hitRate: number;
  readonly missRate: number;
  readonly totalHits: number;
  readonly totalMisses: number;
  readonly totalSets: number;
  readonly totalDeletes: number;
}

// Simple in-memory cache implementation
class SimpleMemoryCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly config: CacheConfig;
  private readonly name: string;
  private totalHits = 0;
  private totalMisses = 0;
  private totalSets = 0;
  private totalDeletes = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(name: string, config: CacheConfig) {
    this.name = name;
    this.config = config;

    // Start cleanup interval
    this.startCleanup();

    log.info('SimpleMemoryCache initialized', {
      cache: this.name,
      ttl: config.ttl,
      maxSize: config.maxSize,
      operation: 'cache_init',
    });
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
      const isTooOld = now - entry.timestamp > this.config.ttl * 1000;

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
    const entryTtl = (ttl || this.config.ttl) * 1000; // Convert to milliseconds

    // Evict oldest entry if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: entryTtl,
      hits: 0,
      lastAccessed: now,
    });

    this.totalSets++;

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
      this.totalMisses++;
      return null;
    }

    // Check if entry is expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.totalMisses++;
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

    this.totalHits++;

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
      this.totalDeletes++;
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

  getStats(): CacheStats {
    const totalRequests = this.totalHits + this.totalMisses;
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: totalRequests > 0 ? this.totalHits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.totalMisses / totalRequests : 0,
      totalHits: this.totalHits,
      totalMisses: this.totalMisses,
      totalSets: this.totalSets,
      totalDeletes: this.totalDeletes,
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

// Cache key generators
export const generateCacheKey = (prefix: string, params: Record<string, unknown>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as Record<string, unknown>);

  return `${prefix}:${JSON.stringify(sortedParams)}`;
};

export const generateListingsCacheKey = (filters: Record<string, unknown>): string => {
  return generateCacheKey('listings', filters);
};

export const generateReviewsCacheKey = (filters: Record<string, unknown>): string => {
  return generateCacheKey('reviews', filters);
};

export const generateStatsCacheKey = (): string => {
  return 'stats:global';
};

export const generateDashboardCacheKey = (): string => {
  return 'dashboard:global';
};

export const generateListingsStatsCacheKey = (): string => {
  return 'listings-stats:global';
};

export const generatePropertyCacheKey = (id: string, options: Record<string, unknown> = {}): string => {
  return generateCacheKey(`property:${id}`, options);
};

// Global cache instances
const cacheConfigs = {
  listings: {
    strategy: 'memory' as const,
    ttl: 300, // 5 minutes
    maxSize: 500,
    checkPeriod: 60, // 1 minute
  },
  reviews: {
    strategy: 'memory' as const,
    ttl: 120, // 2 minutes
    maxSize: 1000,
    checkPeriod: 30, // 30 seconds
  },
  stats: {
    strategy: 'memory' as const,
    ttl: 600, // 10 minutes
    maxSize: 100,
    checkPeriod: 120, // 2 minutes
  },
  properties: {
    strategy: 'memory' as const,
    ttl: 900, // 15 minutes
    maxSize: 200,
    checkPeriod: 180, // 3 minutes
  },
} as const;

export const listingsCache = new SimpleMemoryCache('listings', cacheConfigs.listings);
export const reviewsCache = new SimpleMemoryCache('reviews', cacheConfigs.reviews);
export const statsCache = new SimpleMemoryCache('stats', cacheConfigs.stats);
export const propertyCache = new SimpleMemoryCache('properties', cacheConfigs.properties);

// Cache health check
export function checkCacheHealth(): {
  status: 'healthy' | 'unhealthy';
  stats: Record<string, CacheStats>;
} {
  try {
    const cacheStats = {
      listings: listingsCache.getStats(),
      reviews: reviewsCache.getStats(),
      stats: statsCache.getStats(),
      properties: propertyCache.getStats(),
    };

    // Check if any cache is in an unhealthy state
    const isHealthy = Object.values(cacheStats).every(cache => 
      cache.size >= 0 && cache.maxSize > 0
    );

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      stats: cacheStats,
    };
  } catch (error) {
    log.error('Cache health check failed', {
      error: error instanceof Error ? error.message : String(error),
      operation: 'cache_health_check_failed',
    });

    return {
      status: 'unhealthy',
      stats: {},
    };
  }
}

// Cleanup function for graceful shutdown
export function destroyAllCaches(): void {
  listingsCache.destroy();
  reviewsCache.destroy();
  statsCache.destroy();
  propertyCache.destroy();
  
  log.info('All caches destroyed', {
    operation: 'cache_cleanup',
  });
}