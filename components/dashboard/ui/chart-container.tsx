'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Download,
  MoreHorizontal,
  Calendar,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  actions?: React.ReactNode;
  onExport?: () => void;
  onFilter?: () => void;
  onDateRange?: () => void;
}

export function ChartContainer({
  title,
  subtitle,
  children,
  loading = false,
  className,
  actions,
  onExport,
  onFilter,
  onDateRange
}: ChartContainerProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 bg-gray-300 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-300 rounded w-20 animate-pulse"></div>
              <div className="h-8 bg-gray-300 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-300 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>{title}</span>
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onDateRange && (
              <Button variant="outline" size="sm" onClick={onDateRange}>
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            )}
            {onFilter && (
              <Button variant="outline" size="sm" onClick={onFilter}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            {actions}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

// Simple chart components for demonstration
export function SimpleBarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const maxValue = Math.max(...data);
  
  return (
    <div className="h-64 flex items-end space-x-2 p-4">
      {data.map((value, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div className="w-full bg-blue-100 rounded-t">
            <div
              className="bg-blue-600 rounded-t transition-all duration-500"
              style={{ height: `${(value / maxValue) * 200}px` }}
            />
          </div>
          <div className="text-xs text-gray-600 mt-2 text-center">
            {labels[index]}
          </div>
          <div className="text-xs font-medium text-gray-900 mt-1">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SimpleLineChart({ data, labels }: { data: number[]; labels: string[] }) {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;
  
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - ((value - minValue) / range) * 100
  }));

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className="h-64 p-4">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d={pathData}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="0.5"
          className="transition-all duration-500"
        />
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="1"
            fill="#3B82F6"
            className="transition-all duration-500"
          />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-gray-600 mt-2">
        {labels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
    </div>
  );
}

export function SimplePieChart({ data, labels }: { data: number[]; labels: string[] }) {
  const total = data.reduce((sum, value) => sum + value, 0);
  let cumulativePercentage = 0;

  return (
    <div className="h-64 flex items-center justify-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {data.map((value, index) => {
            const percentage = (value / total) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
            
            cumulativePercentage += percentage;

            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
            const color = colors[index % colors.length];

            const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);

            const largeArcFlag = percentage > 50 ? 1 : 0;

            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            return (
              <path
                key={index}
                d={pathData}
                fill={color}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}


