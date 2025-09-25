export interface User {
  id: string
  email: string
  name: string
  role: Role
  permissions: Permission[]
  createdAt: string
  updatedAt: string
  status: "active" | "inactive"
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

export interface CreateUserData {
  email: string
  name: string
  roleId: string
  password: string
}

export interface CreateRoleData {
  name: string
  description: string
  permissionIds: string[]
}
