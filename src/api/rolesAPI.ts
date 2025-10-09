import api from '../config/axios';
import { Role, CreateRoleRequest, UpdateRoleRequest, AssignPermissionsRequest, RolePermissionsResponse } from '../types';

// Roles API with proper typing and documentation
export const rolesAPI = {
  // Get all roles - requires 'roles:read' permission
  getAll: async (): Promise<Role[]> => {
    const response = await api.get('/roles');
    return response.data;
  },

  // Get role by ID - requires 'roles:read' permission
  getById: async (id: number): Promise<Role> => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  // Create new role - requires 'roles:create' permission
  create: async (roleData: CreateRoleRequest): Promise<Role> => {
    const response = await api.post('/roles', roleData);
    return response.data;
  },

  // Update role - requires 'roles:update' permission
  update: async (id: number, roleData: UpdateRoleRequest): Promise<Role> => {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  },

  // Delete role - requires 'roles:delete' permission
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },

  // Get current user's permissions - requires 'roles:read' permission
  getCurrentUserPermissions: async (): Promise<RolePermissionsResponse> => {
    const response = await api.get('/roles/me/permissions');
    return response.data;
  },

  // Get role permissions - requires 'roles:read' permission
  getRolePermissions: async (id: number): Promise<RolePermissionsResponse> => {
    const response = await api.get(`/roles/${id}/permissions`);
    return response.data;
  },

  // Assign multiple permissions to role - requires 'roles:update' permission
  assignPermissions: async (id: number, permissionsData: AssignPermissionsRequest): Promise<{ message: string }> => {
    const response = await api.post(`/roles/${id}/permissions`, permissionsData);
    return response.data;
  },

  // Assign single permission to role - requires 'roles:update' permission
  assignSinglePermission: async (roleId: number, permissionId: number): Promise<{ message: string }> => {
    const response = await api.post(`/roles/${roleId}/permissions/${permissionId}`);
    return response.data;
  },

  // Remove single permission from role - requires 'roles:update' permission
  removeSinglePermission: async (roleId: number, permissionId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
    return response.data;
  },

  // Seed default roles - requires 'roles:create' permission
  seed: async (): Promise<Role[]> => {
    const response = await api.post('/roles/seed');
    return response.data;
  },
};

export default rolesAPI;