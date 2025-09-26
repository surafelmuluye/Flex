import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const swrConfig = {
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute
  refreshInterval: 300000, // 5 minutes
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRating: number;
  byType: {
    hostToGuest: number;
    guestToHost: number;
  };
  byRating: {
    [key: string]: number;
  };
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
}

export interface ReviewData {
  reviews: Array<{
    id: number;
    hostawayId: number;
    listingId: number;
    type: 'host-to-guest' | 'guest-to-host';
    status: 'pending' | 'approved' | 'rejected';
    rating: number;
    content: string;
    authorName: string;
    authorEmail: string;
    categories: Array<{
      rating: number;
      category: string;
    }>;
    submittedAt: string;
    isPublic: boolean;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    listing: {
      name: string;
      address: string;
      city: string;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: Record<string, any>;
  sort: {
    field: string;
    direction: string;
  };
  stats: ReviewStats;
}

export function useReviewData() {
  const { data, error, isLoading } = useSWR<{ data: ReviewData }>(
    '/api/reviews/hostaway',
    fetcher,
    swrConfig
  );


  return {
    reviewData: data?.data?.reviews || [],
    stats: data?.data?.stats,
    isLoading,
    error,
  };
}
