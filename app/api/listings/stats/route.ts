import { NextRequest } from 'next/server';
import { createApiHandler, createCorsHandler } from '@/lib/handlers/api-handler';
import { getRateLimiter } from '@/lib/services/service-manager';

const listingsStatsHandler = createApiHandler(async () => {

  try {
    // Import Drizzle schema and functions
    const { count, avg, min, max, sql } = await import('drizzle-orm');
    const { listings, reviews } = await import('@/lib/db/schema');
    const { db } = await import('@/lib/db/drizzle');
    
    // Get total listings count
    const totalListingsResult = await db.select({ count: count() }).from(listings);
    const totalListings = totalListingsResult[0]?.count || 0;

    // Get listings with reviews count
    const listingsWithReviewsResult = await db.select({ 
      count: count() 
    }).from(listings)
      .leftJoin(reviews, sql`${listings.id} = ${reviews.listingId}`)
      .where(sql`${reviews.id} IS NOT NULL`);
    const totalWithReviews = listingsWithReviewsResult[0]?.count || 0;

    // Get price statistics
    const priceStatsResult = await db.select({
      avgPrice: avg(listings.price),
      minPrice: min(listings.price),
      maxPrice: max(listings.price),
    }).from(listings);
    
    const avgPrice = priceStatsResult[0]?.avgPrice || 0;
    const minPrice = priceStatsResult[0]?.minPrice || 0;
    const maxPrice = priceStatsResult[0]?.maxPrice || 0;
    
    // Calculate median price (simplified - using average for now)
    const medianPrice = avgPrice;

    // Get listings by location (top 10 cities)
    const listingsByLocationResult = await db.select({
      city: listings.city,
      state: sql`''`.as('state'), // Simplified - no state field in our schema
      count: count(),
    }).from(listings)
      .groupBy(listings.city)
      .orderBy(sql`count DESC`)
      .limit(10);

    const listingsByLocation = listingsByLocationResult.map((row: any) => ({
      city: row.city,
      state: row.state || '',
      count: row.count,
    }));

    // Get bedroom statistics
    const bedroomStatsResult = await db.select({
      bedrooms: listings.bedroomsNumber,
      count: count(),
    }).from(listings)
      .groupBy(listings.bedroomsNumber)
      .orderBy(listings.bedroomsNumber);

    const bedroomStats = bedroomStatsResult.map((row: any) => ({
      bedrooms: row.bedrooms,
      count: row.count,
    }));

    // Get bathroom statistics
    const bathroomStatsResult = await db.select({
      bathrooms: listings.bathroomsNumber,
      count: count(),
    }).from(listings)
      .groupBy(listings.bathroomsNumber)
      .orderBy(listings.bathroomsNumber);

    const bathroomStats = bathroomStatsResult.map((row: any) => ({
      bathrooms: row.bathrooms,
      count: row.count,
    }));

    // Get top rated listings
    const topRatedListingsResult = await db.select({
      id: listings.id,
      name: listings.name,
      address: listings.address,
      city: listings.city,
      price: listings.price,
      avgRating: avg(reviews.rating),
      reviewCount: count(reviews.id),
    }).from(listings)
      .leftJoin(reviews, sql`${listings.id} = ${reviews.listingId} AND ${reviews.status} = 'approved'`)
      .groupBy(listings.id, listings.name, listings.address, listings.city, listings.price)
      .having(sql`COUNT(${reviews.id}) > 0`)
      .orderBy(sql`AVG(${reviews.rating}) DESC`)
      .limit(10);

    const topRatedListings = topRatedListingsResult.map((row: any) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      price: row.price,
      avgRating: parseFloat(row.avgRating) || 0,
      reviewCount: row.reviewCount,
    }));

    // Get recent listings (last 30 days)
    const recentListingsResult = await db.select({
      id: listings.id,
      name: listings.name,
      address: listings.address,
      city: listings.city,
      price: listings.price,
      createdAt: listings.createdAt,
    }).from(listings)
      .where(sql`${listings.createdAt} >= NOW() - INTERVAL '30 days'`)
      .orderBy(sql`${listings.createdAt} DESC`)
      .limit(10);
    
    const recentListings = recentListingsResult.map((row: any) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      price: row.price,
      createdAt: row.createdAt,
    }));

    // Calculate growth rate (month-over-month)
    const currentMonthListingsResult = await db.select({ count: count() }).from(listings)
      .where(sql`${listings.createdAt} >= DATE_TRUNC('month', NOW())`);
    const currentMonthListings = currentMonthListingsResult[0]?.count || 0;

    const previousMonthListingsResult = await db.select({ count: count() }).from(listings)
      .where(sql`${listings.createdAt} >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' AND ${listings.createdAt} < DATE_TRUNC('month', NOW())`);
    const previousMonthListings = previousMonthListingsResult[0]?.count || 0;

    const growthRate = previousMonthListings > 0 
      ? Math.round(((currentMonthListings - previousMonthListings) / previousMonthListings) * 100)
      : currentMonthListings > 0 ? 100 : 0;

    const statsData = {
      overview: {
        totalListings,
        totalWithReviews,
        avgPrice: Math.round(Number(avgPrice) || 0),
        medianPrice: Math.round(Number(medianPrice) || 0),
      },
      growth: {
        growthRate,
        currentMonthListings,
        previousMonthListings,
      },
      listingsByStatus: { active: totalListings }, // Simplified
      listingsByType: { apartment: totalListings }, // Simplified
      listingsByLocation,
      priceStats: {
        min: Number(minPrice) || 0,
        max: Number(maxPrice) || 0,
        avg: Math.round(Number(avgPrice) || 0),
        median: Math.round(Number(medianPrice) || 0),
      },
      bedroomStats,
      bathroomStats,
      topRatedListings,
      recentListings,
      lastUpdated: new Date().toISOString(),
    };

    return statsData;
  } catch (error) {
    // If database fails, serve mock data
    const { getMockData } = await import('@/lib/services/mock-data.service');
    const mockData = getMockData('listingsStats');
    
    return mockData;
  }
}, {
  rateLimiter: getRateLimiter('statsRateLimiter'),
});

export const GET = listingsStatsHandler;
export const OPTIONS = createCorsHandler();
