'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

// API fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json());

// SWR configuration for dashboard data
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute deduplication
  refreshInterval: 300000, // Refresh every 5 minutes
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

// Types
interface DashboardData {
  overview: {
    totalListings: number;
    totalReviews: number;
    avgRating: number;
    recentReviews: number;
    pendingReviews: number;
  };
  trends: {
    reviewGrowthPercentage: number;
    ratingImprovement: number;
    currentMonthReviews: number;
    previousMonthReviews: number;
    currentMonthAvgRating: number;
    previousMonthAvgRating: number;
  };
  listingsByStatus: {
    active: number;
    inactive: number;
    pending: number;
  };
  reviewsByRating: {
    [key: string]: number;
  };
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
  topListings: Array<{
    id: string;
    title: string;
    address: string;
    avgRating: number;
    reviewCount: number;
  }>;
  reviewTrends: Array<{
    month: string;
    count: number;
    avgRating: number;
  }>;
  lastUpdated: string;
}

interface StatsResponse {
  success: boolean;
  data: {
    overview: {
      totalListings: number;
      totalWithReviews: number;
      avgPrice: number;
      medianPrice: number;
    };
    growth: {
      growthRate: number;
      currentMonthListings: number;
      previousMonthListings: number;
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
  };
}

// Custom hook for dashboard data
export function useDashboardData() {
  const { data: dashboardResponse, isLoading: dashboardLoading, error: dashboardError } = useSWR<{success: boolean, data: DashboardData}>('/api/dashboard', fetcher, swrConfig);
  
  const { data: statsData, isLoading: statsLoading, error: statsError } = useSWR<StatsResponse>('/api/listings/stats', fetcher, swrConfig);

  const dashboardData = dashboardResponse?.data;
  const stats = statsData?.data;

  // Calculate dashboard data
  const calculatedData = useMemo(() => {
    if (!dashboardData || !stats) {
      return {
        totalProperties: 0,
        totalReviews: 0,
        averageRating: 0,
        pendingReviews: 0,
        topProperty: null
      };
    }

    return {
      totalProperties: stats.overview?.totalListings || 0,
      totalReviews: dashboardData.overview?.totalReviews || 0,
      averageRating: dashboardData.overview?.avgRating || 0,
      pendingReviews: dashboardData.overview?.pendingReviews || 0,
      topProperty: dashboardData.topListings?.[0] || null
    };
  }, [dashboardData, stats]);

  return {
    // Raw data
    dashboardData,
    statsData,
    stats,
    
    // Calculated data
    calculatedData,
    
    // Loading states
    dashboardLoading,
    statsLoading,
    isLoading: dashboardLoading || statsLoading,
    
    // Error states
    dashboardError,
    statsError,
    hasError: !!dashboardError || !!statsError,
  };
}

// Custom hook for review analytics data
export function useReviewAnalytics() {
  const { dashboardData, dashboardLoading, dashboardError } = useDashboardData();
  
  const reviewAnalytics = useMemo(() => {
    if (!dashboardData) {
      return {
        reviewsByRating: {},
        recentActivity: [],
        reviewTrends: [],
        totalReviews: 0,
        averageRating: 0,
        recentActivityTotal: 0,
      };
    }

    const totalReviews = Object.values(dashboardData.reviewsByRating || {}).reduce((sum, val) => sum + val, 0);
    const averageRating = Object.entries(dashboardData.reviewsByRating || {}).reduce((sum, [rating, count]) => 
      sum + (parseInt(rating) * count), 0
    ) / totalReviews || 0;
    const recentActivityTotal = dashboardData.recentActivity?.reduce((sum, activity) => sum + activity.count, 0) || 0;

    return {
      reviewsByRating: dashboardData.reviewsByRating || {},
      recentActivity: dashboardData.recentActivity || [],
      reviewTrends: dashboardData.reviewTrends || [],
      totalReviews,
      averageRating,
      recentActivityTotal,
    };
  }, [dashboardData]);

  return {
    ...reviewAnalytics,
    loading: dashboardLoading,
    error: dashboardError,
  };
}

// Custom hook for property analytics data
export function usePropertyAnalytics() {
  const { stats, statsLoading, statsError } = useDashboardData();
  
  const propertyAnalytics = useMemo(() => {
    if (!stats) {
      return {
        listingsByLocation: [],
        bedroomStats: [],
        bathroomStats: [],
        priceStats: { min: 0, max: 0, avg: 0, median: 0 },
        totalListings: 0,
        avgPrice: 0,
        mostCommonBedrooms: 0,
        mostCommonBathrooms: 0,
      };
    }

    const mostCommonBedrooms = stats.bedroomStats?.reduce((max, current) => 
      current.count > max.count ? current : max
    )?.bedrooms || 0;
    
    const mostCommonBathrooms = stats.bathroomStats?.reduce((max, current) => 
      current.count > max.count ? current : max
    )?.bathrooms || 0;

    return {
      listingsByLocation: stats.listingsByLocation || [],
      bedroomStats: stats.bedroomStats || [],
      bathroomStats: stats.bathroomStats || [],
      priceStats: stats.priceStats || { min: 0, max: 0, avg: 0, median: 0 },
      totalListings: stats.overview?.totalListings || 0,
      avgPrice: stats.overview?.avgPrice || 0,
      mostCommonBedrooms,
      mostCommonBathrooms,
    };
  }, [stats]);

  return {
    ...propertyAnalytics,
    loading: statsLoading,
    error: statsError,
  };
}
