import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import log from '@/lib/logger';

// CORS configuration
const CORS_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',').map(origin => origin.trim());
const CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
const CORS_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin',
  'Access-Control-Request-Method',
  'Access-Control-Request-Headers',
];

// Security headers configuration
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
};

// Rate limiting configuration for different endpoints
const RATE_LIMIT_CONFIG = {
  '/api/auth': { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  '/api/reviews/hostaway': { windowMs: 60 * 1000, maxRequests: 20 },
  '/api/listings': { windowMs: 60 * 1000, maxRequests: 30 },
  '/api/properties': { windowMs: 60 * 1000, maxRequests: 30 },
  '/api/health': { windowMs: 60 * 1000, maxRequests: 10 },
  default: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
};

// Check if origin is allowed
function isOriginAllowed(origin: string): boolean {
  if (CORS_ORIGINS.includes('*')) {
    return true;
  }
  return CORS_ORIGINS.includes(origin);
}

// Add CORS headers
function addCorsHeaders(response: NextResponse, origin?: string): NextResponse {
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (CORS_ORIGINS.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set('Access-Control-Allow-Methods', CORS_METHODS.join(', '));
  response.headers.set('Access-Control-Allow-Headers', CORS_HEADERS.join(', '));
  response.headers.set('Access-Control-Max-Age', '86400');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}

// Add security headers
function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Log request
function logRequest(request: NextRequest): void {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  log.info('API Request', {
    method: request.method,
    path: request.nextUrl.pathname,
    userAgent,
    ip,
    origin: request.headers.get('origin'),
    operation: 'api_request',
  });
}

// Handle CORS preflight requests
export function handleCorsPreflight(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  
  if (!origin || !isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(addSecurityHeaders(response), origin);
}

// Main API middleware
export function apiMiddleware(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async function (request: NextRequest, ...args: any[]): Promise<NextResponse> {
    const startTime = Date.now();
    const origin = request.headers.get('origin');

    try {
      // Log the request
      logRequest(request);

      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return handleCorsPreflight(request);
      }

      // Check origin for non-preflight requests
      if (origin && !isOriginAllowed(origin)) {
        log.warn('Request from disallowed origin', {
          origin,
          path: request.nextUrl.pathname,
          operation: 'cors_origin_blocked',
        });
        return new NextResponse('Forbidden', { status: 403 });
      }

      // Execute the handler
      const response = await handler(request, ...args);
      const duration = Date.now() - startTime;

      // Add CORS and security headers
      const enhancedResponse = addCorsHeaders(
        addSecurityHeaders(response),
        origin === null ? undefined : origin
      );

      // Add performance headers
      enhancedResponse.headers.set('X-Response-Time', `${duration}ms`);
      enhancedResponse.headers.set('X-Request-ID', `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`);

      // Log the response
      log.info('API Response', {
        method: request.method,
        path: request.nextUrl.pathname,
        statusCode: response.status,
        duration,
        origin,
        operation: 'api_response',
      });

      return enhancedResponse;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      log.error('API Middleware Error', {
        method: request.method,
        path: request.nextUrl.pathname,
        error: error instanceof Error ? error.message : String(error),
        duration,
        origin,
        operation: 'api_middleware_error',
      });

      // Return error response with CORS headers
      const errorResponse = new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' 
            ? (error instanceof Error ? error.message : String(error))
            : 'An unexpected error occurred',
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return addCorsHeaders(addSecurityHeaders(errorResponse), origin === null ? undefined : origin);
    }
  };
}

// Utility to create API route with middleware
export function createApiRoute(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return apiMiddleware(handler);
}

// Utility to handle different HTTP methods
export function createMethodHandler(handlers: {
  GET?: (request: NextRequest, ...args: any[]) => Promise<NextResponse>;
  POST?: (request: NextRequest, ...args: any[]) => Promise<NextResponse>;
  PUT?: (request: NextRequest, ...args: any[]) => Promise<NextResponse>;
  DELETE?: (request: NextRequest, ...args: any[]) => Promise<NextResponse>;
  OPTIONS?: (request: NextRequest, ...args: any[]) => Promise<NextResponse>;
}) {
  return apiMiddleware(async (request: NextRequest, ...args: any[]) => {
    const method = request.method as keyof typeof handlers;
    const handler = handlers[method];

    if (!handler) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Method not allowed',
          message: `Method ${method} is not allowed for this endpoint`,
        }),
        { 
          status: 405,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return handler(request, ...args);
  });
}
