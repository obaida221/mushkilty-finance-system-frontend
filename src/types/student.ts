// Student Types (Based on Backend API Documentation)
export interface Student {
  id: number
  full_name: string
  age?: number
  dob?: string // Date of birth (ISO string)
  education_level?: string
  gender?: string
  phone: string
  city?: string
  area?: string
  course_type?: "online" | "onsite" | "kids" | "ielts"
  previous_course?: string
  is_returning: boolean
  status: "pending" | "contacted with" | "tested" | "accepted" | "rejected"
  created_at: string
  updated_at: string
  enrollments?: Enrollment[]
}

export interface CreateStudentDto {
  full_name: string // Required
  age?: number
  dob?: string | null // ISO date string
  education_level?: string
  gender?: string
  phone: string // Required
  city?: string
  area?: string
  course_type?: "online" | "onsite" | "kids" | "ielts"
  previous_course?: string
  is_returning?: boolean // Default: false
  status?: "pending" | "contacted with" | "tested" | "accepted" | "rejected"
}

// Legacy Student Type (for backward compatibility with existing components)
export interface LegacyStudent {
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

// Import types from academic to avoid circular dependencies
export interface Enrollment {
  id: number
  student_id: number
  batch_id: number
  discount_code?: string
  user_id: number
  total_price?: number
  currency?: "USD" | "IQD"
  enrolled_at?: string
  status?: "pending" | "accepted" | "dropped" | "completed"
  notes?: string
  created_at: string
  updated_at: string
}