"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Home, 
  MessageSquare, 
  Building, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  Menu,
  X
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface ShadcnDashboardLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
  onRefresh?: () => void
  onExport?: () => void
  loading?: boolean
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Reviews', href: '/dashboard/reviews', icon: MessageSquare },
  { name: 'Properties', href: '/dashboard/properties', icon: Building },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
]

export function ShadcnDashboardLayout({
  children,
  title,
  description,
  actions,
  onRefresh,
  onExport,
  loading = false
}: ShadcnDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-background border-r">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-xl font-semibold">Flex Reviews</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="px-4 py-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background border-r px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-semibold">Flex Reviews</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <Link
                  href="/dashboard/settings"
                  className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Settings className="h-5 w-5 shrink-0" />
                  Settings
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Separator orientation="vertical" className="h-6 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground pl-3" />
              <input
                className="block h-10 w-full rounded-md border border-input bg-background py-1.5 pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring sm:text-sm sm:leading-6"
                placeholder="Search..."
                type="search"
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-x-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">M</span>
                </div>
                <span className="hidden lg:block text-sm font-medium">Manager</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Page header */}
            {(title || description || actions || onRefresh || onExport) && (
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    {title && (
                      <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {title}
                      </h1>
                    )}
                    {description && (
                      <p className="mt-2 text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {onRefresh && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={loading}
                      >
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        Refresh
                      </Button>
                    )}
                    {onExport && (
                      <Button variant="outline" size="sm" onClick={onExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    )}
                    {actions}
                  </div>
                </div>
              </div>
            )}

            {/* Main content */}
            <div className={cn(
              "transition-opacity duration-200",
              loading && "opacity-50 pointer-events-none"
            )}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Dashboard Stats Card Component
interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    period: string
  }
  loading?: boolean
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  loading = false 
}: StatsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </CardTitle>
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
          <div className="h-3 w-32 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            <span className={cn(
              "text-xs font-medium",
              trend.direction === 'up' && "text-green-600",
              trend.direction === 'down' && "text-red-600",
              trend.direction === 'neutral' && "text-muted-foreground"
            )}>
              {trend.direction === 'up' && '+'}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              {trend.period}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Dashboard Section Component
interface DashboardSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function DashboardSection({ 
  title, 
  description, 
  children, 
  actions, 
  className 
}: DashboardSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
