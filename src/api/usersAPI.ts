import api from '../config/axios';
import { User, CreateUserRequest, UpdateUserRequest } from '../types';

// Users API with proper typing and error handling
export const usersAPI = {
  // Get all users - requires 'users:read' permission
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get user by ID - requires 'users:read' permission
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user - requires 'users:create' permission
  create: async (userData: CreateUserRequest): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user - requires 'users:update' permission
  update: async (id: number, userData: UpdateUserRequest): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user - requires 'users:delete' permission
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default usersAPI;