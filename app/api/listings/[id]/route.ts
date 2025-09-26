import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/services/database.service';
import { createSuccessResponse, createErrorResponse, handleApiError, createNotFoundResponse } from '@/lib/services/api-response.service';
import { createRateLimitMiddleware, apiRateLimiter } from '@/lib/services/rate-limit.service';
import { createSecurityHeaders, createCorsHeaders, validateRequest, sanitizeInput, isValidUuid } from '@/lib/services/security.service';
import { propertyCache, generatePropertyCacheKey } from '@/lib/services/cache.service';
import { getLogger } from '@/lib/services/simple-logger.service';

const log = getLogger('listings-api');

// Rate limiting middleware
const rateLimitMiddleware = createRateLimitMiddleware(apiRateLimiter);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Security validation
    const securityValidation = validateRequest(request);
    if (!securityValidation.isValid) {
      log.warn('Security validation failed', {
        errors: securityValidation.errors,
        operation: 'listing_detail_security_validation_failed',
      });
      
      return NextResponse.json(
        createErrorResponse('Security validation failed', 400, { errors: securityValidation.errors }),
        { status: 400 }
      );
    }

    // Validate listing ID
    const resolvedParams = await params;
    const listingId = sanitizeInput(resolvedParams.id);
    if (!listingId || !isValidUuid(listingId)) {
      log.warn('Invalid listing ID provided', {
        listingId,
        operation: 'listing_detail_invalid_id',
      });
      
      return NextResponse.json(
        createNotFoundResponse('Listing'),
        { status: 404 }
      );
    }

    // Parse query parameters for additional data
    const { searchParams } = new URL(request.url);
    const includeReviews = searchParams.get('includeReviews') === 'true';
    const includeStats = searchParams.get('includeStats') === 'true';
    const reviewsLimit = Math.min(50, Math.max(1, parseInt(searchParams.get('reviewsLimit') || '10')));

    // Check cache first
    const cacheKey = generatePropertyCacheKey(listingId, { includeReviews, includeStats, reviewsLimit });
    const cachedData = propertyCache.get(cacheKey);
    
    if (cachedData) {
      log.debug('Listing data served from cache', {
        listingId,
        operation: 'listing_detail_cache_hit',
      });
      
      return NextResponse.json(
        createSuccessResponse(cachedData, 'Listing retrieved successfully'),
        {
          status: 200,
          headers: {
            ...createSecurityHeaders(),
            ...createCorsHeaders(request.headers.get('origin')),
            'Cache-Control': 'public, max-age=900', // 15 minutes
          },
        }
      );
    }

    // Fetch data from database
    const { db } = getDatabase();
    
    // Get listing details
    const listingQuery = `
      SELECT 
        id,
        title,
        description,
        address,
        city,
        state,
        country,
        price,
        bedrooms,
        bathrooms,
        property_type,
        status,
        created_at,
        updated_at,
        (SELECT AVG(rating) FROM reviews WHERE listing_id = listings.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE listing_id = listings.id) as review_count
      FROM listings 
      WHERE id = $1
    `;
    
    const listingResult = await db.execute(listingQuery.replace('$1', `'${listingId}'`));
    
    if (!listingResult || listingResult.length === 0) {
      log.warn('Listing not found', {
        listingId,
        operation: 'listing_detail_not_found',
      });
      
      return NextResponse.json(
        createNotFoundResponse('Listing'),
        { status: 404 }
      );
    }

    const listing = listingResult[0];

    // Format listing data
    const listingData = {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      country: listing.country,
      price: parseFloat(String(listing.price)) || 0,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      propertyType: listing.property_type,
      status: listing.status,
      createdAt: listing.created_at,
      updatedAt: listing.updated_at,
      avgRating: parseFloat(String(listing.avg_rating)) || 0,
      reviewCount: listing.review_count,
    };

    let responseData: any = listingData;

    // Include reviews if requested
    if (includeReviews) {
      const reviewsQuery = `
        SELECT 
          id,
          rating,
          content,
          author_name,
          author_email,
          status,
          created_at,
          updated_at
        FROM reviews 
        WHERE listing_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `;
      
      const reviewsResult = await db.execute(reviewsQuery.replace('$1', `'${listingId}'`).replace('$2', reviewsLimit.toString()));
      
      const reviews = reviewsResult.map((row: any) => ({
        id: row.id,
        rating: row.rating,
        content: row.content,
        authorName: row.author_name,
        authorEmail: row.author_email,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      responseData.reviews = reviews;
    }

    // Include stats if requested
    if (includeStats) {
      const statsQuery = `
        SELECT 
          rating,
          COUNT(*) as count
        FROM reviews 
        WHERE listing_id = $1 AND rating IS NOT NULL
        GROUP BY rating
        ORDER BY rating
      `;
      
      const statsResult = await db.execute(statsQuery.replace('$1', `'${listingId}'`));
      
      const ratingDistribution = statsResult.map((row: any) => ({
        rating: row.rating,
        count: row.count,
      }));

      // Get recent activity
      const activityQuery = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM reviews 
        WHERE listing_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      
      const activityResult = await db.execute(activityQuery.replace('$1', `'${listingId}'`));
      
      const recentActivity = activityResult.map((row: any) => ({
        date: row.date,
        count: row.count,
      }));

      responseData.stats = {
        ratingDistribution,
        recentActivity,
      };
    }

    // Cache the data
    propertyCache.set(cacheKey, responseData, 900); // 15 minutes

    log.info('Listing data generated successfully', {
      listingId,
      includeReviews,
      includeStats,
      operation: 'listing_detail_data_generated',
    });

    return NextResponse.json(
      createSuccessResponse(responseData, 'Listing retrieved successfully'),
      {
        status: 200,
        headers: {
          ...createSecurityHeaders(),
          ...createCorsHeaders(request.headers.get('origin')),
          'Cache-Control': 'public, max-age=900', // 15 minutes
        },
      }
    );

  } catch (error) {
    log.error('Listing detail API error', {
      error: error instanceof Error ? error.message : String(error),
      operation: 'listing_detail_api_error',
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
