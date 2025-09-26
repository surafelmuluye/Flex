import { NextRequest } from 'next/server';
import { createApiHandler, createCorsHandler } from '@/lib/handlers/api-handler';
import { getCache, getRateLimiter } from '@/lib/services/service-manager';
import { generateListingsCacheKey } from '@/lib/services/cache.service';
import { sanitizeInput } from '@/lib/services/security.service';
import { db } from '@/lib/db/drizzle';
import { listings, reviews } from '@/lib/db/schema';
import { eq, and, or, like, gte, lte, count, avg, desc, asc, sql } from 'drizzle-orm';

// Listings handler using centralized API handler
const listingsHandler = createApiHandler(async (request: NextRequest) => {
  // Get services from service manager
  const listingsCache = getCache('listingsCache');

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;
    
    // Parse filters
    const filters: Record<string, unknown> = {};
    const search = sanitizeInput(searchParams.get('search') || '');
    const status = sanitizeInput(searchParams.get('status') || '');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    const bathrooms = searchParams.get('bathrooms');
    const propertyType = sanitizeInput(searchParams.get('propertyType') || '');
    const location = sanitizeInput(searchParams.get('location') || '');

    if (search) filters.search = search;
    if (status) filters.status = status;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (bedrooms) filters.bedrooms = parseInt(bedrooms);
    if (bathrooms) filters.bathrooms = parseInt(bathrooms);
    if (propertyType) filters.propertyType = propertyType;
    if (location) filters.location = location;

    // Parse sorting
    const sortBy = sanitizeInput(searchParams.get('sortBy') || 'created_at');
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'ASC' : 'DESC';

    // No backend caching - use database directly

    // Build WHERE conditions using Drizzle ORM
    const whereConditions = [];

    if (filters.search) {
      whereConditions.push(
        or(
          like(listings.name, `%${filters.search}%`),
          like(listings.description, `%${filters.search}%`),
          like(listings.address, `%${filters.search}%`)
        )
      );
    }

    if (filters.status) {
      // Note: No status field in schema, using instantBookable as a proxy
      whereConditions.push(eq(listings.instantBookable, filters.status === 'active'));
    }

    if (filters.minPrice) {
      whereConditions.push(gte(listings.price, filters.minPrice.toString()));
    }

    if (filters.maxPrice) {
      whereConditions.push(lte(listings.price, filters.maxPrice.toString()));
    }

    if (filters.bedrooms) {
      whereConditions.push(eq(listings.bedroomsNumber, parseInt(filters.bedrooms as string)));
    }

    if (filters.bathrooms) {
      whereConditions.push(eq(listings.bathroomsNumber, parseInt(filters.bathrooms as string)));
    }

    if (filters.propertyType) {
      whereConditions.push(eq(listings.propertyTypeId, parseInt(filters.propertyType as string)));
    }

    if (filters.location) {
      whereConditions.push(
        or(
          like(listings.city, `%${filters.location}%`),
          like(listings.state, `%${filters.location}%`),
          like(listings.country, `%${filters.location}%`)
        )
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count using Drizzle ORM
    const totalResult = await db
      .select({ count: count() })
      .from(listings)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Build sort order
    let orderBy;
    const isAsc = sortOrder.toLowerCase() === 'asc';
    switch (sortBy) {
      case 'created_at':
        orderBy = isAsc ? asc(listings.createdAt) : desc(listings.createdAt);
        break;
      case 'name':
        orderBy = isAsc ? asc(listings.name) : desc(listings.name);
        break;
      case 'price':
        orderBy = isAsc ? asc(listings.price) : desc(listings.price);
        break;
      case 'city':
        orderBy = isAsc ? asc(listings.city) : desc(listings.city);
        break;
      case 'bedrooms':
        orderBy = isAsc ? asc(listings.bedroomsNumber) : desc(listings.bedroomsNumber);
        break;
      case 'bathrooms':
        orderBy = isAsc ? asc(listings.bathroomsNumber) : desc(listings.bathroomsNumber);
        break;
      default:
        orderBy = desc(listings.createdAt);
    }

    // Get listings with pagination using Drizzle ORM
    const listingsResult = await db
      .select({
        id: listings.id,
        name: listings.name,
        description: listings.description,
        address: listings.address,
        city: listings.city,
        state: listings.state,
        country: listings.country,
        price: listings.price,
        bedrooms: listings.bedroomsNumber,
        bathrooms: listings.bathroomsNumber,
        propertyType: listings.propertyTypeId,
        status: listings.instantBookable, // Using instantBookable as status proxy
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        avgRating: sql<number>`(SELECT AVG(rating) FROM reviews WHERE listing_id = ${listings.id})`,
        reviewCount: sql<number>`(SELECT COUNT(*) FROM reviews WHERE listing_id = ${listings.id})`,
      })
      .from(listings)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Format listings data
    const formattedListings = listingsResult.map((row) => ({
      id: row.id,
      title: row.name, // Map name to title for frontend compatibility
      description: row.description,
      address: row.address,
      city: row.city,
      state: row.state,
      country: row.country,
      price: parseFloat(row.price?.toString() || '0'),
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      propertyType: row.propertyType,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      avgRating: parseFloat(row.avgRating?.toString() || '0'),
      reviewCount: row.reviewCount || 0,
    }));

    // Calculate pagination
    const totalPages = Math.ceil(Number(total) / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const responseData = {
      listings: formattedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
      filters,
      sort: {
        field: sortBy,
        direction: sortOrder.toLowerCase(),
      },
    };

    // Cache the data
    // No backend caching - return data directly
    return responseData;
  } catch (error) {
    // If database fails, serve mock data
    const { getMockData } = await import('@/lib/services/mock-data.service');
    const mockData = getMockData('listings');
    
    return mockData;
  }
  }, {
  rateLimiter: getRateLimiter('listingsRateLimiter'),
  // No backend caching - use database directly
});

export const GET = listingsHandler;
export const OPTIONS = createCorsHandler();