'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Star, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter,
  Search,
  RefreshCw,
  Download,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Calendar,
  User,
  Building,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Grid3X3,
  List,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Target,
  Globe,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { mutate } from 'swr';
import { NormalizedReview } from '@/lib/db/schema';
import ReviewModal from './review-modal';
import ReviewCard from './review-card';
import Pagination from './pagination';

// API fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

interface ReviewFilters {
  status: 'all' | 'pending' | 'approved' | 'rejected';
  rating: 'all' | '5' | '4' | '3' | '2' | '1';
  property: string;
  search: string;
  dateRange: string;
  type: 'all' | 'guest-to-host' | 'host-to-guest';
  publicDisplay: 'all' | 'public' | 'private';
  channel: 'all' | 'hostaway' | 'google' | 'direct';
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

export function EnhancedReviewsManagement() {
  const [filters, setFilters] = useState<ReviewFilters>({
    status: 'all',
    rating: 'all',
    property: 'all',
    search: '',
    dateRange: 'all',
    type: 'all',
    publicDisplay: 'all',
    channel: 'all'
  });
  
  const [selectedReviews, setSelectedReviews] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [groupBy, setGroupBy] = useState<'none' | 'property' | 'status' | 'rating'>('none');

  // Fetch reviews data
  const { data: reviewsData, error: reviewsError, isLoading: reviewsLoading } = useSWR('/api/reviews/hostaway', fetcher, {
    refreshInterval: 30000,
  });

  const reviews: NormalizedReview[] = reviewsData?.data?.data?.reviews || [];

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = reviews.filter(review => {
      if (filters.status !== 'all') {
        if (filters.status === 'pending' && review.status !== 'pending') return false;
        if (filters.status === 'approved' && review.status !== 'approved') return false;
        if (filters.status === 'rejected' && review.status !== 'rejected') return false;
      }
      
      if (filters.rating !== 'all' && review.rating !== parseInt(filters.rating)) return false;
      
      if (filters.type !== 'all' && review.type !== filters.type) return false;
      
      if (filters.search && !review.content.toLowerCase().includes(filters.search.toLowerCase()) && 
          !review.authorName.toLowerCase().includes(filters.search.toLowerCase()) &&
          !review.listing?.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      
      if (filters.property !== 'all' && review.listingId !== parseInt(filters.property)) return false;
      
      if (filters.dateRange !== 'all') {
        const reviewDate = new Date(review.submittedAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case 'today':
            if (daysDiff > 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
        }
      }
      
      return true;
    });

    // Sort reviews
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'authorName':
          aValue = a.authorName.toLowerCase();
          bValue = b.authorName.toLowerCase();
          break;
        case 'submittedAt':
        default:
          aValue = new Date(a.submittedAt).getTime();
          bValue = new Date(b.submittedAt).getTime();
          break;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [reviews, filters, sortField, sortDirection]);

  // Use stats from API instead of calculating from paginated reviews
  const stats: ReviewStats = useMemo(() => {
    // Get stats from API response
    const apiStats = reviewsData?.data?.data?.stats;
    if (apiStats) {
      return {
        total: apiStats.total,
        pending: apiStats.pending,
        approved: apiStats.approved,
        rejected: apiStats.rejected,
        averageRating: apiStats.averageRating,
        byType: apiStats.byType,
        byRating: apiStats.byRating,
        recentActivity: apiStats.recentActivity,
        thisWeek: 0, // Will be calculated from recentActivity if needed
        lastWeek: 0,
        trend: 'stable' as const
      };
    }
    
    // Fallback to calculating from current reviews if API stats not available
    const total = reviews.length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const approved = reviews.filter(r => r.status === 'approved').length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;
    const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0;
    
    // Calculate weekly stats
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const thisWeek = reviews.filter(r => new Date(r.submittedAt) >= oneWeekAgo).length;
    const lastWeek = reviews.filter(r => {
      const date = new Date(r.submittedAt);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    }).length;
    
    const trend: 'up' | 'down' | 'stable' = 
      thisWeek > lastWeek ? 'up' : 
      thisWeek < lastWeek ? 'down' : 'stable';

    return {
      total,
      pending,
      approved,
      rejected,
      averageRating,
      thisWeek,
      lastWeek,
      trend
    };
  }, [reviews, reviewsData]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedReviews.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedReviews = filteredAndSortedReviews.slice(startIndex, endIndex);

  // Group reviews if needed
  const groupedReviews = useMemo(() => {
    if (groupBy === 'none') return { 'All Reviews': paginatedReviews };
    
    const groups: Record<string, NormalizedReview[]> = {};
    
    paginatedReviews.forEach(review => {
      let key: string;
      switch (groupBy) {
        case 'property':
          key = review.listing?.name || 'Unknown Property';
          break;
        case 'status':
          key = review.status.charAt(0).toUpperCase() + review.status.slice(1);
          break;
        case 'rating':
          key = `${review.rating} Star${review.rating !== 1 ? 's' : ''}`;
          break;
        default:
          key = 'All Reviews';
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(review);
    });
    
    return groups;
  }, [paginatedReviews, groupBy]);

  // Sorting handlers
  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField, sortDirection]);

  const handleApprove = async (reviewId: number) => {
    try {
      setProcessing(reviewId.toString());
      
      // Optimistic update
      const optimisticUpdate = (reviews: NormalizedReview[]) =>
        reviews.map(review =>
          review.id === reviewId ? { ...review, status: 'approved' } : review
        );
      
      mutate('/api/reviews/hostaway', optimisticUpdate(reviews), false);
      
      const response = await fetch(`/api/reviews/hostaway/${reviewId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      
      if (response.ok) {
        mutate('/api/reviews/hostaway');
        setSelectedReviews(prev => {
          const newSet = new Set(prev);
          newSet.delete(reviewId);
          return newSet;
        });
      } else {
        mutate('/api/reviews/hostaway');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      mutate('/api/reviews/hostaway');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (reviewId: number) => {
    try {
      setProcessing(reviewId.toString());
      
      // Optimistic update
      const optimisticUpdate = (reviews: NormalizedReview[]) =>
        reviews.map(review =>
          review.id === reviewId ? { ...review, status: 'rejected' } : review
        );
      
      mutate('/api/reviews/hostaway', optimisticUpdate(reviews), false);
      
      const response = await fetch(`/api/reviews/hostaway/${reviewId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
      
      if (response.ok) {
        mutate('/api/reviews/hostaway');
        setSelectedReviews(prev => {
          const newSet = new Set(prev);
          newSet.delete(reviewId);
          return newSet;
        });
      } else {
        mutate('/api/reviews/hostaway');
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      mutate('/api/reviews/hostaway');
    } finally {
      setProcessing(null);
    }
  };

  const handleTogglePublicDisplay = async (reviewId: number, isPublic: boolean) => {
    try {
      setProcessing(reviewId.toString());
      
      // Optimistic update
      const optimisticUpdate = (reviews: NormalizedReview[]) =>
        reviews.map(review =>
          review.id === reviewId ? { ...review, isPublic: !review.isPublic } : review
        );
      
      mutate('/api/reviews/hostaway', optimisticUpdate(reviews), false);
      
      const response = await fetch(`/api/reviews/hostaway/${reviewId}/public`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !isPublic })
      });
      
      if (response.ok) {
        mutate('/api/reviews/hostaway');
      } else {
        mutate('/api/reviews/hostaway');
      }
    } catch (error) {
      console.error('Error toggling public display:', error);
      mutate('/api/reviews/hostaway');
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkApprove = async () => {
    const promises = Array.from(selectedReviews).map(reviewId => handleApprove(reviewId));
    await Promise.all(promises);
    setSelectedReviews(new Set());
  };

  const handleBulkReject = async () => {
    const promises = Array.from(selectedReviews).map(reviewId => handleReject(reviewId));
    await Promise.all(promises);
    setSelectedReviews(new Set());
  };

  const handleRefresh = async () => {
    await mutate('/api/reviews/hostaway');
  };

  const handleExport = () => {
    const reviewsToExport = filteredAndSortedReviews.length > 0 ? filteredAndSortedReviews : reviews;
    
    // Create CSV content
    const csvContent = [
      // Header
      ['ID', 'Type', 'Status', 'Rating', 'Author', 'Content', 'Property', 'City', 'Submitted Date'].join(','),
      // Data rows
      ...reviewsToExport.map(review => [
        review.id,
        review.type,
        review.status,
        review.rating,
        `"${review.authorName || 'Anonymous'}"`,
        `"${review.content.replace(/"/g, '""')}"`,
        `"${review.listing?.name || 'Unknown Property'}"`,
        review.listing?.name || 'Unknown Property',
        new Date(review.submittedAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reviews-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFilterChange = (key: keyof ReviewFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleReviewSelection = (reviewId: number) => {
    setSelectedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const selectAllReviews = () => {
    if (selectedReviews.size === filteredAndSortedReviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(filteredAndSortedReviews.map(r => r.id)));
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === 'rejected') return <XCircle className="h-4 w-4 text-red-500" />;
    return <Timer className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return <Badge variant="default" className="bg-green-100 text-green-700">Approved</Badge>;
    if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                  {getTrendIcon(stats.trend)}
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Actions
          </CardTitle>
          <CardDescription>
            Filter reviews and perform bulk actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  className="pl-10 w-full sm:w-64"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              
              <Select value={filters.status} onValueChange={(value: any) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-full sm:w-40">
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
                <SelectTrigger className="w-full sm:w-40">
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

              <Select value={filters.dateRange} onValueChange={(value: any) => handleFilterChange('dateRange', value)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.type} onValueChange={(value: any) => handleFilterChange('type', value)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="guest-to-host">Guest to Host</SelectItem>
                  <SelectItem value="host-to-guest">Host to Guest</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.property} onValueChange={(value: any) => handleFilterChange('property', value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {Array.from(new Set(reviews.map(r => r.listingId))).map(listingId => {
                    const review = reviews.find(r => r.listingId === listingId);
                    return (
                      <SelectItem key={listingId} value={listingId.toString()}>
                        {review?.listing?.name || `Property ${listingId}`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={reviewsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${reviewsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {selectedReviews.size > 0 && (
            <div className="flex items-center gap-2 mt-4 p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedReviews.size} reviews selected
              </span>
              <Button size="sm" onClick={handleBulkApprove}>
                <ThumbsUp className="h-4 w-4 mr-2" />
                Approve All
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBulkReject}>
                <ThumbsDown className="h-4 w-4 mr-2" />
                Reject All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({filteredAndSortedReviews.length})</CardTitle>
          <CardDescription>
            Manage individual reviews and their approval status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviewsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filteredAndSortedReviews.length > 0 ? (
            <div className="space-y-4">
              {/* View Controls - Responsive */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Select value={viewMode} onValueChange={(value: 'table' | 'card') => setViewMode(value)}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">Table</SelectItem>
                      <SelectItem value="card">Cards</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={groupBy} onValueChange={(value: 'none' | 'property' | 'status' | 'rating') => setGroupBy(value)}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Group by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Grouping</SelectItem>
                      <SelectItem value="property">By Property</SelectItem>
                      <SelectItem value="status">By Status</SelectItem>
                      <SelectItem value="rating">By Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedReviews.length)} of {filteredAndSortedReviews.length}
                  </span>
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                    <SelectTrigger className="w-full sm:w-20">
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

              {/* Reviews Display */}
              {Object.entries(groupedReviews).map(([groupName, groupReviews]) => (
                <div key={groupName} className="space-y-2">
                  {groupBy !== 'none' && (
                    <h3 className="text-lg font-semibold text-muted-foreground">{groupName} ({groupReviews.length})</h3>
                  )}
                  
                  <div className="rounded-md border overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12 sticky left-0 bg-background z-10">
                            <input
                              type="checkbox"
                              checked={selectedReviews.size === filteredAndSortedReviews.length && filteredAndSortedReviews.length > 0}
                              onChange={selectAllReviews}
                              className="rounded border-gray-300"
                            />
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50 min-w-[200px]"
                            onClick={() => handleSort('submittedAt')}
                          >
                            Review {sortField === 'submittedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead className="min-w-[150px]">Property</TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50 min-w-[120px]"
                            onClick={() => handleSort('authorName')}
                          >
                            Guest {sortField === 'authorName' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50 min-w-[80px]"
                            onClick={() => handleSort('rating')}
                          >
                            Rating {sortField === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[100px]">Date</TableHead>
                          <TableHead className="min-w-[120px] sticky right-0 bg-background z-10">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupReviews.map((review) => {
                    const isSelected = selectedReviews.has(review.id);
                    
                    return (
                      <TableRow key={review.id} className={isSelected ? 'bg-muted/50' : ''}>
                        <TableCell className="sticky left-0 bg-background z-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleReviewSelection(review.id)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="space-y-1">
                            <p className="text-sm line-clamp-2 break-words">{review.content}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusIcon(review.status)}
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {review.type === 'guest-to-host' ? 'Guest Review' : 'Host Review'}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[150px]">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate" title={review.listing?.name || 'Unknown Property'}>
                                {review.listing?.name || 'Unknown Property'}
                              </div>
                              <div className="text-xs text-muted-foreground">ID: {review.listingId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[120px]">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate" title={review.authorName || 'Anonymous'}>
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
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-sm font-medium whitespace-nowrap">
                              {review.rating || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[100px]">
                          {getStatusBadge(review.status)}
                        </TableCell>
                        <TableCell className="max-w-[100px]">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm whitespace-nowrap">
                              {new Date(review.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="sticky right-0 bg-background z-10 max-w-[120px]">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(review.id)}
                              disabled={processing === review.id.toString() || review.status === 'approved'}
                              className="flex-shrink-0"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(review.id)}
                              disabled={processing === review.id.toString() || review.status === 'rejected'}
                              className="flex-shrink-0"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="flex-shrink-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={`/property/${review.listingId}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Property
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
                </div>
              ))}

              {/* Pagination Controls - Responsive */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex-shrink-0"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex-shrink-0"
                    >
                      Next
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Go to page:</span>
                    <Select 
                      value={currentPage.toString()} 
                      onValueChange={(value) => setCurrentPage(parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <SelectItem key={page} value={page.toString()}>
                            {page}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No Reviews Found</CardTitle>
              <CardDescription>
                {filters.search || filters.status !== 'all' || filters.rating !== 'all'
                  ? 'Try adjusting your filters to see more reviews.'
                  : 'No reviews are currently available.'}
              </CardDescription>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
