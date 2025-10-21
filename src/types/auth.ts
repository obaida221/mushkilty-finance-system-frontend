// User and Authentication Types (Based on Actual Backend Response)
import type { BaseEntity } from './common';

export interface User extends BaseEntity {
  email: string
  name: string
  role_id?: number
  role?: Role
  permissions?: Permission[]  // Direct permissions array from backend
}

export interface Role {
  id: number
  name: string
  description: string
  users?: User[]
  rolePermissions?: RolePermission[]
}

export interface Permission {
  id: number
  name: string
  description: string | null
}

export interface RolePermission {
  permission: Permission
}

// Auth API Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
  role_id: number
}

export interface LoginResponse {
  access_token: string
  user: User
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<LoginResponse>
  register: (userData: RegisterRequest) => Promise<User>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
}

// Backend permission response structure
export interface BackendPermissionResponse {
  user: {
    id: number
    email: string
    name: string
  }
  role: {
    id: number
    name: string
    description: string
  }
  permissions: Permission[]
}