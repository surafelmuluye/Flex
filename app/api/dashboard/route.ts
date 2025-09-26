import { NextRequest } from 'next/server';
import { createApiHandler, createCorsHandler } from '@/lib/handlers/api-handler';
import { getRateLimiter } from '@/lib/services/service-manager';

// Dashboard handler using centralized API handler
const dashboardHandler = createApiHandler(async () => {

  try {
    // Import Drizzle schema and functions
    const { count, avg, sql, eq } = await import('drizzle-orm');
    const { listings, reviews } = await import('@/lib/db/schema');
    const { db } = await import('@/lib/db/drizzle');
    
    // Get total listings count
    const totalListingsResult = await db.select({ count: count() }).from(listings);
    const totalListings = totalListingsResult[0]?.count || 0;

    // Get total reviews count
    const totalReviewsResult = await db.select({ count: count() }).from(reviews);
    const totalReviews = totalReviewsResult[0]?.count || 0;

    // Get average rating
    const avgRatingResult = await db.select({ 
      avgRating: avg(reviews.rating) 
    }).from(reviews).where(sql`${reviews.rating} IS NOT NULL`);
    const avgRating = avgRatingResult[0]?.avgRating || 0;

    // Get recent reviews count (last 30 days)
    const recentReviewsResult = await db.select({ count: count() }).from(reviews)
      .where(sql`${reviews.createdAt} >= NOW() - INTERVAL '30 days'`);
    const recentReviews = recentReviewsResult[0]?.count || 0;

    // Get pending reviews count
    const pendingReviewsResult = await db.select({ count: count() }).from(reviews)
      .where(eq(reviews.status, 'pending'));
    const pendingReviews = pendingReviewsResult[0]?.count || 0;

    // Calculate trends (month-over-month comparisons)
    // Get current month data
    const currentMonthReviewsResult = await db.select({ count: count() }).from(reviews)
      .where(sql`${reviews.createdAt} >= DATE_TRUNC('month', NOW())`);
    const currentMonthReviews = currentMonthReviewsResult[0]?.count || 0;

    // Get previous month data
    const previousMonthReviewsResult = await db.select({ count: count() }).from(reviews)
      .where(sql`${reviews.createdAt} >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' AND ${reviews.createdAt} < DATE_TRUNC('month', NOW())`);
    const previousMonthReviews = previousMonthReviewsResult[0]?.count || 0;

    // Calculate review growth percentage
    const reviewGrowthPercentage = previousMonthReviews > 0 
      ? Math.round(((currentMonthReviews - previousMonthReviews) / previousMonthReviews) * 100)
      : currentMonthReviews > 0 ? 100 : 0;

    // Get current month average rating
    const currentMonthAvgRatingResult = await db.select({ 
      avgRating: avg(reviews.rating) 
    }).from(reviews)
      .where(sql`${reviews.createdAt} >= DATE_TRUNC('month', NOW()) AND ${reviews.rating} IS NOT NULL`);
    const currentMonthAvgRating = parseFloat(currentMonthAvgRatingResult[0]?.avgRating || '0');

    // Get previous month average rating
    const previousMonthAvgRatingResult = await db.select({ 
      avgRating: avg(reviews.rating) 
    }).from(reviews)
      .where(sql`${reviews.createdAt} >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' AND ${reviews.createdAt} < DATE_TRUNC('month', NOW()) AND ${reviews.rating} IS NOT NULL`);
    const previousMonthAvgRating = parseFloat(previousMonthAvgRatingResult[0]?.avgRating || '0');

    // Calculate rating improvement
    const ratingImprovement = Math.round((currentMonthAvgRating - previousMonthAvgRating) * 10) / 10;

    // Get listings by status (simplified - assuming all are active)
    const listingsByStatus = { active: totalListings };

    // Get reviews by rating
    const reviewsByRatingResult = await db.select({ 
      rating: reviews.rating, 
      count: count() 
    }).from(reviews)
      .where(sql`${reviews.rating} IS NOT NULL`)
      .groupBy(reviews.rating)
      .orderBy(reviews.rating);
    
    const reviewsByRating = reviewsByRatingResult.reduce((acc: Record<string, number>, row: any) => {
      acc[row.rating] = row.count;
      return acc;
    }, {});

    // Get recent activity (last 7 days)
    const recentActivityResult = await db.select({
      date: sql`DATE(${reviews.createdAt})`.as('date'),
      count: count(),
    }).from(reviews)
      .where(sql`${reviews.createdAt} >= NOW() - INTERVAL '7 days'`)
      .groupBy(sql`DATE(${reviews.createdAt})`)
      .orderBy(sql`DATE(${reviews.createdAt}) DESC`);
    
    const recentActivity = recentActivityResult.map((row: any) => ({
      date: row.date,
      count: row.count,
    }));

    // Get top performing listings
    const topListingsResult = await db.select({
      id: listings.id,
      title: listings.name,
      address: listings.address,
      avgRating: avg(reviews.rating),
      reviewCount: count(reviews.id),
    }).from(listings)
      .leftJoin(reviews, sql`${listings.id} = ${reviews.listingId}`)
      .groupBy(listings.id, listings.name, listings.address)
      .having(sql`COUNT(${reviews.id}) > 0`)
      .orderBy(sql`AVG(${reviews.rating}) DESC`, sql`COUNT(${reviews.id}) DESC`)
      .limit(5);
    
    const topListings = topListingsResult.map((row: any) => ({
      id: row.id,
      title: row.title,
      address: row.address,
      avgRating: parseFloat(row.avgRating) || 0,
      reviewCount: row.reviewCount,
    }));

    // Get review trends (last 12 months)
    const reviewTrendsResult = await db.select({
      month: sql`DATE_TRUNC('month', ${reviews.createdAt})`.as('month'),
      count: count(),
      avgRating: avg(reviews.rating),
    }).from(reviews)
      .where(sql`${reviews.createdAt} >= NOW() - INTERVAL '12 months'`)
      .groupBy(sql`DATE_TRUNC('month', ${reviews.createdAt})`)
      .orderBy(sql`month DESC`);
    
    const reviewTrends = reviewTrendsResult.map((row: any) => ({
      month: row.month,
      count: row.count,
      avgRating: parseFloat(row.avgRating) || 0,
    }));

    // Compile dashboard data
    const dashboardData = {
      overview: {
        totalListings,
        totalReviews,
        avgRating: parseFloat(String(avgRating)) || 0,
        recentReviews,
        pendingReviews,
      },
      trends: {
        reviewGrowthPercentage,
        ratingImprovement,
        currentMonthReviews,
        previousMonthReviews,
        currentMonthAvgRating,
        previousMonthAvgRating,
      },
      listingsByStatus,
      reviewsByRating,
      recentActivity,
      topListings,
      reviewTrends,
      lastUpdated: new Date().toISOString(),
    };

    return dashboardData;
  } catch (error) {
    // If database fails, serve mock data
    const { getMockData } = await import('@/lib/services/mock-data.service');
    const mockData = getMockData('dashboard');
    
    return mockData;
  }
}, {
  rateLimiter: getRateLimiter('apiRateLimiter'),
});

export const GET = dashboardHandler;
export const OPTIONS = createCorsHandler();
