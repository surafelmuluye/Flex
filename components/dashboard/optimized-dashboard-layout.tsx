"use client"

import * as React from "react"
import { OptimizedSidebar } from "./optimized-sidebar"
import { cn } from "@/lib/utils"

interface OptimizedDashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export function OptimizedDashboardLayout({ 
  children, 
  className 
}: OptimizedDashboardLayoutProps) {
  return (
    <OptimizedSidebar>
      <main className={cn(
        "flex-1 overflow-auto bg-gray-50",
        className
      )}>
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </OptimizedSidebar>
  )
}





