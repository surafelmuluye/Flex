'use client';

import React, { useState, useMemo } from 'react';
import { 
  Star, 
  MapPin, 
  Bed, 
  Bath, 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  Utensils,
  Snowflake,
  Tv,
  Waves,
  Mountain,
  Heart,
  Share2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  Camera,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// API fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Property {
  id: number;
  hostawayId: number;
  name: string;
  description: string;
  price: number;
  address: string;
  city: string;
  country: string;
  bedroomsNumber: number;
  bathroomsNumber: number;
  personCapacity: number;
  cleaningFee: number;
  instantBookable: boolean;
  cancellationPolicy: string;
  houseRules: string;
  listingAmenities: Array<{ amenityName: string }>;
  listingImages: Array<{ url: string; caption: string }>;
  lat: number;
  lng: number;
}

interface Review {
  id: string;
  rating: number;
  publicReview: string;
  guestName: string;
  submittedAt: string;
  reviewCategory: Array<{
    category: string;
    rating: number;
  }>;
}

export default function EnhancedPropertyPage({ params }: { params: { id: string } }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDates, setSelectedDates] = useState({ checkin: '', checkout: '' });
  const [guests, setGuests] = useState(1);

  // Fetch property data
  const { data: propertyData, error: propertyError, isLoading: propertyLoading } = useSWR(
    `/api/properties/${params.id}?includeReviews=true&approvedOnly=true`, 
    fetcher
  );

  const property: Property = propertyData?.data?.property;
  const reviews: Review[] = propertyData?.data?.reviews || [];

  // Calculate review statistics
  const reviewStats = useMemo(() => {
    if (!reviews.length) return null;

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    const categoryRatings = {
      cleanliness: 0,
      communication: 0,
      checkin: 0,
      accuracy: 0,
      location: 0,
      value: 0
    };

    reviews.forEach(review => {
      review.reviewCategory?.forEach(category => {
        const categoryName = category.category.toLowerCase().replace('_', '');
        if (categoryRatings.hasOwnProperty(categoryName)) {
          categoryRatings[categoryName as keyof typeof categoryRatings] += category.rating;
        }
      });
    });

    // Average category ratings
    Object.keys(categoryRatings).forEach(key => {
      const categoryKey = key as keyof typeof categoryRatings;
      const count = reviews.filter(r => 
        r.reviewCategory?.some(c => c.category.toLowerCase().replace('_', '') === key)
      ).length;
      categoryRatings[categoryKey] = count > 0 ? categoryRatings[categoryKey] / count : 0;
    });

    return {
      totalReviews,
      averageRating,
      ratingDistribution,
      categoryRatings
    };
  }, [reviews]);

  const nextImage = () => {
    if (property?.listingImages) {
      setCurrentImageIndex((prev) => 
        prev === property.listingImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.listingImages) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.listingImages.length - 1 : prev - 1
      );
    }
  };

  const getAmenityIcon = (amenityName: string) => {
    const name = amenityName.toLowerCase();
    if (name.includes('wifi') || name.includes('internet')) return <Wifi className="h-4 w-4" />;
    if (name.includes('parking')) return <Car className="h-4 w-4" />;
    if (name.includes('kitchen')) return <Utensils className="h-4 w-4" />;
    if (name.includes('coffee')) return <Coffee className="h-4 w-4" />;
    if (name.includes('air conditioning') || name.includes('heating')) return <Snowflake className="h-4 w-4" />;
    if (name.includes('tv')) return <Tv className="h-4 w-4" />;
    if (name.includes('pool') || name.includes('beach')) return <Waves className="h-4 w-4" />;
    if (name.includes('mountain') || name.includes('view')) return <Mountain className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  if (propertyLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (propertyError || !property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <Link href="/dashboard/properties">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/properties" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Properties
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Property Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{property.address}, {property.city}, {property.country}</span>
          </div>
          
          {/* Property Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedroomsNumber} bedroom{property.bedroomsNumber !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathroomsNumber} bathroom{property.bathroomsNumber !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>Up to {property.personCapacity} guest{property.personCapacity !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {property.listingImages && property.listingImages.length > 0 && (
          <div className="relative mb-8">
            <div className="relative h-96 rounded-lg overflow-hidden">
              <img
                src={property.listingImages[currentImageIndex]?.url}
                alt={property.listingImages[currentImageIndex]?.caption || property.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {property.listingImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {property.listingImages.length}
              </div>
            </div>
            
            {/* Thumbnail Strip */}
            {property.listingImages.length > 1 && (
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {property.listingImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-primary-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.caption || `Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this place</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>What this place offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.listingAmenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {getAmenityIcon(amenity.amenityName)}
                      <span className="text-gray-700">{amenity.amenityName}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            {reviewStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>{reviewStats.averageRating.toFixed(1)} · {reviewStats.totalReviews} reviews</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Rating Distribution */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Rating breakdown</h4>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center space-x-3">
                          <span className="text-sm w-8">{rating}</span>
                          <Star className="h-4 w-4 text-yellow-500" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ 
                                width: `${(reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution] / reviewStats.totalReviews) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">
                            {reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category Ratings */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Review categories</h4>
                    <div className="space-y-3">
                      {Object.entries(reviewStats.categoryRatings).map(([category, rating]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="capitalize">{category}</span>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(rating)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-6">
                    <h4 className="font-semibold">Reviews</h4>
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{review.guestName}</p>
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-2">
                                {new Date(review.submittedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.publicReview}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* House Rules */}
            {property.houseRules && (
              <Card>
                <CardHeader>
                  <CardTitle>House rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">{property.houseRules}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold">${property.price}</span>
                    <span className="text-gray-600"> / night</span>
                  </div>
                  {reviewStats && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{reviewStats.averageRating.toFixed(1)}</span>
                      <span className="text-sm text-gray-600">({reviewStats.totalReviews})</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Check-in</label>
                    <input
                      type="date"
                      value={selectedDates.checkin}
                      onChange={(e) => setSelectedDates(prev => ({ ...prev, checkin: e.target.value }))}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Check-out</label>
                    <input
                      type="date"
                      value={selectedDates.checkout}
                      onChange={(e) => setSelectedDates(prev => ({ ...prev, checkout: e.target.value }))}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                {/* Guest Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                  >
                    {Array.from({ length: property.personCapacity }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} guest{i !== 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Booking Button */}
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={!selectedDates.checkin || !selectedDates.checkout}
                >
                  {property.instantBookable ? 'Reserve' : 'Request to book'}
                </Button>

                <p className="text-center text-sm text-gray-600">
                  You won't be charged yet
                </p>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>${property.price} × 1 night</span>
                    <span>${property.price}</span>
                  </div>
                  {property.cleaningFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Cleaning fee</span>
                      <span>${property.cleaningFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Service fee</span>
                    <span>$15</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${property.price + property.cleaningFee + 15}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}





