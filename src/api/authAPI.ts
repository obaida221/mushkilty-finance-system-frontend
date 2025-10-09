import api, { guestApi } from '../config/axios';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

// Auth API using axios (based on Backend Documentation)
export const authAPI = {
  // User Login - POST /auth/login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await guestApi.post('/auth/login', credentials);
    return response.data;
  },

  // User Registration - POST /auth/register
  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await guestApi.post('/auth/register', userData);
    return response.data;
  },

  // Get User Profile - GET /auth/profile (requires authentication)
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export default authAPI;