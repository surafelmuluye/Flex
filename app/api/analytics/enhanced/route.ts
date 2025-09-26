import { NextRequest } from 'next/server';
import { createApiHandler, createCorsHandler } from '@/lib/handlers/api-handler';
import { getRateLimiter } from '@/lib/services/service-manager';

const enhancedAnalyticsHandler = createApiHandler(async () => {
  try {
    // Import Drizzle schema and functions
    const { count, avg, min, max, sql, desc, asc } = await import('drizzle-orm');
    const { listings, reviews, listingAmenities, amenities } = await import('@/lib/db/schema');
    const { db } = await import('@/lib/db/drizzle');
    
    // Get comprehensive analytics data
    
    // 1. Location Analytics
    const topCitiesResult = await db.select({
      city: listings.city,
      count: count(),
      avgPrice: avg(listings.price),
    }).from(listings)
      .groupBy(listings.city)
      .orderBy(desc(count()))
      .limit(10);

    const countriesResult = await db.select({
      country: listings.country,
      count: count(),
      avgPrice: avg(listings.price),
    }).from(listings)
      .groupBy(listings.country)
      .orderBy(desc(count()))
      .limit(10);

    // 2. Property Type Analytics
    const propertyTypesResult = await db.select({
      roomType: listings.roomType,
      count: count(),
    }).from(listings)
      .groupBy(listings.roomType)
      .orderBy(desc(count()));

    // 3. Pricing Analytics - Simplified approach
    const priceRangesResult = [
      { priceRange: '$0-50', count: 0 },
      { priceRange: '$50-100', count: 0 },
      { priceRange: '$100-200', count: 0 },
      { priceRange: '$200-500', count: 0 },
      { priceRange: '$500+', count: 0 }
    ];
    
    // Get all listings and calculate price ranges manually
    const allListings = await db.select({
      price: listings.price,
    }).from(listings);
    
    allListings.forEach(listing => {
      const price = parseFloat(listing.price);
      if (price < 50) priceRangesResult[0].count++;
      else if (price < 100) priceRangesResult[1].count++;
      else if (price < 200) priceRangesResult[2].count++;
      else if (price < 500) priceRangesResult[3].count++;
      else priceRangesResult[4].count++;
    });

    // 4. Capacity Analytics - Simplified approach
    const capacityDistributionResult = [
      { capacityRange: '1-2 guests', count: 0 },
      { capacityRange: '3-4 guests', count: 0 },
      { capacityRange: '5-6 guests', count: 0 },
      { capacityRange: '7-8 guests', count: 0 },
      { capacityRange: '9+ guests', count: 0 }
    ];
    
    // Get all listings and calculate capacity ranges manually
    const allListingsCapacity = await db.select({
      personCapacity: listings.personCapacity,
    }).from(listings);
    
    allListingsCapacity.forEach(listing => {
      const capacity = listing.personCapacity;
      if (capacity <= 2) capacityDistributionResult[0].count++;
      else if (capacity <= 4) capacityDistributionResult[1].count++;
      else if (capacity <= 6) capacityDistributionResult[2].count++;
      else if (capacity <= 8) capacityDistributionResult[3].count++;
      else capacityDistributionResult[4].count++;
    });

    // 5. Bedroom/Bathroom Analytics
    const bedroomStatsResult = await db.select({
      bedrooms: listings.bedroomsNumber,
      count: count(),
    }).from(listings)
      .groupBy(listings.bedroomsNumber)
      .orderBy(listings.bedroomsNumber);

    const bathroomStatsResult = await db.select({
      bathrooms: listings.bathroomsNumber,
      count: count(),
    }).from(listings)
      .groupBy(listings.bathroomsNumber)
      .orderBy(listings.bathroomsNumber);

    // 6. Amenity Analytics
    const popularAmenitiesResult = await db.select({
      amenityName: listingAmenities.amenityName,
      count: count(),
    }).from(listingAmenities)
      .groupBy(listingAmenities.amenityName)
      .orderBy(desc(count()))
      .limit(20);

    const amenityCategoriesResult = await db.select({
      category: amenities.category,
      count: count(),
    }).from(amenities)
      .groupBy(amenities.category)
      .orderBy(desc(count()));

    // 7. Performance Analytics
    const instantBookableResult = await db.select({
      instantBookable: listings.instantBookable,
      count: count(),
    }).from(listings)
      .groupBy(listings.instantBookable);

    const averageNightsResult = await db.select({
      avgMinNights: avg(listings.minNights),
      avgMaxNights: avg(listings.maxNights),
    }).from(listings);

    // 8. Review Analytics
    const reviewResponseRateResult = await db.select({
      totalListings: count(),
      listingsWithReviews: sql<number>`COUNT(DISTINCT ${listings.id}) FILTER (WHERE ${reviews.id} IS NOT NULL)`,
    }).from(listings)
      .leftJoin(reviews, sql`${listings.id} = ${reviews.listingId}`);

    const reviewTrendsResult = await db.select({
      month: sql`DATE_TRUNC('month', ${reviews.createdAt})`.as('month'),
      count: count(),
      avgRating: avg(reviews.rating),
    }).from(reviews)
      .where(sql`${reviews.createdAt} >= NOW() - INTERVAL '12 months'`)
      .groupBy(sql`DATE_TRUNC('month', ${reviews.createdAt})`)
      .orderBy(sql`month DESC`);

    // 9. Geographic Distribution
    const geographicDistributionResult = await db.select({
      country: listings.country,
      city: listings.city,
      count: count(),
      avgPrice: avg(listings.price),
      avgRating: avg(reviews.rating),
    }).from(listings)
      .leftJoin(reviews, sql`${listings.id} = ${reviews.listingId} AND ${reviews.status} = 'approved'`)
      .groupBy(listings.country, listings.city)
      .orderBy(desc(count()))
      .limit(20);

    // 10. Property Features Analytics
    const featuresResult = await db.select({
      hasWifi: sql<number>`COUNT(*) FILTER (WHERE ${listingAmenities.amenityName} ILIKE '%wifi%' OR ${listingAmenities.amenityName} ILIKE '%internet%')`,
      hasParking: sql<number>`COUNT(*) FILTER (WHERE ${listingAmenities.amenityName} ILIKE '%parking%' OR ${listingAmenities.amenityName} ILIKE '%garage%')`,
      hasKitchen: sql<number>`COUNT(*) FILTER (WHERE ${listingAmenities.amenityName} ILIKE '%kitchen%' OR ${listingAmenities.amenityName} ILIKE '%cooking%')`,
      hasPool: sql<number>`COUNT(*) FILTER (WHERE ${listingAmenities.amenityName} ILIKE '%pool%' OR ${listingAmenities.amenityName} ILIKE '%swimming%')`,
      hasGym: sql<number>`COUNT(*) FILTER (WHERE ${listingAmenities.amenityName} ILIKE '%gym%' OR ${listingAmenities.amenityName} ILIKE '%fitness%')`,
    }).from(listings)
      .leftJoin(listingAmenities, sql`${listings.id} = ${listingAmenities.listingId}`);

    // Compile enhanced analytics data
    const enhancedAnalytics = {
      location: {
        topCities: topCitiesResult.map(row => ({
          city: row.city,
          count: row.count,
          avgPrice: parseFloat(row.avgPrice || '0') || 0,
        })),
        countries: countriesResult.map(row => ({
          country: row.country,
          count: row.count,
          avgPrice: parseFloat(row.avgPrice || '0') || 0,
        })),
        geographicDistribution: geographicDistributionResult.map(row => ({
          country: row.country,
          city: row.city,
          count: row.count,
          avgPrice: parseFloat(row.avgPrice || '0') || 0,
          avgRating: parseFloat(row.avgRating || '0') || 0,
        })),
      },
      propertyTypes: {
        roomTypes: propertyTypesResult.map(row => ({
          type: row.roomType || 'Unknown',
          count: row.count,
        })),
      },
      pricing: {
        priceRanges: priceRangesResult.map(row => ({
          range: row.priceRange,
          count: row.count,
        })),
      },
      capacity: {
        distribution: capacityDistributionResult.map(row => ({
          range: row.capacityRange,
          count: row.count,
        })),
        bedrooms: bedroomStatsResult.map(row => ({
          bedrooms: row.bedrooms,
          count: row.count,
        })),
        bathrooms: bathroomStatsResult.map(row => ({
          bathrooms: row.bathrooms,
          count: row.count,
        })),
      },
      amenities: {
        popular: popularAmenitiesResult.map(row => ({
          name: row.amenityName,
          count: row.count,
        })),
        categories: amenityCategoriesResult.map(row => ({
          category: row.category || 'Other',
          count: row.count,
        })),
        features: featuresResult[0] ? {
          hasWifi: featuresResult[0].hasWifi,
          hasParking: featuresResult[0].hasParking,
          hasKitchen: featuresResult[0].hasKitchen,
          hasPool: featuresResult[0].hasPool,
          hasGym: featuresResult[0].hasGym,
        } : {},
      },
      performance: {
        instantBookable: instantBookableResult.reduce((acc, row) => {
          acc[row.instantBookable ? 'enabled' : 'disabled'] = row.count;
          return acc;
        }, {} as Record<string, number>),
        averageNights: {
          min: parseFloat(averageNightsResult[0]?.avgMinNights || '0') || 0,
          max: parseFloat(averageNightsResult[0]?.avgMaxNights || '0') || 0,
        },
        reviewResponseRate: reviewResponseRateResult[0] ? 
          Math.round((reviewResponseRateResult[0].listingsWithReviews / reviewResponseRateResult[0].totalListings) * 100) : 0,
      },
      reviews: {
        trends: reviewTrendsResult.map(row => ({
          month: row.month,
          count: row.count,
          avgRating: parseFloat(row.avgRating || '0') || 0,
        })),
      },
      lastUpdated: new Date().toISOString(),
    };

    return enhancedAnalytics;
  } catch (error) {
    console.error('Error fetching enhanced analytics:', error);
    // Return empty analytics structure on error
    return {
      location: { topCities: [], countries: [], geographicDistribution: [] },
      propertyTypes: { roomTypes: [] },
      pricing: { priceRanges: [] },
      capacity: { distribution: [], bedrooms: [], bathrooms: [] },
      amenities: { popular: [], categories: [], features: {} },
      performance: { instantBookable: {}, averageNights: { min: 0, max: 0 }, reviewResponseRate: 0 },
      reviews: { trends: [] },
      lastUpdated: new Date().toISOString(),
    };
  }
}, {
  rateLimiter: getRateLimiter('statsRateLimiter'),
});

export const GET = enhancedAnalyticsHandler;
export const OPTIONS = createCorsHandler();
