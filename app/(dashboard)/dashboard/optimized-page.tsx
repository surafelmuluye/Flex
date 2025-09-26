'use client';

import React, { useState, useMemo } from 'react';
import { 
  Star, 
  MessageSquare, 
  Building, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  AlertTriangle,
  ThumbsUp,
  ChevronRight,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { mutate } from 'swr';
import { OptimizedDashboardLayout } from '@/components/dashboard/optimized-dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Optimized API fetcher with caching
const fetcher = (url: string) => fetch(url).then(res => res.json());

interface DashboardStats {
  totalProperties: number;
  totalReviews: number;
  averageRating: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  trend: 'up' | 'down' | 'stable';
  responseRate: number;
  topPerformingProperty: string;
  needsAttention: number;
}

interface PropertyWithMetrics {
  property: any;
  metrics: {
    totalReviews: number;
    averageRating: number;
    pendingReviews: number;
    approvedReviews: number;
    rejectedReviews: number;
    trend: 'up' | 'down' | 'stable';
    lastReviewDate: string;
    responseTime: number;
  };
}

interface ReviewInsight {
  type: 'trend' | 'alert' | 'success' | 'info';
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
}

export default function OptimizedDashboardPage() {
  const [refreshing, setRefreshing] = useState(false);

  // Optimized data fetching with reduced refresh intervals
  const { data: propertiesData, error: propertiesError, isLoading: propertiesLoading } = useSWR('/api/listings?limit=10', fetcher, {
    refreshInterval: 300000, // 5 minutes instead of 1 minute
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute deduplication
  });

  const { data: reviewsData, error: reviewsError, isLoading: reviewsLoading } = useSWR('/api/reviews/hostaway/hostaway', fetcher, {
    refreshInterval: 300000, // 5 minutes instead of 1 minute
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute deduplication
  });

  const { data: statsData, isLoading: statsLoading } = useSWR('/api/listings/stats', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600000 // 10 minutes
  });

  // Optimized refresh handler
  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        mutate('/api/listings?limit=10'),
        mutate('/api/reviews/hostaway/hostaway'),
        mutate('/api/listings/stats')
      ]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Memoized dashboard data calculation
  const { stats, properties, insights } = useMemo(() => {
    const calculateDashboardData = () => {
      if (!propertiesData?.success || !reviewsData?.success) {
        return {
          stats: {
            totalProperties: statsData?.data?.total || 0,
            totalReviews: 0,
            averageRating: 0,
            pendingReviews: 0,
            approvedReviews: 0,
            rejectedReviews: 0,
            trend: 'stable' as const,
            responseRate: 0,
            topPerformingProperty: '',
            needsAttention: 0
          },
          properties: [],
          insights: []
        };
      }

      const properties = propertiesData.data || [];
      const reviews = reviewsData.data || [];
      const dbStats = statsData?.data;

      // Simplified property metrics calculation
      const propertiesWithMetrics: PropertyWithMetrics[] = properties.slice(0, 6).map((property: any) => {
        const propertyReviews = reviews.filter((review: any) => 
          review.listingId === property.id.toString()
        );

        const totalReviews = propertyReviews.length;
        const approvedReviews = propertyReviews.filter((r: any) => r.approved === true).length;
        const pendingReviews = propertyReviews.filter((r: any) => r.approved === undefined).length;
        const rejectedReviews = propertyReviews.filter((r: any) => r.approved === false).length;
        
        const ratings = propertyReviews
          .filter((r: any) => r.rating)
          .map((r: any) => r.rating);
        
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
          : 0;

        return {
          property,
          metrics: {
            totalReviews,
            averageRating,
            pendingReviews,
            approvedReviews,
            rejectedReviews,
            trend: averageRating >= 4.0 ? 'up' : averageRating <= 3.0 ? 'down' : 'stable',
            lastReviewDate: propertyReviews.length > 0 
              ? propertyReviews.sort((a: any, b: any) => 
                  new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                )[0].submittedAt
              : '',
            responseTime: Math.floor(Math.random() * 24) + 1
          }
        };
      });

      // Calculate overall stats
      const totalProperties = dbStats?.total || properties.length;
      const totalReviews = reviews.length;
      const pendingReviews = reviews.filter((r: any) => r.approved === undefined).length;
      const approvedReviews = reviews.filter((r: any) => r.approved === true).length;
      const rejectedReviews = reviews.filter((r: any) => r.approved === false).length;

      const allRatings = reviews
        .filter((r: any) => r.rating)
        .map((r: any) => r.rating);
      
      const averageRating = allRatings.length > 0 
        ? allRatings.reduce((sum: number, rating: number) => sum + rating, 0) / allRatings.length
        : 0;

      const responseRate = totalReviews > 0 ? Math.round((approvedReviews / totalReviews) * 100) : 0;

      const topProperty = propertiesWithMetrics.length > 0 
        ? propertiesWithMetrics.reduce((top, current) => 
            current.metrics.averageRating > top.metrics.averageRating ? current : top
          )
        : { property: { name: 'No properties' } };

      const needsAttention = propertiesWithMetrics.filter(p => 
        p.metrics.pendingReviews > 0 || p.metrics.averageRating < 3.5
      ).length;

      const stats: DashboardStats = {
        totalProperties,
        totalReviews,
        averageRating,
        pendingReviews,
        approvedReviews,
        rejectedReviews,
        trend: averageRating >= 4.0 ? 'up' : averageRating <= 3.0 ? 'down' : 'stable',
        responseRate,
        topPerformingProperty: topProperty.property.name,
        needsAttention
      };

      // Generate insights
      const insights: ReviewInsight[] = [];
      
      if (pendingReviews > 3) {
        insights.push({
          type: 'alert',
          title: 'Pending Reviews',
          description: `${pendingReviews} reviews need your attention`,
          action: 'Review Now',
          actionUrl: '/dashboard/reviews?status=pending'
        });
      }

      if (needsAttention > 0) {
        insights.push({
          type: 'alert',
          title: 'Properties Need Attention',
          description: `${needsAttention} properties require immediate action`,
          action: 'View Properties',
          actionUrl: '/dashboard/properties?filter=attention'
        });
      }

      if (averageRating >= 4.5) {
        insights.push({
          type: 'success',
          title: 'Excellent Performance',
          description: `Your properties are performing exceptionally well`,
          action: 'View Details',
          actionUrl: '/dashboard/analytics'
        });
      }

      return { stats, properties: propertiesWithMetrics, insights };
    };

    return calculateDashboardData();
  }, [propertiesData, reviewsData, statsData]);

  const isLoading = propertiesLoading || reviewsLoading;

  return (
    <OptimizedDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening with your properties.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={refreshing}
          >
            <TrendingUp className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingReviews}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-green-600">{stats.responseRate}%</p>
                </div>
                <ThumbsUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight, index) => (
              <Card 
                key={index} 
                className="border-l-4 border-l-primary-500 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {insight.type === 'alert' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                    {insight.type === 'success' && <ThumbsUp className="h-5 w-5 text-green-500 mt-0.5" />}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      {insight.action && (
                        <Link href={insight.actionUrl || '#'}>
                          <Button variant="outline" size="sm" className="mt-2">
                            {insight.action}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Properties Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
            <CardDescription>Recent property metrics and performance insights</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 animate-pulse rounded" />
                ))}
              </div>
            ) : properties.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {properties.map((propertyWithMetrics) => (
                  <Card 
                    key={propertyWithMetrics.property.id} 
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {propertyWithMetrics.property.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {propertyWithMetrics.property.city}, {propertyWithMetrics.property.country}
                          </p>
                        </div>
                        <Badge 
                          variant={propertyWithMetrics.metrics.averageRating >= 4.5 ? "default" : 
                                  propertyWithMetrics.metrics.averageRating >= 3.5 ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {propertyWithMetrics.metrics.averageRating.toFixed(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{propertyWithMetrics.metrics.totalReviews} reviews</span>
                        </div>
                        {propertyWithMetrics.metrics.pendingReviews > 0 && (
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                            {propertyWithMetrics.metrics.pendingReviews} pending
                          </Badge>
                        )}
                      </div>
                      
                      <Link href={`/dashboard/properties/${propertyWithMetrics.property.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600 mb-4">No properties are currently available.</p>
                <Button>
                  <Building className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/reviews?status=pending">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Review Pending</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {stats.pendingReviews} reviews waiting for approval
                </p>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  {stats.pendingReviews} pending
                </Badge>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/dashboard/analytics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">View Analytics</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Detailed performance insights and trends
                </p>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Insights
                </Badge>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/dashboard/properties?filter=attention">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Needs Attention</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Properties requiring immediate action
                </p>
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  {stats.needsAttention} properties
                </Badge>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </OptimizedDashboardLayout>
  );
}
