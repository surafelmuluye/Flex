import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { reviews, listings, managers, activityLogs } from '@/lib/db/schema';
import { eq, and, desc, asc, count, sql } from 'drizzle-orm';
import { log } from '@/lib/services/simple-logger.service';
import { hostawayService } from './hostaway-integration.service';

export interface ReviewFilters {
  listingId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  type?: 'host-to-guest' | 'guest-to-host';
  rating?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRating: number;
  byType: {
    hostToGuest: number;
    guestToHost: number;
  };
  byRating: Record<number, number>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
}

export interface ReviewApprovalRequest {
  reviewId: string;
  action: 'approve' | 'reject';
  managerId: number;
  notes?: string;
  rejectionReason?: string;
}

export class ReviewManagementService {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/flex_dashboard';
    const client = postgres(connectionString);
    this.db = drizzle(client);
  }

  /**
   * Get reviews with filtering and pagination
   */
  async getReviews(
    filters: ReviewFilters = {},
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'submittedAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    try {
      const offset = (page - 1) * limit;
      
      // Build where conditions
      const whereConditions = [];
      
      if (filters.listingId) {
        whereConditions.push(eq(reviews.listingId, parseInt(filters.listingId)));
      }
      
      if (filters.status) {
        whereConditions.push(eq(reviews.status, filters.status));
      }
      
      if (filters.type) {
        whereConditions.push(eq(reviews.type, filters.type));
      }
      
      if (filters.rating) {
        whereConditions.push(eq(reviews.rating, filters.rating));
      }
      
      if (filters.dateFrom) {
        whereConditions.push(sql`${reviews.submittedAt} >= ${filters.dateFrom}`);
      }
      
      if (filters.dateTo) {
        whereConditions.push(sql`${reviews.submittedAt} <= ${filters.dateTo}`);
      }
      
      if (filters.search) {
        whereConditions.push(
          sql`(${reviews.content} ILIKE ${`%${filters.search}%`} OR ${reviews.authorName} ILIKE ${`%${filters.search}%`})`
        );
      }

      // Build order by
      const orderBy = sortOrder === 'asc' ? asc : desc;
      let orderColumn;
      
      switch (sortBy) {
        case 'rating':
          orderColumn = reviews.rating;
          break;
        case 'authorName':
          orderColumn = reviews.authorName;
          break;
        case 'submittedAt':
        default:
          orderColumn = reviews.submittedAt;
          break;
      }

      // Get reviews
      const reviewsData = await this.db
        .select({
          id: reviews.id,
          hostawayId: reviews.hostawayId,
          listingId: reviews.listingId,
          type: reviews.type,
          status: reviews.status,
          rating: reviews.rating,
          content: reviews.content,
          authorName: reviews.authorName,
          authorEmail: reviews.authorEmail,
          categories: reviews.categories,
          submittedAt: reviews.submittedAt,
          isPublic: reviews.isPublic,
          notes: reviews.notes,
          createdAt: reviews.createdAt,
          updatedAt: reviews.updatedAt,
          listing: {
            name: listings.name,
            address: listings.address,
            city: listings.city,
          }
        })
        .from(reviews)
        .leftJoin(listings, eq(reviews.listingId, listings.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(orderBy(orderColumn))
        .limit(limit)
        .offset(offset);

      // Get total count
      const totalResult = await this.db
        .select({ count: count() })
        .from(reviews)
        .leftJoin(listings, eq(reviews.listingId, listings.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      const total = totalResult[0]?.count || 0;

      log.info('Retrieved reviews', {
        operation: 'get_reviews',
        filters,
        page,
        limit,
        total,
        returned: reviewsData.length,
      });

      return {
        reviews: reviewsData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
        filters,
        sort: {
          field: sortBy,
          direction: sortOrder,
        }
      };
    } catch (error) {
      log.error('Failed to get reviews', {
        operation: 'get_reviews_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        filters,
      });
      throw error;
    }
  }

  /**
   * Get review statistics
   */
  async getReviewStats(filters: ReviewFilters = {}): Promise<ReviewStats> {
    try {
      // Build where conditions
      const whereConditions = [];
      
      if (filters.listingId) {
        whereConditions.push(eq(reviews.listingId, parseInt(filters.listingId)));
      }
      
      if (filters.status) {
        whereConditions.push(eq(reviews.status, filters.status));
      }
      
      if (filters.type) {
        whereConditions.push(eq(reviews.type, filters.type));
      }
      
      if (filters.rating) {
        whereConditions.push(eq(reviews.rating, filters.rating));
      }
      
      if (filters.dateFrom) {
        whereConditions.push(sql`${reviews.submittedAt} >= ${filters.dateFrom}`);
      }
      
      if (filters.dateTo) {
        whereConditions.push(sql`${reviews.submittedAt} <= ${filters.dateTo}`);
      }

      // Get basic stats
      const statsResult = await this.db
        .select({
          status: reviews.status,
          type: reviews.type,
          rating: reviews.rating,
          submittedAt: reviews.submittedAt,
        })
        .from(reviews)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      const total = statsResult.length;
      const pending = statsResult.filter(r => r.status === 'pending').length;
      const approved = statsResult.filter(r => r.status === 'approved').length;
      const rejected = statsResult.filter(r => r.status === 'rejected').length;
      
      const hostToGuest = statsResult.filter(r => r.type === 'host-to-guest').length;
      const guestToHost = statsResult.filter(r => r.type === 'guest-to-host').length;
      
      const ratings = statsResult.filter(r => r.rating !== null).map(r => r.rating!);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;

      // Get rating distribution
      const byRating: Record<number, number> = {};
      for (let i = 1; i <= 5; i++) {
        byRating[i] = statsResult.filter(r => r.rating === i).length;
      }

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentActivity = statsResult
        .filter(r => new Date(r.submittedAt) >= thirtyDaysAgo)
        .reduce((acc, review) => {
          const date = new Date(review.submittedAt).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const recentActivityArray = Object.entries(recentActivity)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      log.info('Retrieved review statistics', {
        operation: 'get_review_stats',
        total,
        pending,
        approved,
        rejected,
        averageRating,
      });

      return {
        total,
        pending,
        approved,
        rejected,
        averageRating,
        byType: {
          hostToGuest,
          guestToHost,
        },
        byRating,
        recentActivity: recentActivityArray,
      };
    } catch (error) {
      log.error('Failed to get review statistics', {
        operation: 'get_review_stats_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        filters,
      });
      throw error;
    }
  }

  /**
   * Approve or reject a review
   */
  async approveRejectReview(request: ReviewApprovalRequest) {
    try {
      const { reviewId, action, managerId, notes, rejectionReason } = request;
      
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        updatedAt: new Date(),
      };

      if (action === 'approve') {
        updateData.approvedBy = managerId;
        updateData.approvedAt = new Date();
        updateData.isPublic = true; // Approved reviews are public by default
      } else {
        updateData.rejectedBy = managerId;
        updateData.rejectedAt = new Date();
        updateData.rejectionReason = rejectionReason;
        updateData.isPublic = false;
      }

      if (notes) {
        updateData.notes = notes;
      }

      // Update the review
      await this.db
        .update(reviews)
        .set(updateData)
        .where(eq(reviews.id, parseInt(reviewId)));

      // Log the activity
      await this.db.insert(activityLogs).values({
        managerId,
        action: action === 'approve' ? 'APPROVE_REVIEW' : 'REJECT_REVIEW',
        details: `Review ${action}d: ${reviewId}`,
        timestamp: new Date(),
      });

      log.info('Review approval/rejection processed', {
        operation: 'approve_reject_review',
        reviewId,
        action,
        managerId,
      });

      return { success: true, message: `Review ${action}d successfully` };
    } catch (error) {
      log.error('Failed to approve/reject review', {
        operation: 'approve_reject_review_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        request,
      });
      throw error;
    }
  }

  /**
   * Bulk approve/reject reviews
   */
  async bulkApproveRejectReviews(
    reviewIds: string[],
    action: 'approve' | 'reject',
    managerId: number,
    notes?: string
  ) {
    try {
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        updatedAt: new Date(),
      };

      if (action === 'approve') {
        updateData.approvedBy = managerId;
        updateData.approvedAt = new Date();
        updateData.isPublic = true;
      } else {
        updateData.rejectedBy = managerId;
        updateData.rejectedAt = new Date();
        updateData.isPublic = false;
      }

      if (notes) {
        updateData.notes = notes;
      }

      // Update all reviews
      await this.db
        .update(reviews)
        .set(updateData)
        .where(sql`${reviews.id} = ANY(${reviewIds.map(id => parseInt(id))})`);

      // Log the activity
      await this.db.insert(activityLogs).values({
        managerId,
        action: 'BULK_APPROVE',
        details: `Bulk ${action}: ${reviewIds.length} reviews`,
        timestamp: new Date(),
      });

      log.info('Bulk review approval/rejection processed', {
        operation: 'bulk_approve_reject_reviews',
        reviewIds: reviewIds.length,
        action,
        managerId,
      });

      return { success: true, message: `${reviewIds.length} reviews ${action}d successfully` };
    } catch (error) {
      log.error('Failed to bulk approve/reject reviews', {
        operation: 'bulk_approve_reject_reviews_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        reviewIds: reviewIds.length,
        action,
        managerId,
      });
      throw error;
    }
  }

  /**
   * Sync reviews from Hostaway API
   */
  async syncHostawayReviews() {
    try {
      log.info('Starting Hostaway review sync', {
        operation: 'sync_hostaway_reviews',
      });

      const normalizedReviews = await hostawayService.processAndStoreReviews();
      
      // Store reviews in database
      for (const review of normalizedReviews) {
        // Check if review already exists
        const existingReview = await this.db
          .select()
          .from(reviews)
          .where(eq(reviews.hostawayId, review.hostawayId))
          .limit(1);

        if (existingReview.length === 0) {
          // Insert new review
          await this.db.insert(reviews).values({
            hostawayId: review.hostawayId,
            listingId: parseInt(review.listingId),
            type: review.type,
            status: review.status,
            rating: review.rating,
            content: review.content,
            authorName: review.authorName,
            authorEmail: review.authorEmail,
            categories: review.categories,
            submittedAt: new Date(review.submittedAt),
            isPublic: review.isPublic,
            notes: review.notes,
          });
        }
      }

      log.info('Hostaway review sync completed', {
        operation: 'sync_hostaway_reviews_complete',
        reviewsProcessed: normalizedReviews.length,
      });

      return { success: true, message: `Synced ${normalizedReviews.length} reviews from Hostaway` };
    } catch (error) {
      log.error('Failed to sync Hostaway reviews', {
        operation: 'sync_hostaway_reviews_error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get public reviews for a listing (for public website display)
   */
  async getPublicReviews(listingId: string, limit: number = 10) {
    try {
      const publicReviews = await this.db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          content: reviews.content,
          authorName: reviews.authorName,
          submittedAt: reviews.submittedAt,
          categories: reviews.categories,
        })
        .from(reviews)
        .where(
          and(
            eq(reviews.listingId, parseInt(listingId)),
            eq(reviews.status, 'approved'),
            eq(reviews.isPublic, true)
          )
        )
        .orderBy(desc(reviews.submittedAt))
        .limit(limit);

      log.info('Retrieved public reviews', {
        operation: 'get_public_reviews',
        listingId,
        count: publicReviews.length,
      });

      return publicReviews;
    } catch (error) {
      log.error('Failed to get public reviews', {
        operation: 'get_public_reviews_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        listingId,
      });
      throw error;
    }
  }
}

// Export singleton instance
export const reviewManagementService = new ReviewManagementService();
