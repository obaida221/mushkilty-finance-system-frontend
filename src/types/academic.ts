// Course Types (based on API documentation)
export interface Course {
  id: number
  user_id: number // Teacher/instructor ID
  name: string
  project_type?: "online" | "onsite" | "kids" | "ielts"
  description?: string
  created_at: string
  updated_at: string
  user?: User // Teacher/instructor details
  batches?: Batch[] // Associated batches
}

export interface CreateCourseDto {
  user_id: number // Required: Teacher/instructor ID
  name: string // Required: Course name (max 255 chars)
  project_type?: "online" | "onsite" | "kids" | "ielts"
  description?: string
}

// Batch Types (based on API documentation)
export interface Batch {
  id: number
  course_id: number
  trainer_id: number
  name: string
  description?: string
  level?: "A1" | "A2" | "B1" | "B2" | "C1"
  location?: string
  start_date?: string
  end_date?: string
  schedule?: string
  capacity?: number
  status?: "open" | "closed" | "full"
  actual_price?: number
  created_at: string
  updated_at: string
  course?: Course
  trainer?: User
  enrollments?: Enrollment[]
}

export interface CreateBatchDto {
  course_id: number
  trainer_id: number
  name: string
  description?: string
  level?: "A1" | "A2" | "B1" | "B2" | "C1"
  location?: string
  start_date?: string
  end_date?: string
  schedule?: string
  capacity?: number
  status?: "open" | "closed" | "full"
  actual_price?: number
}

// Enrollment Types (based on API documentation)
export interface Enrollment {
  id: number
  student_id: number
  batch_id: number
  discount_code?: string
  user_id: number // Operator creating the enrollment
  total_price?: number
  currency?: "USD" | "IQD"
  enrolled_at?: string
  status?: "pending" | "accepted" | "dropped" | "completed"
  notes?: string
  created_at: string
  updated_at: string
  student?: {
    id: number
    full_name: string
    phone: string
    status: string
  }
  batch?: Batch
  user?: User // Operator
}

export interface CreateEnrollmentDto {
  student_id: number
  batch_id: number
  discount_code?: string
  user_id: number
  total_price?: number
  currency?: "USD" | "IQD"
  enrolled_at?: string
  status?: "pending" | "accepted" | "dropped" | "completed"
  notes?: string
}

// User Types (basic structure for references)
export interface User {
  id: number
  name: string
  email: string
  role?: {
    id: number
    name: string
    description: string
  }
}

// Legacy Teacher Type (for backward compatibility)
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