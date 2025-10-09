import api from '../config/axios';
import { Permission, CreatePermissionRequest } from '../types';

// Permissions API with proper typing and documentation
export const permissionsAPI = {
  // Get all permissions - requires 'permissions:read' permission
  getAll: async (): Promise<Permission[]> => {
    const response = await api.get('/permissions');
    return response.data;
  },

  // Create new permission - requires 'permissions:create' permission
  create: async (permissionData: CreatePermissionRequest): Promise<Permission> => {
    const response = await api.post('/permissions', permissionData);
    return response.data;
  },

  // Seed default permissions - requires 'permissions:update' permission
  seed: async (): Promise<{ created: number }> => {
    const response = await api.post('/permissions/seed');
    return response.data;
  },
};

export default permissionsAPI;