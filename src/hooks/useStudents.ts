import { useState, useEffect, useCallback } from 'react'
import { studentsAPI } from '../api'
import type { Student, CreateStudentDto } from '../types'

interface UseStudentsState {
  students: Student[]
  loading: boolean
  error: string | null
}

interface UseStudentsReturn extends UseStudentsState {
  fetchStudents: () => Promise<void>
  createStudent: (data: CreateStudentDto) => Promise<Student>
  updateStudent: (id: number, data: Partial<CreateStudentDto>) => Promise<Student>
  deleteStudent: (id: number) => Promise<void>
  getStudentById: (id: number) => Promise<Student>
  getStudentsByStatus: (status: string) => Student[]
  getStudentsByCourseType: (courseType: string) => Student[]
  getStudentsByCity: (city: string) => Student[]
  updateStudentStatus: (id: number, status: string) => Promise<Student>
  updateStudentStatusBasedOnEnrollment: (studentId: number) => Promise<Student>
  updateStudentStatusBasedOnPayment: (studentId: number) => Promise<Student>
  updateStudentStatusBasedOnRefund: (studentId: number) => Promise<Student>
  refreshStudents: () => void
}

export const useStudents = (): UseStudentsReturn => {
  const [state, setState] = useState<UseStudentsState>({
    students: [],
    loading: false,
    error: null,
  })

  const fetchStudents = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await studentsAPI.getAll()
      setState(prev => ({ ...prev, students: response.data, loading: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch students',
        loading: false,
      }))
    }
  }, [])

  const createStudent = useCallback(async (data: CreateStudentDto): Promise<Student> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await studentsAPI.create(data)
      const newStudent = response.data
      setState(prev => ({
        ...prev,
        students: [newStudent, ...prev.students],
        loading: false,
      }))
      return newStudent
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create student',
        loading: false,
      }))
      throw error
    }
  }, [])

  const updateStudent = useCallback(async (id: number, data: Partial<CreateStudentDto>): Promise<Student> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await studentsAPI.update(id, data)
      const updatedStudent = response.data
      setState(prev => ({
        ...prev,
        students: prev.students.map(student => student.id === id ? updatedStudent : student),
        loading: false,
      }))
      return updatedStudent
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update student',
        loading: false,
      }))
      throw error
    }
  }, [])

  const deleteStudent = useCallback(async (id: number): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      await studentsAPI.delete(id)
      setState(prev => ({
        ...prev,
        students: prev.students.filter(student => student.id !== id),
        loading: false,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete student',
        loading: false,
      }))
      throw error
    }
  }, [])

  const getStudentById = useCallback(async (id: number): Promise<Student> => {
    try {
      const response = await studentsAPI.getById(id)
      return response.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch student')
    }
  }, [])

  const getStudentsByStatus = useCallback((status: string): Student[] => {
    return state.students.filter(student => student.status === status)
  }, [state.students])

  const getStudentsByCourseType = useCallback((courseType: string): Student[] => {
    return state.students.filter(student => student.course_type === courseType)
  }, [state.students])

  const getStudentsByCity = useCallback((city: string): Student[] => {
    return state.students.filter(student => student.city?.toLowerCase() === city.toLowerCase())
  }, [state.students])

  const updateStudentStatus = useCallback(async (id: number, status: string): Promise<Student> => {
    return updateStudent(id, { status: status as any })
  }, [updateStudent])
  
  // تحديث حالة الطالب إلى "تم الاختبار" عند التسجيل في دورة
  const updateStudentStatusBasedOnEnrollment = useCallback(async (studentId: number): Promise<Student> => {
    return updateStudent(studentId, { status: "tested" })
  }, [updateStudent])
  
  // تحديث حالة الطالب إلى "مقبول" عند دفع الرسوم
  const updateStudentStatusBasedOnPayment = useCallback(async (studentId: number): Promise<Student> => {
    return updateStudent(studentId, { status: "accepted" })
  }, [updateStudent])
  
  // تحديث حالة الطالب إلى "مرفوض" عند إرجاع المبلغ
  const updateStudentStatusBasedOnRefund = useCallback(async (studentId: number): Promise<Student> => {
    return updateStudent(studentId, { status: "rejected" })
  }, [updateStudent])

  const refreshStudents = useCallback(() => {
    fetchStudents()
  }, [fetchStudents])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  return {
    ...state,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    getStudentsByStatus,
    getStudentsByCourseType,
    getStudentsByCity,
    updateStudentStatus,
    updateStudentStatusBasedOnEnrollment,
    updateStudentStatusBasedOnPayment,
    updateStudentStatusBasedOnRefund,
    refreshStudents,
  }
}

export default useStudents