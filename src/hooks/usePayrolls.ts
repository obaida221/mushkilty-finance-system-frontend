import { useState, useEffect } from 'react';
import { payrollsAPI } from '../api';
import type { Payroll } from '../types/financial';

export interface CreatePayrollDto {
  user_id: number;
  amount: number;
  currency?: 'USD' | 'IQD';
  period_start: string; // YYYY-MM-DD
  period_end: string;   // YYYY-MM-DD
  paid_at?: string;     // ISO date string
  note?: string;
}

export interface UpdatePayrollDto {
  user_id?: number;
  amount?: number;
  currency?: 'USD' | 'IQD';
  period_start?: string;
  period_end?: string;
  paid_at?: string;
  note?: string;
}

export const usePayrolls = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await payrollsAPI.getAll();
      setPayrolls(response.data);
    } catch (err: any) {
      // console.error('Failed to fetch payrolls:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load payrolls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const createPayroll = async (data: CreatePayrollDto): Promise<Payroll> => {
    setLoading(true);
    setError(null);
    try {
      const response = await payrollsAPI.create(data);
      await fetchPayrolls(); // Refresh the list
      return response.data;
    } catch (err: any) {
      // console.error('Failed to create payroll:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to create payroll';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePayroll = async (id: number, data: UpdatePayrollDto): Promise<Payroll> => {
    setLoading(true);
    setError(null);
    try {
      const response = await payrollsAPI.update(id, data);
      await fetchPayrolls(); // Refresh the list
      return response.data;
    } catch (err: any) {
      // console.error('Failed to update payroll:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to update payroll';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePayroll = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await payrollsAPI.delete(id);
      await fetchPayrolls(); // Refresh the list
    } catch (err: any) {
      // console.error('Failed to delete payroll:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to delete payroll';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    payrolls,
    loading,
    error,
    fetchPayrolls,
    createPayroll,
    updatePayroll,
    deletePayroll,
  };
};
