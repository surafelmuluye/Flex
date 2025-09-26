'use client';

import React from 'react';
import { PropertiesDataTable } from '@/components/dashboard/properties-data-table';
import { EnhancedSection } from '@/components/dashboard/enhanced-section';
import { EnhancedStatsCard } from '@/components/dashboard/enhanced-stats-card';
import { 
  Building,
  Star,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  MapPin,
  DollarSign,
} from 'lucide-react';
import useSWR from 'swr';

// API fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

interface StatsResponse {
  success: boolean
  data: {
    overview: {
      totalListings: number;
      totalWithReviews: number;
      avgPrice: number;
      medianPrice: number;
    };
    listingsByStatus: {
      active: number;
      inactive: number;
      pending: number;
    };
    listingsByType: {
      [key: string]: number;
    };
    listingsByLocation: Array<{
      city: string;
      state: string;
      count: number;
    }>;
    priceStats: {
      min: number;
      max: number;
      avg: number;
      median: number;
    };
    bedroomStats: Array<{
      bedrooms: number;
      count: number;
    }>;
    bathroomStats: Array<{
      bathrooms: number;
      count: number;
    }>;
    topRatedListings: Array<{
      id: string;
      title: string;
      address: string;
      price: number;
      avgRating: number;
      reviewCount: number;
    }>;
    recentListings: Array<{
      date: string;
      count: number;
    }>;
    lastUpdated: string;
    // Optional legacy properties for backward compatibility
    availableCities?: string[];
    availableCountries?: string[];
    availableAmenities?: string[];
  }
}

export default function PropertiesPage() {

  // Fetch statistics
  const { data: statsData, isLoading: statsLoading } = useSWR<StatsResponse>('/api/listings/stats', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000 // 5 minutes
  });

  const stats = statsData?.data;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Properties Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg">
            Manage and monitor all your properties with advanced filtering and analytics
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <EnhancedSection
        title="Property Overview"
        description="Summary statistics and performance metrics"
        badge={stats ? `${stats.overview?.totalListings || 0} Properties` : undefined}
        badgeColor="bg-blue-100 text-blue-700"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatsCard
            title="Total Properties"
            value={stats?.overview?.totalListings || 0}
            description="Active listings"
            icon={<Building className="h-5 w-5" />}
            loading={statsLoading}
            variant="info"
            trend={{
              value: 12,
              direction: 'up',
              period: 'vs last month'
            }}
          />
          <EnhancedStatsCard
            title="Average Price"
            value={stats?.overview?.avgPrice ? `$${Math.round(stats.overview.avgPrice)}` : '$0'}
            description="Per night"
            icon={<DollarSign className="h-5 w-5" />}
            loading={statsLoading}
            variant="success"
            trend={{
              value: 8,
              direction: 'up',
              period: 'vs last month'
            }}
          />
          <EnhancedStatsCard
            title="Cities Covered"
            value={stats?.listingsByLocation?.length ?? stats?.availableCities?.length ?? 0}
            description="Different locations"
            icon={<MapPin className="h-5 w-5" />}
            loading={statsLoading}
            variant="info"
          />
          <EnhancedStatsCard
            title="Countries"
            value={stats?.listingsByLocation?.length ?? stats?.availableCountries?.length ?? 0}
            description="Global presence"
            icon={<Building className="h-5 w-5" />}
            loading={statsLoading}
            variant="success"
          />
        </div>
      </EnhancedSection>

      {/* Top Cities */}
      {stats?.listingsByLocation && stats.listingsByLocation.length > 0 && (
        <EnhancedSection
          title="Top Cities"
          description="Properties distribution by location"
          badge="Live Data"
          badgeColor="bg-green-100 text-green-700"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.listingsByLocation.slice(0, 6).map((location, index) => (
              <div key={location.city} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{location.city}</h3>
                    <p className="text-sm text-gray-500">{location.count} properties</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{location.count}</div>
                  <div className="text-xs text-gray-500">properties</div>
                </div>
              </div>
            ))}
          </div>
        </EnhancedSection>
      )}

      {/* Properties Management */}
      <EnhancedSection
        title="Property Management"
        description="Browse, filter, and manage all your properties"
        badge="Advanced"
        badgeColor="bg-purple-100 text-purple-700"
      >
        <PropertiesDataTable />
      </EnhancedSection>
    </div>
  );
}