import api from '../config/axios';

// paymens API (guest access for viewing, admin access for CRUD)
export const rolesAPI = {
  getAll: () => api.get('/roles'),
  getCurrentUserPermissions: () => api.get(`/roles/me/permissions`),
  getById: (id: number) => api.get(`/roles/${id}`),
  create: (roleData: any) => api.post('/roles', roleData),
  update: (id: number, roleData: any) => api.put(`/roles/${id}`, roleData),
  assignSinglePermission: (roleId: number, permissionId: number) => api.post(`/roles/${roleId}/permissions/${permissionId}`),
  removeSinglePermission: (roleId: number, permissionId: number) => api.delete(`/roles/${roleId}/permissions/${permissionId}`),
  assignPermissions: (id: number, roleData: any) => api.post(`/roles/${id}/permissions`, roleData),
  getRolePermissions: (id: number, roleData: any) => api.get(`/roles/${id}/permissions`, roleData),
  seed: () => api.post('/roles/seed'),
  delete: (id: number) => api.delete(`/roles/${id}`),
};

export default rolesAPI;