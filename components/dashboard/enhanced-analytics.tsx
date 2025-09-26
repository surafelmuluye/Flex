'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  MapPin, 
  Home, 
  DollarSign, 
  Star, 
  Users, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Dumbbell,
  Waves,
  Mountain,
  Building
} from 'lucide-react';

interface EnhancedAnalyticsProps {
  enhancedAnalyticsData: any; // Pre-calculated analytics data from API
  reviewsData: any;
  loading?: boolean;
}

export function EnhancedAnalytics({ enhancedAnalyticsData, reviewsData, loading }: EnhancedAnalyticsProps) {
  // Extract the actual data from the API response wrapper
  const actualData = enhancedAnalyticsData?.data || enhancedAnalyticsData;
  
  // Early return if no data
  if (!enhancedAnalyticsData || typeof enhancedAnalyticsData !== 'object') {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Enhanced analytics data is not available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Use pre-calculated analytics data from API with safety checks
  const analytics = {
    // Location Analytics
    topCities: Array.isArray(actualData?.location?.topCities) ? actualData.location.topCities : [],
    countries: Array.isArray(actualData?.location?.countries) ? actualData.location.countries : [],
    
    // Property Type Analytics - Fixed mapping
    propertyTypes: Array.isArray(actualData?.propertyTypes?.roomTypes) ? actualData.propertyTypes.roomTypes : [],
    roomTypes: Array.isArray(actualData?.propertyTypes?.roomTypes) ? actualData.propertyTypes.roomTypes : [],
    
    // Pricing Analytics - Fixed mapping
    priceRanges: Array.isArray(actualData?.pricing?.priceRanges) ? actualData.pricing.priceRanges : [],
    averagePriceByCity: Array.isArray(actualData?.pricing?.averagePriceByCity) ? actualData.pricing.averagePriceByCity : [],
    
    // Capacity Analytics - Fixed mapping
    capacityDistribution: Array.isArray(actualData?.capacity?.distribution) ? actualData.capacity.distribution : [],
    bedroomBathroomRatio: actualData?.capacity?.bedroomBathroomRatio || {},
    
    // Amenity Analytics - Fixed mapping
    popularAmenities: Array.isArray(actualData?.amenities?.popular) ? actualData.amenities.popular : [],
    amenityCategories: Array.isArray(actualData?.amenities?.categories) ? actualData.amenities.categories : [],
    
    // Review Analytics
    reviewTrends: Array.isArray(reviewsData?.reviewTrends) ? reviewsData.reviewTrends : [],
    ratingDistribution: reviewsData?.reviewsByRating || {},
    reviewResponseRate: typeof actualData?.performance?.reviewResponseRate === 'number' ? actualData.performance.reviewResponseRate : 0,
    
    // Performance Analytics - Fixed mapping
    instantBookableRate: actualData?.performance?.instantBookable || {},
    averageNights: actualData?.performance?.averageNights || {},
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Analytics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-slate-200 bg-white hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Price Ranges
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              {analytics.priceRanges.map((range: any, index: number) => {
                const safeRange = range?.range || 'Unknown';
                const safeCount = typeof range?.count === 'number' ? range.count : 0;
                const maxCount = Math.max(...analytics.priceRanges.map((r: any) => typeof r?.count === 'number' ? r.count : 0));
                const percentage = maxCount > 0 ? (safeCount / maxCount) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{String(safeRange)}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{safeCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-slate-200 bg-white hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Home className="h-5 w-5 text-indigo-600" />
              Property Types
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              {analytics.propertyTypes.map((type: any, index: number) => {
                const safeType = type?.type || 'unknown';
                const safeCount = typeof type?.count === 'number' ? type.count : 0;
                const maxCount = Math.max(...analytics.propertyTypes.map((t: any) => typeof t?.count === 'number' ? t.count : 0));
                const percentage = maxCount > 0 ? (safeCount / maxCount) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {String(safeType).replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{safeCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-slate-200 bg-white hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-violet-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Capacity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              {analytics.capacityDistribution.map((capacity: any, index: number) => {
                const safeRange = capacity?.range || 'Unknown';
                const safeCount = typeof capacity?.count === 'number' ? capacity.count : 0;
                const maxCount = Math.max(...analytics.capacityDistribution.map((c: any) => typeof c?.count === 'number' ? c.count : 0));
                const percentage = maxCount > 0 ? (safeCount / maxCount) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{String(safeRange)}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{safeCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Amenity Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-slate-200 bg-white hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Wifi className="h-5 w-5 text-orange-600" />
              Popular Amenities
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              {analytics.popularAmenities.slice(0, 8).map((amenity: any, index: number) => {
                const safeName = amenity?.name || 'Unknown';
                const safeCount = typeof amenity?.count === 'number' ? amenity.count : 0;
                
                return (
                  <div key={String(safeName)} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getAmenityIcon(String(safeName))}
                      <span className="text-sm font-medium text-slate-700">{String(safeName)}</span>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      {safeCount}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-slate-200 bg-white hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Instant Bookable
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {typeof analytics.instantBookableRate === 'object' && analytics.instantBookableRate.enabled 
                  ? Math.round((analytics.instantBookableRate.enabled / (analytics.instantBookableRate.enabled + analytics.instantBookableRate.disabled)) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-slate-600">Properties with instant booking</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-slate-200 bg-white hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Star className="h-5 w-5 text-pink-600" />
              Review Response
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">
                {typeof analytics.reviewResponseRate === 'number' ? analytics.reviewResponseRate : 0}%
              </div>
              <p className="text-sm text-slate-600">Properties with reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-slate-200 bg-white hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Avg. Nights
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {typeof analytics.averageNights === 'object' && analytics.averageNights.min 
                  ? Math.round(analytics.averageNights.min)
                  : 0}
              </div>
              <p className="text-sm text-slate-600">Minimum stay requirement</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper functions for calculations
function calculatePropertyTypes(listings: any[]) {
  const types = listings.reduce((acc: any, listing: any) => {
    const type = listing.roomType || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(types).map(([type, count]) => ({
    label: type,
    count: count as number
  })).sort((a, b) => b.count - a.count);
}

function calculateRoomTypes(listings: any[]) {
  const types = listings.reduce((acc: any, listing: any) => {
    const type = listing.roomType || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(types).map(([type, count]) => ({
    label: type,
    count: count as number
  })).sort((a, b) => b.count - a.count);
}

function calculatePriceRanges(listings: any[]) {
  const ranges = [
    { label: '$0-50', min: 0, max: 50 },
    { label: '$50-100', min: 50, max: 100 },
    { label: '$100-200', min: 100, max: 200 },
    { label: '$200-500', min: 200, max: 500 },
    { label: '$500+', min: 500, max: Infinity }
  ];
  
  return ranges.map(range => ({
    ...range,
    count: listings.filter((listing: any) => 
      listing.price >= range.min && listing.price < range.max
    ).length
  }));
}

function calculateAveragePriceByCity(listings: any[]) {
  const cityPrices = listings.reduce((acc: any, listing: any) => {
    if (!acc[listing.city]) {
      acc[listing.city] = { total: 0, count: 0 };
    }
    acc[listing.city].total += listing.price;
    acc[listing.city].count += 1;
    return acc;
  }, {});
  
  return Object.entries(cityPrices).map(([city, data]: [string, any]) => ({
    city,
    averagePrice: Math.round(data.total / data.count)
  })).sort((a, b) => b.averagePrice - a.averagePrice);
}

function calculateCapacityDistribution(listings: any[]) {
  const capacities = [
    { label: '1-2 guests', min: 1, max: 2 },
    { label: '3-4 guests', min: 3, max: 4 },
    { label: '5-6 guests', min: 5, max: 6 },
    { label: '7-8 guests', min: 7, max: 8 },
    { label: '9+ guests', min: 9, max: Infinity }
  ];
  
  return capacities.map(capacity => ({
    ...capacity,
    count: listings.filter((listing: any) => 
      listing.personCapacity >= capacity.min && listing.personCapacity <= capacity.max
    ).length
  }));
}

function calculateBedroomBathroomRatio(listings: any[]) {
  const ratios = listings.map((listing: any) => ({
    bedrooms: listing.bedroomsNumber,
    bathrooms: listing.bathroomsNumber,
    ratio: listing.bathroomsNumber > 0 ? listing.bedroomsNumber / listing.bathroomsNumber : 0
  }));
  
  return {
    averageRatio: ratios.reduce((sum, r) => sum + r.ratio, 0) / ratios.length,
    totalBedrooms: ratios.reduce((sum, r) => sum + r.bedrooms, 0),
    totalBathrooms: ratios.reduce((sum, r) => sum + r.bathrooms, 0)
  };
}

function calculatePopularAmenities(amenities: any) {
  // Handle both array and object formats
  if (!amenities) return [];
  
  // If it's already an object with popular amenities, return them
  if (amenities.popular && Array.isArray(amenities.popular)) {
    return amenities.popular;
  }
  
  // If it's an array, process it
  if (Array.isArray(amenities)) {
    const amenityCounts = amenities.reduce((acc: any, amenity: any) => {
      acc[amenity.amenityName] = (acc[amenity.amenityName] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(amenityCounts).map(([name, count]) => ({
      name,
      count: count as number
    })).sort((a, b) => b.count - a.count);
  }
  
  return [];
}

function calculateAmenityCategories(amenities: any) {
  // Handle both array and object formats
  if (!amenities) return [];
  
  // If it's already an object with categories, return them
  if (amenities.categories && Array.isArray(amenities.categories)) {
    return amenities.categories;
  }
  
  // If it's an array, process it
  if (Array.isArray(amenities)) {
    const categories = amenities.reduce((acc: any, amenity: any) => {
      const category = amenity.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(categories).map(([category, count]) => ({
      category,
      count: count as number
    })).sort((a, b) => b.count - a.count);
  }
  
  return [];
}

function calculateReviewResponseRate(reviewsData: any) {
  const totalListings = 300; // From our database
  const listingsWithReviews = reviewsData?.topListings?.length || 0;
  return Math.round((listingsWithReviews / totalListings) * 100);
}

function calculateInstantBookableRate(listings: any[]) {
  if (!listings || listings.length === 0) return 0;
  const instantBookable = listings.filter((listing: any) => listing.instantBookable).length;
  return Math.round((instantBookable / listings.length) * 100);
}

function calculateAverageNights(listings: any[]) {
  if (!listings || listings.length === 0) return 0;
  const totalNights = listings.reduce((sum, listing: any) => sum + (listing.minNights || 1), 0);
  return Math.round(totalNights / listings.length);
}

function getAmenityIcon(amenityName: string) {
  const name = amenityName.toLowerCase();
  if (name.includes('wifi') || name.includes('internet')) return <Wifi className="h-4 w-4 text-orange-500" />;
  if (name.includes('parking') || name.includes('garage')) return <Car className="h-4 w-4 text-orange-500" />;
  if (name.includes('coffee') || name.includes('kitchen')) return <Coffee className="h-4 w-4 text-orange-500" />;
  if (name.includes('restaurant') || name.includes('dining')) return <Utensils className="h-4 w-4 text-orange-500" />;
  if (name.includes('gym') || name.includes('fitness')) return <Dumbbell className="h-4 w-4 text-orange-500" />;
  if (name.includes('pool') || name.includes('beach')) return <Waves className="h-4 w-4 text-orange-500" />;
  if (name.includes('mountain') || name.includes('hiking')) return <Mountain className="h-4 w-4 text-orange-500" />;
  return <Building className="h-4 w-4 text-orange-500" />;
}
