import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import log from '@/lib/logger';
import { ApiError } from './error-handler';

// Request context interface
export interface RequestContext {
  startTime: number;
  method: string;
  path: string;
  userAgent?: string;
  ip?: string;
  userId?: string;
  requestId: string;
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics = new Map<string, { count: number; totalTime: number; avgTime: number }>();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(operation: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(operation, duration);
    };
  }

  private recordMetric(operation: string, duration: number): void {
    const existing = this.metrics.get(operation) || { count: 0, totalTime: 0, avgTime: 0 };
    
    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;
    
    this.metrics.set(operation, existing);

    // Log slow operations
    if (duration > 2000) {
      log.warn(
        `[PerformanceMonitor] Slow operation detected: ${operation} took ${duration}ms (threshold: 2000ms)`
      );
    }
  }

  getMetrics(): Record<string, { count: number; totalTime: number; avgTime: number }> {
    return Object.fromEntries(this.metrics);
  }

  reset(): void {
    this.metrics.clear();
  }
}

// Request ID generator
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Extract request context
export function extractRequestContext(request: NextRequest): RequestContext {
  const headersList = headers();
  
  return {
    startTime: Date.now(),
    method: request.method,
    path: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent') || undefined,
    ip:
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      undefined,
    requestId: generateRequestId(),
  };
}

// Security utilities
export class SecurityUtils {
  // Sanitize input to prevent XSS
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate and sanitize email
  static sanitizeEmail(email: string): string {
    const sanitized = this.sanitizeInput(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(sanitized)) {
      throw ApiError.validation('Invalid email format');
    }
    
    return sanitized.toLowerCase();
  }

  // Validate and sanitize phone number
  static sanitizePhone(phone: string): string {
    const sanitized = this.sanitizeInput(phone);
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    
    if (!phoneRegex.test(sanitized.replace(/[\s\-\(\)]/g, ''))) {
      throw ApiError.validation('Invalid phone number format');
    }
    
    return sanitized;
  }

  // Validate URL
  static validateUrl(url: string): string {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }
      return parsed.toString();
    } catch {
      throw ApiError.validation('Invalid URL format');
    }
  }

  // Check for SQL injection patterns
  static detectSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
      /(\b(OR|AND)\s+['"]\s*LIKE\s*['"])/i,
      /(\b(OR|AND)\s+['"]\s*IN\s*\(['"])/i,
      /(\b(OR|AND)\s+['"]\s*BETWEEN\s+['"])/i,
      /(\b(OR|AND)\s+['"]\s*EXISTS\s*\(['"])/i,
      /(\b(OR|AND)\s+['"]\s*NOT\s+EXISTS\s*\(['"])/i,
      /(\b(OR|AND)\s+['"]\s*IS\s+NULL\b)/i,
      /(\b(OR|AND)\s+['"]\s*IS\s+NOT\s+NULL\b)/i,
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // Check for XSS patterns
  static detectXss(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
      /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }
}

// Input validation and sanitization
export function sanitizeAndValidateInput(input: any, type: 'string' | 'email' | 'phone' | 'url'): any {
  if (typeof input === 'string') {
    // Check for malicious patterns
    if (SecurityUtils.detectSqlInjection(input)) {
      throw ApiError.validation('Invalid input detected');
    }
    
    if (SecurityUtils.detectXss(input)) {
      throw ApiError.validation('Invalid input detected');
    }

    switch (type) {
      case 'string':
        return SecurityUtils.sanitizeInput(input);
      case 'email':
        return SecurityUtils.sanitizeEmail(input);
      case 'phone':
        return SecurityUtils.sanitizePhone(input);
      case 'url':
        return SecurityUtils.validateUrl(input);
      default:
        return input;
    }
  }
  
  return input;
}

// Response utilities
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

// Logging utilities
export function logApiRequest(context: RequestContext, endpoint: string, params?: Record<string, any>): void {
  log.info('API Request', {
    requestId: context.requestId,
    method: context.method,
    path: context.path,
    endpoint,
    userAgent: context.userAgent,
    ip: context.ip,
    userId: context.userId,
    ...params,
    operation: 'api_request',
  });
}

export function logApiResponse(
  context: RequestContext, 
  endpoint: string, 
  statusCode: number, 
  duration: number,
  params?: Record<string, any>
): void {
  const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
  
  log[level]('API Response', {
    requestId: context.requestId,
    method: context.method,
    path: context.path,
    endpoint,
    statusCode,
    duration,
    userAgent: context.userAgent,
    ip: context.ip,
    userId: context.userId,
    ...params,
    operation: 'api_response',
  });
}

// Database query utilities
export function logDatabaseQuery(query: string, params?: any[], duration?: number): void {
  log.debug('Database query executed', {
    query: query.substring(0, 200), // Truncate long queries
    paramCount: params?.length || 0,
    duration,
    operation: 'database_query',
  });
}

// External API utilities
export function logExternalApiCall(
  service: string,
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  error?: string
): void {
  const level = statusCode >= 400 ? 'error' : 'info';
  
  log[level]('External API call', {
    service,
    endpoint,
    method,
    statusCode,
    duration,
    error,
    operation: 'external_api_call',
  });
}

// Utility to create standardized API responses
export function createApiResponse<T>(
  data: T,
  context: RequestContext,
  options?: {
    source?: string;
    pagination?: any;
    statistics?: any;
  }
): NextResponse {
  const duration = Date.now() - context.startTime;
  
  const response = NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    duration,
    requestId: context.requestId,
    ...options,
  });

  // Add security headers
  addSecurityHeaders(response);

  // Log the response
  logApiResponse(context, context.path, 200, duration, options);

  return response;
}

// Utility to handle OPTIONS requests for CORS
export function handleCorsRequest(): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  return addSecurityHeaders(response);
}

// Utility to check if request is from allowed origin
export function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
  
  if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
    return true;
  }
  
  return allowedOrigins.includes(origin);
}

// Utility to extract pagination info from request
export function extractPaginationInfo(request: NextRequest): {
  page: number;
  limit: number;
  offset: number;
} {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

// Utility to create pagination response
export function createPaginationResponse(
  data: any[],
  total: number,
  page: number,
  limit: number
): {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
} {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore,
    },
  };
}
