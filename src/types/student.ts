export interface Student {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  enrollmentDate: string
  course: Course | null
  paymentStatus: "paid" | "pending" | "overdue"
  totalFees: number
  paidAmount: number
  remainingAmount: number
  discounts: Discount[]
  status: "active" | "inactive" | "graduated"
}

export interface Course {
  id: string
  name: string
  description: string
  duration: string
  fees: number
  teacher: Teacher | null
  startDate: string
  endDate: string
  maxStudents: number
  enrolledStudents: number
  status: "active" | "inactive" | "completed"
}

export interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  specialization: string
  salary: number
  courses: Course[]
  hireDate: string
  status: "active" | "inactive"
}

export interface Discount {
  id: string
  name: string
  type: "percentage" | "fixed"
  value: number
  promoCode?: string
  validFrom: string
  validTo: string
  isActive: boolean
}
