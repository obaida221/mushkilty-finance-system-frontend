import api from '../config/axios';

// paymens API (guest access for viewing, admin access for CRUD)
export const payrollsAPI = {
  getAll: () => api.get('/payrolls'),
  getById: (id: number) => api.get(`/payrolls/${id}`),
  create: (payrollData: any) => api.post('/payrolls', payrollData),
  update: (id: number, payrollData: any) => api.patch(`/payrolls/${id}`, payrollData),
  delete: (id: number) => api.delete(`/payrolls/${id}`),
};

export default payrollsAPI;