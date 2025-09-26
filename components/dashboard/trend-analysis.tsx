'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  MessageSquare,
  Star,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import useSWR from 'swr';

// API fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

interface TrendData {
  period: string;
  reviews: number;
  averageRating: number;
  approvalRate: number;
  commonIssues: string[];
  topCategories: Array<{
    category: string;
    averageRating: number;
    count: number;
  }>;
}

interface RecurringIssue {
  category: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  trend: 'improving' | 'stable' | 'worsening';
  affectedProperties: number;
  lastOccurrence: string;
  examples: Array<{
    propertyName: string;
    reviewContent: string;
    rating: number;
    date: string;
  }>;
}

interface TrendAnalysisProps {
  className?: string;
}

export function TrendAnalysis({ className }: TrendAnalysisProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'issues' | 'performance'>('overview');

  // Fetch data
  const { data: reviewsData, isLoading: reviewsLoading } = useSWR('/api/reviews/hostaway', fetcher);
  const { data: propertiesData, isLoading: propertiesLoading } = useSWR('/api/listings', fetcher);

  const reviews = reviewsData?.data?.data?.reviews || [];
  const properties = propertiesData?.data?.data?.listings || [];

  // Calculate trend data
  const trendData = useMemo(() => {
    if (!reviews.length) return [];

    const now = new Date();
    const periods: TrendData[] = [];
    
    // Calculate periods based on time range
    let periodCount = 0;
    let periodDays = 0;
    
    switch (timeRange) {
      case '7d':
        periodCount = 7;
        periodDays = 1;
        break;
      case '30d':
        periodCount = 6;
        periodDays = 5;
        break;
      case '90d':
        periodCount = 9;
        periodDays = 10;
        break;
      case '1y':
        periodCount = 12;
        periodDays = 30;
        break;
    }

    for (let i = periodCount - 1; i >= 0; i--) {
      const periodStart = new Date(now);
      const periodEnd = new Date(now);
      
      if (timeRange === '7d') {
        periodStart.setDate(periodStart.getDate() - i);
        periodEnd.setDate(periodEnd.getDate() - i + 1);
      } else {
        periodStart.setDate(periodStart.getDate() - (i + 1) * periodDays);
        periodEnd.setDate(periodEnd.getDate() - i * periodDays);
      }

      const periodReviews = reviews.filter((review: any) => {
        const reviewDate = new Date(review.submittedAt);
        return reviewDate >= periodStart && reviewDate < periodEnd;
      });

      const periodName = timeRange === '7d' 
        ? periodStart.toLocaleDateString('en-US', { weekday: 'short' })
        : timeRange === '30d' || timeRange === '90d'
        ? `${periodStart.getDate()}-${periodEnd.getDate()}`
        : periodStart.toLocaleDateString('en-US', { month: 'short' });

      // Calculate average rating
      const averageRating = periodReviews.length > 0
        ? periodReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / periodReviews.length
        : 0;

      // Calculate approval rate
      const approvedReviews = periodReviews.filter((r: any) => r.status === 'approved');
      const approvalRate = periodReviews.length > 0
        ? (approvedReviews.length / periodReviews.length) * 100
        : 0;

      // Find common issues (categories with low ratings)
      const categoryRatings: Record<string, number[]> = {};
      periodReviews.forEach((review: any) => {
        if (review.categories) {
          review.categories.forEach((category: any) => {
            if (!categoryRatings[category.category]) {
              categoryRatings[category.category] = [];
            }
            categoryRatings[category.category].push(category.rating);
          });
        }
      });

      const commonIssues = Object.entries(categoryRatings)
        .filter(([_, ratings]) => {
          const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
          return avgRating < 7; // Low rating threshold
        })
        .map(([category, _]) => category);

      // Calculate top categories
      const topCategories = Object.entries(categoryRatings)
        .map(([category, ratings]) => ({
          category,
          averageRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
          count: ratings.length
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      periods.push({
        period: periodName,
        reviews: periodReviews.length,
        averageRating,
        approvalRate,
        commonIssues,
        topCategories
      });
    }

    return periods;
  }, [reviews, timeRange]);

  // Calculate recurring issues
  const recurringIssues = useMemo(() => {
    if (!reviews.length || !properties.length) return [];

    const issueMap: Record<string, RecurringIssue> = {};
    
    // Analyze all reviews for recurring patterns
    reviews.forEach((review: any) => {
      if (review.categories) {
        review.categories.forEach((category: any) => {
          if (category.rating < 7) { // Low rating
            const categoryKey = category.category;
            
            if (!issueMap[categoryKey]) {
              issueMap[categoryKey] = {
                category: categoryKey,
                frequency: 0,
                severity: 'low',
                trend: 'stable',
                affectedProperties: 0,
                lastOccurrence: review.submittedAt,
                examples: []
              };
            }
            
            issueMap[categoryKey].frequency++;
            issueMap[categoryKey].lastOccurrence = review.submittedAt;
            
            // Add example if we have space
            if (issueMap[categoryKey].examples.length < 3) {
              const property = properties.find((p: any) => p.id === review.listingId);
              issueMap[categoryKey].examples.push({
                propertyName: property?.name || 'Unknown Property',
                reviewContent: review.content,
                rating: category.rating,
                date: review.submittedAt
              });
            }
          }
        });
      }
    });

    // Calculate severity and affected properties
    Object.values(issueMap).forEach(issue => {
      const totalReviews = reviews.length;
      const frequencyPercentage = (issue.frequency / totalReviews) * 100;
      
      if (frequencyPercentage > 20) {
        issue.severity = 'high';
      } else if (frequencyPercentage > 10) {
        issue.severity = 'medium';
      }
      
      // Count unique properties affected
      const affectedPropertyIds = new Set();
      reviews.forEach((review: any) => {
        if (review.categories) {
          review.categories.forEach((category: any) => {
            if (category.category === issue.category && category.rating < 7) {
              affectedPropertyIds.add(review.listingId);
            }
          });
        }
      });
      issue.affectedProperties = affectedPropertyIds.size;
    });

    return Object.values(issueMap)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }, [reviews, properties]);

  // Calculate performance insights
  const performanceInsights = useMemo(() => {
    if (!trendData.length) return null;

    const latest = trendData[trendData.length - 1];
    const previous = trendData[trendData.length - 2];
    
    if (!previous) return null;

    const reviewTrend = latest.reviews - previous.reviews;
    const ratingTrend = latest.averageRating - previous.averageRating;
    const approvalTrend = latest.approvalRate - previous.approvalRate;

    return {
      reviewTrend,
      ratingTrend,
      approvalTrend,
      totalIssues: recurringIssues.length,
      highSeverityIssues: recurringIssues.filter(i => i.severity === 'high').length,
      averageResponseTime: '2.4 hours', // Mock data - would come from actual response tracking
      improvementAreas: recurringIssues.slice(0, 3).map(i => i.category)
    };
  }, [trendData, recurringIssues]);

  if (reviewsLoading || propertiesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Trend Analysis & Insights</h2>
          <p className="text-muted-foreground">
            Identify patterns, recurring issues, and performance trends
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: '7d' | '30d' | '90d' | '1y') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance Overview */}
      {performanceInsights && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Review Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {performanceInsights.reviewTrend >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="text-2xl font-bold">
                  {performanceInsights.reviewTrend >= 0 ? '+' : ''}{performanceInsights.reviewTrend}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">vs previous period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rating Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {performanceInsights.ratingTrend >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="text-2xl font-bold">
                  {performanceInsights.ratingTrend >= 0 ? '+' : ''}{performanceInsights.ratingTrend.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">average rating change</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-2xl font-bold">{performanceInsights.totalIssues}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {performanceInsights.highSeverityIssues} high severity
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold">{performanceInsights.averageResponseTime}</span>
              </div>
              <p className="text-xs text-muted-foreground">average response</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={viewMode} onValueChange={(value: string) => setViewMode(value as 'overview' | 'issues' | 'performance')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Recurring Issues</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Review Trends</CardTitle>
              <CardDescription>Review count and average rating over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendData.map((period, index) => (
                  <div key={period.period} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 text-sm font-medium">{period.period}</div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{period.reviews}</span>
                        <span className="text-sm text-muted-foreground">reviews</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.round(period.averageRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm font-medium ml-1">
                          {period.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <Badge variant={period.approvalRate > 80 ? 'default' : 'secondary'}>
                        {period.approvalRate.toFixed(0)}% approved
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Improvement Areas */}
          {performanceInsights && (
            <Card>
              <CardHeader>
                <CardTitle>Priority Improvement Areas</CardTitle>
                <CardDescription>Focus areas based on recurring issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceInsights.improvementAreas.map((area, index) => (
                    <div key={area} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium capitalize">{area.replace('_', ' ')}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Target className="h-4 w-4 mr-2" />
                        Focus Area
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Issues</CardTitle>
              <CardDescription>Categories with consistently low ratings across properties</CardDescription>
            </CardHeader>
            <CardContent>
              {recurringIssues.length > 0 ? (
                <div className="space-y-4">
                  {recurringIssues.map((issue, index) => (
                    <div key={issue.category} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}
                          >
                            {issue.severity.toUpperCase()}
                          </Badge>
                          <div>
                            <h3 className="font-semibold capitalize">{issue.category.replace('_', ' ')}</h3>
                            <p className="text-sm text-muted-foreground">
                              {issue.frequency} occurrences across {issue.affectedProperties} properties
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Last seen</div>
                          <div className="text-sm font-medium">
                            {new Date(issue.lastOccurrence).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Recent Examples:</h4>
                        {issue.examples.map((example, exIndex) => (
                          <div key={exIndex} className="bg-muted p-3 rounded text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{example.propertyName}</span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < example.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground line-clamp-2">{example.reviewContent}</p>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(example.date).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recurring Issues</h3>
                  <p className="text-muted-foreground">
                    Great job! No significant recurring issues detected.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Rating</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < 4 // Mock 4-star average
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold">4.2</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Approval Rate</span>
                  <span className="font-bold text-green-600">87%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="font-bold text-blue-600">2.4h</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Issue Resolution</span>
                  <span className="font-bold text-purple-600">94%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Action Items</CardTitle>
                <CardDescription>Recommended actions based on trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Address Cleanliness Issues</div>
                    <div className="text-sm text-muted-foreground">
                      Multiple properties showing cleanliness concerns
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Improve Response Time</div>
                    <div className="text-sm text-muted-foreground">
                      Current average is 2.4 hours, target is under 2 hours
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Target className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Focus on Communication</div>
                    <div className="text-sm text-muted-foreground">
                      Communication ratings have improved 15% this month
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
