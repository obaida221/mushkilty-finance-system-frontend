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