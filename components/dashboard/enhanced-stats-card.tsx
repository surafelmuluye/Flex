"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface EnhancedStatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  loading?: boolean
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    period?: string
  }
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  className?: string
}

export function EnhancedStatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  loading = false,
  trend,
  variant = 'default',
  className
}: EnhancedStatsCardProps) {
  if (loading) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 w-24 bg-slate-200 animate-pulse rounded" />
          </CardTitle>
          <div className="h-8 w-8 bg-slate-200 animate-pulse rounded-lg" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-slate-200 animate-pulse rounded mb-2" />
          <div className="h-3 w-32 bg-slate-200 animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  const variantStyles = {
    default: "border-slate-200 bg-white hover:shadow-md",
    success: "border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-green-100",
    warning: "border-orange-200 bg-gradient-to-br from-orange-50 to-white hover:shadow-orange-100",
    error: "border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-red-100",
    info: "border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-blue-100"
  }

  const iconStyles = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-green-100 text-green-600",
    warning: "bg-orange-100 text-orange-600",
    error: "bg-red-100 text-red-600",
    info: "bg-blue-100 text-blue-600"
  }

  const trendStyles = {
    up: "text-green-600 bg-green-50",
    down: "text-red-600 bg-red-50",
    neutral: "text-slate-600 bg-slate-50"
  }

  const TrendIcon = trend?.direction === 'up' ? TrendingUp : 
                   trend?.direction === 'down' ? TrendingDown : Minus

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
      variantStyles[variant],
      className
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn(
            "p-2 rounded-lg transition-all duration-200 group-hover:scale-110",
            iconStyles[variant]
          )}>
            {icon}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <div className="text-3xl font-bold text-slate-900">
            {value}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              trendStyles[trend.direction]
            )}>
              <TrendIcon className="h-3 w-3" />
              <span>{isNaN(trend.value) ? '0' : Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-slate-500">
            {description}
          </p>
        )}
        
        {trend?.period && (
          <p className="text-xs text-slate-400 mt-1">
            {trend.period}
          </p>
        )}
      </CardContent>

      {/* Animated border on hover */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary-200/50 transition-colors duration-300" />
    </Card>
  )
}
