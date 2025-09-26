import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/services/database.service';
import { createSuccessResponse, createErrorResponse, handleApiError, createNotFoundResponse } from '@/lib/services/api-response.service';
import { createRateLimitMiddleware, reviewsRateLimiter } from '@/lib/services/rate-limit.service';
import { createSecurityHeaders, createCorsHeaders, validateRequest, sanitizeInput } from '@/lib/services/security.service';
import { reviewsCache, propertyCache } from '@/lib/services/cache.service';
import { reviews } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import log from '@/lib/logger';

// Rate limiting middleware
const rateLimitMiddleware = createRateLimitMiddleware(reviewsRateLimiter);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Await params
    const { id } = await params;
    
    // Security validation
    const securityValidation = validateRequest(request);
    if (!securityValidation.isValid) {
      log.warn('Security validation failed', {
        errors: securityValidation.errors,
        operation: 'review_approve_security_validation_failed',
      });
      
      return NextResponse.json(
        createErrorResponse('Security validation failed', 400, { errors: securityValidation.errors }),
        { status: 400 }
      );
    }

    // Rate limiting - temporarily disabled
    // const rateLimitResponse = await rateLimitMiddleware(request);
    // if (rateLimitResponse) {
    //   return rateLimitResponse;
    // }

    // Validate review ID
    const reviewId = sanitizeInput(id);
    if (!reviewId || !/^\d+$/.test(reviewId)) {
      log.warn('Invalid review ID provided', {
        reviewId,
        operation: 'review_approve_invalid_id',
      });
      
      return NextResponse.json(
        createNotFoundResponse('Review'),
        { status: 404 }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      log.warn('Invalid JSON in request body', {
        error: error instanceof Error ? error.message : String(error),
        operation: 'review_approve_invalid_json',
      });
      
      return NextResponse.json(
        createErrorResponse('Invalid JSON in request body', 400),
        { status: 400 }
      );
    }

    const { status } = requestBody;
    
    // Validate status
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      log.warn('Invalid status provided', {
        status,
        operation: 'review_approve_invalid_status',
      });
      
      return NextResponse.json(
        createErrorResponse('Invalid status. Must be one of: approved, rejected, pending', 400),
        { status: 400 }
      );
    }

    // Fetch data from database using Drizzle ORM
    const { db } = getDatabase();
    
    // Check if review exists
    const existingReview = await db
      .select({
        id: reviews.id,
        listingId: reviews.listingId,
        rating: reviews.rating,
        content: reviews.content,
        authorName: reviews.authorName,
        status: reviews.status,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .where(eq(reviews.id, parseInt(reviewId)))
      .limit(1);
    
    if (!existingReview || existingReview.length === 0) {
      log.warn('Review not found', {
        reviewId,
        operation: 'review_approve_not_found',
      });
      
      return NextResponse.json(
        createNotFoundResponse('Review'),
        { status: 404 }
      );
    }

    const review = existingReview[0];

    // Update review status
    const updatedReview = await db
      .update(reviews)
      .set({ 
        status: status as 'pending' | 'approved' | 'rejected',
        updatedAt: new Date()
      })
      .where(eq(reviews.id, parseInt(reviewId)))
      .returning({
        id: reviews.id,
        listingId: reviews.listingId,
        rating: reviews.rating,
        content: reviews.content,
        authorName: reviews.authorName,
        status: reviews.status,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
      });
    
    if (!updatedReview || updatedReview.length === 0) {
      log.error('Failed to update review status', {
        reviewId,
        status,
        operation: 'review_approve_update_failed',
      });
      
      return NextResponse.json(
        createErrorResponse('Failed to update review status', 500),
        { status: 500 }
      );
    }

    const updatedReviewData = updatedReview[0];

    // Clear related caches
    reviewsCache.clear();
    propertyCache.clear();

    // Format response data
    const responseData = {
      id: updatedReviewData.id,
      listingId: updatedReviewData.listingId,
      rating: updatedReviewData.rating,
      content: updatedReviewData.content,
      authorName: updatedReviewData.authorName,
      status: updatedReviewData.status,
      createdAt: updatedReviewData.createdAt,
      updatedAt: updatedReviewData.updatedAt,
    };

    log.info('Review status updated successfully', {
      reviewId,
      oldStatus: review.status,
      newStatus: status,
      operation: 'review_approve_success',
    });

    return NextResponse.json(
      createSuccessResponse(responseData, `Review ${status} successfully`),
      {
        status: 200,
        headers: {
          ...createSecurityHeaders(),
          ...createCorsHeaders(request.headers.get('origin')),
        },
      }
    );

  } catch (error) {
    log.error('Review approve API error', {
      error: error instanceof Error ? error.message : String(error),
      operation: 'review_approve_api_error',
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
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...createSecurityHeaders(),
      ...createCorsHeaders(request.headers.get('origin')),
    },
  });
}



