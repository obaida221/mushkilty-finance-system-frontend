export interface PayrollRecord {
  id: string
  teacherId: string
  teacherName: string
  baseSalary: number
  bonuses: number
  deductions: number
  totalAmount: number
  payPeriod: string
  payDate: string
  status: "pending" | "processed" | "paid"
  transactionId?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Discount {
  id: string
  code: string
  name: string
  description: string
  type: "percentage" | "fixed"
  value: number
  minAmount?: number
  maxDiscount?: number
  validFrom: string
  validTo: string
  usageLimit?: number
  usedCount: number
  isActive: boolean
  applicableTo: "all" | "courses" | "specific"
  courseIds?: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface DiscountUsage {
  id: string
  discountId: string
  studentId: string
  studentName: string
  transactionId: string
  discountAmount: number
  usedAt: string
}
