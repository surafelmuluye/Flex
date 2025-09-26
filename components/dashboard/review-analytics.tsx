'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  MessageSquare,
  Calendar,
  Users,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface ReviewAnalyticsProps {
  reviewData: any;
  stats: any;
  loading?: boolean;
}

export function ReviewAnalytics({ reviewData, stats, loading }: ReviewAnalyticsProps) {
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

  if (!stats) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Review analytics data is not available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate additional metrics
  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const rejectionRate = stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0;
  const pendingRate = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;

  // Rating distribution data
  const ratingDistribution = [
    { rating: 5, count: stats.byRating?.['5'] || 0, percentage: stats.total > 0 ? Math.round(((stats.byRating?.['5'] || 0) / stats.total) * 100) : 0 },
    { rating: 4, count: stats.byRating?.['4'] || 0, percentage: stats.total > 0 ? Math.round(((stats.byRating?.['4'] || 0) / stats.total) * 100) : 0 },
    { rating: 3, count: stats.byRating?.['3'] || 0, percentage: stats.total > 0 ? Math.round(((stats.byRating?.['3'] || 0) / stats.total) * 100) : 0 },
    { rating: 2, count: stats.byRating?.['2'] || 0, percentage: stats.total > 0 ? Math.round(((stats.byRating?.['2'] || 0) / stats.total) * 100) : 0 },
    { rating: 1, count: stats.byRating?.['1'] || 0, percentage: stats.total > 0 ? Math.round(((stats.byRating?.['1'] || 0) / stats.total) * 100) : 0 },
  ];

  // Review type distribution
  const typeDistribution = [
    { type: 'Guest to Host', count: stats.byType?.guestToHost || 0, percentage: stats.total > 0 ? Math.round(((stats.byType?.guestToHost || 0) / stats.total) * 100) : 0 },
    { type: 'Host to Guest', count: stats.byType?.hostToGuest || 0, percentage: stats.total > 0 ? Math.round(((stats.byType?.hostToGuest || 0) / stats.total) * 100) : 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Rating Distribution */}
      <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-slate-200 bg-white hover:shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Rating Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-3">
            {ratingDistribution.map((item) => (
              <div key={item.rating} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">{item.rating} Star{item.rating !== 1 ? 's' : ''}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                    {item.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Type Distribution */}
      <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-slate-200 bg-white hover:shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Review Types
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-3">
            {typeDistribution.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{item.type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {item.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Status Overview */}
      <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-slate-200 bg-white hover:shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Review Status
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.approved}</div>
              <div className="text-sm text-slate-600">Approved</div>
              <Badge variant="outline" className="text-green-600 border-green-200 mt-1">
                {approvalRate}%
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">{stats.pending}</div>
              <div className="text-sm text-slate-600">Pending</div>
              <Badge variant="outline" className="text-orange-600 border-orange-200 mt-1">
                {pendingRate}%
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">{stats.rejected}</div>
              <div className="text-sm text-slate-600">Rejected</div>
              <Badge variant="outline" className="text-red-600 border-red-200 mt-1">
                {rejectionRate}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {stats.recentActivity && stats.recentActivity.length > 0 && (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-slate-200 bg-white hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-violet-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-2">
              {stats.recentActivity.slice(0, 7).map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, Math.max(0, (activity.count / Math.max(...stats.recentActivity.map((a: any) => a.count))) * 100))}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{activity.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}