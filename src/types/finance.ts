export interface Transaction {
  id: string
  type: "payment" | "expense" | "refund" | "payroll"
  amount: number
  description: string
  date: string
  status: "completed" | "pending" | "failed"
  reference?: string
  relatedId?: string // ID of related payment, expense, etc.
  category: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  studentId: string
  studentName: string
  courseId?: string
  courseName?: string
  amount: number
  paymentMethod: "cash" | "card" | "bank_transfer" | "check"
  transactionId: string
  status: "completed" | "pending" | "failed"
  date: string
  description: string
  receiptNumber: string
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: string
  category: string
  description: string
  amount: number
  date: string
  paymentMethod: "cash" | "card" | "bank_transfer" | "check"
  transactionId: string
  status: "completed" | "pending"
  receipt?: string
  vendor?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Refund {
  id: string
  originalPaymentId: string
  studentId: string
  studentName: string
  amount: number
  reason: string
  status: "completed" | "pending" | "rejected"
  transactionId: string
  date: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentMethod {
  id: string
  name: string
  type: "cash" | "card" | "bank_transfer" | "check"
  isActive: boolean
}
