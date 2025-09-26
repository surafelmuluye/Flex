'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { ReviewCard } from '@/components/dashboard/review-card';
import { ReviewFilters } from '@/components/dashboard/review-filters';
import { 
  ArrowLeft,
  Building,
  Star,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { NormalizedReview } from '@/lib/db/schema';

interface PropertyData {
  property: any;
  reviews: NormalizedReview[];
  stats: {
    totalReviews: number;
    averageRating: number;
    pendingReviews: number;
    approvedReviews: number;
    rejectedReviews: number;
  };
}

interface FilterState {
  status: 'all' | 'pending' | 'approved' | 'rejected';
  type: 'all' | 'guest-to-host' | 'host-to-guest';
  rating: 'all' | '5' | '4' | '3' | '2' | '1';
  dateRange: 'all' | 'week' | 'month' | 'quarter';
  search: string;
}

export default function PropertyManagementPage() {
  const params = useParams();
  const propertyId = params.id as string;
  
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [filteredReviews, setFilteredReviews] = useState<NormalizedReview[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    type: 'all',
    rating: 'all',
    dateRange: 'all',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    fetchPropertyData();
  }, [propertyId]);

  useEffect(() => {
    if (propertyData) {
      applyFilters();
    }
  }, [propertyData, filters]);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${propertyId}?includeReviews=true`);
      const data = await response.json();
      
      if (data.success) {
        const { property, reviews } = data.data;
        
        // Calculate stats from reviews data
        const totalReviews = reviews?.length || 0;
        const approvedReviews = reviews?.filter((r: any) => r.approved === true).length || 0;
        const pendingReviews = reviews?.filter((r: any) => r.approved === undefined).length || 0;
        const rejectedReviews = reviews?.filter((r: any) => r.approved === false).length || 0;
        
        const ratings = reviews?.filter((r: any) => r.rating).map((r: any) => r.rating) || [];
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
          : 0;

        const stats = {
          totalReviews,
          averageRating,
          pendingReviews,
          approvedReviews,
          rejectedReviews
        };

        setPropertyData({
          property,
          reviews: reviews || [],
          stats
        });
      }
    } catch (error) {
      console.error('Error fetching property data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!propertyData) return;

    let filtered = [...propertyData.reviews];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(review => {
        if (filters.status === 'pending') return review.status === 'pending';
        if (filters.status === 'approved') return review.status === 'approved';
        if (filters.status === 'rejected') return review.status === 'rejected';
        return true;
      });
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(review => review.type === filters.type);
    }

    // Rating filter
    if (filters.rating !== 'all') {
      const targetRating = parseInt(filters.rating);
      filtered = filtered.filter(review => review.rating === targetRating);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(review => 
        new Date(review.submittedAt) >= cutoffDate
      );
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(review =>
        review.content.toLowerCase().includes(searchLower) ||
        review.authorName.toLowerCase().includes(searchLower) ||
        (review.listing?.name || '').toLowerCase().includes(searchLower)
      );
    }

    setFilteredReviews(filtered);
  };

  const handleApprove = async (reviewId: number) => {
    try {
      setProcessing(reviewId);
      const response = await fetch(`/api/reviews/hostaway/${reviewId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true })
      });

      if (response.ok) {
        // Refresh data
        await fetchPropertyData();
      }
    } catch (error) {
      console.error('Error approving review:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (reviewId: number) => {
    try {
      setProcessing(reviewId);
      const response = await fetch(`/api/reviews/hostaway/${reviewId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false })
      });

      if (response.ok) {
        // Refresh data
        await fetchPropertyData();
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      rating: 'all',
      dateRange: 'all',
      search: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5A5A]"></div>
      </div>
    );
  }

  if (!propertyData) {
    return (
      <div className="text-center py-12">
        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Property Not Found</h3>
        <p className="text-gray-600">The requested property could not be found.</p>
      </div>
    );
  }

  const { property, reviews, stats } = propertyData;
  
  // Safety check for stats
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5A5A]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Property Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.name}</h1>
              <p className="text-gray-600 mb-4">{property.city}, {property.country}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  <span>{property.bedroomsNumber} bedrooms</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{stats.totalReviews} reviews</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  <span>{stats.averageRating.toFixed(1)} avg rating</span>
                </div>
              </div>
            </div>
            <Link 
              href={`/property/${property.id}`}
              className="bg-[#2D5A5A] hover:bg-[#1e3d3d] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              View Public Page
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalReviews}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-[#2D5A5A]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold text-orange-600">{stats.pendingReviews}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-xl font-bold text-green-600">{stats.approvedReviews}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-xl font-bold text-red-600">{stats.rejectedReviews}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ReviewFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            stats={{
              total: stats.totalReviews,
              pending: stats.pendingReviews,
              approved: stats.approvedReviews,
              rejected: stats.rejectedReviews
            }}
          />
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Reviews ({filteredReviews.length})
            </h2>
          </div>

          {filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onTogglePublic={async (id: number) => {}}
                  onViewDetails={() => {}}
                  isProcessing={processing === review.id}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Found</h3>
                <p className="text-gray-600">
                  {filters.status === 'all' 
                    ? 'No reviews available for this property.'
                    : `No reviews match the current filters.`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
