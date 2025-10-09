import usersAPI from '../api/usersAPI';
import rolesAPI from '../api/rolesAPI';
import permissionsAPI from '../api/permissionssAPI';
import { 
  User, 
  Role, 
  Permission, 
  CreateUserRequest, 
  UpdateUserRequest, 
  CreateRoleRequest, 
  UpdateRoleRequest,
  CreatePermissionRequest,
  AssignPermissionsRequest,
  RolePermissionsResponse
} from '../types';

/**
 * User Management Service
 * Provides comprehensive user management functionality with proper error handling
 */
export class UserManagementService {
  
  // ============== USER OPERATIONS ==============
  
  /**
   * Get all users in the system
   * Requires: users:read permission
   */
  async getAllUsers(): Promise<User[]> {
    try {
      return await usersAPI.getAll();
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw new Error('فشل في جلب قائمة المستخدمين');
    }
  }

  /**
   * Get a specific user by ID
   * Requires: users:read permission
   */
  async getUser(id: number): Promise<User> {
    try {
      return await usersAPI.getById(id);
    } catch (error) {
      console.error(`Failed to fetch user ${id}:`, error);
      throw new Error('فشل في جلب بيانات المستخدم');
    }
  }

  /**
   * Create a new user
   * Requires: users:create permission
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      // Validate required fields
      this.validateUserData(userData);
      
      return await usersAPI.create(userData);
    } catch (error) {
      console.error('Failed to create user:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('فشل في إنشاء المستخدم');
    }
  }

  /**
   * Update an existing user
   * Requires: users:update permission
   */
  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    try {
      // Validate update data
      if (userData.email) {
        this.validateEmail(userData.email);
      }
      
      return await usersAPI.update(id, userData);
    } catch (error) {
      console.error(`Failed to update user ${id}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('فشل في تحديث بيانات المستخدم');
    }
  }

  /**
   * Delete a user
   * Requires: users:delete permission
   */
  async deleteUser(id: number): Promise<void> {
    try {
      await usersAPI.delete(id);
    } catch (error) {
      console.error(`Failed to delete user ${id}:`, error);
      throw new Error('فشل في حذف المستخدم');
    }
  }

  // ============== ROLE OPERATIONS ==============

  /**
   * Get all roles in the system
   * Requires: roles:read permission
   */
  async getAllRoles(): Promise<Role[]> {
    try {
      return await rolesAPI.getAll();
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      throw new Error('فشل في جلب قائمة الأدوار');
    }
  }

  /**
   * Get a specific role by ID
   * Requires: roles:read permission
   */
  async getRole(id: number): Promise<Role> {
    try {
      return await rolesAPI.getById(id);
    } catch (error) {
      console.error(`Failed to fetch role ${id}:`, error);
      throw new Error('فشل في جلب بيانات الدور');
    }
  }

  /**
   * Create a new role
   * Requires: roles:create permission
   */
  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    try {
      // Validate required fields
      if (!roleData.name?.trim()) {
        throw new Error('اسم الدور مطلوب');
      }
      
      return await rolesAPI.create(roleData);
    } catch (error) {
      console.error('Failed to create role:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('فشل في إنشاء الدور');
    }
  }

  /**
   * Update an existing role
   * Requires: roles:update permission
   */
  async updateRole(id: number, roleData: UpdateRoleRequest): Promise<Role> {
    try {
      return await rolesAPI.update(id, roleData);
    } catch (error) {
      console.error(`Failed to update role ${id}:`, error);
      throw new Error('فشل في تحديث الدور');
    }
  }

  /**
   * Delete a role
   * Requires: roles:delete permission
   */
  async deleteRole(id: number): Promise<void> {
    try {
      await rolesAPI.delete(id);
    } catch (error) {
      console.error(`Failed to delete role ${id}:`, error);
      throw new Error('فشل في حذف الدور');
    }
  }

  /**
   * Seed default roles
   * Requires: roles:create permission
   */
  async seedRoles(): Promise<Role[]> {
    try {
      return await rolesAPI.seed();
    } catch (error) {
      console.error('Failed to seed roles:', error);
      throw new Error('فشل في إنشاء الأدوار الافتراضية');
    }
  }

  // ============== PERMISSION OPERATIONS ==============

  /**
   * Get all permissions in the system
   * Requires: permissions:read permission
   */
  async getAllPermissions(): Promise<Permission[]> {
    try {
      return await permissionsAPI.getAll();
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      throw new Error('فشل في جلب قائمة الصلاحيات');
    }
  }

  /**
   * Create a new permission
   * Requires: permissions:create permission
   */
  async createPermission(permissionData: CreatePermissionRequest): Promise<Permission> {
    try {
      if (!permissionData.name?.trim()) {
        throw new Error('اسم الصلاحية مطلوب');
      }
      
      return await permissionsAPI.create(permissionData);
    } catch (error) {
      console.error('Failed to create permission:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('فشل في إنشاء الصلاحية');
    }
  }

  /**
   * Seed default permissions
   * Requires: permissions:update permission
   */
  async seedPermissions(): Promise<{ created: number }> {
    try {
      return await permissionsAPI.seed();
    } catch (error) {
      console.error('Failed to seed permissions:', error);
      throw new Error('فشل في إنشاء الصلاحيات الافتراضية');
    }
  }

  // ============== ROLE-PERMISSION OPERATIONS ==============

  /**
   * Get permissions for current user's role
   * Requires: roles:read permission
   */
  async getCurrentUserPermissions(): Promise<RolePermissionsResponse> {
    try {
      return await rolesAPI.getCurrentUserPermissions();
    } catch (error) {
      console.error('Failed to fetch current user permissions:', error);
      throw new Error('فشل في جلب صلاحيات المستخدم الحالي');
    }
  }

  /**
   * Get permissions for a specific role
   * Requires: roles:read permission
   */
  async getRolePermissions(roleId: number): Promise<RolePermissionsResponse> {
    try {
      return await rolesAPI.getRolePermissions(roleId);
    } catch (error) {
      console.error(`Failed to fetch permissions for role ${roleId}:`, error);
      throw new Error('فشل في جلب صلاحيات الدور');
    }
  }

  /**
   * Assign multiple permissions to a role
   * Requires: roles:update permission
   */
  async assignPermissionsToRole(
    roleId: number, 
    permissions: AssignPermissionsRequest
  ): Promise<void> {
    try {
      await rolesAPI.assignPermissions(roleId, permissions);
    } catch (error) {
      console.error(`Failed to assign permissions to role ${roleId}:`, error);
      throw new Error('فشل في تعيين الصلاحيات للدور');
    }
  }

  /**
   * Assign a single permission to a role
   * Requires: roles:update permission
   */
  async assignSinglePermissionToRole(roleId: number, permissionId: number): Promise<void> {
    try {
      await rolesAPI.assignSinglePermission(roleId, permissionId);
    } catch (error) {
      console.error(`Failed to assign permission ${permissionId} to role ${roleId}:`, error);
      throw new Error('فشل في تعيين الصلاحية للدور');
    }
  }

  /**
   * Remove a single permission from a role
   * Requires: roles:update permission
   */
  async removeSinglePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    try {
      await rolesAPI.removeSinglePermission(roleId, permissionId);
    } catch (error) {
      console.error(`Failed to remove permission ${permissionId} from role ${roleId}:`, error);
      throw new Error('فشل في إزالة الصلاحية من الدور');
    }
  }

  // ============== SYSTEM SETUP ==============

  /**
   * Complete system setup - seed roles and permissions
   * Requires: roles:create, permissions:update permissions
   */
  async setupSystem(): Promise<{
    permissions: { created: number };
    roles: Role[];
  }> {
    try {
      // 1. Seed permissions first
      const permissions = await this.seedPermissions();
      console.log('✅ Permissions seeded:', permissions.created);
      
      // 2. Seed roles
      const roles = await this.seedRoles();
      console.log('✅ Roles seeded:', roles.length);
      
      return { permissions, roles };
    } catch (error) {
      console.error('System setup failed:', error);
      throw new Error('فشل في إعداد النظام');
    }
  }

  // ============== UTILITY METHODS ==============

  /**
   * Validate user creation data
   */
  private validateUserData(userData: CreateUserRequest): void {
    if (!userData.email?.trim()) {
      throw new Error('البريد الإلكتروني مطلوب');
    }
    
    if (!this.isValidEmail(userData.email)) {
      throw new Error('البريد الإلكتروني غير صحيح');
    }
    
    if (!userData.password && !userData.password_hash) {
      throw new Error('كلمة المرور مطلوبة');
    }
    
    if (userData.password && userData.password.length < 6) {
      throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    }
    
    if (!userData.role_id) {
      throw new Error('الدور مطلوب');
    }
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): void {
    if (!this.isValidEmail(email)) {
      throw new Error('البريد الإلكتروني غير صحيح');
    }
  }

  /**
   * Check if email format is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate a strong random password
   */
  generateRandomPassword(length: number = 12): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

// Export singleton instance
export const userManagementService = new UserManagementService();
export default userManagementService;