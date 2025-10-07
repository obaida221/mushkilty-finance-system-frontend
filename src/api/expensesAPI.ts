import api from '../config/axios';

// paymens API (guest access for viewing, admin access for CRUD)
export const expensesAPI = {
  getAll: () => api.get('/expenses'),
  getById: (id: number) => api.get(`/expenses/${id}`),
  create: (expenseData: any) => api.post('/expenses', expenseData),
  update: (id: number, expenseData: any) => api.patch(`/expenses/${id}`, expenseData),
  delete: (id: number) => api.delete(`/expenses/${id}`),
};

export default expensesAPI;