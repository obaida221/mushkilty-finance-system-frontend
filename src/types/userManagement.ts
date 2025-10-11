import type { Role, Permission } from './auth'

// User Management Request/Response Types
export interface CreateUserRequest {
  email: string
  name?: string
  password?: string
  password_hash?: string
  role_id: number
}

export interface UpdateUserRequest {
  email?: string
  name?: string
  password?: string
  role_id?: number
}

export interface CreateRoleRequest {
  name: string
  description: string
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
}

export interface CreatePermissionRequest {
  name: string
  description: string
}

export interface AssignPermissionsRequest {
  permissions?: string[]
  permissionIds?: number[]
  replace?: boolean
}

export interface RolePermissionsResponse {
  role: Role
  permissions: Permission[]
}