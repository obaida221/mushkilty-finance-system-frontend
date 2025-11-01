"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, AuthContextType, RegisterRequest, LoginResponse } from "../types"
import { authService } from "../services/authService"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Try to load user from localStorage on initial render
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchProfile = async () => {
    try {
      const userData = await authService.getProfile()

      // Store user data with permissions
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData)
    } catch (error) {
      console.error('Profile fetch error:', error)
      // Don't immediately logout on error - check if we have cached user data
      const cachedUser = localStorage.getItem('user');
      if (!cachedUser) {
        logout();
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const data = await authService.login(email, password)
      setToken(data.access_token)

      // Fetch user profile with permissions
      const profileData = await authService.getProfile()
      setUser(profileData)
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(profileData));

      return data
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: RegisterRequest): Promise<User> => {
    try {
      const data = await authService.register(userData)
      return data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setToken(null)
    setUser(null)
    // Force a reload to clear any cached state
    window.location.href = '/login';
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper hook to check permissions
export const usePermission = () => {
  const { user } = useAuth()

  const hasPermission = (permissionName: string): boolean => {
    return authService.hasPermission(user, permissionName)
  }

  return { hasPermission }
}
