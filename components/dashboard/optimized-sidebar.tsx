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
  Settings,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Clock,
  Star
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useCallback } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface OptimizedSidebarProps {
  children: React.ReactNode
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  badgeColor?: string
  isActive?: boolean
}

export function OptimizedSidebar({ children }: OptimizedSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Memoized navigation items to prevent unnecessary re-renders
  const navigationItems = React.useMemo((): NavItem[] => [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard"
    },
    {
      title: "Properties",
      href: "/dashboard/properties",
      icon: Building,
      isActive: pathname.startsWith("/dashboard/properties")
    },
    {
      title: "Reviews",
      href: "/dashboard/reviews",
      icon: MessageSquare,
      badge: "3",
      badgeColor: "bg-yellow-100 text-yellow-700",
      isActive: pathname.startsWith("/dashboard/reviews")
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      isActive: pathname.startsWith("/dashboard/analytics")
    },
  ], [pathname])

  // Optimized toggle function with useCallback
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  const toggleExpanded = useCallback((itemTitle: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemTitle)) {
        newSet.delete(itemTitle)
      } else {
        newSet.add(itemTitle)
      }
      return newSet
    })
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Optimized Sidebar */}
      <div className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Flex Reviews</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10 px-3 transition-all duration-200",
                    item.isActive 
                      ? "bg-primary-600 text-white shadow-sm" 
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", item.badgeColor)}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 px-3 hover:bg-gray-100",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback className="bg-primary-100 text-primary-600">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="ml-3 text-left">
                    <p className="text-sm font-medium text-gray-900">Manager</p>
                    <p className="text-xs text-gray-500">admin@flex.com</p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
