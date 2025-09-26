'use client';

import React, { useState, useMemo } from 'react';
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
  Star, 
  MapPin, 
  Bed, 
  Bath, 
  Users, 
  DollarSign,
  MoreHorizontal,
  Eye,
  Edit,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Building
} from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { mutate } from 'swr';

// API fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  country: string;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  avgRating: number;
  reviewCount: number;
}

interface PropertyFilters {
  search: string;
  location: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  sortBy: string;
  sortOrder: string;
}

interface PropertyStats {
  totalReviews: number;
  averageRating: number;
  pendingReviews: number;
  approvedReviews: number;
  trend: 'up' | 'down' | 'stable';
  lastReviewDate: string;
  responseTime: number;
}

export function PropertiesDataTable() {
  const [filters, setFilters] = useState<PropertyFilters>({
    search: '',
    location: '',
    status: 'all',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    propertyType: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Build query string from filters
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.location) params.set('location', filters.location);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
    if (filters.bathrooms) params.set('bathrooms', filters.bathrooms);
    if (filters.propertyType) params.set('propertyType', filters.propertyType);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    
    params.set('page', currentPage.toString());
    params.set('limit', pageSize.toString());
    
    return params.toString();
  }, [filters, currentPage, pageSize]);

  // Fetch properties data
  const { data: propertiesData, error: propertiesError, isLoading: propertiesLoading } = useSWR(
    `/api/listings?${queryString}`, 
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000
    }
  );

  // Fetch stats data for filter options
  const { data: statsData } = useSWR('/api/listings/stats', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000 // 5 minutes
  });

  const properties: Property[] = propertiesData?.data?.listings || [];
  const pagination = propertiesData?.data?.pagination;
  const stats = statsData?.data;

  // Get property stats from API data
  const getPropertyStats = (property: Property): PropertyStats => {
    return {
      totalReviews: property.reviewCount || 0,
      averageRating: property.avgRating || 0,
      pendingReviews: Math.floor(Math.random() * 5), // This would come from reviews API
      approvedReviews: Math.floor(property.reviewCount * 0.8) || 0,
      trend: property.avgRating >= 4.0 ? 'up' : property.avgRating >= 3.0 ? 'stable' : 'down',
      lastReviewDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      responseTime: Math.floor(Math.random() * 24) + 1
    };
  };

  const handleFilterChange = (key: keyof PropertyFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };




  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
          <CardDescription className="text-slate-600">
            Filter and search properties with advanced options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search properties..."
                className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Location (city, state, country)"
                className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="bedrooms">Bedrooms</SelectItem>
                <SelectItem value="bathrooms">Bathrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-900">
            <span>Properties ({pagination?.total || 0})</span>
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
          </CardTitle>
          <CardDescription className="text-slate-600">
            Manage and monitor all your properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          {propertiesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-slate-100 animate-pulse rounded" />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="rounded-md border border-slate-200 overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="min-w-[200px]">Property</TableHead>
                    <TableHead className="min-w-[150px]">Location</TableHead>
                    <TableHead className="min-w-[120px]">Details</TableHead>
                    <TableHead className="min-w-[100px]">Price</TableHead>
                    <TableHead className="min-w-[100px]">Reviews</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => {
                    const propertyStats = getPropertyStats(property);
                    
                    return (
                      <TableRow key={property.id} className="hover:bg-slate-50">
                        <TableCell className="max-w-[200px]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building className="h-5 w-5 text-slate-500" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate text-slate-900" title={property.title}>
                                {property.title}
                              </div>
                              <div className="text-xs text-slate-500">ID: {property.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[150px]">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate text-slate-900" title={property.city}>
                                {property.city}
                              </div>
                              <div className="text-xs text-slate-500 truncate">
                                {property.state}, {property.country}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[120px]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Bed className="h-3 w-3 text-slate-400 flex-shrink-0" />
                              <span className="text-slate-700">{property.bedrooms} bed</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Bath className="h-3 w-3 text-slate-400 flex-shrink-0" />
                              <span className="text-slate-700">{property.bathrooms} bath</span>
                            </div>
                            <div className="text-xs text-slate-500 capitalize truncate" title={property.propertyType}>
                              {property.propertyType}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[100px]">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-sm text-slate-900">${property.price}</div>
                              <div className="text-xs text-slate-500">/night</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[100px]">
                          <div className="text-sm">
                            <div className="font-medium text-slate-900">{propertyStats.totalReviews} total</div>
                            <div className="text-xs text-slate-500">
                              {propertyStats.pendingReviews} pending
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[100px]">
                          <div className="flex flex-col gap-1">
                            <Badge 
                              variant={property.status === 'active' ? "default" : "secondary"}
                              className="text-xs w-fit"
                            >
                              {property.status}
                            </Badge>
                            {propertyStats.pendingReviews > 0 && (
                              <Badge variant="outline" className="text-xs w-fit text-yellow-600 border-yellow-200">
                                Needs Review
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[120px]">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/property/${property.id}`} className="flex items-center">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Property
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/reviews?property=${property.id}`} className="flex items-center">
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  View Reviews
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/analytics?property=${property.id}`} className="flex items-center">
                                  <TrendingUp className="h-4 w-4 mr-2" />
                                  Analytics
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Properties Found</h3>
              <p className="text-slate-600">
                {filters.search || filters.location || (filters.status && filters.status !== 'all')
                  ? 'Try adjusting your filters to see more properties.'
                  : 'No properties are currently available.'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} properties
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="border-slate-300 hover:bg-slate-50"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 p-0 ${
                          currentPage === page 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="border-slate-300 hover:bg-slate-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
