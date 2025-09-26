'use client';

import React from 'react';
import ComprehensiveReviewsManagement from '@/components/dashboard/comprehensive-reviews-management';
import { EnhancedSection } from '@/components/dashboard/enhanced-section';
import { EnhancedStatsCard } from '@/components/dashboard/enhanced-stats-card';
import { useReviewData } from '@/lib/hooks/use-review-data';
import useSWR from 'swr';
import { 
  MessageSquare, 
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Calendar
} from 'lucide-react';

export default function ReviewsPage() {
  // Use the same approach as EnhancedReviewsManagement
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: reviewsData, error: reviewsError, isLoading: reviewsLoading } = useSWR('/api/reviews/hostaway', fetcher, {
    refreshInterval: 30000,
  });

  const reviewData = reviewsData?.data?.data?.reviews || [];
  const stats = reviewsData?.data?.data?.stats;


  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Review Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg">
            Manage and approve guest reviews across all your properties
          </p>
        </div>
      </div>

      {/* Review Analytics Overview */}
      <EnhancedSection
        title="Review Analytics"
        description="Key metrics and insights from your review data"
        badge="Analytics"
        badgeColor="bg-green-100 text-green-700"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatsCard
            title="Total Reviews"
            value={stats?.total || 0}
            description="All time reviews"
            icon={<MessageSquare className="h-5 w-5" />}
            loading={reviewsLoading}
            variant="info"
            trend={{
              value: stats?.thisWeek || 0,
              direction: 'up' as const,
              period: 'This week'
            }}
          />
          <EnhancedStatsCard
            title="Average Rating"
            value={stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
            description="Overall rating"
            icon={<Star className="h-5 w-5" />}
            loading={reviewsLoading}
            variant="warning"
          />
          <EnhancedStatsCard
            title="Pending Reviews"
            value={stats?.pending || 0}
            description="Awaiting approval"
            icon={<Clock className="h-5 w-5" />}
            loading={reviewsLoading}
            variant="error"
            trend={{
              value: Math.round(((stats?.pending || 0) / (stats?.total || 1)) * 100),
              direction: 'down' as const,
              period: 'Pending rate'
            }}
          />
          <EnhancedStatsCard
            title="Approval Rate"
            value={stats?.total ? Math.round(((stats.approved || 0) / stats.total) * 100) : 0}
            description="Approved reviews"
            icon={<CheckCircle className="h-5 w-5" />}
            loading={reviewsLoading}
            variant="success"
            trend={{
              value: stats?.approved || 0,
              direction: 'up' as const,
              period: 'Approved'
            }}
          />
        </div>
      </EnhancedSection>


            {/* Modern Reviews Management */}
            <EnhancedSection
              title="Review Management"
              description="Sleek and modern review management with advanced filtering and public display controls"
              badge="Management"
              badgeColor="bg-blue-100 text-blue-700"
            >
              <ComprehensiveReviewsManagement />
            </EnhancedSection>
    </div>
  );
}