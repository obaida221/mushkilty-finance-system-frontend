import api from '../config/axios';

// paymens API (guest access for viewing, admin access for CRUD)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (userData: any) => api.post('/users', userData),
  update: (id: number, userData: any) => api.put(`/users/${id}`, userData),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export default usersAPI;