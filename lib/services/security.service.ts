import type { SecurityConfig, SecurityHeaders } from '@/lib/types/api';
import log from '@/lib/logger';

// Security configuration
const securityConfig: SecurityConfig = {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://the-flex-dashboard.vercel.app'] 
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  },
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
  },
};

// Input sanitization
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') {
    return String(input);
  }

  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// SQL injection prevention
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/['"]/g, '') // Remove quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comments
    .replace(/\*\//g, '') // Remove block comments
    .trim();
}

// XSS prevention
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate UUID format
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Generate secure random string
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// Hash password (simple implementation - in production use bcrypt)
export function hashPassword(password: string): string {
  // This is a simple hash - in production, use bcrypt or similar
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

// Verify password
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Security headers middleware
export function createSecurityHeaders(): SecurityHeaders {
  return {
    ...securityConfig.headers,
    'Content-Security-Policy': process.env.NODE_ENV === 'production'
      ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
      : "default-src 'self' 'unsafe-inline' 'unsafe-eval';",
  };
}

// CORS middleware
export function createCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = securityConfig.cors.origin;
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);
  
  if (!isAllowedOrigin && origin) {
    log.warn('CORS: Origin not allowed', {
      origin,
      allowedOrigins,
      operation: 'cors_origin_blocked',
    });
  }

  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': securityConfig.cors.methods.join(', '),
    'Access-Control-Allow-Headers': securityConfig.cors.allowedHeaders.join(', '),
    'Access-Control-Allow-Credentials': securityConfig.cors.credentials.toString(),
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

// Security validation
export function validateRequest(request: Request): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check request size
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    errors.push('Request too large');
  }

  // Check content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      errors.push('Invalid content type');
    }
  }

    // Check for suspicious headers (only in production)
    if (process.env.NODE_ENV === 'production') {
      const suspiciousHeaders = ['x-originating-ip', 'x-remote-ip'];
      for (const header of suspiciousHeaders) {
        if (request.headers.get(header)) {
          errors.push(`Suspicious header: ${header}`);
        }
      }
    }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Security audit logging
export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): void {
  const logData = {
    ...details,
    event,
    severity,
    timestamp: new Date().toISOString(),
    operation: 'security_event',
  };

  switch (severity) {
    case 'critical':
    case 'high':
      log.error('Security event', logData);
      break;
    case 'medium':
      log.warn('Security event', logData);
      break;
    case 'low':
      log.info('Security event', logData);
      break;
  }
}

// Security configuration getter
export function getSecurityConfig(): SecurityConfig {
  return securityConfig;
}

// Security health check
export function checkSecurityHealth(): {
  status: 'healthy' | 'unhealthy';
  config: SecurityConfig;
  issues: string[];
} {
  const issues: string[] = [];

  // Check if CORS is properly configured
  if (securityConfig.cors.origin.length === 0) {
    issues.push('CORS origins not configured');
  }

  // Check if security headers are present
  const requiredHeaders = ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection'];
  for (const header of requiredHeaders) {
    if (!securityConfig.headers[header as keyof typeof securityConfig.headers]) {
      issues.push(`Missing security header: ${header}`);
    }
  }

  return {
    status: issues.length === 0 ? 'healthy' : 'unhealthy',
    config: securityConfig,
    issues,
  };
}
