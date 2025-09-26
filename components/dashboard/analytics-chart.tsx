'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface AnalyticsChartProps {
  title: string;
  data: ChartData[];
  type: 'bar' | 'pie' | 'line' | 'area';
  height?: number;
  className?: string;
}

export function AnalyticsChart({ 
  title, 
  data, 
  type, 
  height = 300, 
  className 
}: AnalyticsChartProps) {
  // Safely calculate maxValue with fallback
  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value || 0)) : 1;
  
  // Early return for invalid data
  if (!data || data.length === 0) {
    return (
      <Card className={cn("group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-slate-200 bg-white hover:shadow-md", className)}>
        <CardHeader className="relative z-10">
          <CardTitle className="text-lg font-semibold text-slate-900">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-center justify-center h-32 text-slate-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const renderBarChart = () => (
    <div className="space-y-2">
      {data.map((item, index) => {
        // Safely calculate percentage with NaN protection
        const safeValue = isNaN(item.value) ? 0 : item.value;
        const safeMaxValue = isNaN(maxValue) || maxValue === 0 ? 1 : maxValue;
        const percentage = Math.min(100, Math.max(0, (safeValue / safeMaxValue) * 100));
        
        return (
          <div key={item.name} className="flex items-center gap-3">
            <div className="w-20 text-sm text-gray-600 truncate">
              {item.name}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  item.color || `bg-blue-${500 + (index * 100)}`
                )}
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color || `hsl(${200 + index * 40}, 70%, 50%)`
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {safeValue}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + (isNaN(item.value) ? 0 : item.value), 0);
    let cumulativePercentage = 0;

    return (
      <div className="relative w-full h-full">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {data.map((item, index) => {
            const safeValue = isNaN(item.value) ? 0 : item.value;
            const safeTotal = isNaN(total) || total === 0 ? 1 : total;
            const percentage = (safeValue / safeTotal) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
            
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

            cumulativePercentage += percentage;

            return (
              <path
                key={item.name}
                d={pathData}
                fill={item.color || `hsl(${200 + index * 40}, 70%, 50%)`}
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold">{total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>
    );
  };

  const renderLineChart = () => (
    <div className="space-y-2">
      <div className="relative h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-blue-500"
            points={data.map((item, index) => 
              `${data.length > 1 ? (index / (data.length - 1)) * 100 : 50},${100 - ((item.value || 0) / maxValue) * 100}`
            ).join(' ')}
          />
          {data.map((item, index) => (
            <circle
              key={item.name}
              cx={data.length > 1 ? (index / (data.length - 1)) * 100 : 50}
              cy={100 - ((item.value || 0) / maxValue) * 100}
              r="1"
              fill="currentColor"
              className="text-blue-500"
            />
          ))}
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        {data.map((item, index) => (
          <div key={item.name} className="text-center">
            <div className="font-medium">{item.value}</div>
            <div className="truncate max-w-16">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAreaChart = () => (
    <div className="space-y-2">
      <div className="relative h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" className="text-blue-500" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" className="text-blue-500" />
            </linearGradient>
          </defs>
          <path
            d={`M 0,100 ${data.map((item, index) => 
              `L ${data.length > 1 ? (index / (data.length - 1)) * 100 : 50},${100 - ((item.value || 0) / maxValue) * 100}`
            ).join(' ')} L 100,100 Z`}
            fill="url(#areaGradient)"
            className="text-blue-500"
          />
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-blue-500"
            points={data.map((item, index) => 
              `${data.length > 1 ? (index / (data.length - 1)) * 100 : 50},${100 - ((item.value || 0) / maxValue) * 100}`
            ).join(' ')}
          />
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        {data.map((item, index) => (
          <div key={item.name} className="text-center">
            <div className="font-medium">{item.value}</div>
            <div className="truncate max-w-16">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'line':
        return renderLineChart();
      case 'area':
        return renderAreaChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <Card className={cn("group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-slate-200 bg-white hover:shadow-md", className)}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-lg font-semibold text-slate-900">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div style={{ height: `${height}px` }}>
          {data.length > 0 ? renderChart() : (
            <div className="flex items-center justify-center h-full text-slate-500">
              No data available
            </div>
          )}
        </div>
      </CardContent>

      {/* Animated border on hover */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary-200/50 transition-colors duration-300" />
    </Card>
  );
}
