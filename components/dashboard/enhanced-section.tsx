"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, MoreHorizontal } from "lucide-react"

interface EnhancedSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
  variant?: 'default' | 'minimal' | 'elevated'
  badge?: string
  badgeColor?: string
}

export function EnhancedSection({ 
  title, 
  description, 
  children, 
  actions,
  className,
  variant = 'default',
  badge,
  badgeColor
}: EnhancedSectionProps) {
  const variantStyles = {
    default: "space-y-6",
    minimal: "space-y-4",
    elevated: "space-y-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm"
  }

  return (
    <div className={cn(variantStyles[variant], className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {title}
              </h2>
              {badge && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs font-medium",
                    badgeColor || "bg-primary-100 text-primary-700"
                  )}
                >
                  {badge}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-slate-600 mt-1 text-sm">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      
      <div className="relative">
        {children}
      </div>
    </div>
  )
}





