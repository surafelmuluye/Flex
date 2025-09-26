import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/services/api-response.service';
import { createRateLimitMiddleware } from '@/lib/services/rate-limit.service';
import { createSecurityHeaders, createCorsHeaders, validateRequest } from '@/lib/services/security.service';
import log from '@/lib/logger';

// API handler configuration
interface ApiHandlerConfig {
  rateLimiter?: any;
  cache?: {
    key: string;
    ttl: number;
    cache: any;
  };
  requireAuth?: boolean;
  allowedMethods?: string[];
}

// Generic API handler that follows DRY principles
export function createApiHandler<T = unknown>(
  handler: (request: NextRequest, context?: any) => Promise<T>,
  config: ApiHandlerConfig = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    
    try {
      // Log request start
      log.debug('API request started', {
        method: request.method,
        url: request.url,
        requestId,
        operation: 'api_request_start',
      });

      // Security validation
      const securityValidation = validateRequest(request);
      if (!securityValidation.isValid) {
        log.warn('Security validation failed', {
          errors: securityValidation.errors,
          requestId,
          operation: 'api_security_validation_failed',
        });
        
        return NextResponse.json(
          createErrorResponse('Security validation failed', 400, { errors: securityValidation.errors }),
          { status: 400 }
        );
      }

      // Rate limiting
      if (config.rateLimiter) {
        const rateLimitMiddleware = createRateLimitMiddleware(config.rateLimiter);
        const rateLimitResponse = await rateLimitMiddleware(request);
        if (rateLimitResponse) {
          return NextResponse.json(
            JSON.parse(await rateLimitResponse.text()),
            { status: rateLimitResponse.status, headers: Object.fromEntries(rateLimitResponse.headers.entries()) }
          );
        }
      }

      // Method validation
      if (config.allowedMethods && !config.allowedMethods.includes(request.method)) {
        log.warn('Method not allowed', {
          method: request.method,
          allowedMethods: config.allowedMethods,
          requestId,
          operation: 'api_method_not_allowed',
        });
        
        return NextResponse.json(
          createErrorResponse('Method not allowed', 405),
          { status: 405 }
        );
      }

      // Check cache first
      if (config.cache) {
        const cachedData = config.cache.cache.get(config.cache.key);
        if (cachedData) {
          log.debug('Data served from cache', {
            cacheKey: config.cache.key,
            requestId,
            operation: 'api_cache_hit',
          });
          
          return NextResponse.json(
            createSuccessResponse(cachedData, 'Data retrieved successfully'),
            {
              status: 200,
              headers: {
                ...createSecurityHeaders(),
                ...createCorsHeaders(request.headers.get('origin')),
                'Cache-Control': `public, max-age=${config.cache.ttl}`,
              },
            }
          );
        }
      }

      // Execute handler
      const result = await handler(request, context);

      // Cache the result
      if (config.cache && result) {
        config.cache.cache.set(config.cache.key, result, config.cache.ttl);
      }

      const responseTime = Date.now() - startTime;

      log.info('API request completed', {
        method: request.method,
        url: request.url,
        requestId,
        responseTime,
        operation: 'api_request_completed',
      });

      return NextResponse.json(
        createSuccessResponse(result, 'Request completed successfully'),
        {
          status: 200,
          headers: {
            ...createSecurityHeaders(),
            ...createCorsHeaders(request.headers.get('origin')),
            'Cache-Control': config.cache ? `public, max-age=${config.cache.ttl}` : 'no-cache',
          },
        }
      );

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      log.error('API request failed', {
        method: request.method,
        url: request.url,
        requestId,
        responseTime,
        error: error instanceof Error ? error.message : String(error),
        operation: 'api_request_failed',
      });

      const errorResponse = handleApiError(error);
      
      return NextResponse.json(
        errorResponse,
        {
          status: errorResponse.error.statusCode,
          headers: {
            ...createSecurityHeaders(),
            ...createCorsHeaders(request.headers.get('origin')),
          },
        }
      );
    }
  };
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// CORS handler
export function createCorsHandler() {
  return async (request: NextRequest): Promise<NextResponse> => {
    return new NextResponse(null, {
      status: 200,
      headers: {
        ...createSecurityHeaders(),
        ...createCorsHeaders(request.headers.get('origin')),
      },
    });
  };
}

// Health check handler
export function createHealthHandler() {
  return createApiHandler(async () => {
    const startTime = Date.now();
    
    // Import health check functions dynamically to avoid circular dependencies
    const { checkDatabaseHealth } = await import('@/lib/services/database.service');
    const { checkCacheHealth } = await import('@/lib/services/cache.service');
    const { checkSecurityHealth } = await import('@/lib/services/security.service');

    const [databaseHealth, cacheHealth, securityHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkCacheHealth(),
      checkSecurityHealth(),
    ]);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const isHealthy = 
      databaseHealth.status === 'healthy' &&
      cacheHealth.status === 'healthy' &&
      securityHealth.status === 'healthy';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        database: {
          ...databaseHealth,
          lastChecked: new Date().toISOString(),
        },
        cache: {
          ...cacheHealth,
          lastChecked: new Date().toISOString(),
        },
        security: {
          ...securityHealth,
          lastChecked: new Date().toISOString(),
        },
      },
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  });
}




