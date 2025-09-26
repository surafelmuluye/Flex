import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const swrConfig = {
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute
  refreshInterval: 300000, // 5 minutes
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

export interface EnhancedAnalyticsData {
  location: {
    topCities: Array<{
      city: string;
      count: number;
      avgPrice: number;
    }>;
    countries: Array<{
      country: string;
      count: number;
      avgPrice: number;
    }>;
    geographicDistribution: Array<{
      country: string;
      city: string;
      count: number;
      avgPrice: number;
      avgRating: number;
    }>;
  };
  propertyTypes: {
    roomTypes: Array<{
      type: string;
      count: number;
    }>;
  };
  pricing: {
    priceRanges: Array<{
      range: string;
      count: number;
    }>;
  };
  capacity: {
    distribution: Array<{
      range: string;
      count: number;
    }>;
    bedrooms: Array<{
      bedrooms: number;
      count: number;
    }>;
    bathrooms: Array<{
      bathrooms: number;
      count: number;
    }>;
  };
  amenities: {
    popular: Array<{
      name: string;
      count: number;
    }>;
    categories: Array<{
      category: string;
      count: number;
    }>;
    features: {
      hasWifi: number;
      hasParking: number;
      hasKitchen: number;
      hasPool: number;
      hasGym: number;
    };
  };
  performance: {
    instantBookable: Record<string, number>;
    averageNights: {
      min: number;
      max: number;
    };
    reviewResponseRate: number;
  };
  reviews: {
    trends: Array<{
      month: string;
      count: number;
      avgRating: number;
    }>;
  };
  lastUpdated: string;
}

export function useEnhancedAnalytics() {
  const { data, error, isLoading } = useSWR<{ data: EnhancedAnalyticsData }>(
    '/api/analytics/enhanced',
    fetcher,
    swrConfig
  );

  return {
    analytics: data, // Return the full API response (which includes the data wrapper)
    isLoading,
    error,
  };
}
