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
  { name: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
  { name: "المستخدمون والأدوار", href: "/users", icon: UserCheck, permission: { resource: "users", action: "manage" } },
  { name: "الطلاب", href: "/students", icon: GraduationCap, permission: { resource: "students", action: "manage" } },
  { name: "الدورات", href: "/courses", icon: BookOpen, permission: { resource: "courses", action: "manage" } },
  { name: "المدرسون", href: "/teachers", icon: Users, permission: { resource: "courses", action: "manage" } },
  {
    name: "المعاملات",
    href: "/transactions",
    icon: Receipt,
    permission: { resource: "finances", action: "manage" },
  },
  { name: "المدفوعات", href: "/payments", icon: CreditCard, permission: { resource: "finances", action: "manage" } },
  { name: "المصروفات", href: "/expenses", icon: TrendingDown, permission: { resource: "finances", action: "manage" } },
  {
    name: "المبالغ المستردة",
    href: "/refunds",
    icon: RotateCcw,
    permission: { resource: "finances", action: "manage" },
  },
  { name: "الخصومات", href: "/discounts", icon: Percent, permission: { resource: "finances", action: "manage" } },
  { name: "كشوف المرتبات", href: "/payroll", icon: Wallet, permission: { resource: "finances", action: "manage" } },
  { name: "التحليلات", href: "/analytics", icon: BarChart3, permission: { resource: "analytics", action: "view" } },
]

export function Sidebar() {
  const { user, logout, hasPermission } = useAuth()
  const location = useLocation()

  const filteredNavigation = navigation.filter((item) => {
    if (!item.permission) return true
    return hasPermission(item.permission.resource, item.permission.action)
  })

  return (
    <div className="flex h-full w-64 flex-col bg-card border-l border-border">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">إدارة التعليم المالي</span>
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
              <Icon className="ml-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          )
        })}
      </nav>

      {/* User info and logout */}
      <div className="border-t border-border p-4">
        <div className="flex items-center space-x-3 space-x-reverse mb-3">
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
          <LogOut className="ml-3 h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  )
}
