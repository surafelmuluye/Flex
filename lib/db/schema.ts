import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  decimal,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Rename users to managers and simplify
export const managers = pgTable('managers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  isFirstUser: boolean('is_first_user').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Reviews table for storing normalized reviews
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  hostawayId: integer('hostaway_id').unique(), // Original Hostaway review ID
  listingId: integer('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull(), // 'host-to-guest' or 'guest-to-host'
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'approved', 'rejected'
  rating: integer('rating'), // Overall rating (1-5)
  content: text('content').notNull(), // The review text
  authorName: varchar('author_name', { length: 255 }).notNull(),
  authorEmail: varchar('author_email', { length: 255 }),
  categories: jsonb('categories'), // Store review categories as JSON
  submittedAt: timestamp('submitted_at').notNull(),
  approvedBy: integer('approved_by').references(() => managers.id),
  approvedAt: timestamp('approved_at'),
  rejectedBy: integer('rejected_by').references(() => managers.id),
  rejectedAt: timestamp('rejected_at'),
  rejectionReason: text('rejection_reason'),
  notes: text('notes'), // Manager notes
  isPublic: boolean('is_public').default(false), // Whether to show on public website
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  listingIdx: index('reviews_listing_idx').on(table.listingId),
  statusIdx: index('reviews_status_idx').on(table.status),
  typeIdx: index('reviews_type_idx').on(table.type),
  ratingIdx: index('reviews_rating_idx').on(table.rating),
  submittedAtIdx: index('reviews_submitted_at_idx').on(table.submittedAt),
  hostawayIdIdx: index('reviews_hostaway_id_idx').on(table.hostawayId),
}));

// New table for review approvals (minimal storage)
export const reviewApprovals = pgTable('review_approvals', {
  id: serial('id').primaryKey(),
  reviewId: varchar('review_id', { length: 100 }).notNull(),
  listingId: varchar('listing_id', { length: 100 }).notNull(),
  approved: boolean('approved').default(false),
  approvedBy: integer('approved_by').references(() => managers.id),
  approvedAt: timestamp('approved_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Keep for activity logging
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  managerId: integer('manager_id').references(() => managers.id),
  action: text('action').notNull(),
  details: text('details'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

// Enhanced listings schema with proper indexing for filtering
export const listings = pgTable('listings', {
  id: serial('id').primaryKey(),
  hostawayId: integer('hostaway_id').unique(), // Original Hostaway ID
  name: varchar('name', { length: 255 }).notNull(),
  externalListingName: varchar('external_listing_name', { length: 255 }),
  internalListingName: varchar('internal_listing_name', { length: 255 }),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  
  // Location fields with indexes for filtering
  country: varchar('country', { length: 100 }).notNull(),
  countryCode: varchar('country_code', { length: 3 }),
  state: varchar('state', { length: 100 }),
  city: varchar('city', { length: 100 }).notNull(),
  street: varchar('street', { length: 255 }),
  address: text('address').notNull(),
  publicAddress: text('public_address'),
  zipcode: varchar('zipcode', { length: 20 }),
  lat: decimal('lat', { precision: 10, scale: 8 }),
  lng: decimal('lng', { precision: 11, scale: 8 }),
  
  // Pricing and capacity
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  cleaningFee: decimal('cleaning_fee', { precision: 10, scale: 2 }).default('0'),
  checkinFee: decimal('checkin_fee', { precision: 10, scale: 2 }).default('0'),
  priceForExtraPerson: decimal('price_for_extra_person', { precision: 10, scale: 2 }).default('0'),
  refundableDamageDeposit: decimal('refundable_damage_deposit', { precision: 10, scale: 2 }).default('0'),
  
  // Property details
  bedroomsNumber: integer('bedrooms_number').notNull().default(0),
  bathroomsNumber: integer('bathrooms_number').notNull().default(0),
  bedsNumber: integer('beds_number').default(0),
  personCapacity: integer('person_capacity').notNull().default(1),
  maxChildrenAllowed: integer('max_children_allowed'),
  maxInfantsAllowed: integer('max_infants_allowed'),
  maxPetsAllowed: integer('max_pets_allowed'),
  squareMeters: integer('square_meters'),
  
  // Property type and room details
  propertyTypeId: integer('property_type_id'),
  roomType: varchar('room_type', { length: 50 }),
  bathroomType: varchar('bathroom_type', { length: 50 }),
  
  // Stay policies
  minNights: integer('min_nights').default(1),
  maxNights: integer('max_nights'),
  guestsIncluded: integer('guests_included').default(1),
  checkInTimeStart: integer('check_in_time_start'),
  checkInTimeEnd: integer('check_in_time_end'),
  checkOutTime: integer('check_out_time'),
  cancellationPolicy: varchar('cancellation_policy', { length: 50 }),
  
  // Property rules and instructions
  houseRules: text('house_rules'),
  keyPickup: text('key_pickup'),
  specialInstruction: text('special_instruction'),
  doorSecurityCode: varchar('door_security_code', { length: 50 }),
  cleaningInstruction: text('cleaning_instruction'),
  
  // Contact information
  contactName: varchar('contact_name', { length: 100 }),
  contactSurName: varchar('contact_sur_name', { length: 100 }),
  contactPhone1: varchar('contact_phone1', { length: 50 }),
  contactPhone2: varchar('contact_phone2', { length: 50 }),
  contactLanguage: varchar('contact_language', { length: 100 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactAddress: text('contact_address'),
  
  // System fields
  language: varchar('language', { length: 10 }).default('en'),
  currencyCode: varchar('currency_code', { length: 3 }).default('USD'),
  timeZoneName: varchar('time_zone_name', { length: 50 }),
  
  // Status and metadata
  instantBookable: boolean('instant_bookable').default(false),
  allowSameDayBooking: boolean('allow_same_day_booking').default(false),
  sameDayBookingLeadTime: integer('same_day_booking_lead_time'),
  cleannessStatus: varchar('cleanness_status', { length: 10 }),
  cleannessStatusUpdatedOn: timestamp('cleanness_status_updated_on'),
  
  // WiFi credentials
  wifiUsername: varchar('wifi_username', { length: 100 }),
  wifiPassword: varchar('wifi_password', { length: 100 }),
  
  // Timestamps
  insertedOn: timestamp('inserted_on').notNull().defaultNow(),
  latestActivityOn: timestamp('latest_activity_on').defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  // Indexes for efficient filtering and searching
  cityIdx: index('listings_city_idx').on(table.city),
  countryIdx: index('listings_country_idx').on(table.country),
  priceIdx: index('listings_price_idx').on(table.price),
  bedroomsIdx: index('listings_bedrooms_idx').on(table.bedroomsNumber),
  bathroomsIdx: index('listings_bathrooms_idx').on(table.bathroomsNumber),
  capacityIdx: index('listings_capacity_idx').on(table.personCapacity),
  instantBookableIdx: index('listings_instant_bookable_idx').on(table.instantBookable),
  locationIdx: index('listings_location_idx').on(table.lat, table.lng),
  searchIdx: index('listings_search_idx').on(table.name, table.city, table.country),
  hostawayIdIdx: index('listings_hostaway_id_idx').on(table.hostawayId),
}));

// Amenities table for normalized amenity data
export const amenities = pgTable('amenities', {
  id: serial('id').primaryKey(),
  amenityId: integer('amenity_id').unique(),
  amenityName: varchar('amenity_name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  icon: varchar('icon', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  nameIdx: index('amenities_name_idx').on(table.amenityName),
  categoryIdx: index('amenities_category_idx').on(table.category),
}));

// Junction table for listing amenities
export const listingAmenities = pgTable('listing_amenities', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  amenityId: integer('amenity_id').notNull().references(() => amenities.id, { onDelete: 'cascade' }),
  amenityName: varchar('amenity_name', { length: 255 }).notNull(), // Denormalized for performance
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  listingIdx: index('listing_amenities_listing_idx').on(table.listingId),
  amenityIdx: index('listing_amenities_amenity_idx').on(table.amenityId),
  uniqueListingAmenity: unique('unique_listing_amenity').on(table.listingId, table.amenityId),
}));

// Images table for listing photos
export const listingImages = pgTable('listing_images', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  caption: varchar('caption', { length: 255 }),
  sortOrder: integer('sort_order').default(0),
  isThumbnail: boolean('is_thumbnail').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  listingIdx: index('listing_images_listing_idx').on(table.listingId),
  sortOrderIdx: index('listing_images_sort_order_idx').on(table.listingId, table.sortOrder),
}));

// Bed types table
export const bedTypes = pgTable('bed_types', {
  id: serial('id').primaryKey(),
  bedTypeId: integer('bed_type_id').unique(),
  bedTypeName: varchar('bed_type_name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Listing bed types junction table
export const listingBedTypes = pgTable('listing_bed_types', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  bedTypeId: integer('bed_type_id').notNull().references(() => bedTypes.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  bedroomNumber: integer('bedroom_number').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  listingIdx: index('listing_bed_types_listing_idx').on(table.listingId),
  bedroomIdx: index('listing_bed_types_bedroom_idx').on(table.listingId, table.bedroomNumber),
}));

// Relations
export const managersRelations = relations(managers, ({ many }) => ({
  reviewApprovals: many(reviewApprovals),
  activityLogs: many(activityLogs),
  approvedReviews: many(reviews, { relationName: 'approvedReviews' }),
  rejectedReviews: many(reviews, { relationName: 'rejectedReviews' }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  listing: one(listings, {
    fields: [reviews.listingId],
    references: [listings.id],
  }),
  approvedByManager: one(managers, {
    fields: [reviews.approvedBy],
    references: [managers.id],
    relationName: 'approvedReviews',
  }),
  rejectedByManager: one(managers, {
    fields: [reviews.rejectedBy],
    references: [managers.id],
    relationName: 'rejectedReviews',
  }),
}));

export const reviewApprovalsRelations = relations(reviewApprovals, ({ one }) => ({
  manager: one(managers, {
    fields: [reviewApprovals.approvedBy],
    references: [managers.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  manager: one(managers, {
    fields: [activityLogs.managerId],
    references: [managers.id],
  }),
}));

// New relations for listings
export const listingsRelations = relations(listings, ({ many }) => ({
  amenities: many(listingAmenities),
  images: many(listingImages),
  bedTypes: many(listingBedTypes),
  reviews: many(reviews),
}));

export const amenitiesRelations = relations(amenities, ({ many }) => ({
  listingAmenities: many(listingAmenities),
}));

export const listingAmenitiesRelations = relations(listingAmenities, ({ one }) => ({
  listing: one(listings, {
    fields: [listingAmenities.listingId],
    references: [listings.id],
  }),
  amenity: one(amenities, {
    fields: [listingAmenities.amenityId],
    references: [amenities.id],
  }),
}));

export const listingImagesRelations = relations(listingImages, ({ one }) => ({
  listing: one(listings, {
    fields: [listingImages.listingId],
    references: [listings.id],
  }),
}));

export const bedTypesRelations = relations(bedTypes, ({ many }) => ({
  listingBedTypes: many(listingBedTypes),
}));

export const listingBedTypesRelations = relations(listingBedTypes, ({ one }) => ({
  listing: one(listings, {
    fields: [listingBedTypes.listingId],
    references: [listings.id],
  }),
  bedType: one(bedTypes, {
    fields: [listingBedTypes.bedTypeId],
    references: [bedTypes.id],
  }),
}));

// Type definitions
export type Manager = typeof managers.$inferSelect;
export type NewManager = typeof managers.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type ReviewApproval = typeof reviewApprovals.$inferSelect;
export type NewReviewApproval = typeof reviewApprovals.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

// New type definitions for listings
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type Amenity = typeof amenities.$inferSelect;
export type NewAmenity = typeof amenities.$inferInsert;
export type ListingAmenity = typeof listingAmenities.$inferSelect;
export type NewListingAmenity = typeof listingAmenities.$inferInsert;
export type ListingImage = typeof listingImages.$inferSelect;
export type NewListingImage = typeof listingImages.$inferInsert;
export type BedType = typeof bedTypes.$inferSelect;
export type NewBedType = typeof bedTypes.$inferInsert;
export type ListingBedType = typeof listingBedTypes.$inferSelect;
export type NewListingBedType = typeof listingBedTypes.$inferInsert;

// Extended types with relations
export type ListingWithRelations = Listing & {
  amenities: (ListingAmenity & { amenity: Amenity })[];
  images: ListingImage[];
  bedTypes: (ListingBedType & { bedType: BedType })[];
  reviews: Review[];
};

export type ReviewWithRelations = Review & {
  listing: Listing;
  approvedByManager?: Manager;
  rejectedByManager?: Manager;
};

// Hostaway data types (not stored in DB, used for API responses)
export interface HostawayListing {
  id: number;
  name: string;
  description: string;
  price: number;
  address: string;
  city: string;
  country: string;
  bedroomsNumber: number;
  bathroomsNumber: number;
  personCapacity: number;
  cleaningFee?: number;
  listingAmenities: Array<{ amenityName: string }>;
  listingImages: Array<{ url: string; caption: string }>;
}

export interface NormalizedReview {
  id: number;
  hostawayId?: number;
  listingId: number;
  type: 'host-to-guest' | 'guest-to-host';
  status: 'pending' | 'approved' | 'rejected';
  rating?: number;
  content: string;
  authorName: string;
  authorEmail?: string;
  categories?: Array<{
    category: string;
    rating: number;
  }>;
  submittedAt: string;
  approvedBy?: number;
  approvedAt?: string;
  rejectedBy?: number;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  listing?: {
    name: string;
    address: string;
    city: string;
  };
}

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  APPROVE_REVIEW = 'APPROVE_REVIEW',
  REJECT_REVIEW = 'REJECT_REVIEW',
  BULK_APPROVE = 'BULK_APPROVE',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}
