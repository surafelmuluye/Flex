import { NextRequest, NextResponse } from 'next/server';
import { GoogleReviewsService } from '@/lib/services/google-reviews.service';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'Flex Living property';
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Google Places API key not configured',
        findings: {
          feasibility: 'POSSIBLE',
          requirements: [
            'Google Cloud Console project with Places API enabled',
            'API key with appropriate permissions',
            'Billing account (Google Places API is not free)'
          ],
          limitations: [
            'Only 5 most recent reviews per place (Google\'s limitation)',
            'No category breakdowns (cleanliness, communication, etc.)',
            'Rate limiting and quota restrictions',
            'Requires property to be listed on Google Maps'
          ],
          costConsiderations: [
            'Google Places API charges per request',
            'Details requests are more expensive than search requests',
            'Need to implement caching to minimize API calls'
          ]
        }
      });
    }

    const googleReviewsService = new GoogleReviewsService(apiKey);

    // Search for places
    const places = await googleReviewsService.searchPlaces(query);
    
    if (places.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No places found for the given query',
        data: {
          places: [],
          reviews: []
        }
      });
    }

    // Get details for the first place (including reviews)
    const placeDetails = await googleReviewsService.getPlaceDetails(places[0].place_id);
    
    if (!placeDetails) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch place details'
      });
    }

    // Normalize reviews to our format
    const normalizedReviews = googleReviewsService.normalizeGoogleReviews(
      placeDetails.reviews,
      places[0].place_id
    );

    return NextResponse.json({
      success: true,
      data: {
        place: {
          id: placeDetails.placeId,
          name: placeDetails.name,
          address: placeDetails.address,
          rating: placeDetails.rating,
          totalReviews: placeDetails.userRatingsTotal
        },
        reviews: normalizedReviews,
        rawGoogleReviews: placeDetails.reviews
      },
      findings: {
        feasibility: 'POSSIBLE',
        implementation: 'SUCCESSFUL',
        notes: [
          'Successfully integrated with Google Places API',
          'Able to fetch place details and reviews',
          'Reviews normalized to match our schema',
          'Ready for production implementation with proper API key'
        ]
      }
    });

  } catch (error) {
    console.error('Google Reviews integration error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      findings: {
        feasibility: 'POSSIBLE',
        error: 'Integration failed due to configuration or API issues',
        recommendations: [
          'Verify Google Places API key is valid',
          'Ensure Places API is enabled in Google Cloud Console',
          'Check billing account is set up',
          'Verify API quotas are not exceeded'
        ]
      }
    });
  }
}