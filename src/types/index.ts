// User and Authentication Types (Based on Actual Backend Response)
export interface User {
  id: number
  email: string
  name: string
  role_id?: number
  role?: Role
  permissions?: Permission[]  // Direct permissions array from backend
  created_at?: string
  updated_at?: string
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

// Student Types
export interface Student {
  id: string
  fullName: string
  email: string
  phone: string
  courseId: string | null
  course?: Course
  enrollmentDate: string | null
  status: "active" | "inactive" | "graduated"
  totalPaid: number
  totalDue: number
  discountId: string | null
  discount?: Discount
  createdAt: string
}

// Course Types
export interface Course {
  id: string
  name: string
  nameAr: string
  description: string
  price: number
  duration: number // in months
  teacherId: string | null
  teacher?: Teacher
  enrolledCount: number
  status: "active" | "inactive"
  createdAt: string
}

// Teacher Types
export interface Teacher {
  id: string
  fullName: string
  email: string
  phone: string
  specialization: string
  salary: number
  status: "active" | "inactive"
  createdAt: string
}

// Transaction Types
export interface Transaction {
  id: string
  type: "payment" | "expense" | "refund" | "payroll"
  amount: number
  description: string
  date: string
  referenceId: string | null // Links to payment, expense, refund, or payroll
  createdBy: string
  createdAt: string
}

// Payment Types
export interface Payment {
  id: string
  studentId: string
  student?: Student
  amount: number
  paymentMethod: "cash" | "card" | "bank_transfer" | "online"
  transactionId: string
  transaction?: Transaction
  date: string
  notes: string
  createdAt: string
}

// Expense Types
export interface Expense {
  id: string
  category: string
  description: string
  amount: number
  transactionId: string
  transaction?: Transaction
  date: string
  createdBy: string
  createdAt: string
}

// Refund Types
export interface Refund {
  id: string
  studentId: string
  student?: Student
  amount: number
  reason: string
  transactionId: string
  transaction?: Transaction
  date: string
  approvedBy: string
  createdAt: string
}

// Discount Types
export interface Discount {
  id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  description: string
  startDate: string
  endDate: string
  usageCount: number
  maxUsage: number | null
  isActive: boolean
  createdAt: string
}

// Payroll Types
export interface Payroll {
  id: string
  teacherId: string
  teacher?: Teacher
  amount: number
  bonus: number
  deductions: number
  netAmount: number
  month: string
  year: number
  transactionId: string
  transaction?: Transaction
  status: "pending" | "paid"
  paidDate: string | null
  createdAt: string
}

// Dashboard Stats
export interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  totalRefunds: number
  totalPayroll: number
  netProfit: number
  activeStudents: number
  activeCourses: number
  activeTeachers: number
}
