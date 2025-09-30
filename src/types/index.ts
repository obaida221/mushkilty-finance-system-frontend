// User and Authentication Types
export interface User {
  id: string
  username: string
  email: string
  fullName: string
  roleId: string
  role?: Role
  isActive: boolean
  createdAt: string
}

export interface Role {
  id: string
  name: string
  nameAr: string
  description: string
  permissions: Permission[]
}

export interface Permission {
  id: string
  name: string
  nameAr: string
  resource: string
  action: "create" | "read" | "update" | "delete"
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
