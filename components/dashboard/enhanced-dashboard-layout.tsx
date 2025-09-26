"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/enhanced-card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
  X,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface EnhancedDashboardLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
  onRefresh?: () => void
  onExport?: () => void
  loading?: boolean
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home,
    badge: null,
    description: 'Overview and insights'
  },
  { 
    name: 'Reviews', 
    href: '/dashboard/reviews', 
    icon: MessageSquare,
    badge: '3',
    description: 'Manage guest reviews'
  },
  { 
    name: 'Properties', 
    href: '/dashboard/properties', 
    icon: Building,
    badge: null,
    description: 'Property management'
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: BarChart3,
    badge: null,
    description: 'Performance insights'
  },
]

export function EnhancedDashboardLayout({
  children,
  title,
  description,
  actions,
  onRefresh,
  onExport,
  loading = false
}: EnhancedDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Implement search logic here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden transition-all duration-300",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
        <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-2xl">
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Flex Reviews
              </h1>
            </div>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={() => setSidebarOpen(false)}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  )} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className={cn(
                      "text-xs mt-0.5",
                      isActive ? "text-primary-100" : "text-slate-500 dark:text-slate-400"
                    )}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-80 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Flex Reviews
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Property Management</p>
              </div>
            </div>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-2">
              <li>
                <ul className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                          )}
                        >
                          <item.icon className={cn(
                            "h-5 w-5 transition-colors",
                            isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                          )} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span>{item.name}</span>
                              {item.badge && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className={cn(
                              "text-xs mt-0.5",
                              isActive ? "text-primary-100" : "text-slate-500 dark:text-slate-400"
                            )}>
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <Link
                  href="/dashboard/settings"
                  className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200"
                >
                  <Settings className="h-5 w-5 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Separator orientation="vertical" className="h-6 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 pl-3" />
              <input
                className="block h-10 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-1.5 pl-10 pr-3 text-sm ring-offset-background placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 sm:text-sm sm:leading-6"
                placeholder="Search properties, reviews..."
                type="search"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button 
                variant="ghost" 
                size="icon-sm"
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon-sm"
                onClick={toggleTheme}
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:block text-sm font-medium">Manager</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Page header */}
            {(title || description || actions || onRefresh || onExport) && (
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    {title && (
                      <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                        {title}
                      </h1>
                    )}
                    {description && (
                      <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
                        {description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {onRefresh && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={loading}
                        leftIcon={<RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />}
                      >
                        Refresh
                      </Button>
                    )}
                    {onExport && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onExport}
                        leftIcon={<Download className="h-4 w-4" />}
                      >
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
              "transition-all duration-300",
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

// Enhanced Stats Card Component
interface EnhancedStatsCardProps {
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
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  gradient?: boolean
}

export function EnhancedStatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  loading = false,
  variant = 'default',
  gradient = false
}: EnhancedStatsCardProps) {
  const variantStyles = {
    default: 'border-slate-200 dark:border-slate-700',
    success: 'border-success-200 dark:border-success-800 bg-success-50/50 dark:bg-success-900/20',
    warning: 'border-warning-200 dark:border-warning-800 bg-warning-50/50 dark:bg-warning-900/20',
    error: 'border-error-200 dark:border-error-800 bg-error-50/50 dark:bg-error-900/20',
    info: 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/20',
  }

  const iconStyles = {
    default: 'text-slate-600 dark:text-slate-400',
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    error: 'text-error-600 dark:text-error-400',
    info: 'text-primary-600 dark:text-primary-400',
  }

  if (loading) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
          </CardTitle>
          <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mb-2" />
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
        variantStyles[variant],
        gradient && "bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn("p-2 rounded-lg bg-slate-100 dark:bg-slate-800", iconStyles[variant])}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          {value}
        </div>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            <span className={cn(
              "text-xs font-medium flex items-center",
              trend.direction === 'up' && "text-success-600 dark:text-success-400",
              trend.direction === 'down' && "text-error-600 dark:text-error-400",
              trend.direction === 'neutral' && "text-slate-500 dark:text-slate-400"
            )}>
              {trend.direction === 'up' && '↗'}
              {trend.direction === 'down' && '↘'}
              {trend.direction === 'neutral' && '→'}
              {trend.value}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
              {trend.period}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced Section Component
interface EnhancedSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
  variant?: 'default' | 'card' | 'minimal'
}

export function EnhancedSection({ 
  title, 
  description, 
  children, 
  actions, 
  className,
  variant = 'default'
}: EnhancedSectionProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            {description && (
              <p className="text-slate-600 dark:text-slate-400 mt-1">{description}</p>
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

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          {description && (
            <p className="text-slate-600 dark:text-slate-400 mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-6">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}
