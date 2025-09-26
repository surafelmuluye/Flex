import { z } from 'zod';
import type {
  ListingFilters,
  ReviewFilters,
  PropertyQuery,
  ReviewApprovalRequest,
  ManagerRegistrationRequest,
  ManagerLoginRequest,
  PaginationMeta,
  ApiResponse,
  NormalizedReview,
  Property,
  ListingStats,
  ReviewStats,
  ReviewApprovalResponse,
} from '@/lib/types/api';

// Base schemas
export const BaseResponseSchema = z.object({
  success: z.boolean(),
  timestamp: z.string().datetime(),
  duration: z.number().min(0).optional(),
  source: z.enum(['cache', 'database', 'external_api', 'mock_data']).optional(),
  requestId: z.string().uuid().optional(),
});

export const ErrorResponseSchema = BaseResponseSchema.extend({
  success: z.literal(false),
  error: z.string().min(1),
  message: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

export const SuccessResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
  data: z.unknown(),
});

// Pagination schemas
export const PaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasMore: z.boolean(),
});

// Query parameter schemas with strict validation
export const PaginationQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive integer')
    .transform(Number)
    .pipe(z.number().int().min(1))
    .optional()
    .default('1'),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a positive integer')
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default('20'),
});

export const ListingFiltersQuerySchema = PaginationQuerySchema.extend({
  search: z
    .string()
    .min(1, 'Search term cannot be empty')
    .max(255, 'Search term too long')
    .optional(),
  city: z
    .string()
    .min(1, 'City cannot be empty')
    .max(100, 'City name too long')
    .optional(),
  country: z
    .string()
    .min(1, 'Country cannot be empty')
    .max(100, 'Country name too long')
    .optional(),
  minPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Invalid price format')
    .transform(Number)
    .pipe(z.number().min(0, 'Price cannot be negative'))
    .optional(),
  maxPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Invalid price format')
    .transform(Number)
    .pipe(z.number().min(0, 'Price cannot be negative'))
    .optional(),
  minBedrooms: z
    .string()
    .regex(/^\d+$/, 'Bedrooms must be an integer')
    .transform(Number)
    .pipe(z.number().int().min(0, 'Bedrooms cannot be negative'))
    .optional(),
  maxBedrooms: z
    .string()
    .regex(/^\d+$/, 'Bedrooms must be an integer')
    .transform(Number)
    .pipe(z.number().int().min(0, 'Bedrooms cannot be negative'))
    .optional(),
  minBathrooms: z
    .string()
    .regex(/^\d+$/, 'Bathrooms must be an integer')
    .transform(Number)
    .pipe(z.number().int().min(0, 'Bathrooms cannot be negative'))
    .optional(),
  maxBathrooms: z
    .string()
    .regex(/^\d+$/, 'Bathrooms must be an integer')
    .transform(Number)
    .pipe(z.number().int().min(0, 'Bathrooms cannot be negative'))
    .optional(),
  minCapacity: z
    .string()
    .regex(/^\d+$/, 'Capacity must be an integer')
    .transform(Number)
    .pipe(z.number().int().min(1, 'Capacity must be at least 1'))
    .optional(),
  maxCapacity: z
    .string()
    .regex(/^\d+$/, 'Capacity must be an integer')
    .transform(Number)
    .pipe(z.number().int().min(1, 'Capacity must be at least 1'))
    .optional(),
  instantBookable: z
    .enum(['true', 'false'])
    .transform(val => val === 'true')
    .optional(),
  amenities: z
    .string()
    .transform(str => str.split(',').map(s => s.trim()).filter(Boolean))
    .pipe(z.array(z.string().min(1).max(100)))
    .optional(),
  sortBy: z
    .enum(['created_at', 'name', 'price', 'rating', 'review_count'])
    .optional()
    .default('created_at'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),
});

export const ReviewFiltersQuerySchema = PaginationQuerySchema.extend({
  listingId: z
    .string()
    .min(1, 'Listing ID cannot be empty')
    .max(50, 'Listing ID too long')
    .optional(),
  status: z
    .enum(['all', 'pending', 'approved', 'rejected'])
    .optional()
    .default('all'),
  rating: z
    .enum(['all', '1', '2', '3', '4', '5'])
    .optional()
    .default('all'),
  type: z
    .enum(['all', 'guest-to-host', 'host-to-guest'])
    .optional()
    .default('all'),
  dateFrom: z
    .string()
    .datetime('Invalid date format')
    .optional(),
  dateTo: z
    .string()
    .datetime('Invalid date format')
    .optional(),
});

export const PropertyQuerySchema = z.object({
  includeReviews: z
    .enum(['true', 'false'])
    .transform(val => val === 'true')
    .optional()
    .default('false'),
  approvedOnly: z
    .enum(['true', 'false'])
    .transform(val => val === 'true')
    .optional()
    .default('false'),
});

// Request body schemas
export const ReviewApprovalSchema = z.object({
  approved: z.boolean(),
  listingId: z
    .string()
    .min(1, 'Listing ID is required')
    .max(50, 'Listing ID too long'),
  notes: z
    .string()
    .max(500, 'Notes too long')
    .optional(),
});

export const ManagerRegistrationSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name too long'),
});

export const ManagerLoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email too long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password too long'),
});

// Data schemas
export const ReviewCategorySchema = z.object({
  category: z
    .string()
    .min(1, 'Category cannot be empty')
    .max(50, 'Category name too long'),
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(10, 'Rating cannot exceed 10'),
});

export const NormalizedReviewSchema = z.object({
  id: z
    .string()
    .min(1, 'Review ID cannot be empty')
    .max(50, 'Review ID too long'),
  listingId: z
    .string()
    .min(1, 'Listing ID cannot be empty')
    .max(50, 'Listing ID too long'),
  listingName: z
    .string()
    .min(1, 'Listing name cannot be empty')
    .max(255, 'Listing name too long'),
  type: z.enum(['host-to-guest', 'guest-to-host']),
  status: z.enum(['published', 'pending']),
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .optional(),
  publicReview: z
    .string()
    .min(1, 'Review text cannot be empty')
    .max(2000, 'Review text too long'),
  guestName: z
    .string()
    .min(1, 'Guest name cannot be empty')
    .max(255, 'Guest name too long'),
  submittedAt: z
    .string()
    .datetime('Invalid date format'),
  reviewCategory: z
    .array(ReviewCategorySchema)
    .min(1, 'At least one review category is required'),
  approved: z.boolean().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().datetime().optional(),
});

export const ListingAmenitySchema = z.object({
  amenityName: z
    .string()
    .min(1, 'Amenity name cannot be empty')
    .max(100, 'Amenity name too long'),
});

export const ListingImageSchema = z.object({
  url: z
    .string()
    .url('Invalid URL format')
    .max(500, 'URL too long'),
  caption: z
    .string()
    .max(255, 'Caption too long')
    .optional(),
});

export const PropertySchema = z.object({
  id: z.number().int().positive('Invalid property ID'),
  hostawayId: z
    .string()
    .min(1, 'Hostaway ID cannot be empty')
    .max(50, 'Hostaway ID too long'),
  name: z
    .string()
    .min(1, 'Property name cannot be empty')
    .max(255, 'Property name too long'),
  description: z
    .string()
    .max(2000, 'Description too long'),
  price: z
    .number()
    .min(0, 'Price cannot be negative'),
  address: z
    .string()
    .min(1, 'Address cannot be empty')
    .max(500, 'Address too long'),
  city: z
    .string()
    .min(1, 'City cannot be empty')
    .max(100, 'City name too long'),
  country: z
    .string()
    .min(1, 'Country cannot be empty')
    .max(100, 'Country name too long'),
  bedroomsNumber: z
    .number()
    .int()
    .min(0, 'Bedrooms cannot be negative'),
  bathroomsNumber: z
    .number()
    .int()
    .min(0, 'Bathrooms cannot be negative'),
  personCapacity: z
    .number()
    .int()
    .min(1, 'Capacity must be at least 1'),
  cleaningFee: z
    .number()
    .min(0, 'Cleaning fee cannot be negative'),
  checkinFee: z
    .number()
    .min(0, 'Check-in fee cannot be negative'),
  priceForExtraPerson: z
    .number()
    .min(0, 'Extra person price cannot be negative'),
  refundableDamageDeposit: z
    .number()
    .min(0, 'Damage deposit cannot be negative'),
  minNights: z
    .number()
    .int()
    .min(1, 'Minimum nights must be at least 1'),
  maxNights: z
    .number()
    .int()
    .min(1, 'Maximum nights must be at least 1'),
  instantBookable: z.boolean(),
  cancellationPolicy: z
    .string()
    .max(100, 'Cancellation policy too long'),
  houseRules: z
    .string()
    .max(2000, 'House rules too long')
    .optional(),
  contactName: z
    .string()
    .max(255, 'Contact name too long')
    .optional(),
  contactEmail: z
    .string()
    .email('Invalid contact email')
    .max(255, 'Contact email too long')
    .optional(),
  contactPhone1: z
    .string()
    .max(50, 'Contact phone too long')
    .optional(),
  language: z
    .string()
    .max(10, 'Language code too long'),
  currencyCode: z
    .string()
    .max(3, 'Currency code too long'),
  timeZoneName: z
    .string()
    .max(50, 'Timezone name too long'),
  lat: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),
  lng: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional(),
  listingAmenities: z
    .array(ListingAmenitySchema)
    .min(0),
  listingImages: z
    .array(ListingImageSchema)
    .min(0),
});

// Response schemas
export const ListingsResponseSchema = SuccessResponseSchema.extend({
  data: z.array(PropertySchema),
  pagination: PaginationSchema,
});

export const ReviewsResponseSchema = SuccessResponseSchema.extend({
  data: z.array(NormalizedReviewSchema),
  pagination: PaginationSchema,
  statistics: z.object({
    total: z.number().int().min(0),
    byStatus: z.object({
      pending: z.number().int().min(0),
      approved: z.number().int().min(0),
      rejected: z.number().int().min(0),
    }),
    byType: z.object({
      'guest-to-host': z.number().int().min(0),
      'host-to-guest': z.number().int().min(0),
    }),
    byRating: z.object({
      1: z.number().int().min(0),
      2: z.number().int().min(0),
      3: z.number().int().min(0),
      4: z.number().int().min(0),
      5: z.number().int().min(0),
    }),
    averageRating: z
      .number()
      .min(0)
      .max(5),
    categoryAverages: z.record(z.string(), z.number()),
  }),
});

export const PropertyResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    property: PropertySchema,
    reviews: z.array(NormalizedReviewSchema).optional(),
    reviewCount: z.number().int().min(0).optional(),
    approvedReviewCount: z.number().int().min(0).optional(),
  }),
});

export const ReviewApprovalResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    reviewId: z.string(),
    approved: z.boolean(),
    approvedBy: z.string(),
    approvedAt: z.string().datetime(),
    notes: z.string().optional(),
  }),
});

export const StatsResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    total: z.number().int().min(0),
    averagePrice: z.number().min(0),
    availableCities: z.array(z.string()),
    availableCountries: z.array(z.string()),
    availableAmenities: z.array(z.string()),
    priceRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
    }),
    capacityRange: z.object({
      min: z.number().int().min(1),
      max: z.number().int().min(1),
    }),
    cities: z.array(z.object({
      city: z.string(),
      count: z.number().int().min(0),
    })),
    countries: z.array(z.object({
      country: z.string(),
      count: z.number().int().min(0),
    })),
  }),
});

// Type exports with strict typing
export type {
  ListingFilters,
  ReviewFilters,
  PropertyQuery,
  ReviewApprovalRequest,
  ManagerRegistrationRequest,
  ManagerLoginRequest,
  PaginationMeta,
  ApiResponse,
  NormalizedReview,
  Property,
  ListingStats,
  ReviewStats,
  ReviewApprovalResponse,
};

// Validation helper functions
export const validateListingFilters = (data: unknown): ListingFilters => {
  return ListingFiltersQuerySchema.parse(data);
};

export const validateReviewFilters = (data: unknown): ReviewFilters => {
  const parsed = ReviewFiltersQuerySchema.parse(data);
  return {
    listingId: parsed.listingId,
    rating: parsed.rating === 'all' ? undefined : parseInt(parsed.rating),
    status: parsed.status === 'all' ? undefined : parsed.status,
    dateFrom: parsed.dateFrom,
    dateTo: parsed.dateTo,
  };
};

export const validatePropertyQuery = (data: unknown): PropertyQuery => {
  const parsed = PropertyQuerySchema.parse(data);
  return {
    id: '', // Not available in schema, will need to be provided separately
    includeReviews: parsed.includeReviews,
    includeStats: false, // Not available in schema
    reviewsLimit: 10, // Default value
  };
};

export const validateReviewApproval = (data: unknown): ReviewApprovalRequest => {
  const parsed = ReviewApprovalSchema.parse(data);
  return {
    status: parsed.approved ? 'approved' : 'rejected',
  };
};

export const validateManagerRegistration = (data: unknown): ManagerRegistrationRequest => {
  return ManagerRegistrationSchema.parse(data);
};

export const validateManagerLogin = (data: unknown): ManagerLoginRequest => {
  return ManagerLoginSchema.parse(data);
};

export const validateNormalizedReview = (data: unknown): NormalizedReview => {
  const parsed = NormalizedReviewSchema.parse(data);
  return {
    id: parsed.id,
    listingId: parsed.listingId,
    rating: parsed.rating || 0,
    content: parsed.publicReview,
    authorName: parsed.guestName,
    authorEmail: '', // Not available in schema
    status: parsed.status,
    createdAt: parsed.submittedAt,
    updatedAt: parsed.submittedAt, // Use submittedAt as fallback
    listing: {
      title: parsed.listingName,
      address: '', // Not available in schema
    },
  };
};

export const validateProperty = (data: unknown): Property => {
  const parsed = PropertySchema.parse(data);
  return {
    id: parsed.id.toString(),
    title: parsed.name,
    description: parsed.description || '',
    address: parsed.address,
    city: parsed.city,
    state: '', // Not available in schema
    country: parsed.country,
    price: parsed.price,
    bedrooms: parsed.bedroomsNumber,
    bathrooms: parsed.bathroomsNumber,
    propertyType: 'apartment', // Default value
    status: 'active', // Default value
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    avgRating: 0, // Default value
    reviewCount: 0, // Default value
  };
};

// Safe validation functions that return results instead of throwing
export const safeValidateListingFilters = (data: unknown) => {
  return ListingFiltersQuerySchema.safeParse(data);
};

export const safeValidateReviewFilters = (data: unknown) => {
  return ReviewFiltersQuerySchema.safeParse(data);
};

export const safeValidatePropertyQuery = (data: unknown) => {
  return PropertyQuerySchema.safeParse(data);
};

export const safeValidateReviewApproval = (data: unknown) => {
  return ReviewApprovalSchema.safeParse(data);
};

export const safeValidateManagerRegistration = (data: unknown) => {
  return ManagerRegistrationSchema.safeParse(data);
};

export const safeValidateManagerLogin = (data: unknown) => {
  return ManagerLoginSchema.safeParse(data);
};