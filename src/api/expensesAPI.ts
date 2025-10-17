import api from '../config/axios';
import type { Expense } from '../types/financial';

// Expenses API - Manage organizational expenses
export const expensesAPI = {
  getAll: () => api.get<Expense[]>('/expenses'),
  getById: (id: number) => api.get<Expense>(`/expenses/${id}`),
  create: (expenseData: any) => api.post<Expense>('/expenses', expenseData),
  update: (id: number, expenseData: any) => api.patch<Expense>(`/expenses/${id}`, expenseData),
  delete: (id: number) => api.delete(`/expenses/${id}`),
};

export default expensesAPI;