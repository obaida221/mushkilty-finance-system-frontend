import api from '../config/axios';

// paymens API (guest access for viewing, admin access for CRUD)
export const studentsAPI = {
  getAll: () => api.get('/students'),
  getById: (id: number) => api.get(`/students/${id}`),
  create: (studentData: any) => api.post('/students', studentData),
  update: (id: number, studentData: any) => api.patch(`/students/${id}`, studentData),
  delete: (id: number) => api.delete(`/students/${id}`),
};

export default studentsAPI;