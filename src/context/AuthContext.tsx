"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, Role } from "../types"

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (resource: string, action: string) => boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock data for demonstration
const mockRoles: Role[] = [
  {
    id: "1",
    name: "Admin",
    nameAr: "مدير النظام",
    description: "Full system access",
    permissions: [
      { id: "1", name: "Manage Users", nameAr: "إدارة المستخدمين", resource: "users", action: "create" },
      { id: "2", name: "View Users", nameAr: "عرض المستخدمين", resource: "users", action: "read" },
      { id: "3", name: "Manage Students", nameAr: "إدارة الطلاب", resource: "students", action: "create" },
      { id: "4", name: "Manage Finances", nameAr: "إدارة المالية", resource: "finances", action: "create" },
    ],
  },
  {
    id: "2",
    name: "Accountant",
    nameAr: "محاسب",
    description: "Financial management access",
    permissions: [
      { id: "2", name: "View Users", nameAr: "عرض المستخدمين", resource: "users", action: "read" },
      { id: "3", name: "Manage Students", nameAr: "إدارة الطلاب", resource: "students", action: "create" },
      { id: "4", name: "Manage Finances", nameAr: "إدارة المالية", resource: "finances", action: "create" },
    ],
  },
]

const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    fullName: "أحمد محمد",
    roleId: "1",
    role: mockRoles[0],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "accountant",
    email: "accountant@example.com",
    fullName: "فاطمة علي",
    roleId: "2",
    role: mockRoles[1],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    // Mock login - in production, this would call an API
    const foundUser = mockUsers.find((u) => u.username === username)
    if (foundUser && password === "password") {
      setUser(foundUser)
      localStorage.setItem("user", JSON.stringify(foundUser))
    } else {
      throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة")
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user || !user.role) return false
    return user.role.permissions.some((p) => p.resource === resource && p.action === action)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, isLoading }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
