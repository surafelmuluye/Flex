"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  MessageSquare, 
  Building, 
  BarChart3, 
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Shield,
  Globe,
  Moon,
  Sun,
  Palette
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useCallback, useMemo } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { signOut } from "@/app/(login)/manager-actions"

interface EnhancedSidebarProps {
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
    badge: null,
    description: 'Overview and insights'
  },
  { 
    name: 'Reviews', 
    href: '/dashboard/reviews', 
    icon: MessageSquare,
    badge: null,
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

// Quick Actions removed for cleaner UI

export function EnhancedSidebar({
  children,
  title,
  description,
  actions
}: EnhancedSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Memoized navigation items to prevent unnecessary re-renders
  const navigationItems = useMemo(() => navigation, [])

  // Optimized handlers with useCallback
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const handleCollapseToggle = useCallback(() => {
    setCollapsed(prev => !prev)
  }, [])

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  // Handle scroll detection for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Mobile sidebar overlay */}
        <div className={cn(
          "fixed inset-0 z-50 lg:hidden transition-all duration-300",
          sidebarOpen ? "block" : "hidden"
        )}>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={handleCloseSidebar} 
          />
          <div className="fixed left-0 top-0 h-full w-80 bg-white border-r border-slate-200 shadow-2xl">
            <SidebarContent 
              onClose={handleCloseSidebar}
              isMobile={true}
            />
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300",
          collapsed ? "lg:w-16" : "lg:w-72"
        )}>
          <SidebarContent 
            collapsed={collapsed}
            onToggleCollapse={handleCollapseToggle}
            isMobile={false}
          />
          
          {/* Expand button for collapsed state - positioned outside sidebar */}
          {collapsed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCollapseToggle}
              className="absolute -right-4 top-8 p-0 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-700 border-slate-300 shadow-md hover:shadow-lg transition-all duration-200 h-8 w-8 z-20"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Main content */}
        <div className={cn(
          "transition-all duration-300",
          collapsed ? "lg:pl-16" : "lg:pl-72"
        )}>
          {/* Enhanced Top navigation */}
          <div className={cn(
            "sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-white/80 backdrop-blur-md px-4 shadow-sm transition-all duration-200 sm:gap-x-6 sm:px-6 lg:px-8",
            isScrolled ? "shadow-lg border-slate-200/50" : "shadow-sm border-slate-200"
          )}>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden hover:bg-slate-100"
              onClick={handleSidebarToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1 items-center">
                {/* Search removed */}
              </div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* Notification removed */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-slate-100">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                          M
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:block text-sm font-medium">Manager</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <form action={signOut}>
                      <DropdownMenuItem 
                        className="text-red-600 cursor-pointer"
                        asChild
                      >
                        <button type="submit" className="w-full flex items-center">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Sign out</span>
                        </button>
                      </DropdownMenuItem>
                    </form>
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
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                          {title}
                        </h1>
                      )}
                      {description && (
                        <p className="mt-2 text-lg text-slate-600">
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
              <div className="flex-1 overflow-auto">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}

interface SidebarContentProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onClose?: () => void
  isMobile: boolean
}

function SidebarContent({ collapsed = false, onToggleCollapse, onClose, isMobile }: SidebarContentProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Memoized navigation items to prevent unnecessary re-renders
  const navigationItems = useMemo(() => navigation, [])

  // Optimized navigation click handler
  const handleNavigationClick = useCallback((href: string) => {
    router.push(href)
    if (isMobile) {
      onClose?.()
    }
  }, [router, isMobile, onClose])

  return (
    <div className={cn(
      "flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-slate-200 pb-4",
      collapsed ? "px-2" : "px-6"
    )}>
      {/* Logo and Brand */}
      <div className={cn(
        "flex h-16 shrink-0 items-center relative",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <div className={cn(
          "flex items-center",
          collapsed ? "" : "space-x-3"
        )}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Flex.global
              </h1>
              <p className="text-xs text-slate-500">Reviews Dashboard</p>
            </div>
          )}
        </div>
        {!isMobile && !collapsed && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleCollapse}
            className="p-0 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-700 border-slate-300 shadow-md hover:shadow-lg transition-all duration-200 h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <Separator className={cn(
        "my-4",
        collapsed ? "mx-2" : "mx-0"
      )} />
      
      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul className="flex flex-1 flex-col gap-y-1">
          <li>
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleNavigationClick(item.href)}
                            className={cn(
                              "flex items-center justify-center rounded-lg p-3 text-sm font-medium transition-all duration-150 hover:scale-105 w-full",
                              isActive
                                ? "bg-primary-100 text-primary-700 shadow-sm"
                                : "text-slate-700 hover:bg-slate-100"
                            )}
                          >
                            <item.icon className={cn(
                              "h-5 w-5",
                              isActive ? "text-primary-600" : "text-slate-600"
                            )} />
                            {item.badge && (
                              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="ml-2">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.description}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <button
                        onClick={() => handleNavigationClick(item.href)}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:scale-[1.02] relative w-full text-left",
                          isActive
                            ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 shadow-sm border border-primary-200/50"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 transition-colors",
                          isActive ? "text-primary-600" : "text-slate-500 group-hover:text-slate-700"
                        )} />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs transition-all duration-200",
                              "bg-slate-100 text-slate-600"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {isActive && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-l-full"></div>
                        )}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </li>
          
        </ul>
      </nav>

    </div>
  )
}
