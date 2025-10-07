import api from '../config/axios';

// paymens API (guest access for viewing, admin access for CRUD)
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getById: (id: number) => api.get(`/courses/${id}`),
  create: (courseData: any) => api.post('/courses', courseData),
  update: (id: number, courseData: any) => api.patch(`/courses/${id}`, courseData),
  delete: (id: number) => api.delete(`/courses/${id}`),
};

export default coursesAPI;