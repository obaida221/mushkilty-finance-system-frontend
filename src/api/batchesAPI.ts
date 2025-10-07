import api from '../config/axios';

// paymens API (guest access for viewing, admin access for CRUD)
export const batchesAPI = {
  getAll: () => api.get('/batches'),
  getById: (id: number) => api.get(`/batches/${id}`),
  create: (batchData: any) => api.post('/batches', batchData),
  update: (id: number, batchData: any) => api.patch(`/batches/${id}`, batchData),
  delete: (id: number) => api.delete(`/batches/${id}`),
};

export default batchesAPI;