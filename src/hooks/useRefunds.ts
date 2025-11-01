import { useState, useEffect } from 'react';
import { refundsAPI } from '../api';
import type { Refund } from '../types';
import { useStudents } from './useStudents';
import { usePayments } from './usePayments';

export interface CreateRefundDto {
  payment_id: number;
  reason?: string;
  refunded_at?: string; // ISO date string
}

export interface UpdateRefundDto {
  payment_id?: number;
  reason?: string;
  refunded_at?: string;
}

export const useRefunds = () => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { updateStudentStatusBasedOnRefund } = useStudents();
  const { getPaymentById } = usePayments();

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await refundsAPI.getAll();
      setRefunds(response.data);
    } catch (err: any) {
      // console.error('Failed to fetch refunds:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const createRefund = async (data: CreateRefundDto): Promise<Refund> => {
    setLoading(true);
    setError(null);
    try {
      const response = await refundsAPI.create(data);
      
      // تحديث حالة الطالب إلى "مرفوض" عند إرجاع المبلغ
      const payment = await getPaymentById(data.payment_id);
      if (payment.enrollment?.student?.id) {
        await updateStudentStatusBasedOnRefund(payment.enrollment.student.id);
      }
      
      await fetchRefunds(); // Refresh the list
      return response.data;
    } catch (err: any) {
      // console.error('Failed to create refund:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to create refund';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRefund = async (id: number, data: UpdateRefundDto): Promise<Refund> => {
    setLoading(true);
    setError(null);
    try {
      const response = await refundsAPI.update(id, data);
      await fetchRefunds(); // Refresh the list
      return response.data;
    } catch (err: any) {
      // console.error('Failed to update refund:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to update refund';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRefund = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await refundsAPI.delete(id);
      await fetchRefunds(); // Refresh the list
    } catch (err: any) {
      // console.error('Failed to delete refund:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to delete refund';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    refunds,
    loading,
    error,
    fetchRefunds,
    createRefund,
    updateRefund,
    deleteRefund,
  };
};
