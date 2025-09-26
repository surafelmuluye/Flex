"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  MessageSquare, 
  Building, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SimpleDashboardLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home,
    badge: null
  },
  { 
    name: 'Reviews', 
    href: '/dashboard/reviews', 
    icon: MessageSquare,
    badge: null
  },
  { 
    name: 'Properties', 
    href: '/dashboard/properties', 
    icon: Building,
    badge: null
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: BarChart3,
    badge: null
  },
]

export function SimpleDashboardLayout({
  children,
  title,
  description,
  actions
}: SimpleDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden transition-all duration-300",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div 
          className="fixed inset-0 bg-black/50" 
          onClick={() => setSidebarOpen(false)} 
        />
        <div className="fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 shadow-xl">
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Flex Reviews
              </h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarOpen(false)}
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
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Flex Reviews
                </h1>
                <p className="text-xs text-gray-500">Property Management</p>
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
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary-100 text-primary-700"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-3" />
              <input
                className="block h-10 w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-10 pr-3 text-sm placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 sm:text-sm sm:leading-6"
                placeholder="Search properties, reviews..."
                type="search"
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary-600 text-white">
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
            {(title || description || actions) && (
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    {title && (
                      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        {title}
                      </h1>
                    )}
                    {description && (
                      <p className="mt-2 text-lg text-gray-600">
                        {description}
                      </p>
                    )}
                  </div>
                  {actions && (
                    <div className="flex items-center gap-3">
                      {actions}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main content */}
            <div>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Simple Stats Card Component
interface SimpleStatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  loading?: boolean
}

export function SimpleStatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  loading = false
}: SimpleStatsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
          </CardTitle>
          <div className="h-4 w-4 bg-gray-200 animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-3 w-32 bg-gray-200 animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon && (
          <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {value}
        </div>
        {description && (
          <p className="text-xs text-gray-500">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Simple Section Component
interface SimpleSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function SimpleSection({ 
  title, 
  description, 
  children, 
  actions, 
  className
}: SimpleSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
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
