import { log } from '@/lib/services/simple-logger.service';

export interface HostawayReview {
  id: number;
  type: 'host-to-guest' | 'guest-to-host';
  status: 'published' | 'pending';
  rating: number | null;
  publicReview: string;
  reviewCategory: Array<{
    category: string;
    rating: number;
  }>;
  submittedAt: string;
  guestName: string;
  listingName: string;
}

export interface HostawayApiResponse {
  status: string;
  result: HostawayReview[];
}

export interface NormalizedReview {
  id: string;
  hostawayId: number;
  listingId: string;
  type: 'host-to-guest' | 'guest-to-host';
  status: 'pending' | 'approved' | 'rejected';
  rating: number | null;
  content: string;
  authorName: string;
  authorEmail: string;
  categories: Array<{
    category: string;
    rating: number;
  }>;
  submittedAt: string;
  isPublic: boolean;
  notes?: string;
}

export class HostawayIntegrationService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = process.env.HOSTAWAY_CLIENT_ID || '61148';
    this.clientSecret = process.env.HOSTAWAY_CLIENT_SECRET || 'f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152';
    this.baseUrl = 'https://api.hostaway.com/v1';
  }

  /**
   * Get access token from Hostaway OAuth API
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      log.info('Requesting access token from Hostaway', {
        operation: 'hostaway_get_token',
        clientId: this.clientId,
      });

      const response = await fetch(`${this.baseUrl}/accessTokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'general'
        })
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token || '';
      // Set expiry to 1 hour from now (with 5 minute buffer)
      this.tokenExpiry = Date.now() + ((tokenData.expires_in || 3600) - 300) * 1000;

      log.info('Successfully obtained access token from Hostaway', {
        operation: 'hostaway_token_success',
        expiresIn: tokenData.expires_in,
      });

      return this.accessToken || '';
    } catch (error) {
      log.error('Failed to get access token from Hostaway', {
        operation: 'hostaway_token_error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Fetch listings from Hostaway API
   */
  private async fetchListings(): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      
      log.info('Fetching listings from Hostaway', {
        operation: 'hostaway_fetch_listings',
      });

      const response = await fetch(`${this.baseUrl}/listings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Listings request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      log.info('Successfully fetched listings from Hostaway', {
        operation: 'hostaway_listings_success',
        listingCount: data.result?.length || 0,
      });

      return data.result || [];
    } catch (error) {
      log.error('Failed to fetch listings from Hostaway', {
        operation: 'hostaway_listings_error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Fetch reviews from Hostaway API
   * First gets listings, then checks for reviews
   */
  async fetchReviews(): Promise<HostawayApiResponse> {
    try {
      log.info('Starting Hostaway reviews fetch process', {
        operation: 'hostaway_fetch_reviews_start',
      });

      // Step 1: Get access token
      const token = await this.getAccessToken();
      
      // Step 2: Get listings
      const listings = await this.fetchListings();
      
      // Step 3: Check if we have listings
      if (!listings || listings.length === 0) {
        log.info('No listings found in Hostaway, returning empty result', {
          operation: 'hostaway_no_listings',
        });
        return {
          status: "success",
          result: []
        };
      }

      // Step 4: Try to fetch reviews (this might not exist in the API)
      try {
        const token = await this.getAccessToken();
        
        const response = await fetch(`${this.baseUrl}/reviews`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });

        if (!response.ok) {
          // If reviews endpoint doesn't exist or returns error, return empty result
          log.info('Reviews endpoint not available, returning empty result', {
            operation: 'hostaway_reviews_not_available',
            status: response.status,
          });
          return {
            status: "success",
            result: []
          };
        }

        const data = await response.json();
        
        // Check if we got actual reviews
        if (data.result && data.result.length > 0) {
          log.info('Successfully fetched reviews from Hostaway API', {
            operation: 'hostaway_fetch_success',
            reviewCount: data.result.length,
          });
          return data;
        } else {
          // No reviews found, return empty result
          log.info('No reviews found in Hostaway, returning empty result', {
            operation: 'hostaway_no_reviews',
          });
          return {
            status: "success",
            result: []
          };
        }
      } catch (reviewsError) {
        // If reviews endpoint fails, return empty result
        log.info('Reviews endpoint failed, returning empty result', {
          operation: 'hostaway_reviews_failed',
          error: reviewsError instanceof Error ? reviewsError.message : 'Unknown error',
        });
        return {
          status: "success",
          result: []
        };
      }
    } catch (error) {
      log.error('Failed to fetch reviews from Hostaway API', {
        operation: 'hostaway_fetch_error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Return empty data so it falls back to database
      return {
        status: "success",
        result: []
      };
    }
  }

  /**
   * Get reviews - wrapper for fetchReviews that returns normalized data
   */
  async getReviews(): Promise<NormalizedReview[]> {
    try {
      const response = await this.fetchReviews();
      
      if (!response.result || response.result.length === 0) {
        return [];
      }
      
      // Normalize all reviews
      return response.result.map(review => this.normalizeReview(review, '1')); // Default listing ID
    } catch (error) {
      log.error('Failed to get reviews from Hostaway', {
        operation: 'hostaway_get_reviews_error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  /**
   * Normalize Hostaway review data for our system
   */
  normalizeReview(hostawayReview: HostawayReview, listingId: string): NormalizedReview {
    return {
      id: `hostaway_${hostawayReview.id}`,
      hostawayId: hostawayReview.id,
      listingId,
      type: hostawayReview.type,
      status: hostawayReview.status === 'published' ? 'approved' : 'pending',
      rating: hostawayReview.rating,
      content: hostawayReview.publicReview,
      authorName: hostawayReview.guestName,
      authorEmail: '', // Not available in Hostaway API
      categories: hostawayReview.reviewCategory || [],
      submittedAt: hostawayReview.submittedAt,
      isPublic: hostawayReview.status === 'published',
      notes: undefined,
    };
  }


  /**
   * Process and store reviews from Hostaway API
   */
  async processAndStoreReviews(): Promise<NormalizedReview[]> {
    try {
      const hostawayData = await this.fetchReviews();
      const normalizedReviews: NormalizedReview[] = [];

      for (const review of hostawayData.result) {
        // Find the listing by name (in a real system, you'd have a mapping)
        const listingId = await this.findListingIdByName(review.listingName);
        if (listingId) {
          const normalizedReview = this.normalizeReview(review, listingId);
          normalizedReviews.push(normalizedReview);
        }
      }

      log.info('Processed reviews from Hostaway', {
        operation: 'hostaway_process_reviews',
        totalReviews: normalizedReviews.length,
      });

      return normalizedReviews;
    } catch (error) {
      log.error('Failed to process Hostaway reviews', {
        operation: 'hostaway_process_error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Find listing ID by name (helper method)
   * In a real system, you'd have a proper mapping
   */
  private async findListingIdByName(listingName: string): Promise<string | null> {
    // This is a simplified mapping - in reality, you'd query your database
    const listingMappings: Record<string, string> = {
      '2B N1 A - 29 Shoreditch Heights': '1',
      'Luxury Downtown Apartment': '1',
      'Cozy Beach House': '2',
      'Modern City Loft': '3',
    };

    return listingMappings[listingName] || null;
  }
}

// Export singleton instance
export const hostawayService = new HostawayIntegrationService();
