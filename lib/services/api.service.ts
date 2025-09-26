import { NextRequest, NextResponse } from 'next/server';
import { getLogger } from './simple-logger.service';

const logger = getLogger('api-service');

export interface RequestContext {
  requestId: string;
  startTime: number;
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
}

export function extractRequestContext(request: NextRequest): RequestContext {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  return {
    requestId,
    startTime,
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown'
  };
}

export function createApiResponse(
  data: any,
  context: RequestContext,
  status: number = 200,
  headers?: Record<string, string>
): NextResponse {
  const duration = Date.now() - context.startTime;
  
  const response = {
    success: true,
    data,
    message: 'Request completed successfully',
    timestamp: new Date().toISOString(),
    requestId: context.requestId,
    duration
  };

  logger.info('API response created', {
    requestId: context.requestId,
    method: context.method,
    url: context.url,
    status,
    duration,
    hasData: !!data,
    operation: 'api_response_created'
  });

  return NextResponse.json(response, { status, headers });
}

export function createErrorResponse(
  message: string,
  context: RequestContext,
  status: number = 500,
  error?: any
): NextResponse {
  const duration = Date.now() - context.startTime;
  
  const response = {
    success: false,
    error: message,
    message,
    timestamp: new Date().toISOString(),
    requestId: context.requestId,
    duration
  };

  if (error) {
    response.error = error;
  }

  logger.error('API error response created', {
    requestId: context.requestId,
    method: context.method,
    url: context.url,
    status,
    duration,
    error: error instanceof Error ? error.message : String(error),
    operation: 'api_error_response_created'
  });

  return NextResponse.json(response, { status });
}

export class PerformanceMonitor {
  private timers: Map<string, number> = new Map();

  startTimer(name: string): () => void {
    const startTime = Date.now();
    this.timers.set(name, startTime);
    
    logger.debug('Timer started', {
      timerName: name,
      startTime,
      operation: 'timer_started'
    });

    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.timers.delete(name);
      
      logger.debug('Timer completed', {
        timerName: name,
        duration,
        startTime,
        endTime,
        operation: 'timer_completed'
      });
    };
  }

  getTimer(name: string): number | undefined {
    return this.timers.get(name);
  }

  clearTimer(name: string): void {
    this.timers.delete(name);
  }

  clearAllTimers(): void {
    this.timers.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

export function withRequestLogging<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    const request = args.find(arg => arg instanceof Request) as NextRequest | undefined;
    
    if (request) {
      const context = extractRequestContext(request);
      
      logger.info('API request started', {
        requestId: context.requestId,
        method: context.method,
        url: context.url,
        userAgent: context.userAgent,
        ip: context.ip,
        operation: 'api_request_started'
      });

      try {
        const response = await handler(...args);
        const duration = Date.now() - context.startTime;
        
        logger.info('API request completed', {
          requestId: context.requestId,
          method: context.method,
          url: context.url,
          status: response.status,
          duration,
          operation: 'api_request_completed'
        });

        return response;
      } catch (error) {
        const duration = Date.now() - context.startTime;
        
        logger.error('API request failed', {
          requestId: context.requestId,
          method: context.method,
          url: context.url,
          duration,
          error: error instanceof Error ? error.message : String(error),
          operation: 'api_request_failed'
        });

        throw error;
      }
    }

    return handler(...args);
  };
}

export function validateRequestMethod(
  request: NextRequest,
  allowedMethods: string[]
): boolean {
  const method = request.method;
  const isAllowed = allowedMethods.includes(method);
  
  if (!isAllowed) {
    logger.warn('Method not allowed', {
      method,
      allowedMethods,
      url: request.url,
      operation: 'method_not_allowed'
    });
  }
  
  return isAllowed;
}

export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}




