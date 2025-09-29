"use client"

import type React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { LoginPage } from "@/pages/LoginPage"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: { resource: string; action: string }
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { user, hasPermission, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">تم رفض الوصول</h1>
          <p className="text-muted-foreground">ليس لديك صلاحية للوصول إلى هذه الصفحة.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
