import api from '../config/axios';

// paymens API (guest access for viewing, admin access for CRUD)
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id: number) => api.get(`/payments/${id}`),
  create: (paymentData: any) => api.post('/payments', paymentData),
  update: (id: number, paymentData: any) => api.patch(`/payments/${id}`, paymentData),
  delete: (id: number) => api.delete(`/payments/${id}`),
};

export default paymentsAPI;