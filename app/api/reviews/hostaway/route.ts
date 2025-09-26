import { NextRequest } from 'next/server';
import { createApiHandler, createCorsHandler } from '@/lib/handlers/api-handler';
import { getCache, getRateLimiter } from '@/lib/services/service-manager';
import { generateReviewsCacheKey } from '@/lib/services/cache.service';
import { sanitizeInput } from '@/lib/services/security.service';
import { reviewManagementService } from '@/lib/services/review-management.service';

const reviewsHandler = createApiHandler(async (request: NextRequest) => {
  const reviewsCache = getCache('reviewsCache');
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

  // Parse filters
  const filters = {
    listingId: searchParams.get('listingId') || undefined,
    status: searchParams.get('status') as 'pending' | 'approved' | 'rejected' || undefined,
    type: searchParams.get('type') as 'host-to-guest' | 'guest-to-host' || undefined,
    rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    search: sanitizeInput(searchParams.get('search') || '') || undefined,
  };

  const sortBy = sanitizeInput(searchParams.get('sortBy') || 'submittedAt');
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' as const : 'desc' as const;

  // No backend caching - use database directly

  try {
    // First, try to get reviews from Hostaway
    const { hostawayService } = await import('@/lib/services/hostaway-integration.service');
    
    let reviewsData: any[] = [];
    let stats = null;
    
    try {
      // Try Hostaway first - this will get token, fetch listings, then try to get reviews
      const hostawayResponse = await hostawayService.fetchReviews();
      
      if (hostawayResponse && hostawayResponse.result && hostawayResponse.result.length > 0) {
        console.log(`Found ${hostawayResponse.result.length} reviews from Hostaway`);
        
        // Normalize Hostaway reviews
        reviewsData = hostawayResponse.result.map(review => ({
          id: review.id,
          hostawayId: review.id,
          listingId: 1, // Default listing ID - in real implementation, map by listingName
          type: review.type || 'guest-to-host',
          status: review.status === 'published' ? 'approved' : 'pending',
          rating: review.rating,
          content: review.publicReview,
          authorName: review.guestName,
          authorEmail: '', // Not available in Hostaway API
          categories: review.reviewCategory || [],
          submittedAt: review.submittedAt,
          isPublic: review.status === 'published',
          notes: undefined,
          listing: { 
            id: 1, 
            name: review.listingName || 'Unknown Property',
            address: '',
            city: ''
          }
        }));
        
        // Calculate stats from Hostaway data
        stats = {
          total: reviewsData.length,
          pending: reviewsData.filter(r => r.status === 'pending').length,
          approved: reviewsData.filter(r => r.status === 'approved').length,
          rejected: reviewsData.filter(r => r.status === 'rejected').length,
          averageRating: reviewsData.length > 0 ? reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length : 0,
          byType: {
            hostToGuest: reviewsData.filter(r => r.type === 'host-to-guest').length,
            guestToHost: reviewsData.filter(r => r.type === 'guest-to-host').length,
          },
          byRating: reviewsData.reduce((acc, r) => {
            if (r.rating) {
              acc[r.rating] = (acc[r.rating] || 0) + 1;
            }
            return acc;
          }, {} as Record<number, number>),
          recentActivity: []
        };
        
        console.log('Successfully processed Hostaway reviews');
      } else {
        console.log('No reviews found in Hostaway response');
      }
    } catch (hostawayError) {
      console.log('Hostaway not available, falling back to database:', hostawayError);
    }
    
    // If Hostaway is empty or fails, use database
    if (!reviewsData || reviewsData.length === 0) {
      console.log('Falling back to database for reviews');
      const result = await reviewManagementService.getReviews(
        filters,
        page,
        limit,
        sortBy,
        sortOrder
      );
      
      reviewsData = result.reviews;
      stats = await reviewManagementService.getReviewStats(filters);
    }

    const responseData = {
      success: true,
      data: {
        reviews: reviewsData,
        pagination: {
          page,
          limit,
          total: stats?.total || reviewsData.length, // Use stats.total for correct total count
          totalPages: Math.ceil((stats?.total || reviewsData.length) / limit),
          hasNext: page * limit < (stats?.total || reviewsData.length),
          hasPrev: page > 1,
        },
        filters,
        sort: {
          field: sortBy,
          direction: sortOrder,
        },
        stats,
      },
      lastUpdated: new Date().toISOString(),
    };

    return responseData;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}, {
  rateLimiter: getRateLimiter('reviewsRateLimiter'),
  // No backend caching - use database directly
});

export const GET = reviewsHandler;
export const OPTIONS = createCorsHandler();