import api from '../config/axios';

// paymentMethods API (guest access for viewing, admin access for CRUD)
export const paymentMethodsAPI = {
  getAll: () => api.get('/payment-methods'),
  getById: (id: number) => api.get(`/payment-methods/${id}`),
  create: (paymentMethodData: any) => api.post('/payment-methods', paymentMethodData),
  update: (id: number, paymentMethodData: any) => api.patch(`/payment-methods/${id}`, paymentMethodData),
  delete: (id: number) => api.delete(`/payment-methods/${id}`),
};

export default paymentMethodsAPI;