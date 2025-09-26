// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorDetails;
  message?: string;
  timestamp: string;
  meta?: PaginationMeta;
}

export interface ApiSuccessResponse<T = unknown> extends ApiResponse<T> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: ApiErrorDetails;
  timestamp: string;
}

export interface ApiErrorDetails {
  message: string;
  statusCode: number;
  timestamp: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Pagination Types
export interface PaginationMeta {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

// Filtering and Sorting Types
export interface FilterParams {
  [key: string]: unknown;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryParams extends PaginationParams {
  filters?: FilterParams;
  sort?: SortParams;
  search?: string;
}

// Cache Types
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

export type CacheStrategy = 'memory' | 'redis' | 'none';

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter: number | null;
}

// Security Types
export interface SecurityConfig {
  cors: {
    origin: string[];
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
  headers: Record<string, string>;
  rateLimit: RateLimitConfig;
}

export interface SecurityHeaders {
  [key: string]: string;
}

// Database Types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

// Health Check Types
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    database: ServiceHealth;
    cache: ServiceHealth;
    rateLimit: ServiceHealth;
    security: ServiceHealth;
  };
  uptime: number;
  version: string;
}

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  details: Record<string, unknown>;
  lastChecked: string;
}

// API Endpoint Types
export interface ApiEndpoint {
  path: string;
  method: string;
  handler: (request: Request) => Promise<Response>;
  middleware?: Array<(request: Request) => Promise<Response | null>>;
  rateLimit?: RateLimitConfig;
  cache?: {
    strategy: CacheStrategy;
    ttl: number;
  };
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Utility Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';

export interface RequestContext {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

// Additional Types for Validation Schemas
export interface ListingFilters {
  search?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  location?: string;
}

export interface ReviewFilters {
  listingId?: string;
  rating?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PropertyQuery {
  id: string;
  includeReviews?: boolean;
  includeStats?: boolean;
  reviewsLimit?: number;
}

export interface ReviewApprovalRequest {
  status: 'approved' | 'rejected' | 'pending';
}

export interface ManagerRegistrationRequest {
  email: string;
  password: string;
  name: string;
}

export interface ManagerLoginRequest {
  email: string;
  password: string;
}

export interface NormalizedReview {
  id: string;
  listingId: string;
  rating: number;
  content: string;
  authorName: string;
  authorEmail: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  listing?: {
    title: string;
    address: string;
  };
}

export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  avgRating: number;
  reviewCount: number;
}

export interface ListingStats {
  overview: {
    totalListings: number;
    totalWithReviews: number;
    avgPrice: number;
    medianPrice: number;
  };
  listingsByStatus: Record<string, number>;
  listingsByType: Record<string, number>;
  listingsByLocation: Array<{
    city: string;
    state: string;
    count: number;
  }>;
  priceStats: {
    min: number;
    max: number;
    avg: number;
    median: number;
  };
  bedroomStats: Array<{
    bedrooms: number;
    count: number;
  }>;
  bathroomStats: Array<{
    bathrooms: number;
    count: number;
  }>;
  topRatedListings: Array<{
    id: string;
    title: string;
    address: string;
    price: number;
    avgRating: number;
    reviewCount: number;
  }>;
  recentListings: Array<{
    date: string;
    count: number;
  }>;
  lastUpdated: string;
}

export interface ReviewStats {
  totalReviews: number;
  avgRating: number;
  reviewsByRating: Record<string, number>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
  topListings: Array<{
    id: string;
    title: string;
    address: string;
    avgRating: number;
    reviewCount: number;
  }>;
  reviewTrends: Array<{
    month: string;
    count: number;
    avgRating: number;
  }>;
}

export interface ReviewApprovalResponse {
  id: string;
  listingId: string;
  rating: number;
  content: string;
  authorName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Error Types
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationErrorClass extends Error {
  public readonly field: string;
  public readonly value?: unknown;

  constructor(field: string, message: string, value?: unknown) {
    super(message);
    this.name = 'ValidationErrorClass';
    this.field = field;
    this.value = value;
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED', { retryAfter });
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', details?: Record<string, unknown>) {
    super(message, 500, 'INTERNAL_ERROR', details);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request', details?: Record<string, unknown>) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}