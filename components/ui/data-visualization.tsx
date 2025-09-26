import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Progress } from './progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  PieChart, 
  LineChart,
  Activity,
  Target,
  Zap
} from 'lucide-react';

// Enhanced data visualization components

/**
 * Metric card with trend indicator
 */
export function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  description,
  className
}: {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  className?: string;
}) {
  const getTrendIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
            {change !== undefined && (
              <div className="flex items-center mt-2">
                {getTrendIcon()}
                <span className={cn('text-sm font-medium ml-1', getChangeColor())}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Simple bar chart component
 */
export function SimpleBarChart({
  data,
  title,
  description,
  className
}: {
  data: Array<{ label: string; value: number; color?: string }>;
  title?: string;
  description?: string;
  className?: string;
}) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
          </CardTitle>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-gray-600">{item.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-500',
                    item.color || 'bg-primary-600'
                  )}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Simple line chart component
 */
export function SimpleLineChart({
  data,
  title,
  description,
  className
}: {
  data: Array<{ label: string; value: number }>;
  title?: string;
  description?: string;
  className?: string;
}) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  // Simple SVG line chart
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            {title}
          </CardTitle>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        <div className="h-64 w-full">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-600"
              points={points}
            />
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.value - minValue) / range) * 100;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1"
                  fill="currentColor"
                  className="text-primary-600"
                />
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{data[0]?.label}</span>
          <span>{data[data.length - 1]?.label}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Simple pie chart component
 */
export function SimplePieChart({
  data,
  title,
  description,
  className
}: {
  data: Array<{ label: string; value: number; color?: string }>;
  title?: string;
  description?: string;
  className?: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-gray-500'
  ];

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            {title}
          </CardTitle>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            return (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className={cn(
                    'w-4 h-4 rounded-full',
                    item.color || colors[index % colors.length]
                  )}
                />
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-gray-600">{item.value}</span>
                  </div>
                  <Progress value={percentage} className="mt-1" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Performance indicator
 */
export function PerformanceIndicator({
  score,
  maxScore = 100,
  label,
  description,
  className
}: {
  score: number;
  maxScore?: number;
  label?: string;
  description?: string;
  className?: string;
}) {
  const percentage = (score / maxScore) * 100;
  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = () => {
    if (percentage >= 80) return <Target className="h-5 w-5 text-green-600" />;
    if (percentage >= 60) return <Activity className="h-5 w-5 text-yellow-600" />;
    return <Zap className="h-5 w-5 text-red-600" />;
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            {label && <p className="text-sm font-medium text-gray-600">{label}</p>}
            <p className={cn('text-2xl font-bold', getScoreColor())}>
              {score}/{maxScore}
            </p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {getScoreIcon()}
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0</span>
          <span>{maxScore}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Comparison chart
 */
export function ComparisonChart({
  data,
  title,
  description,
  className
}: {
  data: Array<{ 
    label: string; 
    current: number; 
    previous: number; 
    unit?: string;
  }>;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const change = item.previous > 0 
              ? ((item.current - item.previous) / item.previous) * 100 
              : 0;
            const changeType = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">
                      {item.current}{item.unit}
                    </span>
                    <Badge variant={changeType === 'positive' ? 'default' : changeType === 'negative' ? 'destructive' : 'secondary'}>
                      {change > 0 ? '+' : ''}{change.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span>Current: </span>
                    <span className="font-medium">{item.current}{item.unit}</span>
                  </div>
                  <div>
                    <span>Previous: </span>
                    <span className="font-medium">{item.previous}{item.unit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Data table with sorting and filtering
 */
export function DataTable({
  data,
  columns,
  title,
  description,
  className
}: {
  data: Array<Record<string, any>>;
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
  }>;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="text-left py-3 px-4 font-medium text-gray-700"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="py-3 px-4">
                      {column.render 
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}


