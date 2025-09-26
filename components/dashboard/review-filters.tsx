'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Filter,
  Search,
  Star,
  Calendar,
  User,
  Building,
  RotateCcw
} from 'lucide-react';

interface ReviewFiltersProps {
  filters: {
    status: 'all' | 'pending' | 'approved' | 'rejected';
    type: 'all' | 'guest-to-host' | 'host-to-guest';
    rating: 'all' | '5' | '4' | '3' | '2' | '1';
    dateRange: 'all' | 'week' | 'month' | 'quarter';
    search: string;
  };
  onFilterChange: (filters: Partial<ReviewFiltersProps['filters']>) => void;
  onReset: () => void;
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export function ReviewFilters({ filters, onFilterChange, onReset, stats }: ReviewFiltersProps) {
  const handleStatusChange = (status: ReviewFiltersProps['filters']['status']) => {
    onFilterChange({ status });
  };

  const handleTypeChange = (type: ReviewFiltersProps['filters']['type']) => {
    onFilterChange({ type });
  };

  const handleRatingChange = (rating: ReviewFiltersProps['filters']['rating']) => {
    onFilterChange({ rating });
  };

  const handleDateRangeChange = (dateRange: ReviewFiltersProps['filters']['dateRange']) => {
    onFilterChange({ dateRange });
  };

  const handleSearchChange = (search: string) => {
    onFilterChange({ search });
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2D5A5A] focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Review Stats */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Review Stats
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Reviews</span>
              <span className="font-medium">{stats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-orange-600">Pending</span>
              <span className="font-medium text-orange-600">{stats.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600">Approved</span>
              <span className="font-medium text-green-600">{stats.approved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-600">Rejected</span>
              <span className="font-medium text-red-600">{stats.rejected}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Filter */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Reviews', count: stats.total },
              { value: 'pending', label: 'Pending', count: stats.pending },
              { value: 'approved', label: 'Approved', count: stats.approved },
              { value: 'rejected', label: 'Rejected', count: stats.rejected },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value as any)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  filters.status === option.value
                    ? 'bg-[#2D5A5A] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{option.label}</span>
                  <span className="text-xs opacity-75">({option.count})</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Type Filter */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Review Type</h3>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Types' },
              { value: 'guest-to-host', label: 'Guest Reviews' },
              { value: 'host-to-guest', label: 'Host Reviews' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleTypeChange(option.value as any)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  filters.type === option.value
                    ? 'bg-[#2D5A5A] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rating Filter */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Star className="h-4 w-4 mr-2" />
            Rating
          </h3>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Ratings' },
              { value: '5', label: '5 Stars' },
              { value: '4', label: '4 Stars' },
              { value: '3', label: '3 Stars' },
              { value: '2', label: '2 Stars' },
              { value: '1', label: '1 Star' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleRatingChange(option.value as any)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  filters.rating === option.value
                    ? 'bg-[#2D5A5A] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </h3>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Time' },
              { value: 'week', label: 'Last Week' },
              { value: 'month', label: 'Last Month' },
              { value: 'quarter', label: 'Last 3 Months' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleDateRangeChange(option.value as any)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  filters.dateRange === option.value
                    ? 'bg-[#2D5A5A] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset Filters */}
      <Button
        onClick={onReset}
        variant="outline"
        className="w-full"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset Filters
      </Button>
    </div>
  );
}


