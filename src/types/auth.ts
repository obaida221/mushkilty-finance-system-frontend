export interface User {
  id: string
  email: string
  name: string
  role: Role
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (resource: string, action: string) => boolean
  isLoading: boolean
}
