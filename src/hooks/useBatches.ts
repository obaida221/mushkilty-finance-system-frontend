import { useState, useEffect, useCallback } from 'react'
import { batchesAPI } from '../api'
import type { Batch, CreateBatchDto } from '../types'

interface UseBatchesState {
  batches: Batch[]
  loading: boolean
  error: string | null
}

interface UseBatchesReturn extends UseBatchesState {
  fetchBatches: () => Promise<void>
  createBatch: (data: CreateBatchDto) => Promise<Batch>
  updateBatch: (id: number, data: Partial<CreateBatchDto>) => Promise<Batch>
  deleteBatch: (id: number) => Promise<void>
  getBatchById: (id: number) => Promise<Batch>
  getBatchesByCourse: (courseId: number) => Batch[]
  getBatchesByStatus: (status: string) => Batch[]
  refreshBatches: () => void
}

export const useBatches = (): UseBatchesReturn => {
  const [state, setState] = useState<UseBatchesState>({
    batches: [],
    loading: false,
    error: null,
  })

  const fetchBatches = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await batchesAPI.getAll()
      setState(prev => ({ ...prev, batches: response.data, loading: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch batches',
        loading: false,
      }))
    }
  }, [])

  const createBatch = useCallback(async (data: CreateBatchDto): Promise<Batch> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await batchesAPI.create(data)
      const newBatch = response.data
      setState(prev => ({
        ...prev,
        batches: [newBatch, ...prev.batches],
        loading: false,
      }))
      return newBatch
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? "fail" : 'Failed to create batch',
        loading: false,
      }))
      throw error
    }
  }, [])

  const updateBatch = useCallback(async (id: number, data: Partial<CreateBatchDto>): Promise<Batch> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await batchesAPI.update(id, data)
      const updatedBatch = response.data
      setState(prev => ({
        ...prev,
        batches: prev.batches.map(batch => batch.id === id ? updatedBatch : batch),
        loading: false,
      }))
      return updatedBatch
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update batch',
        loading: false,
      }))
      throw error
    }
  }, [])

  const deleteBatch = useCallback(async (id: number): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      await batchesAPI.delete(id)
      setState(prev => ({
        ...prev,
        batches: prev.batches.filter(batch => batch.id !== id),
        loading: false,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete batch',
        loading: false,
      }))
      throw error
    }
  }, [])

  const getBatchById = useCallback(async (id: number): Promise<Batch> => {
    try {
      const response = await batchesAPI.getById(id)
      return response.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch batch')
    }
  }, [])

  const getBatchesByCourse = useCallback((courseId: number): Batch[] => {
    return state.batches.filter(batch => batch.course_id === courseId)
  }, [state.batches])

  const getBatchesByStatus = useCallback((status: string): Batch[] => {
    return state.batches.filter(batch => batch.status === status)
  }, [state.batches])

  const refreshBatches = useCallback(() => {
    fetchBatches()
  }, [fetchBatches])

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  return {
    ...state,
    fetchBatches,
    createBatch,
    updateBatch,
    deleteBatch,
    getBatchById,
    getBatchesByCourse,
    getBatchesByStatus,
    refreshBatches,
  }
}

export default useBatches