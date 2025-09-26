'use client';

import React from 'react';
import { EnhancedSection } from '@/components/dashboard/enhanced-section';
import { EnhancedStatsCard } from '@/components/dashboard/enhanced-stats-card';
import { ReviewAnalytics } from '@/components/dashboard/review-analytics';
import { PropertyAnalytics } from '@/components/dashboard/property-analytics';
import { useDashboardData } from '@/lib/hooks/use-dashboard-data';
import { useEnhancedAnalytics } from '@/lib/hooks/use-enhanced-analytics';
import { EnhancedAnalytics } from '@/components/dashboard/enhanced-analytics';
import { 
  Building,
  Star,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  MapPin,
  DollarSign,
  BarChart3,
  PieChart,
  Sparkles,
  Zap,
  Target,
  Globe,
  Heart,
  Users,
  Calendar,
  Activity
} from 'lucide-react';


export default function DashboardPage() {
  // Use centralized data fetching hook
  const { 
    dashboardData, 
    stats, 
    calculatedData, 
    isLoading 
  } = useDashboardData();

  // Use enhanced analytics hook
  const { 
    analytics: enhancedAnalytics, 
    isLoading: analyticsLoading 
  } = useEnhancedAnalytics();

  // Debug logging
  console.log('DashboardPage - enhancedAnalytics:', enhancedAnalytics);
  console.log('DashboardPage - analyticsLoading:', analyticsLoading);

  return (
    <div className="space-y-8">
      {/* Modern Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 border border-blue-100/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-800 bg-clip-text text-transparent">
                Flex Dashboard
              </h1>
              <p className="text-blue-600/80 font-medium text-xl mt-2">
                Modern insights for your property portfolio
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-blue-600">
              <Activity className="h-5 w-5" />
              <span className="font-medium">Live Data</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <Globe className="h-5 w-5" />
              <span className="font-medium">Public Reviews: {stats?.overview?.totalWithReviews || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <Target className="h-5 w-5" />
              <span className="font-medium">Properties: {stats?.overview?.totalListings || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <EnhancedSection
        title="Overview"
        description="Key performance metrics and insights"
        badge="Live Data"
        badgeColor="bg-green-100 text-green-700"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatsCard
            title="Total Properties"
            value={calculatedData.totalProperties}
            description="Active listings"
            icon={<Building className="h-5 w-5" />}
            loading={isLoading}
            variant="info"
            trend={{
              value: stats?.growth?.growthRate || 0,
              direction: (stats?.growth?.growthRate || 0) >= 0 ? 'up' : 'down',
              period: 'vs last month'
            }}
          />
          <EnhancedStatsCard
            title="Total Reviews"
            value={calculatedData.totalReviews}
            description="Guest feedback"
            icon={<MessageSquare className="h-5 w-5" />}
            loading={isLoading}
            variant="success"
            trend={{
              value: dashboardData?.trends?.reviewGrowthPercentage || 0,
              direction: (dashboardData?.trends?.reviewGrowthPercentage || 0) >= 0 ? 'up' : 'down',
              period: 'vs last month'
            }}
          />
          <EnhancedStatsCard
            title="Average Rating"
            value={isNaN(calculatedData.averageRating) ? '0.0' : calculatedData.averageRating.toFixed(1)}
            description="Out of 5.0"
            icon={<Star className="h-5 w-5" />}
            loading={isLoading}
            variant="warning"
            trend={{
              value: dashboardData?.trends?.ratingImprovement || 0,
              direction: (dashboardData?.trends?.ratingImprovement || 0) >= 0 ? 'up' : 'down',
              period: 'vs last month'
            }}
          />
          <EnhancedStatsCard
            title="Pending Reviews"
            value={calculatedData.pendingReviews}
            description="Awaiting approval"
            icon={<AlertTriangle className="h-5 w-5" />}
            loading={isLoading}
            variant="error"
          />
        </div>
      </EnhancedSection>

      {/* Top Performing Property */}
      {calculatedData.topProperty && (
        <EnhancedSection
          title="Top Performing Property"
          description="Your highest-rated property this month"
          badge="Featured"
          badgeColor="bg-yellow-100 text-yellow-700"
        >
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {calculatedData.topProperty.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {calculatedData.topProperty.reviewCount} reviews
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {isNaN(calculatedData.topProperty.avgRating) ? '0.0' : calculatedData.topProperty.avgRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
              </div>
            </div>
          </div>
        </EnhancedSection>
      )}

      {/* Property Insights */}
      <EnhancedSection
        title="Property Insights"
        description="Distribution and performance metrics"
        badge="Analytics"
        badgeColor="bg-blue-100 text-blue-700"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatsCard
            title="Average Price"
            value={stats?.overview?.avgPrice ? `$${Math.round(stats.overview.avgPrice)}` : '$0'}
            description="Per night"
            icon={<DollarSign className="h-5 w-5" />}
            loading={isLoading}
            variant="success"
          />
          <EnhancedStatsCard
            title="Cities Covered"
            value={stats?.listingsByLocation?.length ?? stats?.availableCities?.length ?? 0}
            description="Different locations"
            icon={<MapPin className="h-5 w-5" />}
            loading={isLoading}
            variant="info"
          />
          <EnhancedStatsCard
            title="Popular Amenities"
            value={enhancedAnalytics?.data?.amenities?.popular?.length || 0}
            description="Available features"
            icon={<BarChart3 className="h-5 w-5" />}
            loading={isLoading || analyticsLoading}
            variant="warning"
          />
          <EnhancedStatsCard
            title="Property Types"
            value={enhancedAnalytics?.data?.propertyTypes?.roomTypes?.length || 0}
            description="Room categories"
            icon={<PieChart className="h-5 w-5" />}
            loading={isLoading || analyticsLoading}
            variant="error"
          />
        </div>
      </EnhancedSection>

      {/* Review Analytics */}
      <EnhancedSection
        title="Review Analytics"
        description="Comprehensive review insights and trends"
        badge="Charts"
        badgeColor="bg-purple-100 text-purple-700"
      >
        <ReviewAnalytics
          reviewData={[]}
          stats={stats}
          loading={isLoading}
        />
      </EnhancedSection>


            {/* Enhanced Analytics */}
            <EnhancedSection
              title="Enhanced Analytics"
              description="Comprehensive insights from all available data"
              badge="Advanced"
              badgeColor="bg-indigo-100 text-indigo-700"
            >
              <EnhancedAnalytics
                enhancedAnalyticsData={enhancedAnalytics}
                reviewsData={dashboardData}
                loading={isLoading || analyticsLoading}
              />
            </EnhancedSection>

    </div>
  );
}