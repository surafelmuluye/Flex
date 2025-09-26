import log from '@/lib/logger';

// Mock data for when database is not available
export const mockDashboardData = {
  overview: {
    totalListings: 150,
    totalReviews: 1250,
    avgRating: 4.2,
    recentReviews: 45,
  },
  listingsByStatus: {
    active: 120,
    inactive: 25,
    pending: 5,
  },
  reviewsByRating: {
    5: 450,
    4: 380,
    3: 250,
    2: 120,
    1: 50,
  },
  recentActivity: [
    { date: '2025-09-25', count: 8 },
    { date: '2025-09-24', count: 12 },
    { date: '2025-09-23', count: 6 },
    { date: '2025-09-22', count: 15 },
    { date: '2025-09-21', count: 4 },
  ],
  topListings: [
    {
      id: '1',
      title: 'Luxury Downtown Apartment',
      address: '123 Main St, New York, NY',
      avgRating: 4.8,
      reviewCount: 45,
    },
    {
      id: '2',
      title: 'Cozy Beach House',
      address: '456 Ocean Ave, Miami, FL',
      avgRating: 4.7,
      reviewCount: 38,
    },
    {
      id: '3',
      title: 'Modern City Loft',
      address: '789 Urban Blvd, San Francisco, CA',
      avgRating: 4.6,
      reviewCount: 32,
    },
  ],
  reviewTrends: [
    { month: '2025-09', count: 45, avgRating: 4.2 },
    { month: '2025-08', count: 52, avgRating: 4.1 },
    { month: '2025-07', count: 38, avgRating: 4.3 },
  ],
  lastUpdated: new Date().toISOString(),
};

export const mockListingsData = {
  listings: [
    {
      id: '1',
      title: 'Luxury Downtown Apartment',
      description: 'Beautiful apartment in the heart of downtown',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      price: 2500,
      bedrooms: 2,
      bathrooms: 2,
      propertyType: 'apartment',
      status: 'active',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-09-25T00:00:00Z',
      avgRating: 4.8,
      reviewCount: 45,
    },
    {
      id: '2',
      title: 'Cozy Beach House',
      description: 'Perfect beachfront property with ocean views',
      address: '456 Ocean Ave',
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      price: 3200,
      bedrooms: 3,
      bathrooms: 2,
      propertyType: 'house',
      status: 'active',
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-09-25T00:00:00Z',
      avgRating: 4.7,
      reviewCount: 38,
    },
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    totalPages: 8,
    hasNext: true,
    hasPrev: false,
  },
  filters: {},
  sort: {
    field: 'created_at',
    direction: 'desc',
  },
};

export const mockReviewsData = {
  reviews: [
    {
      id: '1',
      listingId: '1',
      rating: 5,
      content: 'Amazing place to stay! Highly recommended.',
      authorName: 'John Doe',
      authorEmail: 'john@example.com',
      status: 'approved',
      createdAt: '2025-09-20T00:00:00Z',
      updatedAt: '2025-09-20T00:00:00Z',
      listing: {
        title: 'Luxury Downtown Apartment',
        address: '123 Main St, New York, NY',
      },
    },
    {
      id: '2',
      listingId: '2',
      rating: 4,
      content: 'Great location and beautiful views.',
      authorName: 'Jane Smith',
      authorEmail: 'jane@example.com',
      status: 'approved',
      createdAt: '2025-09-19T00:00:00Z',
      updatedAt: '2025-09-19T00:00:00Z',
      listing: {
        title: 'Cozy Beach House',
        address: '456 Ocean Ave, Miami, FL',
      },
    },
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 1250,
    totalPages: 63,
    hasNext: true,
    hasPrev: false,
  },
  filters: {},
  sort: {
    field: 'created_at',
    direction: 'desc',
  },
};

export const mockListingsStatsData = {
  overview: {
    totalListings: 150,
    totalWithReviews: 120,
    avgPrice: 2800,
    medianPrice: 2500,
  },
  listingsByStatus: {
    active: 120,
    inactive: 25,
    pending: 5,
  },
  listingsByType: {
    apartment: 80,
    house: 45,
    condo: 20,
    townhouse: 5,
  },
  listingsByLocation: [
    { city: 'New York', state: 'NY', count: 25 },
    { city: 'Miami', state: 'FL', count: 20 },
    { city: 'San Francisco', state: 'CA', count: 18 },
    { city: 'Los Angeles', state: 'CA', count: 15 },
    { city: 'Chicago', state: 'IL', count: 12 },
  ],
  priceStats: {
    min: 800,
    max: 5000,
    avg: 2800,
    median: 2500,
  },
  bedroomStats: [
    { bedrooms: 1, count: 30 },
    { bedrooms: 2, count: 60 },
    { bedrooms: 3, count: 40 },
    { bedrooms: 4, count: 15 },
    { bedrooms: 5, count: 5 },
  ],
  bathroomStats: [
    { bathrooms: 1, count: 45 },
    { bathrooms: 2, count: 70 },
    { bathrooms: 3, count: 25 },
    { bathrooms: 4, count: 10 },
  ],
  topRatedListings: [
    {
      id: '1',
      title: 'Luxury Downtown Apartment',
      address: '123 Main St, New York, NY',
      price: 2500,
      avgRating: 4.8,
      reviewCount: 45,
    },
    {
      id: '2',
      title: 'Cozy Beach House',
      address: '456 Ocean Ave, Miami, FL',
      price: 3200,
      avgRating: 4.7,
      reviewCount: 38,
    },
  ],
  recentListings: [
    { date: '2025-09-25', count: 3 },
    { date: '2025-09-24', count: 5 },
    { date: '2025-09-23', count: 2 },
    { date: '2025-09-22', count: 4 },
    { date: '2025-09-21', count: 1 },
  ],
  lastUpdated: new Date().toISOString(),
};

// Function to get mock data with logging
export function getMockData(type: 'dashboard' | 'listings' | 'reviews' | 'listingsStats' | 'property', options?: { id?: string }) {
  log.info('Serving mock data', {
    type,
    operation: 'mock_data_served',
  });

  switch (type) {
    case 'dashboard':
      return mockDashboardData;
    case 'listings':
      return mockListingsData;
    case 'reviews':
      return mockReviewsData;
    case 'listingsStats':
      return mockListingsStatsData;
    case 'property':
      return getMockPropertyData(options?.id || '1');
    default:
      throw new Error(`Unknown mock data type: ${type}`);
  }
}

function getMockPropertyData(propertyId: string) {
  const mockProperty = {
    id: propertyId,
    title: `Property ${propertyId}`,
    description: `Beautiful property located in the heart of the city. This ${propertyId === '1' ? 'luxury apartment' : 'modern home'} offers stunning views and all modern amenities.`,
    address: `${propertyId}23 Main Street, New York, NY 10001`,
    city: 'New York',
    state: 'NY',
    country: 'USA',
    price: 150 + parseInt(propertyId) * 50,
    bedrooms: 2 + (parseInt(propertyId) % 3),
    bathrooms: 1 + (parseInt(propertyId) % 2),
    propertyType: 'apartment',
    status: 'active',
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    avgRating: 4.0 + Math.random() * 1.0,
    reviewCount: Math.floor(Math.random() * 50) + 5,
  };

  const mockReviews = Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, i) => ({
    id: `review_${propertyId}_${i}`,
    listingId: propertyId,
    rating: Math.floor(Math.random() * 5) + 1,
    content: `Great property! ${i % 2 === 0 ? 'Highly recommended for families.' : 'Perfect location and amenities.'}`,
    authorName: `Guest ${i + 1}`,
    authorEmail: `guest${i + 1}@example.com`,
    status: ['approved', 'pending', 'rejected'][Math.floor(Math.random() * 3)],
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    listing: {
      title: mockProperty.title,
      address: mockProperty.address,
    },
  }));

  const totalReviews = mockReviews.length;
  const approvedReviews = mockReviews.filter(r => r.status === 'approved').length;
  const pendingReviews = mockReviews.filter(r => r.status === 'pending').length;
  const rejectedReviews = mockReviews.filter(r => r.status === 'rejected').length;

  const ratings = mockReviews.filter(r => r.rating).map(r => r.rating);
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : 0;

  return {
    property: mockProperty,
    reviews: mockReviews,
    stats: {
      totalReviews,
      averageRating,
      pendingReviews,
      approvedReviews,
      rejectedReviews
    }
  };
}
