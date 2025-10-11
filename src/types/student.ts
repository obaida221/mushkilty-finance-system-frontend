// Student Types (Based on Backend API)
export interface Student {
  id: string
  fullName: string
  email: string
  phone: string
  courseId: string | null
  course?: {
    id: string
    name: string
    nameAr: string
    description: string
    price: number
    duration: number
    teacherId: string | null
    enrolledCount: number
    status: "active" | "inactive"
    createdAt: string
  }
  enrollmentDate: string | null
  status: "active" | "inactive" | "graduated"
  totalPaid: number
  totalDue: number
  discountId: string | null
  discount?: {
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
  createdAt: string
}