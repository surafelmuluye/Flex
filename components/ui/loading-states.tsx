import React from 'react';
import { cn } from '@/lib/utils';
import { AccessibleSpinner, ScreenReaderOnly } from './accessibility';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

// Enhanced loading and error state components

/**
 * Skeleton loader component
 */
export function Skeleton({ 
  className, 
  ...props 
}: { 
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
}

/**
 * Card skeleton loader
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-gray-200 p-6', className)}>
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table skeleton loader
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Enhanced loading component with different states
 */
export function LoadingState({
  type = 'spinner',
  size = 'md',
  message = 'Loading...',
  className
}: {
  type?: 'spinner' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full bg-primary-600 animate-bounce',
                  sizeClasses[size]
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return (
          <div
            className={cn(
              'rounded-full bg-primary-600 animate-pulse',
              sizeClasses[size]
            )}
          />
        );
      default:
        return <AccessibleSpinner size={size} label={message} />;
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      {renderLoader()}
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}

/**
 * Enhanced error state component
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  action,
  onRetry,
  className
}: {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4 p-8', className)}>
      <div className="rounded-full bg-red-100 p-3">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{message}</p>
      </div>
      <div className="flex space-x-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        )}
        {action}
      </div>
    </div>
  );
}

/**
 * Empty state component
 */
export function EmptyState({
  icon: Icon,
  title = 'No data available',
  message = 'There is no data to display at the moment.',
  action,
  className
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4 p-8', className)}>
      {Icon && (
        <div className="rounded-full bg-gray-100 p-3">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
      )}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{message}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * Connection status indicator
 */
export function ConnectionStatus({
  isOnline = true,
  isConnected = true,
  className
}: {
  isOnline?: boolean;
  isConnected?: boolean;
  className?: string;
}) {
  const getStatus = () => {
    if (!isOnline) return { icon: WifiOff, text: 'Offline', color: 'text-red-600' };
    if (!isConnected) return { icon: WifiOff, text: 'Disconnected', color: 'text-yellow-600' };
    return { icon: Wifi, text: 'Connected', color: 'text-green-600' };
  };

  const { icon: Icon, text, color } = getStatus();

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Icon className={cn('h-4 w-4', color)} />
      <span className={cn('text-sm font-medium', color)}>{text}</span>
    </div>
  );
}

/**
 * Progress indicator
 */
export function ProgressIndicator({
  value,
  max = 100,
  size = 'md',
  showLabel = true,
  className
}: {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Progress</span>
          <span className="text-gray-500">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className="h-full bg-primary-600 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`Progress: ${Math.round(percentage)}%`}
        />
      </div>
    </div>
  );
}

/**
 * Toast notification component
 */
export function Toast({
  type = 'info',
  title,
  message,
  onClose,
  className
}: {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}) {
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconClasses = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  };

  return (
    <div
      className={cn(
        'rounded-md border p-4 shadow-sm',
        typeClasses[type],
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className={cn('h-5 w-5', iconClasses[type])} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          <p className={cn('text-sm', title && 'mt-1')}>{message}</p>
        </div>
        {onClose && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <ScreenReaderOnly>Close</ScreenReaderOnly>
              <span className="sr-only">×</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Loading overlay component
 */
export function LoadingOverlay({
  isLoading,
  message = 'Loading...',
  children
}: {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <LoadingState message={message} />
      </div>
    </div>
  );
}


