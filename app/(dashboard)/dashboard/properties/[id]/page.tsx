'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Star, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  User, 
  Building, 
  ArrowLeft,
  ExternalLink,
  Heart,
  Share2,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { NormalizedReview } from '@/lib/db/schema';

// API fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

interface PropertyDetails {
  id: number;
  name: string;
  address: string;
  city: string;
  description: string;
  amenities: string[];
  images: string[];
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  propertyType: string;
  rating: number;
  reviewCount: number;
}

const PropertyDetailsPage: React.FC = () => {
  const params = useParams();
  const propertyId = params.id as string;
  
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');
  const [filterRating, setFilterRating] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');

  // Fetch property details
  const { data: propertyData, error: propertyError, isLoading: propertyLoading } = useSWR(
    `/api/listings/${propertyId}`,
    fetcher
  );

  // Fetch reviews for this property
  const { data: reviewsData, error: reviewsError, isLoading: reviewsLoading } = useSWR(
    `/api/reviews/hostaway?listingId=${propertyId}&status=approved&isPublic=true`,
    fetcher
  );

  const property: PropertyDetails = propertyData?.data;
  const reviews: NormalizedReview[] = reviewsData?.data?.data?.reviews || [];

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (filterRating === 'all') return true;
      return review.rating === parseInt(filterRating);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.submittedAt || '').getTime() - new Date(a.submittedAt || '').getTime();
        case 'oldest':
          return new Date(a.submittedAt || '').getTime() - new Date(b.submittedAt || '').getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  if (propertyLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (propertyError || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h2>
            <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or has been removed.</p>
            <Link href="/dashboard/properties">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/properties">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{property.name}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.address}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-semibold">{property.rating.toFixed(1)}</span>
                  <span className="ml-1 text-gray-600">({property.reviewCount} reviews)</span>
                </div>
                <Badge variant="outline" className="text-sm">
                  {property.propertyType}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Images */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Building className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-600">Property Image Placeholder</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  About this property
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {property.description || 'No description available for this property.'}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.guests}</div>
                    <div className="text-sm text-gray-600">Guests</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.propertyType}</div>
                    <div className="text-sm text-gray-600">Type</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                      Guest Reviews
                    </CardTitle>
                    <CardDescription>
                      {filteredAndSortedReviews.length} of {reviews.length} reviews
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={filterRating}
                      onChange={(e) => setFilterRating(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredAndSortedReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-600">Be the first to review this property!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredAndSortedReviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{review.authorName || 'Anonymous'}</h4>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < (review.rating || 0)
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                  {review.submittedAt
                                    ? new Date(review.submittedAt).toLocaleDateString()
                                    : 'Unknown date'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {review.content || 'No review content available.'}
                        </p>
                        
                        {review.categories && review.categories.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {review.categories.map((category: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-700 capitalize">
                                  {category.category.replace('_', ' ')}
                                </span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < (category.rating || 0)
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {property.currency} {property.price}
                    </div>
                    <div className="text-sm text-gray-600">per night</div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 font-medium">{property.rating.toFixed(1)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full mb-3" size="lg">
                  Check Availability
                </Button>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Booking Site
                </Button>
              </CardContent>
            </Card>

            {/* Property Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Overall Rating</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 font-medium">{property.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="font-medium">{property.reviewCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Property Type</span>
                  <span className="font-medium">{property.propertyType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Max Guests</span>
                  <span className="font-medium">{property.guests}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;