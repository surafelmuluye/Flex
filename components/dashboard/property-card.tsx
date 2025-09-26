"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  Bed, 
  Bath, 
  Users, 
  Star, 
  Zap, 
  Heart,
  Share2,
  Eye,
  Calendar,
  DollarSign,
  Wifi,
  Car,
  Shield,
  Clock
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface PropertyCardProps {
  property: {
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
  className?: string
  showActions?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Free WiFi': Wifi,
  'WiFi speed (25+ Mbps)': Wifi,
  'Internet': Wifi,
  'Wireless': Wifi,
  'Parking': Car,
  '24-hour checkin': Clock,
  'Contactless Check-In/Out': Shield,
  'Enhanced Cleaning Practices': Shield,
  'Smoke detector': Shield,
  'Carbon Monoxide Detector': Shield,
}

export function PropertyCard({ 
  property, 
  className, 
  showActions = true,
  variant = 'default'
}: PropertyCardProps) {
  const [isLiked, setIsLiked] = React.useState(false)
  const [imageError, setImageError] = React.useState(false)
  
  const mainImage = property.listingImages[0]
  const totalFees = (property.cleaningFee || 0) + (property.checkinFee || 0)
  const pricePerNight = property.price + (totalFees / (property.minNights || 1))

  const getAmenityIcon = (amenityName: string) => {
    const iconKey = Object.keys(amenityIcons).find(key => 
      amenityName.toLowerCase().includes(key.toLowerCase())
    )
    return iconKey ? amenityIcons[iconKey] : null
  }

  const formatPrice = (price: number) => {
    const currency = property.currencyCode || 'USD'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (variant === 'compact') {
    return (
      <Card className={cn("group hover:shadow-lg transition-all duration-300 hover:-translate-y-1", className)}>
        <div className="flex">
          <div className="relative w-32 h-24 flex-shrink-0">
            {mainImage && !imageError ? (
              <Image
                src={mainImage.url}
                alt={mainImage.caption || property.name}
                fill
                className="object-cover rounded-l-lg"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-l-lg flex items-center justify-center">
                <span className="text-gray-500 text-xs">No image</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary-600 transition-colors">
                {property.name}
              </h3>
              <div className="flex items-center gap-1">
                {property.instantBookable && (
                  <Zap className="h-3 w-3 text-green-500" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={cn("h-3 w-3", isLiked ? "fill-red-500 text-red-500" : "text-gray-400")} />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{property.city}, {property.country}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Bed className="h-3 w-3" />
                  <span>{property.bedroomsNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-3 w-3" />
                  <span>{property.bathroomsNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{property.personCapacity}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-sm">{formatPrice(property.price)}</div>
                <div className="text-xs text-gray-500">per night</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (variant === 'detailed') {
    return (
      <Card className={cn("group hover:shadow-xl transition-all duration-300 hover:-translate-y-2", className)}>
        <div className="relative">
          <div className="relative h-64 w-full">
            {mainImage && !imageError ? (
              <Image
                src={mainImage.url}
                alt={mainImage.caption || property.name}
                fill
                className="object-cover rounded-t-lg"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-t-lg flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
            
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {property.instantBookable && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Zap className="h-3 w-3 mr-1" />
                  Instant Book
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={cn("h-4 w-4", isLiked ? "fill-red-500 text-red-500" : "text-gray-600")} />
              </Button>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-primary-600 transition-colors">
                  {property.name}
                </h3>
                <div className="flex items-center gap-1 text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{property.city}, {property.country}</span>
                </div>
                {property.description && (
                  <p className="text-gray-700 text-sm line-clamp-2">
                    {property.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  <span>{property.bedroomsNumber} bedroom{property.bedroomsNumber !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  <span>{property.bathroomsNumber} bathroom{property.bathroomsNumber !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{property.personCapacity} guest{property.personCapacity !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Key Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {property.listingAmenities.slice(0, 6).map((amenity, index) => {
                    const IconComponent = getAmenityIcon(amenity.amenityName)
                    return (
                      <div key={index} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                        {IconComponent && <IconComponent className="h-3 w-3" />}
                        <span>{amenity.amenityName}</span>
                      </div>
                    )
                  })}
                  {property.listingAmenities.length > 6 && (
                    <div className="text-xs text-gray-500 px-2 py-1">
                      +{property.listingAmenities.length - 6} more
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <div className="font-bold text-xl">{formatPrice(property.price)}</div>
                  <div className="text-sm text-gray-500">per night</div>
                  {totalFees > 0 && (
                    <div className="text-xs text-gray-500">
                      +{formatPrice(totalFees)} fees
                    </div>
                  )}
                </div>
                
                {showActions && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Link href={`/property/${property.id}`}>
                      <Button size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300 hover:-translate-y-1", className)}>
      <div className="relative">
        <div className="relative h-48 w-full">
          {mainImage && !imageError ? (
            <Image
              src={mainImage.url}
              alt={mainImage.caption || property.name}
              fill
              className="object-cover rounded-t-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-t-lg flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
          
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {property.instantBookable && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Instant
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn("h-4 w-4", isLiked ? "fill-red-500 text-red-500" : "text-gray-600")} />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                {property.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">{property.city}, {property.country}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{property.bedroomsNumber}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathroomsNumber}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{property.personCapacity}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <div className="font-bold text-lg">{formatPrice(property.price)}</div>
                <div className="text-sm text-gray-500">per night</div>
              </div>
              
              {showActions && (
                <Link href={`/property/${property.id}`}>
                  <Button size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}