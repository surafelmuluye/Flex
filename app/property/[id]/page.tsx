'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  Home,
  Calendar,
  MessageSquare,
  ChevronDown,
  Wifi,
  Tv,
  Car,
  Coffee,
  Wind,
  Shield,
  Eye,
  EyeOff,
  Check,
  X,
  Clock,
  User,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  Heart,
  Share2,
  Camera,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  DollarSign,
  Key,
  Utensils,
  Waves,
  Mountain,
  TreePine,
  Car as CarIcon,
  WashingMachine,
  Thermometer,
  Lock,
  Wifi as WifiIcon,
  Monitor,
  Gamepad2,
  Music,
  BookOpen,
  Dumbbell,
  Baby,
  PawPrint,
  Cigarette,
  PartyPopper,
  Volume2,
  VolumeX
} from 'lucide-react';
import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  publicAddress?: string;
  city: string;
  state?: string;
  country: string;
  street?: string;
  zipcode?: string;
  lat?: number;
  lng?: number;
  price: number;
  cleaningFee?: number;
  checkinFee?: number;
  priceForExtraPerson?: number;
  refundableDamageDeposit?: number;
  bedrooms: number;
  bathrooms: number;
  bedsNumber?: number;
  personCapacity?: number;
  maxChildrenAllowed?: number;
  maxInfantsAllowed?: number;
  maxPetsAllowed?: number;
  squareMeters?: number;
  property_type: number;
  roomType?: string;
  bathroomType?: string;
  minNights?: number;
  maxNights?: number;
  guestsIncluded?: number;
  checkInTimeStart?: number;
  checkInTimeEnd?: number;
  checkOutTime?: number;
  cancellationPolicy?: string;
  houseRules?: string;
  keyPickup?: string;
  specialInstruction?: string;
  doorSecurityCode?: string;
  cleaningInstruction?: string;
  contactName?: string;
  contactSurName?: string;
  contactPhone1?: string;
  contactPhone2?: string;
  contactLanguage?: string;
  contactEmail?: string;
  contactAddress?: string;
  language?: string;
  currencyCode?: string;
  timeZoneName?: string;
  instantBookable?: boolean;
  allowSameDayBooking?: boolean;
  sameDayBookingLeadTime?: number;
  cleannessStatus?: string;
  wifiUsername?: string;
  wifiPassword?: string;
  thumbnailUrl?: string;
  status: boolean;
  avg_rating: number;
  review_count: number;
  amenities: string[];
}

interface Review {
  id: string;
  hostawayId?: string;
  listingId: string;
  type: string;
  status: string;
  rating: number;
  content: string;
  authorName: string;
  authorEmail?: string;
  categories?: Array<{
    category: string;
    rating: number;
  }>;
  submittedAt: string;
  isPublic: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  listing?: {
    id: string;
    name: string;
  };
}

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const { data: propertyData, isLoading: propertyLoading, error: propertyError } = useSWR(
    resolvedParams ? `/api/properties/${resolvedParams.id}` : null,
    fetcher,
    { refreshInterval: 0 }
  );

  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = useSWR(
    resolvedParams ? `/api/reviews/hostaway?listingId=${resolvedParams.id}&status=approved&limit=10` : null,
    fetcher,
    { refreshInterval: 0 }
  );

  const property: Property = propertyData?.data?.property;
  const allReviews: Review[] = reviewsData?.data?.data?.reviews || [];
  const reviews: Review[] = allReviews.filter(review => review.status === 'approved');

  // Debug logging
  console.log('Property Data:', propertyData);
  console.log('Property:', property);
  console.log('Resolved Params:', resolvedParams);
  console.log('Property Loading:', propertyLoading);
  console.log('Property Error:', propertyError);

  // Generate property images - using real images from same-assets.com
  const generatePropertyImages = (property: Property) => {
    const baseImages = [
      'https://ext.same-assets.com/3841620933/1270541429.jpeg',
      'https://ext.same-assets.com/3841620933/1129741690.jpeg',
      'https://ext.same-assets.com/3841620933/175653614.jpeg',
      'https://ext.same-assets.com/3841620933/2936047367.jpeg',
      'https://ext.same-assets.com/3841620933/4183304256.jpeg',
      'https://ext.same-assets.com/3841620933/2184652734.jpeg',
      'https://ext.same-assets.com/3841620933/2226493174.jpeg',
      'https://ext.same-assets.com/3841620933/208029973.jpeg',
      'https://ext.same-assets.com/3841620933/349114665.jpeg',
      'https://ext.same-assets.com/3841620933/2949909300.jpeg',
      'https://ext.same-assets.com/3841620933/760367574.jpeg',
      'https://ext.same-assets.com/3841620933/1423401075.jpeg',
      'https://ext.same-assets.com/3841620933/3797350192.jpeg',
      'https://ext.same-assets.com/3841620933/3591841554.jpeg',
      'https://ext.same-assets.com/3841620933/2517966124.jpeg',
      'https://ext.same-assets.com/3841620933/623513740.jpeg',
      'https://ext.same-assets.com/3841620933/1150896784.jpeg',
      'https://ext.same-assets.com/3841620933/3193144378.jpeg',
      'https://ext.same-assets.com/3841620933/543983923.jpeg',
      'https://ext.same-assets.com/3841620933/2771209756.jpeg',
      'https://ext.same-assets.com/3841620933/770668557.jpeg',
      'https://ext.same-assets.com/3841620933/3601037046.jpeg',
      'https://ext.same-assets.com/3841620933/3009753153.jpeg',
      'https://ext.same-assets.com/3841620933/1998916707.jpeg',
      'https://ext.same-assets.com/3841620933/3907961363.jpeg',
      'https://ext.same-assets.com/3841620933/1517906058.jpeg',
      'https://ext.same-assets.com/3841620933/132081470.jpeg',
      'https://ext.same-assets.com/3841620933/1202038488.jpeg'
    ];
    return baseImages;
  };

  const images = property ? generatePropertyImages(property) : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Helper functions
  const formatTime = (timeInMinutes?: number) => {
    if (!timeInMinutes) return 'N/A';
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'WiFi': <WifiIcon className="h-5 w-5" />,
      'Parking': <CarIcon className="h-5 w-5" />,
      'Kitchen': <Utensils className="h-5 w-5" />,
      'Air conditioning': <Thermometer className="h-5 w-5" />,
      'TV': <Monitor className="h-5 w-5" />,
      'Washing Machine': <WashingMachine className="h-5 w-5" />,
      'Hair Dryer': <User className="h-5 w-5" />,
      'Heating': <Thermometer className="h-5 w-5" />,
      'Cable TV': <Monitor className="h-5 w-5" />,
      'Internet': <WifiIcon className="h-5 w-5" />,
      'Wireless': <WifiIcon className="h-5 w-5" />,
      'Elevator': <Home className="h-5 w-5" />,
      'Smoke Detector': <Shield className="h-5 w-5" />,
    };
    return iconMap[amenity] || <Home className="h-5 w-5" />;
  };

  if (!resolvedParams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#284E4C' }}></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (propertyError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading property</div>
          <p className="text-gray-600">{propertyError?.message || 'Something went wrong'}</p>
          <p className="text-gray-500 text-sm mt-2">Resolved Params: {JSON.stringify(resolvedParams)}</p>
        </div>
      </div>
    );
  }

  if (propertyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#284E4C' }}></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-600">The property you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold" style={{ color: '#284E4C' }}>
                The Flex
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8 items-center">
              <Link href="/about-us" className="text-gray-600 hover:text-gray-900">About Us</Link>
              <Link href="/careers" className="text-gray-600 hover:text-gray-900">Careers</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
              <button
                onClick={() => setShowModal(true)}
                className="text-white px-4 py-2 rounded-md transition-colors text-sm" style={{ backgroundColor: '#284E4C' }}
              >
                Newsletter
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Newsletter Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 overflow-hidden">
            <div className="flex">
              <div className="flex-1">
                <img
                  src="https://ext.same-assets.com/3841620933/576535041.jpeg"
                  alt="Paris cityscape"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="float-right text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
                <h2 className="text-2xl font-bold mb-2">Sign-up to our newsletter</h2>
                <p className="text-xl mb-6">and receive 5% discount</p>
                <form className="space-y-4">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      placeholder="First name"
                      className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#284E4C' } as any}
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#284E4C' } as any}
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#284E4C' } as any}
                  />
                  <div className="flex">
                    <select className="p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:border-transparent"
                            style={{ '--tw-ring-color': '#284E4C' } as any}>
                      <option>🇫🇷 +44</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      className="flex-1 p-3 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#284E4C' } as any}
                    />
                  </div>
                  <button className="w-full text-white py-3 rounded-md font-semibold transition-colors" style={{ backgroundColor: '#284E4C' }}>
                    Subscribe
                  </button>
                  <p className="text-sm text-gray-500 text-center">
                    By subscribing, you agree to receive marketing communications from us.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Content - Property Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* Image Gallery */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-lg overflow-hidden relative group">
                <img
                  src={images[currentImageIndex]}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-md text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnail Grid */}
              <div className="grid grid-cols-6 gap-2 mt-4">
                {images.slice(0, 6).map((src, i) => (
                  <div
                    key={i}
                      className={`aspect-[4/3] rounded-md overflow-hidden cursor-pointer transition-all ${
                        currentImageIndex === i
                          ? 'border-2'
                          : 'border-2 border-transparent hover:border-gray-300'
                      }`}
                      style={currentImageIndex === i ? { borderColor: '#284E4C' } : {}}
                    onClick={() => selectImage(i)}
                  >
                    <img
                      src={src}
                      alt={`Property image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Property Title & Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {property.name}
              </h1>

              <div className="flex items-center space-x-8 text-gray-600 mb-8">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium">{property.personCapacity || property.bedrooms + 2}</span>
                  <span>Guests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  <span className="font-medium">{property.bedrooms}</span>
                  <span>Bedrooms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  <span className="font-medium">{property.bathrooms}</span>
                  <span>Bathrooms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  <span className="font-medium">{property.bedsNumber || property.bedrooms}</span>
                  <span>beds</span>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">About this property</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {property.description || `Welcome to your home away from home in the heart of ${property.city}! This spacious and modern ${property.bedrooms}-bedroom, ${property.bathrooms}-bathroom apartment offers the perfect blend of comfort and convenience, making it ideal for families, couples, or friends traveling together.`}
              </p>
              <p className="text-gray-600 leading-relaxed">
                Welcome to my apartment! This property offers two c... <span className="font-medium cursor-pointer hover:underline" style={{ color: '#284E4C' }}>Read more</span>
              </p>
            </div>

            {/* Amenities */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Amenities</h2>
                <button className="hover:underline flex items-center" style={{ color: '#284E4C' }}>
                  View all amenities
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {property.amenities.slice(0, 9).map((amenity, i) => (
                  <div key={i} className="flex items-center space-x-3 text-gray-600">
                    <span style={{ color: '#284E4C' }}>{getAmenityIcon(amenity)}</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stay Policies */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Stay Policies</h2>

              {/* Check-in & Check-out */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">Check-in & Check-out</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Check-in Time</p>
                    <p className="text-lg font-semibold">{property.checkInTimeStart ? formatTime(property.checkInTimeStart) : '3:00 PM'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Check-out Time</p>
                    <p className="text-lg font-semibold">{property.checkOutTime ? formatTime(property.checkOutTime) : '10:00 AM'}</p>
                  </div>
                </div>
              </div>

              {/* House Rules */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">House Rules</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                    <span>No smoking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                    <span>No pets</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                    <span>No parties or events</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#284E4C' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Security deposit required</span>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">Cancellation Policy</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">For stays less than 28 days</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Full refund up to 14 days before check-in</li>
                      <li>• No refund for bookings less than 14 days before check-in</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">For stays of 28 days or more</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Full refund up to 30 days before check-in</li>
                      <li>• No refund for bookings less than 30 days before check-in</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Location</h2>
              <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-500 font-medium">Google Maps Integration</p>
                  <p className="text-sm text-gray-400 mt-2">Map showing {property.city}, {property.country} location</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Browse more <a href="#" className="hover:underline" style={{ color: '#284E4C' }}>furnished rentals in {property.city}</a>
                </p>
              </div>
            </div>

            {/* Guest Reviews Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Guest Reviews</h2>

              {reviewsLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#284E4C' }}>
                          <span className="text-white font-bold text-lg">
                            {(review.authorName || 'Guest').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg">{review.authorName || 'Guest'}</h4>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < review.rating
                                      ? 'fill-current'
                                      : 'text-gray-300'
                                  }`}
                                  style={i < review.rating ? { color: '#284E4C' } : {}}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 font-medium">
                              {new Date(review.submittedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 leading-relaxed text-lg">
                        {review.content || 'No review content available'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No reviews yet</h3>
                  <p className="text-gray-500 text-lg">Be the first to review this property!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white text-center py-3 rounded-md mb-4" style={{ backgroundColor: '#284E4C' }}>
                  Book Your Stay
                </h3>
                <p className="text-sm text-gray-600 text-center">Select dates to see prices</p>
              </div>

              <div className="space-y-4">
                <button className="w-full border border-gray-300 rounded-md p-3 text-left text-gray-600 transition-colors flex items-center"
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#284E4C'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Select dates
                </button>

                <div className="relative">
                  <button className="w-full border border-gray-300 rounded-md p-3 text-left text-gray-600 transition-colors flex items-center justify-between"
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#284E4C'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>1 Guest</span>
                    </div>
                    <span className="text-sm text-gray-400">Up to 5 guests</span>
                  </button>
                </div>

                <button className="w-full bg-gray-100 text-gray-500 py-3 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Check availability
                </button>

                <button className="w-full border py-3 rounded-md transition-colors flex items-center justify-center"
                        style={{ borderColor: '#284E4C', color: '#284E4C' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#284E4C';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#284E4C';
                        }}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Inquiry
                </button>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Instant booking confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-white py-12 mt-16" style={{ backgroundColor: '#284E4C' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Join The Flex</h3>
              <p className="text-sm mb-4">
                Sign up now and stay up to date on our latest news and exclusive deals including 5% off your first stay!
              </p>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First name"
                    className="p-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/70 focus:bg-white/20 focus:border-white/40 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    className="p-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/70 focus:bg-white/20 focus:border-white/40 transition-colors"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full p-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/70 focus:bg-white/20 focus:border-white/40 transition-colors"
                />
                <div className="flex gap-2">
                  <select className="w-20 p-2 rounded bg-white/10 border border-white/20 text-white focus:bg-white/20 focus:border-white/40 transition-colors">
                    <option>🇫🇷 +44</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    className="flex-1 p-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/70 focus:bg-white/20 focus:border-white/40 transition-colors"
                  />
                </div>
                <button className="w-full bg-white py-2 rounded font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center" style={{ color: '#284E4C' }}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Subscribe
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">The Flex</h3>
              <p className="text-sm">
                Professional property management services for landlords, flexible corporate lets for businesses and quality accommodations for short-term and long-term guests.
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.343-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378 0 0-.599 2.295-.744 2.852-.268 1.028-1.993 2.323-2.97 3.106C9.716 23.439 10.814 23.957 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.017 0z"/>
                  </svg>
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:underline">Blog</Link></li>
                <li><Link href="/careers" className="hover:underline">Careers</Link></li>
                <li><Link href="/terms" className="hover:underline">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
              </ul>

              <h3 className="text-lg font-semibold mb-4 mt-6">Locations</h3>
              <ul className="space-y-2 text-sm">
                <li>LONDON</li>
                <li>PARIS</li>
                <li>ALGIERS</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Support Numbers</p>
                <p>United Kingdom<br />+44 77 2374 5646</p>
                <p>Algeria<br />+33 7 57 59 22 41</p>
                <p>France<br />+33 6 44 64 57 17</p>
                <p className="mt-4">info@theflex.global</p>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
            © 2025 The Flex. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}