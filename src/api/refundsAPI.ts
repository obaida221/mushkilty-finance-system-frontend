import api from '../config/axios';

// paymens API (guest access for viewing, admin access for CRUD)
export const refundsAPI = {
  getAll: () => api.get('/refunds'),
  getById: (id: number) => api.get(`/refunds/${id}`),
  create: (refundData: any) => api.post('/refunds', refundData),
  update: (id: number, refundData: any) => api.patch(`/refunds/${id}`, refundData),
  delete: (id: number) => api.delete(`/refunds/${id}`),
};

export default refundsAPI;