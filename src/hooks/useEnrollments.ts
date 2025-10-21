import { useState, useEffect, useCallback } from 'react'
import { enrollmentsAPI } from '../api'
import type { Enrollment, CreateEnrollmentDto } from '../types'
import { useStudents } from './useStudents'

interface UseEnrollmentsState {
  enrollments: Enrollment[]
  loading: boolean
  error: string | null
}

interface UseEnrollmentsReturn extends UseEnrollmentsState {
  fetchEnrollments: () => Promise<void>
  createEnrollment: (data: CreateEnrollmentDto) => Promise<Enrollment>
  updateEnrollment: (id: number, data: Partial<CreateEnrollmentDto>) => Promise<Enrollment>
  deleteEnrollment: (id: number) => Promise<void>
  getEnrollmentById: (id: number) => Promise<Enrollment>
  getEnrollmentsByStudent: (studentId: number) => Enrollment[]
  getEnrollmentsByBatch: (batchId: number) => Enrollment[]
  getEnrollmentsByStatus: (status: string) => Enrollment[]
  updateEnrollmentStatus: (id: number, status: string) => Promise<Enrollment>
  refreshEnrollments: () => void
}

export const useEnrollments = (): UseEnrollmentsReturn => {
  const [state, setState] = useState<UseEnrollmentsState>({
    enrollments: [],
    loading: false,
    error: null,
  })

  const fetchEnrollments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await enrollmentsAPI.getAll()
      setState(prev => ({ ...prev, enrollments: response.data, loading: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch enrollments',
        loading: false,
      }))
    }
  }, [])

  const { updateStudentStatusBasedOnEnrollment } = useStudents()
  
  const createEnrollment = useCallback(async (data: CreateEnrollmentDto): Promise<Enrollment> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await enrollmentsAPI.create(data)
      const newEnrollment = response.data
      
      // تحديث حالة الطالب إلى "تم الاختبار" عند التسجيل
      await updateStudentStatusBasedOnEnrollment(data.student_id)
      
      setState(prev => ({
        ...prev,
        enrollments: [newEnrollment, ...prev.enrollments],
        loading: false,
      }))
      return newEnrollment
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create enrollment',
        loading: false,
      }))
      throw error
    }
  }, [updateStudentStatusBasedOnEnrollment])

  const updateEnrollment = useCallback(async (id: number, data: Partial<CreateEnrollmentDto>): Promise<Enrollment> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await enrollmentsAPI.update(id, data)
      const updatedEnrollment = response.data
      setState(prev => ({
        ...prev,
        enrollments: prev.enrollments.map(enrollment => enrollment.id === id ? updatedEnrollment : enrollment),
        loading: false,
      }))
      return updatedEnrollment
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update enrollment',
        loading: false,
      }))
      throw error
    }
  }, [])

  const deleteEnrollment = useCallback(async (id: number): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      await enrollmentsAPI.delete(id)
      setState(prev => ({
        ...prev,
        enrollments: prev.enrollments.filter(enrollment => enrollment.id !== id),
        loading: false,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete enrollment',
        loading: false,
      }))
      throw error
    }
  }, [])

  const getEnrollmentById = useCallback(async (id: number): Promise<Enrollment> => {
    try {
      const response = await enrollmentsAPI.getById(id)
      return response.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch enrollment')
    }
  }, [])

  const getEnrollmentsByStudent = useCallback((studentId: number): Enrollment[] => {
    return state.enrollments.filter(enrollment => enrollment.student_id === studentId)
  }, [state.enrollments])

  const getEnrollmentsByBatch = useCallback((batchId: number): Enrollment[] => {
    return state.enrollments.filter(enrollment => enrollment.batch_id === batchId)
  }, [state.enrollments])

  const getEnrollmentsByStatus = useCallback((status: string): Enrollment[] => {
    return state.enrollments.filter(enrollment => enrollment.status === status)
  }, [state.enrollments])

  const updateEnrollmentStatus = useCallback(async (id: number, status: string): Promise<Enrollment> => {
    return updateEnrollment(id, { status: status as any })
  }, [updateEnrollment])

  const refreshEnrollments = useCallback(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  return {
    ...state,
    fetchEnrollments,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
    getEnrollmentById,
    getEnrollmentsByStudent,
    getEnrollmentsByBatch,
    getEnrollmentsByStatus,
    updateEnrollmentStatus,
    refreshEnrollments,
  }
}

export default useEnrollments