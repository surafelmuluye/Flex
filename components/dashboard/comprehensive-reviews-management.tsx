'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Star, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter,
  Search,
  Download,
  Eye,
  User,
  Building,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Globe,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal
} from 'lucide-react';
import useSWR from 'swr';
import { mutate } from 'swr';
import { NormalizedReview } from '@/lib/db/schema';
import ReviewModal from './review-modal';
import Pagination from './pagination';

// API fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

interface ReviewFilters {
  status: 'all' | 'pending' | 'approved' | 'rejected';
  rating: 'all' | '5' | '4' | '3' | '2' | '1';
  property: string;
  search: string;
  type: 'all' | 'guest-to-host' | 'host-to-guest';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  publicDisplay: 'all' | 'public' | 'private';
  category: 'all' | 'cleanliness' | 'communication' | 'check-in' | 'accuracy' | 'location' | 'value' | 'respect_house_rules';
  channel: 'all' | 'hostaway' | 'google' | 'airbnb' | 'booking.com';
}

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRating: number;
  thisWeek: number;
  lastWeek: number;
  trend: 'up' | 'down' | 'stable';
}

const ComprehensiveReviewsManagement: React.FC = () => {
  // State management
  const [filters, setFilters] = useState<ReviewFilters>({
    status: 'all',
    rating: 'all',
    property: 'all',
    search: '',
    type: 'all',
    dateRange: 'all',
    publicDisplay: 'all',
    category: 'all',
    channel: 'all',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode] = useState<'table' | 'cards'>('table');
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedReview, setSelectedReview] = useState<NormalizedReview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'property' | 'status' | 'rating' | 'category'>('none');

  // Build API URL with filters and pagination
  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();
    
    // Pagination
    params.set('page', currentPage.toString());
    params.set('limit', pageSize.toString());
    
    // Sorting
    params.set('sortBy', sortField);
    params.set('sortOrder', sortDirection);
    
    // Filters
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.rating !== 'all') params.set('rating', filters.rating);
    if (filters.property !== 'all') params.set('listingId', filters.property);
    if (filters.type !== 'all') params.set('type', filters.type);
    if (filters.search) params.set('search', filters.search);
    if (filters.category !== 'all') params.set('category', filters.category);
    if (filters.channel !== 'all') params.set('channel', filters.channel);
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const dateRanges = {
        today: { from: new Date(now.getFullYear(), now.getMonth(), now.getDate()), to: now },
        week: { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), to: now },
        month: { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: now },
        year: { from: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), to: now },
      };
      const range = dateRanges[filters.dateRange as keyof typeof dateRanges];
      if (range) {
        params.set('dateFrom', range.from.toISOString());
        params.set('dateTo', range.to.toISOString());
      }
    }
    
    return `/api/reviews/hostaway?${params.toString()}`;
  }, [currentPage, pageSize, sortField, sortDirection, filters]);

  // Fetch reviews data with proper caching
  const { data: reviewsData, error: reviewsError, isLoading: reviewsLoading } = useSWR(
    buildApiUrl(), 
    fetcher, 
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const reviews: NormalizedReview[] = reviewsData?.data?.data?.reviews || [];
  const pagination = reviewsData?.data?.data?.pagination;
  const stats: ReviewStats = reviewsData?.data?.data?.stats || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    averageRating: 0,
    thisWeek: 0,
    lastWeek: 0,
    trend: 'stable'
  };

  // Handle approve/reject with proper error handling
  const handleApprove = useCallback(async (id: number) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/reviews/hostaway/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });

      if (!response.ok) {
        throw new Error('Failed to approve review');
      }

      // Refresh data
      mutate(buildApiUrl());
    } catch (error) {
      console.error('Error approving review:', error);
      // You could add a toast notification here
    } finally {
      setIsProcessing(false);
    }
  }, [buildApiUrl]);

  const handleReject = useCallback(async (id: number) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/reviews/hostaway/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (!response.ok) {
        throw new Error('Failed to reject review');
      }

      // Refresh data
      mutate(buildApiUrl());
    } catch (error) {
      console.error('Error rejecting review:', error);
      // You could add a toast notification here
    } finally {
      setIsProcessing(false);
    }
  }, [buildApiUrl]);

  const handleTogglePublic = useCallback(async (id: number) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/reviews/hostaway/${id}/public`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !reviews.find((r: any) => r.id === id)?.isPublic }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle public status');
      }

      // Refresh data
      mutate(buildApiUrl());
    } catch (error) {
      console.error('Error toggling public status:', error);
      // You could add a toast notification here
    } finally {
      setIsProcessing(false);
    }
  }, [buildApiUrl, reviews]);

  const handleViewDetails = useCallback((review: NormalizedReview) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedReview(null);
  }, []);

  // Export functionality
  const handleExport = useCallback(() => {
    const csvContent = [
      ['ID', 'Author', 'Property', 'Rating', 'Status', 'Content', 'Date'].join(','),
      ...reviews.map((review: any) => [
        review.id,
        `"${review.authorName || 'Anonymous'}"`,
        `"${review.listing?.name || 'Unknown Property'}"`,
        review.rating || 0,
        review.status,
        `"${(review.content || '').replace(/"/g, '""')}"`,
        review.submittedAt || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reviews-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [reviews]);

  // Filter handlers
  const handleFilterChange = useCallback((key: keyof ReviewFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  }, [sortField, sortDirection]);


  // Bulk actions
  const handleBulkApprove = useCallback(async () => {
    setIsProcessing(true);
    try {
      const promises = selectedReviews.map(id => handleApprove(id));
      await Promise.all(promises);
      setSelectedReviews([]);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedReviews, handleApprove]);

  const handleBulkReject = useCallback(async () => {
    setIsProcessing(true);
    try {
      const promises = selectedReviews.map(id => handleReject(id));
      await Promise.all(promises);
      setSelectedReviews([]);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedReviews, handleReject]);

  // Selection handlers
  const toggleReviewSelection = useCallback((reviewId: number) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  }, []);

  const selectAllReviews = useCallback(() => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map(r => r.id));
    }
  }, [selectedReviews.length, reviews]);

  // Get unique properties for filter
  const uniqueProperties = useMemo(() => {
    const properties = new Map<string, { id: number; name: string }>();
    reviews.forEach(review => {
      if (review.listingId && review.listing?.name) {
        properties.set(review.listingId.toString(), {
          id: review.listingId,
          name: review.listing.name
        });
      }
    });
    return Array.from(properties.values());
  }, [reviews]);

  // Group reviews based on selected grouping
  const groupedReviews = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Reviews': reviews };
    }

    const groups: Record<string, NormalizedReview[]> = {};
    
    reviews.forEach(review => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'property':
          groupKey = review.listing?.name || `Property ${review.listingId}`;
          break;
        case 'status':
          groupKey = review.status.charAt(0).toUpperCase() + review.status.slice(1);
          break;
        case 'rating':
          groupKey = `${review.rating || 0} Star${(review.rating || 0) !== 1 ? 's' : ''}`;
          break;
        case 'category':
          // For category grouping, we'll group by the first category or 'No Category'
          const firstCategory = review.categories?.[0]?.category || 'No Category';
          groupKey = firstCategory.charAt(0).toUpperCase() + firstCategory.slice(1).replace('_', ' ');
          break;
        default:
          groupKey = 'All Reviews';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(review);
    });
    
    return groups;
  }, [reviews, groupBy]);

  // Status badge helper
  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
    }
  }, []);

  // Trend icon helper
  const getTrendIcon = useCallback((trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4" />;
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Reviews</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-slate-900">{stats.averageRating.toFixed(1)}</p>
                  {getTrendIcon(stats.trend)}
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Filter className="h-5 w-5" />
            Filters & Actions
          </CardTitle>
          <CardDescription className="text-slate-600">
            Filter reviews and perform bulk actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* First Row - Search and Basic Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search reviews, properties, or guests..."
                  className="pl-10 w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              
              <Select value={filters.status} onValueChange={(value: any) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-full sm:w-32 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.rating} onValueChange={(value: any) => handleFilterChange('rating', value)}>
                <SelectTrigger className="w-full sm:w-32 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.type} onValueChange={(value: any) => handleFilterChange('type', value)}>
                <SelectTrigger className="w-full sm:w-36 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="guest-to-host">Guest to Host</SelectItem>
                  <SelectItem value="host-to-guest">Host to Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Second Row - Advanced Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filters.property} onValueChange={(value: any) => handleFilterChange('property', value)}>
                <SelectTrigger className="w-full sm:w-48 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {uniqueProperties.map(property => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.category} onValueChange={(value: any) => handleFilterChange('category', value)}>
                <SelectTrigger className="w-full sm:w-40 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="cleanliness">Cleanliness</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="check-in">Check-in</SelectItem>
                  <SelectItem value="accuracy">Accuracy</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="respect_house_rules">House Rules</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.channel} onValueChange={(value: any) => handleFilterChange('channel', value)}>
                <SelectTrigger className="w-full sm:w-36 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="hostaway">Hostaway</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="booking.com">Booking.com</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.dateRange} onValueChange={(value: any) => handleFilterChange('dateRange', value)}>
                <SelectTrigger className="w-full sm:w-32 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Third Row - Grouping and Actions */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
                  <SelectTrigger className="w-full sm:w-40 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Grouping</SelectItem>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>

              </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="border-slate-300 hover:bg-slate-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {selectedReviews.length > 0 && (
            <div className="flex items-center gap-2 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-900">
                {selectedReviews.length} reviews selected
              </span>
              <Button size="sm" onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700">
                <ThumbsUp className="h-4 w-4 mr-2" />
                Approve All
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBulkReject} className="bg-red-600 hover:bg-red-700">
                <ThumbsDown className="h-4 w-4 mr-2" />
                Reject All
              </Button>
            </div>
          )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Display */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">Reviews ({pagination?.total || 0})</CardTitle>
              <CardDescription className="text-slate-600">
                Manage individual reviews and their approval status
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                <SelectTrigger className="w-20 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reviewsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-slate-100 animate-pulse rounded" />
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <>
              {(
                <div className="rounded-md border border-slate-200 overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedReviews.length === reviews.length && reviews.length > 0}
                            onChange={selectAllReviews}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-100 min-w-[200px]"
                          onClick={() => handleSort('submittedAt')}
                        >
                          Review {sortField === 'submittedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="min-w-[150px]">Property</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-100 min-w-[120px]"
                          onClick={() => handleSort('authorName')}
                        >
                          Guest {sortField === 'authorName' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-100 min-w-[80px]"
                          onClick={() => handleSort('rating')}
                        >
                          Rating {sortField === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[100px]">Date</TableHead>
                        <TableHead className="min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.map((review) => {
                        const isSelected = selectedReviews.includes(review.id);
                        
                        return (
                          <TableRow key={review.id} className={isSelected ? 'bg-blue-50' : ''}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleReviewSelection(review.id)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              <div className="space-y-1">
                                <p className="text-sm line-clamp-2 break-words text-slate-700">{review.content}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-slate-500 whitespace-nowrap">
                                    {review.type === 'guest-to-host' ? 'Guest Review' : 'Host Review'}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[150px]">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="font-medium text-sm truncate text-slate-900" title={review.listing?.name || 'Unknown Property'}>
                                    {review.listing?.name || 'Unknown Property'}
                                  </div>
                                  <div className="text-xs text-slate-500">ID: {review.listingId}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[120px]">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                <span className="text-sm truncate text-slate-900" title={review.authorName || 'Anonymous'}>
                                  {review.authorName || 'Anonymous'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[80px]">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 flex-shrink-0 ${
                                      i < (review.rating || 0)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 text-sm font-medium whitespace-nowrap text-slate-700">
                                  {review.rating || 'N/A'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[100px]">
                              {getStatusBadge(review.status)}
                            </TableCell>
                            <TableCell className="max-w-[100px]">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                <span className="text-sm whitespace-nowrap text-slate-700">
                                  {new Date(review.submittedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[120px]">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(review.id)}
                                  disabled={isProcessing || review.status === 'approved'}
                                  className="flex-shrink-0 border-green-200 text-green-600 hover:bg-green-50"
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(review.id)}
                                  disabled={isProcessing || review.status === 'rejected'}
                                  className="flex-shrink-0 border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(review)}
                                  className="flex-shrink-0 border-slate-200 text-slate-600 hover:bg-slate-50"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <CardTitle className="mb-2 text-slate-900">No Reviews Found</CardTitle>
              <CardDescription className="text-slate-600">
                {filters.search || filters.status !== 'all' || filters.rating !== 'all'
                  ? 'Try adjusting your filters to see more reviews.'
                  : 'No reviews are currently available.'}
              </CardDescription>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <ReviewModal
        review={selectedReview}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ComprehensiveReviewsManagement;
