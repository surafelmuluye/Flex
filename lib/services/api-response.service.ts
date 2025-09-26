import type { ApiResponse, ApiError, PaginationMeta, ApiSuccessResponse } from '@/lib/types/api';
import log from '@/lib/logger';

// Success response factory
export function createSuccessResponse<T>(
  data: T,
  message: string = 'Success',
  meta?: PaginationMeta
): ApiSuccessResponse<T> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };

  if (meta) {
    response.meta = meta;
  }

  log.debug('API success response created', {
    message,
    hasData: !!data,
    hasMeta: !!meta,
    operation: 'api_success_response',
  });

  return response;
}

// Error response factory
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  details?: Record<string, unknown>,
  code?: string
): ApiError {
  const error: ApiError = {
    name: 'ApiError',
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  };

  if (details) {
    error.error.details = details;
  }

  if (code) {
    error.error.code = code;
  }

  log.error('API error response created', {
    message,
    statusCode,
    code,
    hasDetails: !!details,
    operation: 'api_error_response',
  });

  return error;
}

// Validation error response
export function createValidationErrorResponse(
  errors: Record<string, string[]>
): ApiError {
  return createErrorResponse(
    'Validation failed',
    400,
    { validationErrors: errors },
    'VALIDATION_ERROR'
  );
}

// Not found error response
export function createNotFoundResponse(resource: string = 'Resource'): ApiError {
  return createErrorResponse(
    `${resource} not found`,
    404,
    undefined,
    'NOT_FOUND'
  );
}

// Unauthorized error response
export function createUnauthorizedResponse(message: string = 'Unauthorized'): ApiError {
  return createErrorResponse(
    message,
    401,
    undefined,
    'UNAUTHORIZED'
  );
}

// Forbidden error response
export function createForbiddenResponse(message: string = 'Forbidden'): ApiError {
  return createErrorResponse(
    message,
    403,
    undefined,
    'FORBIDDEN'
  );
}

// Rate limit error response
export function createRateLimitResponse(retryAfter?: number): ApiError {
  return createErrorResponse(
    'Rate limit exceeded',
    429,
    { retryAfter },
    'RATE_LIMIT_EXCEEDED'
  );
}

// Internal server error response
export function createInternalErrorResponse(
  message: string = 'Internal server error',
  details?: Record<string, unknown>
): ApiError {
  return createErrorResponse(
    message,
    500,
    details,
    'INTERNAL_ERROR'
  );
}

// Bad request error response
export function createBadRequestResponse(
  message: string = 'Bad request',
  details?: Record<string, unknown>
): ApiError {
  return createErrorResponse(
    message,
    400,
    details,
    'BAD_REQUEST'
  );
}

// Pagination meta factory
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
  totalPages?: number
): PaginationMeta {
  const calculatedTotalPages = totalPages || Math.ceil(total / limit);
  
  return {
    pagination: {
      page,
      limit,
      total,
      totalPages: calculatedTotalPages,
      hasNext: page < calculatedTotalPages,
      hasPrev: page > 1,
    },
  };
}

// Response with pagination
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Success'
): ApiSuccessResponse<T[]> {
  const meta = createPaginationMeta(page, limit, total);
  
  return createSuccessResponse(data, message, meta);
}

// HTTP response factory
export function createHttpResponse<T>(
  response: ApiResponse<T>,
  statusCode?: number
): Response {
  const httpStatus = statusCode || (response.success ? 200 : 500);
  
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });

  // Add rate limit headers if present
  if ('error' in response && response.error?.details?.retryAfter) {
    headers.set('Retry-After', response.error.details.retryAfter.toString());
  }

  log.debug('HTTP response created', {
    statusCode: httpStatus,
    success: response.success,
    hasData: 'data' in response && !!response.data,
    operation: 'http_response_created',
  });

  return new Response(JSON.stringify(response), {
    status: httpStatus,
    headers,
  });
}

// Error handler
export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    log.error('API error handled', {
      message: error.message,
      stack: error.stack,
      operation: 'api_error_handled',
    });

    // Check for specific error types
    if (error.message.includes('validation')) {
      return createValidationErrorResponse({ general: [error.message] });
    }

    if (error.message.includes('not found')) {
      return createNotFoundResponse();
    }

    if (error.message.includes('unauthorized')) {
      return createUnauthorizedResponse(error.message);
    }

    if (error.message.includes('forbidden')) {
      return createForbiddenResponse(error.message);
    }

    // Default to internal server error
    return createInternalErrorResponse(
      'An unexpected error occurred',
      { originalError: error.message }
    );
  }

  // Handle non-Error objects
  const errorMessage = typeof error === 'string' ? error : 'Unknown error';
  
  log.error('API error handled (non-Error)', {
    error: errorMessage,
    operation: 'api_error_handled_non_error',
  });

  return createInternalErrorResponse(
    'An unexpected error occurred',
    { originalError: errorMessage }
  );
}

// Response validation
export function validateApiResponse<T>(response: ApiResponse<T>): boolean {
  try {
    // Check required fields
    if (typeof response.success !== 'boolean') {
      return false;
    }

    if (response.success) {
      // Success response must have data
      return 'data' in response && response.data !== undefined;
    } else {
      // Error response must have error
      return (
        'error' in response &&
        !!response.error &&
        typeof response.error.message === 'string' &&
        typeof response.error.statusCode === 'number'
      );
    }
  } catch {
    return false;
  }
}

// Response sanitization
export function sanitizeApiResponse<T>(response: ApiResponse<T>): ApiResponse<T> {
  try {
    // Remove sensitive data from error responses
    if (!response.success && 'error' in response) {
      const sanitizedError = { ...response.error };
      
      // Remove stack traces in production
      if (process.env.NODE_ENV === 'production' && sanitizedError.details) {
        delete sanitizedError.details.stack;
        delete sanitizedError.details.stackTrace;
      }

      return {
        ...response,
        error: sanitizedError,
      } as ApiResponse<T>;
    }

    return response;
  } catch {
    // If sanitization fails, return a safe error response
    return createInternalErrorResponse('Response sanitization failed') as ApiResponse<T>;
  }
}
