import api from '../config/axios';
import type { Payroll } from '../types/financial';

export interface CreatePayrollDto {
  user_id: number;
  amount: number;
  currency?: 'USD' | 'IQD'; // Default: IQD
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

// Payrolls API
export const payrollsAPI = {
  getAll: () => api.get<Payroll[]>('/payrolls'),
  getById: (id: number) => api.get<Payroll>(`/payrolls/${id}`),
  create: (payrollData: CreatePayrollDto) => api.post<Payroll>('/payrolls', payrollData),
  update: (id: number, payrollData: UpdatePayrollDto) => api.patch<Payroll>(`/payrolls/${id}`, payrollData),
  delete: (id: number) => api.delete(`/payrolls/${id}`),
};

export default payrollsAPI;