import api from '../config/axios';

// paymens API (guest access for viewing, admin access for CRUD)
export const permissionsAPI = {
  getAll: () => api.get('/permissions'),
  // getById: (id: number) => api.get(`/permissions/${id}`),
  create: (permissionData: any) => api.post('/permissions', permissionData),
  seed: () => api.post('/permissions'),
  // update: (id: number, permissionData: any) => api.put(`/permissions/${id}`, permissionData),
  // delete: (id: number) => api.delete(`/permissions/${id}`),
};

export default permissionsAPI;