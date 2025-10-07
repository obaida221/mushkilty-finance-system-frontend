import api from '../config/axios';

// paymens API (guest access for viewing, admin access for CRUD)
export const discountCodesAPI = {
  getAll: () => api.get('/discount-codes'),
  getById: (id: number) => api.get(`/discount-codes/${id}`),
  validateCode: (code: any) => api.post('/discount-codes/validate', code),
  create: (discountCodeData: any) => api.post('/discount-codes', discountCodeData),
  update: (id: number, discountCodeData: any) => api.patch(`/discount-codes/${id}`, discountCodeData),
  incrementUsage: (id: number) => api.patch(`/discount-codes/${id}/increment-usage`),
  delete: (id: number) => api.delete(`/discount-codes/${id}`),
};

export default discountCodesAPI;