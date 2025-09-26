'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Bell,
  Settings,
  Menu,
  X,
  RefreshCw,
  Download,
  Filter,
  Grid,
  List,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  loading?: boolean;
  className?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onSearch?: (query: string) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export function DashboardLayout({
  title,
  subtitle,
  children,
  actions,
  filters,
  loading = false,
  className,
  onRefresh,
  onExport,
  onSearch,
  viewMode = 'grid',
  onViewModeChange
}: DashboardLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-2">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Search */}
          {onSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center border border-gray-300 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Filter Toggle */}
          {filters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          )}

          {/* Refresh */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
              Refresh
            </Button>
          )}

          {/* Export */}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}

          {/* Custom Actions */}
          {actions}

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <Card className="lg:hidden">
          <CardContent className="p-4">
            <div className="space-y-3">
              {onSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              {filters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              )}
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={loading}
                  className="w-full"
                >
                  <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
                  Refresh
                </Button>
              )}
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
              {actions}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {showFilters && filters && (
        <Card>
          <CardContent className="p-4">
            {filters}
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <div className={cn(
        'transition-all duration-200',
        loading && 'opacity-50 pointer-events-none'
      )}>
        {children}
      </div>
    </div>
  );
}

// Quick Stats Component
interface QuickStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    change?: {
      value: number;
      direction: 'up' | 'down' | 'neutral';
    };
    icon?: React.ReactNode;
  }>;
  loading?: boolean;
  className?: string;
}

export function QuickStats({ stats, loading = false, className }: QuickStatsProps) {
  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-2 w-24"></div>
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="p-3 rounded-lg bg-gray-200">
                  <div className="h-6 w-6 bg-gray-300 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {stats.map((stat, index) => (
        <Card key={index} className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.label}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <span className={cn(
                      'text-sm font-medium',
                      stat.change.direction === 'up' && 'text-green-600',
                      stat.change.direction === 'down' && 'text-red-600',
                      stat.change.direction === 'neutral' && 'text-gray-500'
                    )}>
                      {stat.change.direction === 'up' ? '+' : stat.change.direction === 'down' ? '-' : ''}
                      {isNaN(stat.change.value) ? '0' : Math.abs(stat.change.value)}%
                    </span>
                  )}
                </div>
              </div>
              {stat.icon && (
                <div className="p-3 rounded-lg bg-blue-50">
                  <div className="text-blue-600">
                    {stat.icon}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
