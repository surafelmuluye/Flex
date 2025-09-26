import { NormalizedReview, HostawayListing } from '@/lib/db/schema';
import { log } from '@/lib/services/simple-logger.service';

// Enhanced data validation and normalization utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface NormalizationOptions {
  strictMode?: boolean;
  allowPartialData?: boolean;
  defaultValues?: Partial<NormalizedReview>;
}

/**
 * Validates a raw review object from Hostaway API
 */
export function validateHostawayReview(review: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!review.id) {
    errors.push('Review ID is required');
  }

  if (!review.type || !['host-to-guest', 'guest-to-host'].includes(review.type)) {
    errors.push('Review type must be either "host-to-guest" or "guest-to-host"');
  }

  if (!review.status || !['published', 'pending'].includes(review.status)) {
    errors.push('Review status must be either "published" or "pending"');
  }

  if (!review.guestName || typeof review.guestName !== 'string') {
    errors.push('Guest name is required and must be a string');
  }

  if (!review.submittedAt) {
    errors.push('Submission date is required');
  } else {
    // Validate date format
    const date = new Date(review.submittedAt);
    if (isNaN(date.getTime())) {
      errors.push('Invalid submission date format');
    }
  }

  // Optional fields validation
  if (review.rating !== null && review.rating !== undefined) {
    if (typeof review.rating !== 'number' || review.rating < 1 || review.rating > 5) {
      warnings.push('Rating should be a number between 1 and 5');
    }
  }

  if (review.publicReview && typeof review.publicReview !== 'string') {
    warnings.push('Public review should be a string');
  }

  if (review.reviewCategory && !Array.isArray(review.reviewCategory)) {
    warnings.push('Review category should be an array');
  } else if (review.reviewCategory) {
    review.reviewCategory.forEach((category: any, index: number) => {
      if (!category.category || typeof category.category !== 'string') {
        warnings.push(`Category ${index}: category name is required and must be a string`);
      }
      if (typeof category.rating !== 'number' || category.rating < 1 || category.rating > 10) {
        warnings.push(`Category ${index}: rating should be a number between 1 and 10`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates a raw listing object from Hostaway API
 */
export function validateHostawayListing(listing: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!listing.id) {
    errors.push('Listing ID is required');
  }

  if (!listing.name || typeof listing.name !== 'string') {
    errors.push('Listing name is required and must be a string');
  }

  if (!listing.address || typeof listing.address !== 'string') {
    errors.push('Listing address is required and must be a string');
  }

  if (!listing.city || typeof listing.city !== 'string') {
    errors.push('Listing city is required and must be a string');
  }

  if (!listing.country || typeof listing.country !== 'string') {
    errors.push('Listing country is required and must be a string');
  }

  // Optional fields validation
  if (listing.price !== null && listing.price !== undefined) {
    if (typeof listing.price !== 'number' || listing.price < 0) {
      warnings.push('Price should be a positive number');
    }
  }

  if (listing.bedroomsNumber !== null && listing.bedroomsNumber !== undefined) {
    if (typeof listing.bedroomsNumber !== 'number' || listing.bedroomsNumber < 0) {
      warnings.push('Bedrooms number should be a non-negative number');
    }
  }

  if (listing.bathroomsNumber !== null && listing.bathroomsNumber !== undefined) {
    if (typeof listing.bathroomsNumber !== 'number' || listing.bathroomsNumber < 0) {
      warnings.push('Bathrooms number should be a non-negative number');
    }
  }

  if (listing.personCapacity !== null && listing.personCapacity !== undefined) {
    if (typeof listing.personCapacity !== 'number' || listing.personCapacity < 1) {
      warnings.push('Person capacity should be a positive number');
    }
  }

  if (listing.listingAmenities && !Array.isArray(listing.listingAmenities)) {
    warnings.push('Listing amenities should be an array');
  }

  if (listing.listingImages && !Array.isArray(listing.listingImages)) {
    warnings.push('Listing images should be an array');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Enhanced review normalization with validation and error handling
 */
export function normalizeHostawayReview(
  review: any, 
  options: NormalizationOptions = {}
): NormalizedReview {
  const { strictMode = false, allowPartialData = true, defaultValues = {} } = options;

  // Validate the review data
  const validation = validateHostawayReview(review);
  
  if (strictMode && !validation.isValid) {
    throw new Error(`Review validation failed: ${validation.errors.join(', ')}`);
  }

  // Log warnings if any
  if (validation.warnings.length > 0) {
    log.warn('Review normalization warnings', {
      reviewId: review.id,
      warnings: validation.warnings
    });
  }

  // Normalize category ratings
  const normalizedCategories = (review.reviewCategory || []).map((category: any) => ({
    category: String(category.category || 'unknown').toLowerCase().replace(/\s+/g, '_'),
    rating: Math.max(1, Math.min(10, Number(category.rating) || 0))
  }));

  // Calculate average rating from categories if overall rating is missing
  let normalizedRating = review.rating;
  if (!normalizedRating && normalizedCategories.length > 0) {
    const avgCategoryRating = normalizedCategories.reduce((sum: number, cat: any) => sum + cat.rating, 0) / normalizedCategories.length;
    normalizedRating = Math.round((avgCategoryRating / 10) * 5); // Convert 1-10 scale to 1-5 scale
  }

  // Sanitize text fields
  const sanitizeText = (text: string | null | undefined): string => {
    if (!text || typeof text !== 'string') return '';
    return text.trim().replace(/\s+/g, ' ').substring(0, 1000); // Limit to 1000 chars
  };

  const normalizedReview: NormalizedReview = {
    id: parseInt(String(review.id || '0')) || 0,
    listingId: parseInt(String(review.listingId || defaultValues.listingId || '155613')) || 155613,
    type: (review.type === 'host-to-guest' || review.type === 'guest-to-host') 
      ? review.type 
      : 'guest-to-host',
    status: (review.status === 'published' || review.status === 'pending') 
      ? review.status 
      : 'pending',
    rating: normalizedRating || undefined,
    content: sanitizeText(review.publicReview || ''),
    authorName: sanitizeText(review.guestName || 'Anonymous Guest'),
    authorEmail: undefined,
    categories: normalizedCategories,
    submittedAt: review.submittedAt || new Date().toISOString(),
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvedBy: defaultValues.approvedBy || undefined
  };

  return normalizedReview;
}

/**
 * Enhanced listing normalization with validation and error handling
 */
export function normalizeHostawayListing(
  listing: any,
  options: NormalizationOptions = {}
): HostawayListing {
  const { strictMode = false, allowPartialData = true, defaultValues = {} } = options;

  // Validate the listing data
  const validation = validateHostawayListing(listing);
  
  if (strictMode && !validation.isValid) {
    throw new Error(`Listing validation failed: ${validation.errors.join(', ')}`);
  }

  // Log warnings if any
  if (validation.warnings.length > 0) {
    log.warn('Listing normalization warnings', {
      listingId: listing.id,
      warnings: validation.warnings
    });
  }

  // Sanitize text fields
  const sanitizeText = (text: string | null | undefined): string => {
    if (!text || typeof text !== 'string') return '';
    return text.trim().replace(/\s+/g, ' ');
  };

  // Normalize amenities
  const normalizedAmenities = (listing.listingAmenities || []).map((amenity: any) => ({
    amenityName: sanitizeText(amenity.amenityName || amenity.name || 'Unknown Amenity')
  }));

  // Normalize images
  const normalizedImages = (listing.listingImages || []).map((image: any) => ({
    url: String(image.url || ''),
    caption: sanitizeText(image.caption || image.title || '')
  }));

  const normalizedListing: HostawayListing = {
    id: Number(listing.id) || 0,
    name: sanitizeText(listing.name || listing.externalListingName || 'Unknown Property'),
    description: sanitizeText(listing.description || ''),
    price: Number(listing.price) || 0,
    address: sanitizeText(listing.address || ''),
    city: sanitizeText(listing.city || ''),
    country: sanitizeText(listing.country || ''),
    bedroomsNumber: Number(listing.bedroomsNumber) || 0,
    bathroomsNumber: Number(listing.bathroomsNumber) || 0,
    personCapacity: Number(listing.personCapacity) || 1,
    listingAmenities: normalizedAmenities,
    listingImages: normalizedImages,
    cleaningFee: listing.cleaningFee ? Number(listing.cleaningFee) : undefined
  };

  return normalizedListing;
}

/**
 * Batch normalize multiple reviews with error handling
 */
export function normalizeReviewsBatch(
  reviews: any[],
  options: NormalizationOptions = {}
): { valid: NormalizedReview[]; invalid: { review: any; error: string }[] } {
  const valid: NormalizedReview[] = [];
  const invalid: { review: any; error: string }[] = [];

  reviews.forEach((review, index) => {
    try {
      const normalized = normalizeHostawayReview(review, options);
      valid.push(normalized);
    } catch (error) {
      invalid.push({
        review,
        error: error instanceof Error ? error.message : `Unknown error at index ${index}`
      });
    }
  });

  log.info('Batch normalization completed', {
    total: reviews.length,
    valid: valid.length,
    invalid: invalid.length
  });

  return { valid, invalid };
}

/**
 * Batch normalize multiple listings with error handling
 */
export function normalizeListingsBatch(
  listings: any[],
  options: NormalizationOptions = {}
): { valid: HostawayListing[]; invalid: { listing: any; error: string }[] } {
  const valid: HostawayListing[] = [];
  const invalid: { listing: any; error: string }[] = [];

  listings.forEach((listing, index) => {
    try {
      const normalized = normalizeHostawayListing(listing, options);
      valid.push(normalized);
    } catch (error) {
      invalid.push({
        listing,
        error: error instanceof Error ? error.message : `Unknown error at index ${index}`
      });
    }
  });

  log.info('Batch normalization completed', {
    total: listings.length,
    valid: valid.length,
    invalid: invalid.length
  });

  return { valid, invalid };
}

/**
 * Calculate review statistics from normalized reviews
 */
export function calculateReviewStats(reviews: NormalizedReview[]) {
  const stats = {
    total: reviews.length,
    byStatus: {
      pending: 0,
      approved: 0,
      rejected: 0
    },
    byType: {
      'guest-to-host': 0,
      'host-to-guest': 0
    },
    byRating: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    },
    averageRating: 0,
    categoryAverages: {} as Record<string, number>
  };

  let totalRating = 0;
  let ratingCount = 0;
  const categoryTotals: Record<string, { sum: number; count: number }> = {};

  reviews.forEach(review => {
    // Count by status
    if (review.status === 'approved') stats.byStatus.approved++;
    else if (review.status === 'rejected') stats.byStatus.rejected++;
    else stats.byStatus.pending++;

    // Count by type
    stats.byType[review.type]++;

    // Count by rating
    if (review.rating) {
      stats.byRating[review.rating as keyof typeof stats.byRating]++;
      totalRating += review.rating;
      ratingCount++;
    }

    // Calculate category averages
    review.categories?.forEach((category: any) => {
      if (!categoryTotals[category.category]) {
        categoryTotals[category.category] = { sum: 0, count: 0 };
      }
      categoryTotals[category.category].sum += category.rating;
      categoryTotals[category.category].count++;
    });
  });

  // Calculate averages
  stats.averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
  
  Object.keys(categoryTotals).forEach(category => {
    const { sum, count } = categoryTotals[category];
    stats.categoryAverages[category] = count > 0 ? sum / count : 0;
  });

  return stats;
}
