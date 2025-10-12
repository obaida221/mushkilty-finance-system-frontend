import { useState, useEffect, useCallback } from 'react'
import { coursesAPI } from '../api'
import type { Course, CreateCourseDto } from '../types'

interface UseCoursesState {
  courses: Course[]
  loading: boolean
  error: string | null
}

interface UseCoursesReturn extends UseCoursesState {
  fetchCourses: () => Promise<void>
  createCourse: (data: CreateCourseDto) => Promise<Course>
  updateCourse: (id: number, data: Partial<CreateCourseDto>) => Promise<Course>
  deleteCourse: (id: number) => Promise<void>
  getCourseById: (id: number) => Promise<Course>
  getCoursesByType: (type: string) => Course[]
  getCoursesByTeacher: (userId: number) => Course[]
  refreshCourses: () => void
}

export const useCourses = (): UseCoursesReturn => {
  const [state, setState] = useState<UseCoursesState>({
    courses: [],
    loading: false,
    error: null,
  })

  const fetchCourses = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await coursesAPI.getAll()
      setState(prev => ({ ...prev, courses: response.data, loading: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch courses',
        loading: false,
      }))
    }
  }, [])

  const createCourse = useCallback(async (data: CreateCourseDto): Promise<Course> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await coursesAPI.create(data)
      const newCourse = response.data
      setState(prev => ({
        ...prev,
        courses: [newCourse, ...prev.courses],
        loading: false,
      }))
      return newCourse
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create course',
        loading: false,
      }))
      throw error
    }
  }, [])

  const updateCourse = useCallback(async (id: number, data: Partial<CreateCourseDto>): Promise<Course> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await coursesAPI.update(id, data)
      const updatedCourse = response.data
      setState(prev => ({
        ...prev,
        courses: prev.courses.map(course => course.id === id ? updatedCourse : course),
        loading: false,
      }))
      return updatedCourse
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update course',
        loading: false,
      }))
      throw error
    }
  }, [])

  const deleteCourse = useCallback(async (id: number): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      await coursesAPI.delete(id)
      setState(prev => ({
        ...prev,
        courses: prev.courses.filter(course => course.id !== id),
        loading: false,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete course',
        loading: false,
      }))
      throw error
    }
  }, [])

  const getCourseById = useCallback(async (id: number): Promise<Course> => {
    try {
      const response = await coursesAPI.getById(id)
      return response.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch course')
    }
  }, [])

  const getCoursesByType = useCallback((type: string): Course[] => {
    return state.courses.filter(course => course.project_type === type)
  }, [state.courses])

  const getCoursesByTeacher = useCallback((userId: number): Course[] => {
    return state.courses.filter(course => course.user_id === userId)
  }, [state.courses])

  const refreshCourses = useCallback(() => {
    fetchCourses()
  }, [fetchCourses])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  return {
    ...state,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseById,
    getCoursesByType,
    getCoursesByTeacher,
    refreshCourses,
  }
}

export default useCourses