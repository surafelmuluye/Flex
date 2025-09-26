'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw,
  Download,
  Filter,
  Search,
  Grid,
  List,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
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
  showViewToggle?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showRefresh?: boolean;
  showExport?: boolean;
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}

export function PageWrapper({
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
  onViewModeChange,
  showViewToggle = false,
  showSearch = false,
  showFilters = false,
  showRefresh = true,
  showExport = true,
  emptyState
}: PageWrapperProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showFiltersPanel, setShowFiltersPanel] = React.useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Page Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-2 text-lg">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Search */}
          {showSearch && onSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* View Mode Toggle */}
          {showViewToggle && onViewModeChange && (
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-none border-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-none border-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Filter Toggle */}
          {showFilters && filters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          )}

          {/* Refresh */}
          {showRefresh && onRefresh && (
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
          {showExport && onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}

          {/* Custom Actions */}
          {actions}

          {/* More Options */}
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFiltersPanel && filters && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            {filters}
          </CardContent>
        </Card>
      )}

      {/* Page Content */}
      <div className={cn(
        'transition-all duration-200',
        loading && 'opacity-50 pointer-events-none'
      )}>
        {children}
      </div>

      {/* Empty State */}
      {emptyState && (
        <Card className="text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-full">
                {emptyState.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {emptyState.title}
                </h3>
                <p className="text-gray-600 max-w-md">
                  {emptyState.description}
                </p>
              </div>
              {emptyState.action && (
                <Button onClick={emptyState.action.onClick}>
                  {emptyState.action.label}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


