/**
 * Google Reviews Integration Service
 * 
 * This service explores the feasibility of integrating Google Reviews
 * using the Google Places API and Google My Business API.
 */

export interface GoogleReview {
  id: string;
  authorName: string;
  authorUrl?: string;
  profilePhotoUrl?: string;
  rating: number;
  text: string;
  time: number;
  relativeTimeDescription: string;
}

export interface GooglePlaceDetails {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  userRatingsTotal: number;
  reviews: GoogleReview[];
}

export class GoogleReviewsService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Search for places by text query
   */
  async searchPlaces(query: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  }

  /**
   * Get place details including reviews
   */
  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,rating,user_ratings_total,reviews&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      const result = data.result;
      
      return {
        placeId: result.place_id,
        name: result.name,
        address: result.formatted_address,
        rating: result.rating || 0,
        userRatingsTotal: result.user_ratings_total || 0,
        reviews: (result.reviews || []).map((review: any) => ({
          id: review.time.toString(),
          authorName: review.author_name,
          authorUrl: review.author_url,
          profilePhotoUrl: review.profile_photo_url,
          rating: review.rating,
          text: review.text,
          time: review.time,
          relativeTimeDescription: review.relative_time_description,
        }))
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      throw error;
    }
  }

  /**
   * Normalize Google reviews to match our review format
   */
  normalizeGoogleReviews(googleReviews: GoogleReview[], propertyId: string): any[] {
    return googleReviews.map(review => ({
      id: `google_${review.id}`,
      listingId: propertyId,
      listingName: 'Google Review Property', // This would need to be mapped properly
      type: 'guest-to-host' as const,
      status: 'approved' as const, // Google reviews are already public
      rating: review.rating,
      publicReview: review.text,
      guestName: review.authorName,
      submittedAt: new Date(review.time * 1000).toISOString(),
      reviewCategory: [], // Google reviews don't have category breakdowns
      source: 'google',
      googleReviewId: review.id,
      authorUrl: review.authorUrl,
      profilePhotoUrl: review.profilePhotoUrl,
      relativeTimeDescription: review.relativeTimeDescription,
    }));
  }
}
