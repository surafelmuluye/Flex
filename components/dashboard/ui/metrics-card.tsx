'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period?: string;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
  className?: string;
}

const variantStyles = {
  default: {
    card: 'bg-white border-gray-200',
    icon: 'text-blue-600',
    value: 'text-gray-900',
    title: 'text-gray-600',
    subtitle: 'text-gray-500'
  },
  success: {
    card: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    value: 'text-green-900',
    title: 'text-green-700',
    subtitle: 'text-green-600'
  },
  warning: {
    card: 'bg-orange-50 border-orange-200',
    icon: 'text-orange-600',
    value: 'text-orange-900',
    title: 'text-orange-700',
    subtitle: 'text-orange-600'
  },
  danger: {
    card: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    value: 'text-red-900',
    title: 'text-red-700',
    subtitle: 'text-red-600'
  },
  info: {
    card: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    value: 'text-blue-900',
    title: 'text-blue-700',
    subtitle: 'text-blue-600'
  }
};

export function MetricsCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  loading = false,
  className
}: MetricsCardProps) {
  const styles = variantStyles[variant];

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded mb-2 w-24"></div>
              <div className="h-8 bg-gray-300 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-300 rounded w-20"></div>
            </div>
            <div className="p-3 rounded-lg bg-gray-200">
              <div className="h-6 w-6 bg-gray-300 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md', styles.card, className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={cn('text-sm font-medium mb-1', styles.title)}>
              {title}
            </p>
            <div className="flex items-center space-x-2 mb-1">
              <p className={cn('text-2xl font-bold', styles.value)}>
                {value}
              </p>
              {getTrendIcon()}
            </div>
            {subtitle && (
              <p className={cn('text-sm', styles.subtitle)}>
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center space-x-1 mt-1">
                <span className={cn('text-sm font-medium', getTrendColor())}>
                  {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
                  {isNaN(trend.value) ? '0' : Math.abs(trend.value)}%
                </span>
                {trend.period && (
                  <span className={cn('text-xs', styles.subtitle)}>
                    vs {trend.period}
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className={cn('p-3 rounded-lg bg-white/50', styles.card)}>
              <div className={styles.icon}>
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
