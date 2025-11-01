import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Permission } from '../types';

/**
 * Enhanced permission checking hook
 * Provides multiple ways to check permissions for UI components
 */
export const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permissionName: string): boolean => {
    if (!user) return false;
    
    // Check direct permissions
    if (user.permissions?.some(p => p.name === permissionName)) {
      return true;
    }
    
    // Check role permissions
    if (user.role?.rolePermissions?.some(rp => rp.permission.name === permissionName)) {
      return true;
    }
    
    return false;
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some(permission => hasPermission(permission));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissionNames: string[]): boolean => {
    return permissionNames.every(permission => hasPermission(permission));
  };

  /**
   * Get all user permissions (direct + role-based)
   */
  const getAllPermissions = (): Permission[] => {
    const permissions: Permission[] = [];
    
    // Add direct permissions
    if (user?.permissions) {
      permissions.push(...user.permissions);
    }
    
    // Add role permissions
    if (user?.role?.rolePermissions) {
      permissions.push(...user.role.rolePermissions.map(rp => rp.permission));
    }
    
    // Remove duplicates
    const uniquePermissions = permissions.filter(
      (permission, index, self) => 
        index === self.findIndex(p => p.id === permission.id)
    );
    
    return uniquePermissions;
  };

  /**
   * Check permissions for user management operations
   */
  const userManagementPermissions = {
    canViewUsers: hasPermission('users:read'),
    canCreateUsers: hasPermission('users:create'),
    canUpdateUsers: hasPermission('users:update'),
    canDeleteUsers: hasPermission('users:delete'),
    
    canViewRoles: hasPermission('roles:read'),
    canCreateRoles: hasPermission('roles:create'),
    canUpdateRoles: hasPermission('roles:update'),
    canDeleteRoles: hasPermission('roles:delete'),
    
    canViewPermissions: hasPermission('permissions:read'),
    canCreatePermissions: hasPermission('permissions:create'),
    canUpdatePermissions: hasPermission('permissions:update'),
    canDeletePermissions: hasPermission('permissions:delete'),
    
    canManageSystem: hasPermission('system:admin'),
  };

  /**
   * Check permissions for other modules
   */
  const modulePermissions = {
    // Dashboard
    canViewDashboard: hasPermission('dashboard:read'),
    
    // Students
    canViewStudents: hasPermission('students:read'),
    canCreateStudents: hasPermission('students:create'),
    canUpdateStudents: hasPermission('students:update'),
    canDeleteStudents: hasPermission('students:delete'),
    canSearchStudents: hasPermission('students:search'),
    
    // Courses
    canViewCourses: hasPermission('courses:read'),
    canCreateCourses: hasPermission('courses:create'),
    canUpdateCourses: hasPermission('courses:update'),
    canDeleteCourses: hasPermission('courses:delete'),
    canSearchCourses: hasPermission('courses:search'),
    
    // Payments
    canViewPayments: hasPermission('payments:read'),
    canCreatePayments: hasPermission('payments:create'),
    canUpdatePayments: hasPermission('payments:update'),
    canDeletePayments: hasPermission('payments:delete'),
    canViewPaymentReports: hasPermission('payments:reports'),
    
    // Expenses
    canViewExpenses: hasPermission('expenses:read'),
    canCreateExpenses: hasPermission('expenses:create'),
    canUpdateExpenses: hasPermission('expenses:update'),
    canDeleteExpenses: hasPermission('expenses:delete'),
    canViewExpenseReports: hasPermission('expenses:reports'),
    
    // Refunds
    canViewRefunds: hasPermission('refunds:read'),
    canCreateRefunds: hasPermission('refunds:create'),
    canUpdateRefunds: hasPermission('refunds:update'),
    canDeleteRefunds: hasPermission('refunds:delete'),
    canViewRefundReports: hasPermission('refunds:reports'),
    
    // Payrolls
    canViewPayroll: hasPermission('payrolls:read'),
    canCreatePayroll: hasPermission('payrolls:create'),
    canUpdatePayroll: hasPermission('payrolls:update'),
    canDeletePayroll: hasPermission('payrolls:delete'),
    canViewPayrollReports: hasPermission('payrolls:reports'),

    // Payment Methods
    canViewPaymentMethods: hasPermission('payment-methods:read'),
    canCreatePaymentMethods: hasPermission('payment-methods:create'),
    canUpdatePaymentMethods: hasPermission('payment-methods:update'),
    canDeletePaymentMethods: hasPermission('payment-methods:delete'),

    // Academic Modules
    canReadStudents: hasPermission('students:read'),
    canReadCourses: hasPermission('courses:read'),
    canReadBatches: hasPermission('batches:read'),
    canReadEnrollments: hasPermission('enrollments:read'),
    canReadDiscounts: hasPermission('discounts:read'),
  };

  // Get default tab for financial section based on permissions
  const getDefaultFinancialTab = () => {
    if (modulePermissions.canViewExpenses) return 'expenses';
    if (modulePermissions.canViewPayments) return 'payments';
    if (modulePermissions.canViewRefunds) return 'refunds';
    if (modulePermissions.canViewPaymentMethods) return 'payment-methods';
    if (modulePermissions.canViewPayroll) return 'payroll';
    return 'expenses'; // Default fallback
  };

  // Get default tab for academic section based on permissions
  const getDefaultAcademicTab = () => {
    if (modulePermissions.canViewStudents) return 'students';
    if (modulePermissions.canViewCourses) return 'courses';
    if (modulePermissions.canViewBatches) return 'batches';
    if (modulePermissions.canViewEnrollments) return 'enrollments';
    return 'students'; // Default fallback
  };

  // Get first accessible route based on user permissions
  const getFirstAccessibleRoute = () => {
    // Check dashboard permission first
    if (modulePermissions.canViewDashboard) return '/';
    
    // Check academic permissions
    if (modulePermissions.canViewStudents || modulePermissions.canViewCourses || 
        modulePermissions.canViewBatches || modulePermissions.canViewEnrollments) {
      return '/academic';
    }
    
    // Check financial permissions
    if (modulePermissions.canViewExpenses || modulePermissions.canViewPayments || 
        modulePermissions.canViewRefunds || modulePermissions.canViewPayroll) {
      return '/financial';
    }
    
    // Check user management permissions
    if (userManagementPermissions.canViewUsers || userManagementPermissions.canViewRoles || 
        userManagementPermissions.canViewPermissions) {
      return '/users';
    }
    
    // Default fallback
    return '/';
  };

  return {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getAllPermissions,
    userManagementPermissions,
    modulePermissions,
    getDefaultFinancialTab,
    getDefaultAcademicTab,
    getFirstAccessibleRoute,
  };
};

/**
 * Higher-order component for permission-based access control
 */
export const withPermission = (requiredPermission: string) => {
  return <P extends object>(Component: React.ComponentType<P>) => {
    const WrappedComponent: React.FC<P> = (props) => {
      const { hasPermission } = usePermissions();
      
      if (!hasPermission(requiredPermission)) {
        return (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center',
            color: '#666'
          }}>
            <h3>🔒 غير مسموح</h3>
            <p>ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
            <p>الصلاحية المطلوبة: <code>{requiredPermission}</code></p>
          </div>
        );
      }
      
      return <Component {...props} />;
    };
    
    WrappedComponent.displayName = `withPermission(${Component.displayName || Component.name})`;
    return WrappedComponent;
  };
};

/**
 * Hook to check if current user can perform user management operations
 */
export const useUserManagementAccess = () => {
  const { userManagementPermissions } = usePermissions();
  
  const canAccessUserManagement = 
    userManagementPermissions.canViewUsers ||
    userManagementPermissions.canViewRoles ||
    userManagementPermissions.canViewPermissions;
    
  const canManageUsers = 
    userManagementPermissions.canCreateUsers ||
    userManagementPermissions.canUpdateUsers ||
    userManagementPermissions.canDeleteUsers;
    
  const canManageRoles = 
    userManagementPermissions.canCreateRoles ||
    userManagementPermissions.canUpdateRoles ||
    userManagementPermissions.canDeleteRoles;
    
  const isFullAdmin = userManagementPermissions.canManageSystem;
  
  return {
    ...userManagementPermissions,
    canAccessUserManagement,
    canManageUsers,
    canManageRoles,
    isFullAdmin,
  };
};