'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight,
  MoreHorizontal,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'minimal';
  loading?: boolean;
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  onViewAll?: () => void;
  viewAllLabel?: string;
}

export function Section({
  title,
  subtitle,
  children,
  actions,
  className,
  variant = 'default',
  loading = false,
  emptyState,
  onViewAll,
  viewAllLabel = 'View All'
}: SectionProps) {
  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
          <div className="h-32 bg-gray-300 rounded animate-pulse"></div>
        </div>
      );
    }

    if (emptyState && React.Children.count(children) === 0) {
      return (
        <div className="text-center py-12">
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
        </div>
      );
    }

    return children;
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {actions}
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            {viewAllLabel}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (variant === 'minimal') {
    return (
      <div className={cn('space-y-6', className)}>
        {renderHeader()}
        {renderContent()}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={cn('transition-all duration-200 hover:shadow-md', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {actions}
              {onViewAll && (
                <Button variant="ghost" size="sm" onClick={onViewAll}>
                  {viewAllLabel}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {renderHeader()}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-6">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}

// Grid Section Component
interface GridSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean;
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

export function GridSection({
  title,
  subtitle,
  children,
  columns = 3,
  gap = 'md',
  className,
  loading = false,
  emptyState
}: GridSectionProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  const gapSizes = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={cn('grid', gridCols[columns], gapSizes[gap])}>
          {Array.from({ length: columns }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-300 rounded-lg"></div>
            </div>
          ))}
        </div>
      );
    }

    if (emptyState && React.Children.count(children) === 0) {
      return (
        <div className="text-center py-12">
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
        </div>
      );
    }

    return (
      <div className={cn('grid', gridCols[columns], gapSizes[gap])}>
        {children}
      </div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      {renderContent()}
    </div>
  );
}


