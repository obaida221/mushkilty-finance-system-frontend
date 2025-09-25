"use client"

import type React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  Receipt,
  TrendingDown,
  RotateCcw,
  Percent,
  Wallet,
  BarChart3,
  Building2,
  LogOut,
  UserCheck,
} from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: { resource: string; action: string }
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users & Roles", href: "/users", icon: UserCheck, permission: { resource: "users", action: "manage" } },
  { name: "Students", href: "/students", icon: GraduationCap, permission: { resource: "students", action: "manage" } },
  { name: "Courses", href: "/courses", icon: BookOpen, permission: { resource: "courses", action: "manage" } },
  { name: "Teachers", href: "/teachers", icon: Users, permission: { resource: "courses", action: "manage" } },
  {
    name: "Transactions",
    href: "/transactions",
    icon: Receipt,
    permission: { resource: "finance", action: "view" },
  },
  { name: "Payments", href: "/payments", icon: CreditCard, permission: { resource: "finance", action: "manage" } },
  { name: "Expenses", href: "/expenses", icon: TrendingDown, permission: { resource: "finance", action: "manage" } },
  { name: "Refunds", href: "/refunds", icon: RotateCcw, permission: { resource: "finance", action: "manage" } },
  { name: "Discounts", href: "/discounts", icon: Percent, permission: { resource: "finance", action: "manage" } },
  { name: "Payroll", href: "/payroll", icon: Wallet, permission: { resource: "finance", action: "manage" } },
  { name: "Analytics", href: "/analytics", icon: BarChart3, permission: { resource: "analytics", action: "view" } },
]

export function Sidebar() {
  const { user, logout, hasPermission } = useAuth()
  const location = useLocation()

  const filteredNavigation = navigation.filter((item) => {
    if (!item.permission) return true
    return hasPermission(item.permission.resource, item.permission.action)
  })

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">EduFinance</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          )
        })}
      </nav>

      {/* User info and logout */}
      <div className="border-t border-border p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">{user?.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role.name}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}