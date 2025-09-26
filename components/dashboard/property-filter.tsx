"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Users, 
  Star,
  Zap,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export interface PropertyFilters {
  search?: string
  city?: string
  country?: string
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  maxBedrooms?: number
  minBathrooms?: number
  maxBathrooms?: number
  minCapacity?: number
  maxCapacity?: number
  instantBookable?: boolean
  amenities?: string[]
  sortBy?: 'price' | 'name' | 'created_at' | 'rating'
  sortOrder?: 'asc' | 'desc'
}

interface PropertyFilterProps {
  filters: PropertyFilters
  onFiltersChange: (filters: PropertyFilters) => void
  onClearFilters: () => void
  availableCities: string[]
  availableCountries: string[]
  availableAmenities: string[]
  priceRange: { min: number; max: number }
  capacityRange: { min: number; max: number }
  className?: string
}

const amenityCategories = {
  'Basic': ['Essentials', 'Hot water', 'Toilet', 'Towels', 'Shampoo', 'Shower gel', 'Body soap', 'Conditioner'],
  'Kitchen': ['Refrigerator', 'Microwave', 'Oven', 'Stove', 'Dishwasher', 'Toaster', 'Electric kettle', 'Kitchen utensils', 'Dining table', 'Freezer', 'Wine glasses'],
  'Entertainment': ['TV', 'Cable TV', 'Smart TV', 'Internet', 'Wireless', 'Free WiFi', 'WiFi speed (25+ Mbps)'],
  'Laundry': ['Washing Machine', 'Iron', 'Iron board', 'Drying rack for clothing', 'Hangers'],
  'Bathroom': ['Hair Dryer', 'Shower', 'Tub', 'Cleaning products'],
  'Safety': ['Smoke detector', 'Carbon Monoxide Detector'],
  'Family': ['Suitable for children', 'Suitable for infants'],
  'Outdoor': ['Garden or backyard'],
  'Space': ['Private living room', 'Dining area', 'Clothing storage'],
  'Policy': ['Long term stays allowed', '24-hour checkin', 'Contactless Check-In/Out', 'Enhanced Cleaning Practices']
}

export function PropertyFilter({
  filters,
  onFiltersChange,
  onClearFilters,
  availableCities,
  availableCountries,
  availableAmenities,
  priceRange,
  capacityRange,
  className
}: PropertyFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(filters.amenities || [])

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters)
    setSelectedAmenities(filters.amenities || [])
  }, [filters])

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity]
    
    setSelectedAmenities(newAmenities)
    handleFilterChange('amenities', newAmenities)
  }

  const handleClearFilters = () => {
    setLocalFilters({})
    setSelectedAmenities([])
    onClearFilters()
  }

  const activeFiltersCount = Object.keys(localFilters).filter(key => {
    const value = localFilters[key as keyof PropertyFilters]
    return value !== undefined && value !== '' && 
           (Array.isArray(value) ? value.length > 0 : true)
  }).length

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search properties, cities..."
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Select
              value={localFilters.city || ''}
              onValueChange={(value) => handleFilterChange('city', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any city</SelectItem>
                {availableCities?.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                )) || []}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={localFilters.country || ''}
              onValueChange={(value) => handleFilterChange('country', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any country</SelectItem>
                {availableCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-6">
            {/* Price Range */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price Range
              </Label>
              <div className="space-y-3">
                <Slider
                  value={[localFilters.minPrice || priceRange.min, localFilters.maxPrice || priceRange.max]}
                  onValueChange={([min, max]) => {
                    handleFilterChange('minPrice', min)
                    handleFilterChange('maxPrice', max)
                  }}
                  min={priceRange.min}
                  max={priceRange.max}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${localFilters.minPrice || priceRange.min}</span>
                  <span>${localFilters.maxPrice || priceRange.max}</span>
                </div>
              </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Bed className="h-4 w-4" />
                Bedrooms
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={localFilters.minBedrooms?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('minBedrooms', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}+
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={localFilters.maxBedrooms?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('maxBedrooms', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Max" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Bath className="h-4 w-4" />
                Bathrooms
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={localFilters.minBathrooms?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('minBathrooms', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}+
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={localFilters.maxBathrooms?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('maxBathrooms', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Max" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Guest Capacity
              </Label>
              <div className="space-y-3">
                <Slider
                  value={[localFilters.minCapacity || capacityRange.min, localFilters.maxCapacity || capacityRange.max]}
                  onValueChange={([min, max]) => {
                    handleFilterChange('minCapacity', min)
                    handleFilterChange('maxCapacity', max)
                  }}
                  min={capacityRange.min}
                  max={capacityRange.max}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{localFilters.minCapacity || capacityRange.min} guests</span>
                  <span>{localFilters.maxCapacity || capacityRange.max} guests</span>
                </div>
              </div>
            </div>

            {/* Instant Bookable */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="instantBookable"
                checked={localFilters.instantBookable || false}
                onCheckedChange={(checked) => handleFilterChange('instantBookable', checked)}
              />
              <Label htmlFor="instantBookable" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Instant Bookable
              </Label>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <Label>Amenities</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {Object.entries(amenityCategories).map(([category, amenities]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {amenities
                        .filter(amenity => availableAmenities.includes(amenity))
                        .map((amenity) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                              id={amenity}
                              checked={selectedAmenities.includes(amenity)}
                              onCheckedChange={() => handleAmenityToggle(amenity)}
                            />
                            <Label htmlFor={amenity} className="text-sm">
                              {amenity}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  value={localFilters.sortBy || 'created_at'}
                  onValueChange={(value) => handleFilterChange('sortBy', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Date Added</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Order</Label>
                <Select
                  value={localFilters.sortOrder || 'desc'}
                  onValueChange={(value) => handleFilterChange('sortOrder', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
