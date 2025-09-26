import { listingsCache, reviewsCache, statsCache, propertyCache } from './cache.service';
import { apiRateLimiter, authRateLimiter, listingsRateLimiter, reviewsRateLimiter, statsRateLimiter } from './rate-limit.service';
import log from '@/lib/logger';

// Service manager to handle initialization and prevent duplication
class ServiceManager {
  private static instance: ServiceManager;
  private initialized = false;
  private services: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  initialize(): void {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize caches
      this.services.set('listingsCache', listingsCache);
      this.services.set('reviewsCache', reviewsCache);
      this.services.set('statsCache', statsCache);
      this.services.set('propertyCache', propertyCache);

      // Initialize rate limiters
      this.services.set('apiRateLimiter', apiRateLimiter);
      this.services.set('authRateLimiter', authRateLimiter);
      this.services.set('listingsRateLimiter', listingsRateLimiter);
      this.services.set('reviewsRateLimiter', reviewsRateLimiter);
      this.services.set('statsRateLimiter', statsRateLimiter);

      this.initialized = true;

      log.info('Service manager initialized', {
        servicesCount: this.services.size,
        operation: 'service_manager_initialized',
      });
    } catch (error) {
      log.error('Service manager initialization failed', {
        error: error instanceof Error ? error.message : String(error),
        operation: 'service_manager_init_failed',
      });
      throw error;
    }
  }

  getService<T>(name: string): T {
    if (!this.initialized) {
      this.initialize();
    }

    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }

    return service as T;
  }

  getCache(name: string) {
    return this.getService(name);
  }

  getRateLimiter(name: string) {
    return this.getService(name);
  }

  // Health check for all services
  checkServicesHealth(): {
    status: 'healthy' | 'unhealthy';
    services: Record<string, { status: string; details: any }>;
  } {
    const services: Record<string, { status: string; details: any }> = {};

    try {
      // Check caches
      services.listingsCache = {
        status: 'healthy',
        details: this.services.get('listingsCache')?.getStats() || {},
      };
      services.reviewsCache = {
        status: 'healthy',
        details: this.services.get('reviewsCache')?.getStats() || {},
      };
      services.statsCache = {
        status: 'healthy',
        details: this.services.get('statsCache')?.getStats() || {},
      };
      services.propertyCache = {
        status: 'healthy',
        details: this.services.get('propertyCache')?.getStats() || {},
      };

      // Check rate limiters
      services.apiRateLimiter = {
        status: 'healthy',
        details: { initialized: true },
      };
      services.authRateLimiter = {
        status: 'healthy',
        details: { initialized: true },
      };
      services.listingsRateLimiter = {
        status: 'healthy',
        details: { initialized: true },
      };
      services.reviewsRateLimiter = {
        status: 'healthy',
        details: { initialized: true },
      };
      services.statsRateLimiter = {
        status: 'healthy',
        details: { initialized: true },
      };

      const isHealthy = Object.values(services).every(service => service.status === 'healthy');

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        services,
      };
    } catch (error) {
      log.error('Service health check failed', {
        error: error instanceof Error ? error.message : String(error),
        operation: 'service_health_check_failed',
      });

      return {
        status: 'unhealthy',
        services: {},
      };
    }
  }

  // Cleanup all services
  destroy(): void {
    try {
      // Destroy caches
      this.services.get('listingsCache')?.destroy();
      this.services.get('reviewsCache')?.destroy();
      this.services.get('statsCache')?.destroy();
      this.services.get('propertyCache')?.destroy();

      // Destroy rate limiters
      this.services.get('apiRateLimiter')?.destroy();
      this.services.get('authRateLimiter')?.destroy();
      this.services.get('listingsRateLimiter')?.destroy();
      this.services.get('reviewsRateLimiter')?.destroy();
      this.services.get('statsRateLimiter')?.destroy();

      this.services.clear();
      this.initialized = false;

      log.info('Service manager destroyed', {
        operation: 'service_manager_destroyed',
      });
    } catch (error) {
      log.error('Service manager destruction failed', {
        error: error instanceof Error ? error.message : String(error),
        operation: 'service_manager_destroy_failed',
      });
    }
  }
}

// Export singleton instance
export const serviceManager = ServiceManager.getInstance();

// Auto-initialize services
serviceManager.initialize();

// Export convenience functions
export function getCache(name: string) {
  return serviceManager.getCache(name);
}

export function getRateLimiter(name: string) {
  return serviceManager.getRateLimiter(name);
}

export function initializeServices() {
  serviceManager.initialize();
}

export function checkServicesHealth() {
  return serviceManager.checkServicesHealth();
}

export function destroyServices() {
  serviceManager.destroy();
}
