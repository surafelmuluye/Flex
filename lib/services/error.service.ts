import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getLogger } from './simple-logger.service';

const logger = getLogger('error-service');

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class ValidationError extends Error implements ApiError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  details: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class NotFoundError extends Error implements ApiError {
  statusCode = 404;
  code = 'NOT_FOUND';

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error implements ApiError {
  statusCode = 401;
  code = 'UNAUTHORIZED';

  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error implements ApiError {
  statusCode = 403;
  code = 'FORBIDDEN';

  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error implements ApiError {
  statusCode = 409;
  code = 'CONFLICT';

  constructor(message: string = 'Conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends Error implements ApiError {
  statusCode = 500;
  code = 'INTERNAL_SERVER_ERROR';

  constructor(message: string = 'Internal server error') {
    super(message);
    this.name = 'InternalServerError';
  }
}

export function handleApiError(error: unknown, request?: NextRequest): NextResponse {
  logger.error('API Error occurred', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    url: request?.url,
    method: request?.method,
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: error.errors,
        message: 'Invalid input data'
      },
      { status: 400 }
    );
  }

  // Handle custom API errors
  if (error instanceof Error && 'statusCode' in error) {
    const apiError = error as ApiError;
    return NextResponse.json(
      {
        success: false,
        error: apiError.message,
        code: apiError.code,
        details: apiError.details,
        message: apiError.message
      },
      { status: apiError.statusCode || 500 }
    );
  }

  // Handle generic errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return NextResponse.json(
    {
      success: false,
      error: message,
      message: 'Internal server error'
    },
    { status: 500 }
  );
}

export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      const request = args.find(arg => arg instanceof Request) as NextRequest | undefined;
      return handleApiError(error, request);
    }
  };
}

export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      details,
      message
    },
    { status: statusCode }
  );
}




