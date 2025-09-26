'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  MapPin, 
  MessageSquare, 
  Building,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PropertyMetrics {
  totalReviews: number;
  averageRating: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  trend: 'up' | 'down' | 'stable';
  lastReviewDate: string;
  responseTime: number;
  categoryRatings: {
    cleanliness: number;
    communication: number;
    checkin: number;
    accuracy: number;
    location: number;
    value: number;
  };
}

interface Property {
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
  listingAmenities: Array<{ amenityName: string }>;
  listingImages: Array<{ url: string; caption: string }>;
}

interface PropertyPerformanceCardProps {
  property: Property;
  metrics: PropertyMetrics;
  loading?: boolean;
  className?: string;
}

const getPerformanceColor = (rating: number) => {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 4.0) return 'text-blue-600';
  if (rating >= 3.0) return 'text-orange-600';
  return 'text-red-600';
};

const getStatusBadge = (metrics: PropertyMetrics) => {
  if (metrics.pendingReviews > 0) {
    return (
      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
        Pending Reviews
      </Badge>
    );
  }
  if (metrics.averageRating >= 4.5) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        Excellent
      </Badge>
    );
  }
  if (metrics.averageRating < 3.5) {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        Needs Attention
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
      Good
    </Badge>
  );
};

const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-gray-400" />;
  }
};

const getRatingStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={cn(
        'h-4 w-4',
        i < Math.floor(rating) 
          ? 'text-yellow-400 fill-current' 
          : 'text-gray-300'
      )}
    />
  ));
};

export function PropertyPerformanceCard({
  property,
  metrics,
  loading = false,
  className
}: PropertyPerformanceCardProps) {
  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-5 bg-gray-300 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2 w-1/2"></div>
              <div className="h-6 bg-gray-300 rounded w-20"></div>
            </div>
            <div className="text-right">
              <div className="h-8 bg-gray-300 rounded w-12 mb-1"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="h-6 bg-gray-300 rounded w-8 mx-auto mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-12 mx-auto"></div>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <div className="flex-1 h-8 bg-gray-300 rounded"></div>
            <div className="flex-1 h-8 bg-gray-300 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
      className
    )}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
              {property.name}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{property.city}, {property.country}</span>
            </div>
            {getStatusBadge(metrics)}
          </div>
          <div className="text-right ml-4">
            <div className={cn('text-2xl font-bold', getPerformanceColor(metrics.averageRating))}>
              {metrics.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-end">
              <div className="flex">
                {getRatingStars(Math.floor(metrics.averageRating))}
              </div>
              <span className="text-sm text-gray-600 ml-1">
                ({metrics.totalReviews})
              </span>
            </div>
            <div className="flex items-center justify-end mt-1">
              {getTrendIcon(metrics.trend)}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {metrics.approvedReviews}
            </div>
            <div className="text-xs text-gray-600">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">
              {metrics.pendingReviews}
            </div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">
              {metrics.rejectedReviews}
            </div>
            <div className="text-xs text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>Response: {metrics.responseTime}h avg</span>
          <span>
            Last review: {metrics.lastReviewDate 
              ? new Date(metrics.lastReviewDate).toLocaleDateString()
              : 'None'
            }
          </span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link href={`/dashboard/property/${property.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Manage Reviews
            </Button>
          </Link>
          <Link href={`/property/${property.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Building className="h-4 w-4 mr-2" />
              View Public
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}


