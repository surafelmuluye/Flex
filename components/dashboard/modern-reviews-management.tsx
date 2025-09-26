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
  Star, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter,
  Search,
  RefreshCw,
  Download,
  Eye,
  User,
  Building,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Grid3X3,
  List,
  Globe,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
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
  type: 'all' | 'guest-to-host' | 'host-to-guest';
  publicDisplay: 'all' | 'public' | 'private';
}

const ModernReviewsManagement: React.FC = () => {
  // State management
  const [filters, setFilters] = useState<ReviewFilters>({
    status: 'all',
    rating: 'all',
    property: 'all',
    search: '',
    type: 'all',
    publicDisplay: 'all',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedReview, setSelectedReview] = useState<NormalizedReview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    if (filters.search) params.set('search', filters.search);
    if (filters.type !== 'all') params.set('type', filters.type);
    
    return `/api/reviews/hostaway?${params.toString()}`;
  }, [filters, currentPage, pageSize, sortField, sortDirection]);

  // Fetch data
  const { data: reviewsData, error, isLoading } = useSWR(buildApiUrl(), fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  });

  const reviews = reviewsData?.data?.data?.reviews || [];
  const pagination = reviewsData?.data?.data?.pagination;
  const stats = reviewsData?.data?.data?.stats;

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof ReviewFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Handle sorting
  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

  // Handle approve/reject with proper error handling
  const handleApprove = useCallback(async (id: number) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/reviews/hostaway/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve review');
      }

      // Revalidate to get fresh data
      mutate(buildApiUrl());
    } catch (error) {
      console.error('Error approving review:', error);
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
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject review');
      }

      // Revalidate to get fresh data
      mutate(buildApiUrl());
    } catch (error) {
      console.error('Error rejecting review:', error);
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

      // Revalidate to get fresh data
      mutate(buildApiUrl());
    } catch (error) {
      console.error('Error toggling public status:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [buildApiUrl, reviews]);

  const handleViewDetails = useCallback((review: NormalizedReview) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1);
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
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviews-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [reviews]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    mutate(buildApiUrl());
  }, [buildApiUrl]);

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Error loading reviews: {error.message}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Review Management</h2>
          <p className="text-slate-600 mt-1">
            Manage and moderate guest reviews across all properties
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!reviews.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Approved</p>
                  <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {stats.averageRating?.toFixed(1) || '0.0'}
                  </p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2 text-blue-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Rating
              </label>
              <Select
                value={filters.rating}
                onValueChange={(value) => handleFilterChange('rating', value)}
              >
                <SelectTrigger>
                  <SelectValue />
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
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Type
              </label>
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="guest-to-host">Guest to Host</SelectItem>
                  <SelectItem value="host-to-guest">Host to Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Public Display
              </label>
              <Select
                value={filters.publicDisplay}
                onValueChange={(value) => handleFilterChange('publicDisplay', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="public">Public Only</SelectItem>
                  <SelectItem value="private">Private Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search reviews, authors, or properties..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4 mr-2" />
              Table
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Cards
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">Show:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20">
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

        <div className="text-sm text-slate-600">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination?.total || 0)} of {pagination?.total || 0} reviews
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-slate-600">Loading reviews...</span>
            </div>
          </CardContent>
        </Card>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No reviews found</h3>
            <p className="text-slate-600">Try adjusting your filters or search terms.</p>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="border-slate-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedReviews.length === reviews.length && reviews.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReviews(reviews.map((r: any) => r.id));
                        } else {
                          setSelectedReviews([]);
                        }
                      }}
                      className="rounded border-slate-300"
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('authorName')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Author</span>
                      {sortField === 'authorName' && (
                        sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('listing.name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Property</span>
                      {sortField === 'listing.name' && (
                        sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('rating')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Rating</span>
                      {sortField === 'rating' && (
                        sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('submittedAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      {sortField === 'submittedAt' && (
                        sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review: NormalizedReview) => (
                  <TableRow key={review.id} className="hover:bg-slate-50">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReviews(prev => [...prev, review.id]);
                          } else {
                            setSelectedReviews(prev => prev.filter(id => id !== review.id));
                          }
                        }}
                        className="rounded border-slate-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{review.authorName || 'Anonymous'}</div>
                        <div className="text-sm text-slate-600">{review.authorName || 'Anonymous'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">
                          {review.listing?.name || 'Unknown Property'}
                        </div>
                        <div className="text-sm text-slate-600">
                          {review.listingId || 'No address'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < (review.rating || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {review.rating}/5
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            review.status === 'approved'
                              ? 'default'
                              : review.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {review.status}
                        </Badge>
                        {review.status === 'approved' ? (
                          <Globe className="h-3 w-3 text-green-600" />
                        ) : (
                          <Lock className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-700 max-w-xs truncate">
                        {review.content || 'No content'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {review.submittedAt
                          ? new Date(review.submittedAt).toLocaleDateString()
                          : 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(review)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {review.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(review.id)}
                              disabled={isProcessing}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(review.id)}
                              disabled={isProcessing}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublic(review.id)}
                          disabled={isProcessing}
                        >
                          {review.status === 'approved' ? (
                            <Lock className="h-3 w-3" />
                          ) : (
                            <Unlock className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review: NormalizedReview) => (
            <ReviewCard
              key={review.id}
              review={review}
              onApprove={handleApprove}
              onReject={handleReject}
              onTogglePublic={handleTogglePublic}
              onViewDetails={handleViewDetails}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}

      {/* Review Modal */}
      <ReviewModal
        review={selectedReview}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReview(null);
        }}
      />
    </div>
  );
};

export default ModernReviewsManagement;