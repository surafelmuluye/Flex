'use client';

import React from 'react';
import { AnalyticsChart } from './analytics-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Home, Bed, Bath, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyAnalyticsProps {
  listingsByLocation: Array<{ city: string; state: string; count: number }>;
  bedroomStats: Array<{ bedrooms: number; count: number }>;
  bathroomStats: Array<{ bathrooms: number; count: number }>;
  priceStats: { min: number; max: number; avg: number; median: number };
  loading?: boolean;
}

export function PropertyAnalytics({ 
  listingsByLocation, 
  bedroomStats, 
  bathroomStats, 
  priceStats, 
  loading = false 
}: PropertyAnalyticsProps) {
  // Transform location data
  const locationData = listingsByLocation.slice(0, 8).map(location => ({
    name: location.city,
    value: location.count,
    color: getLocationColor(location.count)
  }));

  // Transform bedroom data
  const bedroomData = bedroomStats.map(bedroom => ({
    name: `${bedroom.bedrooms} Bed${bedroom.bedrooms !== 1 ? 's' : ''}`,
    value: bedroom.count,
    color: getBedroomColor(bedroom.bedrooms)
  }));

  // Transform bathroom data
  const bathroomData = bathroomStats.map(bathroom => ({
    name: `${bathroom.bathrooms} Bath${bathroom.bathrooms !== 1 ? 's' : ''}`,
    value: bathroom.count,
    color: getBathroomColor(bathroom.bathrooms)
  }));

  function getLocationColor(count: number): string {
    if (count >= 20) return '#10b981'; // green
    if (count >= 15) return '#84cc16'; // lime
    if (count >= 10) return '#eab308'; // yellow
    if (count >= 5) return '#f97316'; // orange
    return '#6b7280'; // gray
  }

  function getBedroomColor(bedrooms: number): string {
    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#10b981', '#06b6d4'];
    return colors[bedrooms - 1] || '#6b7280';
  }

  function getBathroomColor(bathrooms: number): string {
    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#10b981'];
    return colors[bathrooms - 1] || '#6b7280';
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-slate-200 rounded mb-4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-slate-200 rounded mb-4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Location Distribution */}
        <AnalyticsChart
          title="Properties by Location"
          data={locationData}
          type="bar"
          height={250}
        />

        {/* Bedroom Distribution */}
        <AnalyticsChart
          title="Bedroom Distribution"
          data={bedroomData}
          type="pie"
          height={250}
        />

        {/* Bathroom Distribution */}
        <AnalyticsChart
          title="Bathroom Distribution"
          data={bathroomData}
          type="bar"
          height={250}
        />
      </div>

      {/* Property Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Locations */}
        <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg border-slate-200 bg-white hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Top Locations
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <div className="space-y-3">
              {listingsByLocation.slice(0, 5).map((location, index) => (
                <div key={location.city} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{location.city}</div>
                      {location.state && (
                        <div className="text-sm text-slate-500">{location.state}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">{location.count}</div>
                    <div className="text-sm text-slate-500">properties</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          {/* Animated border on hover */}
          <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary-200/50 transition-colors duration-300" />
        </Card>

        {/* Property Types */}
        <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg border-slate-200 bg-white hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Home className="h-5 w-5 text-green-500" />
              Property Types
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Most Common Bedrooms</span>
                </div>
                <span className="font-semibold">
                  {bedroomStats.reduce((max, current) => 
                    current.count > max.count ? current : max
                  ).bedrooms} bedrooms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bath className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Most Common Bathrooms</span>
                </div>
                <span className="font-semibold">
                  {bathroomStats.reduce((max, current) => 
                    current.count > max.count ? current : max
                  ).bathrooms} bathrooms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Price Range</span>
                </div>
                <span className="font-semibold">
                  ${priceStats.min} - ${priceStats.max}
                </span>
              </div>
            </div>
          </CardContent>

          {/* Animated border on hover */}
          <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary-200/50 transition-colors duration-300" />
        </Card>
      </div>

      {/* Price Analysis */}
      <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg border-slate-200 bg-white hover:shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Price Analysis
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">${priceStats.min}</div>
              <div className="text-sm text-slate-600">Minimum Price</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">${priceStats.avg}</div>
              <div className="text-sm text-slate-600">Average Price</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">${priceStats.median}</div>
              <div className="text-sm text-slate-600">Median Price</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">${priceStats.max}</div>
              <div className="text-sm text-slate-600">Maximum Price</div>
            </div>
          </div>
        </CardContent>

        {/* Animated border on hover */}
        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary-200/50 transition-colors duration-300" />
      </Card>
    </div>
  );
}
