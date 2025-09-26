'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  TrendingUp,
  ArrowRight,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  type: 'success' | 'warning' | 'error' | 'info' | 'trend';
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const insightStyles = {
  success: {
    card: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    title: 'text-green-900',
    description: 'text-green-700',
    button: 'bg-green-600 hover:bg-green-700 text-white'
  },
  warning: {
    card: 'bg-orange-50 border-orange-200',
    icon: 'text-orange-600',
    title: 'text-orange-900',
    description: 'text-orange-700',
    button: 'bg-orange-600 hover:bg-orange-700 text-white'
  },
  error: {
    card: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    title: 'text-red-900',
    description: 'text-red-700',
    button: 'bg-red-600 hover:bg-red-700 text-white'
  },
  info: {
    card: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    description: 'text-blue-700',
    button: 'bg-blue-600 hover:bg-blue-700 text-white'
  },
  trend: {
    card: 'bg-purple-50 border-purple-200',
    icon: 'text-purple-600',
    title: 'text-purple-900',
    description: 'text-purple-700',
    button: 'bg-purple-600 hover:bg-purple-700 text-white'
  }
};

const getIcon = (type: InsightCardProps['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5" />;
    case 'error':
      return <AlertTriangle className="h-5 w-5" />;
    case 'info':
      return <Info className="h-5 w-5" />;
    case 'trend':
      return <TrendingUp className="h-5 w-5" />;
    default:
      return <Info className="h-5 w-5" />;
  }
};

export function InsightCard({
  type,
  title,
  description,
  action,
  dismissible = false,
  onDismiss,
  className
}: InsightCardProps) {
  const styles = insightStyles[type];
  const icon = getIcon(type);

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md', styles.card, className)}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={cn('flex-shrink-0 mt-0.5', styles.icon)}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={cn('font-semibold mb-1', styles.title)}>
              {title}
            </h4>
            <p className={cn('text-sm mb-3', styles.description)}>
              {description}
            </p>
            {action && (
              <div className="flex items-center space-x-2">
                {action.href ? (
                  <Button
                    size="sm"
                    className={cn('text-xs', styles.button)}
                    asChild
                  >
                    <a href={action.href} className="flex items-center">
                      {action.label}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className={cn('text-xs', styles.button)}
                    onClick={action.onClick}
                  >
                    {action.label}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            )}
          </div>
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className={cn('flex-shrink-0 p-1 rounded-full hover:bg-white/50 transition-colors', styles.icon)}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


