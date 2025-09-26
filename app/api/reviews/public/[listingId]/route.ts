import { NextRequest } from 'next/server';
import { createApiHandler, createCorsHandler } from '@/lib/handlers/api-handler';
import { getCache, getRateLimiter } from '@/lib/services/service-manager';
import { reviewManagementService } from '@/lib/services/review-management.service';

const publicReviewsHandler = createApiHandler(async (request: NextRequest, { params }: { params: { listingId: string } }) => {
  const listingId = params.listingId;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));

  try {
    // Get public reviews for the listing
    const publicReviews = await reviewManagementService.getPublicReviews(listingId, limit);
    
    return {
      success: true,
      data: {
        reviews: publicReviews,
        listingId,
        count: publicReviews.length,
        limit,
      },
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      data: null,
    };
  }
}, {
  rateLimiter: getRateLimiter('reviewsRateLimiter'),
  cache: {
    key: 'public-reviews',
    ttl: 600, // 10 minutes cache for public reviews
    cache: getCache('reviewsCache'),
  },
});

export const GET = publicReviewsHandler;
export const OPTIONS = createCorsHandler();



