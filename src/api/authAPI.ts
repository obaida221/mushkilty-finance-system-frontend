import api from '../config/axios';

// Auth API (based on actual Swagger endpoints)
export const authAPI = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

export default authAPI;