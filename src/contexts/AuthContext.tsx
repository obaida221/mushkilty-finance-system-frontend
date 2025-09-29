"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, AuthContextType } from "@/types/auth"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data for demonstration
const mockUsers = [
  {
    id: "1",
    email: "admin@school.com",
    name: "مستخدم المدير",
    role: {
      id: "1",
      name: "admin",
      description: "مدير النظام",
      permissions: [
        { id: "1", name: "manage_users", description: "إدارة المستخدمين", resource: "users", action: "manage" },
        { id: "2", name: "manage_students", description: "إدارة الطلاب", resource: "students", action: "manage" },
        { id: "3", name: "manage_courses", description: "إدارة الدورات", resource: "courses", action: "manage" },
        { id: "4", name: "manage_finance", description: "إدارة المالية", resource: "finance", action: "manage" },
        { id: "5", name: "view_analytics", description: "عرض التحليلات", resource: "analytics", action: "view" },
        { id: "6", name: "view_finance", description: "عرض المالية", resource: "finance", action: "view" },
      ],
    },
    permissions: [
      { id: "1", name: "manage_users", description: "إدارة المستخدمين", resource: "users", action: "manage" },
      { id: "2", name: "manage_students", description: "إدارة الطلاب", resource: "students", action: "manage" },
      { id: "3", name: "manage_courses", description: "إدارة الدورات", resource: "courses", action: "manage" },
      { id: "4", name: "manage_finance", description: "إدارة المالية", resource: "finance", action: "manage" },
      { id: "5", name: "view_analytics", description: "عرض التحليلات", resource: "analytics", action: "view" },
      { id: "6", name: "view_finance", description: "عرض المالية", resource: "finance", action: "view" },
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "accountant@school.com",
    name: "مستخدم المحاسب",
    role: {
      id: "2",
      name: "accountant",
      description: "مدير مالي",
      permissions: [
        { id: "4", name: "manage_finance", description: "إدارة المالية", resource: "finance", action: "manage" },
        { id: "5", name: "view_analytics", description: "عرض التحليلات", resource: "analytics", action: "view" },
        { id: "6", name: "view_finance", description: "عرض المالية", resource: "finance", action: "view" },
      ],
    },
    permissions: [
      { id: "4", name: "manage_finance", description: "إدارة المالية", resource: "finance", action: "manage" },
      { id: "5", name: "view_analytics", description: "عرض التحليلات", resource: "analytics", action: "view" },
      { id: "6", name: "view_finance", description: "عرض المالية", resource: "finance", action: "view" },
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem("auth_token")
    const storedUser = localStorage.getItem("auth_user")

    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    // Mock authentication
    const foundUser = mockUsers.find((u) => u.email === email)

    if (foundUser && password === "password") {
      setUser(foundUser)
      localStorage.setItem("auth_token", "mock_token")
      localStorage.setItem("auth_user", JSON.stringify(foundUser))
    } else {
      throw new Error("بيانات اعتماد غير صحيحة")
    }

    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  }

  const hasPermission = (resource: string, action: string) => {
    if (!user) return false
    return user.permissions.some((p) => p.resource === resource && p.action === action)
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    hasPermission,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
