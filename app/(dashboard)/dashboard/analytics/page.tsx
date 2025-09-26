'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown,
  Star,
  MessageSquare,
  Building,
  Clock,
  Users,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  RefreshCw,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Zap,
  Eye,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';
import useSWR from 'swr';
import { mutate } from 'swr';
import { EnhancedSection } from '@/components/dashboard/enhanced-section';
import { EnhancedStatsCard } from '@/components/dashboard/enhanced-stats-card';

// API fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Property {
  id: number
  title: string
  price: number
  city: string
  country: string
  bedrooms: number
  bathrooms: number
  personCapacity?: number
  instantBookable?: boolean
  currencyCode?: string
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
    cities: Array<{ city: string; count: number }>
    countries: Array<{ country: string; count: number }>
  }
}

interface ListingsResponse {
  success: boolean
  data: {
    listings: Property[]
    pagination: {
      total: number
    }
  }
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [metric, setMetric] = useState('revenue');

  // Fetch data
  const { data: statsData, isLoading: statsLoading } = useSWR<StatsResponse>('/api/listings/stats', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000 // 5 minutes
  });

  const { data: listingsData, isLoading: listingsLoading } = useSWR<ListingsResponse>('/api/listings?limit=100', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000 // 5 minutes
  });

  const isLoading = statsLoading || listingsLoading;
  const stats = statsData?.data;
  const properties = Array.isArray(listingsData?.data?.listings) ? listingsData.data.listings : [];

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!properties.length || !stats) return null;

    // Price analysis
    const prices = properties.map(p => p.price);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Capacity analysis
    const capacities = properties.map(p => p.personCapacity || 2).filter(cap => cap > 0);
    const avgCapacity = capacities.length > 0 ? capacities.reduce((sum, cap) => sum + cap, 0) / capacities.length : 2;

    // Room analysis
    const bedrooms = properties.map(p => p.bedrooms);
    const bathrooms = properties.map(p => p.bathrooms);
    const avgBedrooms = bedrooms.reduce((sum, bed) => sum + bed, 0) / bedrooms.length;
    const avgBathrooms = bathrooms.reduce((sum, bath) => sum + bath, 0) / bathrooms.length;

    // Instant bookable analysis
    const instantBookableCount = properties.filter(p => p.instantBookable).length;
    const instantBookableRate = (instantBookableCount / properties.length) * 100;

    // Top performing properties by price
    const topPerformingByPrice = [...properties]
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);

    // Most common amenities (mock data for now)
    const commonAmenities = [
      { name: 'Free WiFi', count: Math.floor(properties.length * 0.95) },
      { name: 'Kitchen', count: Math.floor(properties.length * 0.88) },
      { name: 'Parking', count: Math.floor(properties.length * 0.72) },
      { name: 'Washing Machine', count: Math.floor(properties.length * 0.65) },
      { name: 'Air Conditioning', count: Math.floor(properties.length * 0.58) },
    ];

    // Revenue projections (mock data)
    const monthlyRevenue = properties.reduce((sum, p) => sum + (p.price * 20), 0); // Assuming 20 nights/month
    const yearlyRevenue = monthlyRevenue * 12;

    return {
      priceAnalysis: { avgPrice, minPrice, maxPrice },
      capacityAnalysis: { avgCapacity },
      roomAnalysis: { avgBedrooms, avgBathrooms },
      instantBookableRate,
      topPerformingByPrice,
      commonAmenities,
      revenue: { monthly: monthlyRevenue, yearly: yearlyRevenue }
    };
  }, [properties, stats]);

  const handleRefresh = async () => {
    await Promise.all([
      mutate('/api/listings/stats'),
      mutate('/api/listings?limit=100')
    ]);
  };

  const handleExport = () => {
    console.log('Exporting analytics data...');
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg">
            Comprehensive insights and performance metrics for your properties
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
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
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <EnhancedSection
        title="Key Performance Indicators"
        description="Essential metrics at a glance"
        badge="Live"
        badgeColor="bg-green-100 text-green-700"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatsCard
            title="Total Properties"
            value={stats?.total || 0}
            description="Active listings"
            icon={<Building className="h-5 w-5" />}
            loading={isLoading}
            variant="info"
            trend={{
              value: 12,
              direction: 'up',
              period: 'vs last month'
            }}
          />
          <EnhancedStatsCard
            title="Average Price"
            value={analytics ? `$${Math.round(analytics.priceAnalysis.avgPrice)}` : '$0'}
            description="Per night"
            icon={<DollarSign className="h-5 w-5" />}
            loading={isLoading}
            variant="success"
            trend={{
              value: 8,
              direction: 'up',
              period: 'vs last month'
            }}
          />
          <EnhancedStatsCard
            title="Instant Book Rate"
            value={analytics ? `${Math.round(analytics.instantBookableRate)}%` : '0%'}
            description="Properties with instant booking"
            icon={<Zap className="h-5 w-5" />}
            loading={isLoading}
            variant="warning"
            trend={{
              value: 5,
              direction: 'up',
              period: 'vs last month'
            }}
          />
          <EnhancedStatsCard
            title="Monthly Revenue"
            value={analytics ? `$${Math.round(analytics.revenue.monthly / 1000)}K` : '$0'}
            description="Projected revenue"
            icon={<TrendingUp className="h-5 w-5" />}
            loading={isLoading}
            variant="success"
            trend={{
              value: 15,
              direction: 'up',
              period: 'vs last month'
            }}
          />
        </div>
      </EnhancedSection>

      {/* Property Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Price Distribution */}
        <EnhancedSection
          title="Price Analysis"
          description="Property pricing insights"
          badge="Analytics"
          badgeColor="bg-blue-100 text-blue-700"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${analytics?.priceAnalysis.minPrice || 0}
                </div>
                <div className="text-sm text-blue-600">Min Price</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${analytics ? Math.round(analytics.priceAnalysis.avgPrice) : 0}
                </div>
                <div className="text-sm text-blue-600">Average</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${analytics?.priceAnalysis.maxPrice || 0}
                </div>
                <div className="text-sm text-blue-600">Max Price</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Price Range Distribution</h4>
              <div className="space-y-2">
                {[
                  { range: '$0-$100', count: properties.filter(p => p.price <= 100).length, color: 'bg-green-500' },
                  { range: '$101-$200', count: properties.filter(p => p.price > 100 && p.price <= 200).length, color: 'bg-blue-500' },
                  { range: '$201-$300', count: properties.filter(p => p.price > 200 && p.price <= 300).length, color: 'bg-yellow-500' },
                  { range: '$301+', count: properties.filter(p => p.price > 300).length, color: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.range} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.range}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${properties.length > 0 ? (item.count / properties.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </EnhancedSection>

        {/* Property Features */}
        <EnhancedSection
          title="Property Features"
          description="Room and capacity analysis"
          badge="Insights"
          badgeColor="bg-purple-100 text-purple-700"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Bed className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-xl font-bold text-purple-600">
                  {analytics ? Math.round(analytics.roomAnalysis.avgBedrooms * 10) / 10 : 0}
                </div>
                <div className="text-sm text-purple-600">Avg Bedrooms</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Bath className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-xl font-bold text-purple-600">
                  {analytics ? Math.round(analytics.roomAnalysis.avgBathrooms * 10) / 10 : 0}
                </div>
                <div className="text-sm text-purple-600">Avg Bathrooms</div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-xl font-bold text-purple-600">
                {analytics ? Math.round(analytics.capacityAnalysis.avgCapacity * 10) / 10 : 0}
              </div>
              <div className="text-sm text-purple-600">Avg Capacity</div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Capacity Distribution</h4>
              <div className="space-y-2">
                {[
                  { range: '1-2 guests', count: properties.filter(p => (p.personCapacity || 2) <= 2).length },
                  { range: '3-4 guests', count: properties.filter(p => (p.personCapacity || 2) >= 3 && (p.personCapacity || 2) <= 4).length },
                  { range: '5-6 guests', count: properties.filter(p => (p.personCapacity || 2) >= 5 && (p.personCapacity || 2) <= 6).length },
                  { range: '7+ guests', count: properties.filter(p => (p.personCapacity || 2) >= 7).length },
                ].map((item) => (
                  <div key={item.range} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.range}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-purple-500"
                          style={{ width: `${properties.length > 0 ? (item.count / properties.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </EnhancedSection>
      </div>

      {/* Top Performing Properties */}
      {analytics?.topPerformingByPrice && (
        <EnhancedSection
          title="Top Performing Properties"
          description="Highest value properties by price"
          badge="Premium"
          badgeColor="bg-yellow-100 text-yellow-700"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {analytics.topPerformingByPrice.map((property, index) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-semibold text-xs">{index + 1}</span>
                      </div>
                      <Award className="h-4 w-4 text-yellow-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      ${property.price}/night
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                    <MapPin className="h-3 w-3" />
                    <span>{property.city}, {property.country}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      <span>{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="h-3 w-3" />
                      <span>{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{property.personCapacity}</span>
                    </div>
                    {property.instantBookable && (
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">Instant</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </EnhancedSection>
      )}

      {/* Geographic Distribution */}
      {stats?.cities && stats.cities.length > 0 && (
        <EnhancedSection
          title="Geographic Distribution"
          description="Properties by location"
          badge="Global"
          badgeColor="bg-green-100 text-green-700"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Cities */}
            <div>
              <h4 className="font-medium mb-4">Top Cities</h4>
              <div className="space-y-3">
                {stats.cities.slice(0, 8).map((city, index) => (
                  <div key={city.city} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-xs">{index + 1}</span>
                      </div>
                      <span className="font-medium">{city.city}</span>
                    </div>
                    <Badge variant="outline">{city.count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Countries */}
            <div>
              <h4 className="font-medium mb-4">Top Countries</h4>
              <div className="space-y-3">
                {stats.countries.slice(0, 8).map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-xs">{index + 1}</span>
                      </div>
                      <span className="font-medium">{country.country}</span>
                    </div>
                    <Badge variant="outline">{country.count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </EnhancedSection>
      )}

      {/* Revenue Projections */}
      {analytics && (
        <EnhancedSection
          title="Revenue Projections"
          description="Financial performance insights"
          badge="Financial"
          badgeColor="bg-green-100 text-green-700"
        >
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent>
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${Math.round(analytics.revenue.monthly / 1000)}K
                </div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
                <div className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs last month
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent>
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${Math.round(analytics.revenue.yearly / 1000000)}M
                </div>
                <div className="text-sm text-gray-600">Yearly Revenue</div>
                <div className="text-xs text-blue-600 mt-1 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +18% vs last year
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent>
                <Target className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  ${Math.round(analytics.priceAnalysis.avgPrice * 0.7)}
                </div>
                <div className="text-sm text-gray-600">Avg Revenue/Property</div>
                <div className="text-xs text-purple-600 mt-1">Per night</div>
              </CardContent>
            </Card>
          </div>
        </EnhancedSection>
      )}

      {/* Performance Insights */}
      <EnhancedSection
        title="Performance Insights"
        description="Key insights and recommendations"
        badge="AI Insights"
        badgeColor="bg-purple-100 text-purple-700"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Strong Performance</h3>
                  <p className="text-sm text-green-600">Your properties are performing well</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                With an average price of ${analytics ? Math.round(analytics.priceAnalysis.avgPrice) : 0} per night, 
                your properties are positioned competitively in the market.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800">Geographic Diversity</h3>
                  <p className="text-sm text-blue-600">Strong global presence</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Properties across {stats?.availableCountries?.length || 0} countries and {stats?.availableCities?.length || 0} cities 
                provide excellent market coverage.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Zap className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800">Booking Optimization</h3>
                  <p className="text-sm text-yellow-600">Instant booking opportunity</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {analytics ? Math.round(analytics.instantBookableRate) : 0}% of properties offer instant booking, 
                which can increase conversion rates.
              </p>
            </CardContent>
          </Card>
        </div>
      </EnhancedSection>
    </div>
  );
}