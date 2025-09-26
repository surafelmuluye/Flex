"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Grid3X3, 
  List, 
  SlidersHorizontal, 
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { PropertyCard } from "./property-card"
import { PropertyFilter, type PropertyFilters } from "./property-filter"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useSWR from 'swr'

interface PropertyGridProps {
  className?: string
}

interface Property {
  id: number
  name: string
  description?: string
  price: number
  address: string
  city: string
  country: string
  bedroomsNumber: number
  bathroomsNumber: number
  personCapacity: number
  instantBookable?: boolean
  cancellationPolicy?: string
  currencyCode?: string
  listingImages: Array<{ url: string; caption?: string }>
  listingAmenities: Array<{ amenityName: string }>
  minNights?: number
  maxNights?: number
  cleaningFee?: number
  checkinFee?: number
}

interface ApiResponse {
  success: boolean
  data: Property[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
  source: string
  duration: number
}

interface StatsResponse {
  success: boolean
  data: {
    total: number
    averagePrice: number
    availableCities: string[]
    availableCountries: string[]
    availableAmenities: string[]
    priceRange: { min: number; max: number }
    capacityRange: { min: number; max: number }
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function PropertyGrid({ className }: PropertyGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<PropertyFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isLoading, setIsLoading] = useState(false)

  // Fetch filter options
  const { data: statsData } = useSWR<StatsResponse>('/api/listings/stats', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000 // 5 minutes
  })

  // Build API URL with filters
  const buildApiUrl = (page: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '12',
      sortBy,
      sortOrder,
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            acc[key] = value.join(',')
          } else {
            acc[key] = value.toString()
          }
        }
        return acc
      }, {} as Record<string, string>)
    })
    
    return `/api/listings?${params.toString()}`
  }

  // Fetch properties
  const { data, error, mutate, isLoading: swrLoading } = useSWR<ApiResponse>(
    buildApiUrl(currentPage),
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000 // 30 seconds
    }
  )

  const properties = data?.data || []
  const pagination = data?.pagination
  const isLoadingData = isLoading || swrLoading

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, sortBy, sortOrder])

  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({})
  }


  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof PropertyFilters]
    return value !== undefined && value !== '' && 
           (Array.isArray(value) ? value.length > 0 : true)
  }).length

  if (error) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <CardContent>
          <div className="text-red-500 mb-4">
            <Filter className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Error Loading Properties</h3>
            <p className="text-sm text-gray-600 mt-2">
              There was an error loading the properties. Please try again.
            </p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Properties</h2>
          <p className="text-gray-600">
            {pagination ? `${pagination.total} properties found` : 'Loading...'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Added</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>

          {/* View Mode */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

        </div>
      </div>

      {/* Filters */}
      {showFilters && statsData && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <PropertyFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              availableCities={statsData.data.availableCities || []}
              availableCountries={statsData.data.availableCountries || []}
              availableAmenities={statsData.data.availableAmenities || []}
              priceRange={statsData.data.priceRange || { min: 0, max: 1000 }}
              capacityRange={statsData.data.capacityRange || { min: 1, max: 10 }}
            />
          </div>
          
          <div className="lg:col-span-3">
            {/* Properties Grid/List */}
            {isLoadingData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg" />
                    <CardContent className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : properties.length > 0 ? (
              <>
                <div className={cn(
                  "grid gap-6",
                  viewMode === 'grid' 
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1"
                )}>
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      variant={viewMode === 'list' ? 'compact' : 'default'}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        )
                      })}
                      {pagination.totalPages > 5 && (
                        <>
                          <span className="px-2">...</span>
                          <Button
                            variant={currentPage === pagination.totalPages ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pagination.totalPages)}
                            className="w-8 h-8 p-0"
                          >
                            {pagination.totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-8 text-center">
                <CardContent>
                  <Filter className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters to see more properties.
                  </p>
                  <Button onClick={handleClearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Properties without filters */}
      {!showFilters && (
        <>
          {isLoadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className={cn(
                "grid gap-6",
                viewMode === 'grid' 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              )}>
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    variant={viewMode === 'list' ? 'compact' : 'default'}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    })}
                    {pagination.totalPages > 5 && (
                      <>
                        <span className="px-2">...</span>
                        <Button
                          variant={currentPage === pagination.totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pagination.totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {pagination.totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <Filter className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
                <p className="text-gray-600 mb-4">
                  No properties are currently available.
                </p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
