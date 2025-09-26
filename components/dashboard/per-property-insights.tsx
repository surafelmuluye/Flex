'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  MessageSquare,
  MapPin,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Eye,
  Filter
} from 'lucide-react';
import useSWR from 'swr';
import Link from 'next/link';

// API fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

interface PropertyInsight {
  propertyId: string;
  propertyName: string;
  address: string;
  city: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  reviewTrends: Array<{
    month: string;
    count: number;
    averageRating: number;
  }>;
  commonIssues: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  performanceMetrics: {
    responseRate: number;
    approvalRate: number;
    publicDisplayRate: number;
  };
  recentReviews: Array<{
    id: string;
    rating: number;
    content: string;
    authorName: string;
    submittedAt: string;
    status: string;
  }>;
}

interface PerPropertyInsightsProps {
  selectedProperty?: string;
  onPropertySelect?: (propertyId: string) => void;
}

export function PerPropertyInsights({ selectedProperty, onPropertySelect }: PerPropertyInsightsProps) {
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'trend'>('rating');
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y' | 'all'>('90d');

  // Fetch properties data
  const { data: propertiesData, isLoading: propertiesLoading } = useSWR('/api/listings', fetcher);
  const { data: reviewsData, isLoading: reviewsLoading } = useSWR('/api/reviews/hostaway', fetcher);

  const properties = propertiesData?.data?.data?.listings || [];
  const reviews = reviewsData?.data?.data?.reviews || [];

  // Calculate per-property insights
  const propertyInsights = useMemo(() => {
    if (!properties.length || !reviews.length) return [];

    return properties.map((property: any) => {
      const propertyReviews = reviews.filter((review: any) => review.listingId === property.id);
      
      // Calculate rating distribution
      const ratingDistribution = propertyReviews.reduce((acc: any, review: any) => {
        const rating = review.rating || 0;
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // Calculate review trends (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const reviewTrends = [];
      for (let i = 5; i >= 0; i--) {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthStr = month.toISOString().slice(0, 7);
        
        const monthReviews = propertyReviews.filter((review: any) => 
          new Date(review.submittedAt).toISOString().slice(0, 7) === monthStr
        );
        
        reviewTrends.push({
          month: monthStr,
          count: monthReviews.length,
          averageRating: monthReviews.length > 0 
            ? monthReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / monthReviews.length 
            : 0
        });
      }

      // Calculate common issues (categories with low ratings)
      const commonIssues: any[] = [];
      const categoryRatings: Record<string, number[]> = {};
      
      propertyReviews.forEach((review: any) => {
        if (review.categories) {
          review.categories.forEach((category: any) => {
            if (!categoryRatings[category.category]) {
              categoryRatings[category.category] = [];
            }
            categoryRatings[category.category].push(category.rating);
          });
        }
      });

      Object.entries(categoryRatings).forEach(([category, ratings]) => {
        const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        if (avgRating < 7) { // Low rating threshold
          commonIssues.push({
            category,
            count: ratings.length,
            percentage: Math.round((ratings.filter(r => r < 7).length / ratings.length) * 100)
          });
        }
      });

      // Calculate performance metrics
      const approvedReviews = propertyReviews.filter((r: any) => r.status === 'approved');
      const publicReviews = propertyReviews.filter((r: any) => r.isPublic);
      
      const performanceMetrics = {
        responseRate: propertyReviews.length > 0 ? 100 : 0, // Assuming all reviews get responses
        approvalRate: propertyReviews.length > 0 ? Math.round((approvedReviews.length / propertyReviews.length) * 100) : 0,
        publicDisplayRate: propertyReviews.length > 0 ? Math.round((publicReviews.length / propertyReviews.length) * 100) : 0
      };

      // Get recent reviews
      const recentReviews = propertyReviews
        .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 5)
        .map((review: any) => ({
          id: review.id,
          rating: review.rating || 0,
          content: review.content,
          authorName: review.authorName,
          submittedAt: review.submittedAt,
          status: review.status
        }));

      return {
        propertyId: property.id,
        propertyName: property.name,
        address: property.address,
        city: property.city,
        totalReviews: propertyReviews.length,
        averageRating: propertyReviews.length > 0 
          ? propertyReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / propertyReviews.length 
          : 0,
        ratingDistribution,
        reviewTrends,
        commonIssues: commonIssues.sort((a: any, b: any) => b.percentage - a.percentage).slice(0, 5),
        performanceMetrics,
        recentReviews
      };
    }).filter((insight: any) => insight.totalReviews > 0); // Only show properties with reviews
  }, [properties, reviews]);

  // Sort insights
  const sortedInsights = useMemo(() => {
    return [...propertyInsights].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.averageRating - a.averageRating;
        case 'reviews':
          return b.totalReviews - a.totalReviews;
        case 'trend':
          const aTrend = a.reviewTrends[a.reviewTrends.length - 1]?.count || 0;
          const bTrend = b.reviewTrends[b.reviewTrends.length - 1]?.count || 0;
          return bTrend - aTrend;
        default:
          return 0;
      }
    });
  }, [propertyInsights, sortBy]);

  const selectedInsight = selectedProperty 
    ? propertyInsights.find((insight: any) => insight.propertyId === selectedProperty)
    : sortedInsights[0];

  if (propertiesLoading || reviewsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Per-Property Performance</h2>
          <p className="text-muted-foreground">
            Analyze individual property performance and identify trends
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={sortBy} onValueChange={(value: 'rating' | 'reviews' | 'trend') => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Average Rating</SelectItem>
              <SelectItem value="reviews">Total Reviews</SelectItem>
              <SelectItem value="trend">Recent Trend</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={(value: '30d' | '90d' | '1y' | 'all') => setTimeRange(value)}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Property Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedInsights.slice(0, 6).map((insight) => (
          <Card 
            key={insight.propertyId} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedProperty === insight.propertyId ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onPropertySelect?.(insight.propertyId)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg line-clamp-1">{insight.propertyName}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {insight.city}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="flex-shrink-0">
                  {insight.totalReviews} reviews
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(insight.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {insight.averageRating.toFixed(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {insight.performanceMetrics.approvalRate}%
                  </div>
                  <div className="text-xs text-muted-foreground">Approved</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {insight.performanceMetrics.publicDisplayRate}%
                  </div>
                  <div className="text-xs text-muted-foreground">Public</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-purple-600">
                    {insight.commonIssues.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Issues</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Property Analysis */}
      {selectedInsight && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="reviews">Recent Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedInsight.totalReviews}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedInsight.averageRating.toFixed(1)}</div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.round(selectedInsight.averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedInsight.performanceMetrics.approvalRate}%</div>
                  <p className="text-xs text-muted-foreground">Reviews approved</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Public Display</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedInsight.performanceMetrics.publicDisplayRate}%</div>
                  <p className="text-xs text-muted-foreground">Shown publicly</p>
                </CardContent>
              </Card>
            </div>

            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>Breakdown of review ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = selectedInsight.ratingDistribution[rating] || 0;
                    const percentage = selectedInsight.totalReviews > 0 
                      ? (count / selectedInsight.totalReviews) * 100 
                      : 0;
                    
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm font-medium">{rating}</span>
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Review Trends (Last 6 Months)</CardTitle>
                <CardDescription>Monthly review count and average rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedInsight.reviewTrends.map((trend: any, index: number) => (
                    <div key={trend.month} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                        <div className="text-sm text-muted-foreground">
                          {trend.count} reviews
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.round(trend.averageRating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">
                          {trend.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Common Issues</CardTitle>
                <CardDescription>Categories with consistently low ratings</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedInsight.commonIssues.length > 0 ? (
                  <div className="space-y-3">
                    {selectedInsight.commonIssues.map((issue: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium capitalize">{issue.category.replace('_', ' ')}</div>
                          <div className="text-sm text-muted-foreground">
                            {issue.count} reviews affected
                          </div>
                        </div>
                        <Badge variant="destructive">
                          {issue.percentage}% low ratings
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Major Issues</h3>
                    <p className="text-muted-foreground">
                      This property is performing well across all categories.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest reviews for this property</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedInsight.recentReviews.map((review: any) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{review.authorName}</span>
                        </div>
                        <Badge variant={review.status === 'approved' ? 'default' : 'secondary'}>
                          {review.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                        {review.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(review.submittedAt).toLocaleDateString()}</span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/reviews?property=${selectedInsight.propertyId}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View All
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
