import api from '../config/axios';

// paymens API (guest access for viewing, admin access for CRUD)
export const enrollmentsAPI = {
  getAll: () => api.get('/enrollments'),
  getById: (id: number) => api.get(`/enrollments/${id}`),
  create: (enrollmentData: any) => api.post('/enrollments', enrollmentData),
  update: (id: number, enrollmentData: any) => api.patch(`/enrollments/${id}`, enrollmentData),
  delete: (id: number) => api.delete(`/enrollments/${id}`),
};

export default enrollmentsAPI;