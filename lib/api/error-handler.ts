import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import log from '@/lib/logger';
import { ErrorResponseSchema } from '@/lib/validation/schemas';
import type { ApiError as ApiErrorType } from '@/lib/types/api';

export enum ApiErrorCode {
  // Validation errors (400-499)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Authentication errors (401-403)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Not found errors (404)
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  
  // Conflict errors (409)
  CONFLICT = 'CONFLICT',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  
  // Rate limiting (429)
  RATE_LIMITED = 'RATE_LIMITED',
  
  // Server errors (500-599)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: ApiErrorCode = ApiErrorCode.INTERNAL_ERROR,
    statusCode: number = 500,
    details?: Record<string, any>,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  static validation(message: string, details?: Record<string, any>): ApiError {
    return new ApiError(message, ApiErrorCode.VALIDATION_ERROR, 400, details);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(message, ApiErrorCode.UNAUTHORIZED, 401);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(message, ApiErrorCode.FORBIDDEN, 403);
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(message, ApiErrorCode.NOT_FOUND, 404);
  }

  static conflict(message: string, details?: Record<string, any>): ApiError {
    return new ApiError(message, ApiErrorCode.CONFLICT, 409, details);
  }

  static rateLimited(message: string = 'Rate limit exceeded'): ApiError {
    return new ApiError(message, ApiErrorCode.RATE_LIMITED, 429);
  }

  static database(message: string, details?: Record<string, any>): ApiError {
    return new ApiError(message, ApiErrorCode.DATABASE_ERROR, 500, details);
  }

  static externalApi(message: string, details?: Record<string, any>): ApiError {
    return new ApiError(message, ApiErrorCode.EXTERNAL_API_ERROR, 502, details);
  }

  static serviceUnavailable(message: string = 'Service temporarily unavailable'): ApiError {
    return new ApiError(message, ApiErrorCode.SERVICE_UNAVAILABLE, 503);
  }
}

export function handleApiError(error: unknown, context?: Record<string, any>): NextResponse {
  const timestamp = new Date().toISOString();
  let apiError: ApiError;

  // Handle different error types
  if (error instanceof ApiError) {
    apiError = error;
  } else if (error instanceof ZodError) {
    const details = error.errors.reduce((acc, err) => {
      const path = err.path.join('.');
      acc[path] = {
        message: err.message,
        code: err.code,
        ...(('received' in err) && { received: (err as any).received }),
      };
      return acc;
    }, {} as Record<string, any>);

    apiError = ApiError.validation('Validation failed', details);
  } else if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ECONNRESET')) {
      apiError = ApiError.database('Database connection failed', { originalError: error.message });
    } else if (error.message.includes('timeout')) {
      apiError = ApiError.serviceUnavailable('Request timeout');
    } else if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      apiError = ApiError.unauthorized(error.message);
    } else if (error.message.includes('not found')) {
      apiError = ApiError.notFound(error.message);
    } else {
      apiError = new ApiError(
        error.message,
        ApiErrorCode.INTERNAL_ERROR,
        500,
        { originalError: error.message, stack: error.stack }
      );
    }
  } else {
    apiError = new ApiError(
      'An unexpected error occurred',
      ApiErrorCode.INTERNAL_ERROR,
      500,
      { originalError: String(error) }
    );
  }

  // Log the error with appropriate level
  const logContext = {
    error: apiError.message,
    code: apiError.code,
    statusCode: apiError.statusCode,
    details: apiError.details,
    stack: apiError.stack,
    ...context,
  };

  if (apiError.statusCode >= 500) {
    log.error('API Error (Server)', logContext);
  } else if (apiError.statusCode >= 400) {
    log.warn('API Error (Client)', logContext);
  } else {
    log.info('API Error (Info)', logContext);
  }

  // Create error response
  const errorResponse = {
    success: false,
    error: {
      message: apiError.message,
      statusCode: apiError.statusCode,
      timestamp,
      code: apiError.code,
      ...(process.env.NODE_ENV === 'development' && apiError.details && {
        details: apiError.details,
      }),
    },
  };

  return NextResponse.json(errorResponse, { status: apiError.statusCode });
}

export function createSuccessResponse<T>(
  data: T,
  options?: {
    source?: string;
    duration?: number;
    pagination?: any;
  }
): NextResponse {
  const response = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...options,
  };

  return NextResponse.json(response);
}

// Utility function to safely parse JSON from request body
export async function safeJsonParse<T>(request: Request): Promise<T> {
  try {
    const text = await request.text();
    if (!text) {
      throw ApiError.validation('Request body is required');
    }
    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.validation('Invalid JSON in request body');
  }
}

// Utility function to validate and parse query parameters
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: any
): T {
  try {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      throw ApiError.validation('Invalid query parameters', {
        errors: error.errors,
      });
    }
    throw ApiError.validation('Failed to parse query parameters');
  }
}

// Middleware for error handling
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, {
        handler: handler.name,
        args: args.length,
      });
    }
  };
}
