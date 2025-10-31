import { useAuth, usePermission } from '../context/AuthContext';

/**
 * Enhanced permission checking hook
 * Provides multiple ways to check permissions for UI components
 */
export const usePermissions = () => {
  const { hasPermission: checkPermission } = usePermission();
  const { user } = useAuth();

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permissionName: string): boolean => {
    if (!user) return false;

    // Check direct permissions
    if (checkPermission(permissionName)) {
      return true;
    }

    return false;
  };



  // Academic permissions
  const canReadStudents = hasPermission('students:read');
  const canReadCourses = hasPermission('courses:read');
  const canReadBatches = hasPermission('batches:read');
  const canReadEnrollments = hasPermission('enrollments:read');
  const canReadDiscounts = hasPermission('discounts:read');

  // Financial permissions
  const canReadPayments = hasPermission('payments:read');
  const canCreatePayments = hasPermission('payments:create');
  const canUpdatePayments = hasPermission('payments:update');
  const canDeletePayments = hasPermission('payments:delete');
  
  const canReadExpenses = hasPermission('expenses:read');
  const canCreateExpenses = hasPermission('expenses:create');
  const canUpdateExpenses = hasPermission('expenses:update');
  const canDeleteExpenses = hasPermission('expenses:delete');
  
  const canReadRefunds = hasPermission('refunds:read');
  const canCreateRefunds = hasPermission('refunds:create');
  const canUpdateRefunds = hasPermission('refunds:update');
  const canDeleteRefunds = hasPermission('refunds:delete');
  
  const canReadPaymentMethods = hasPermission('payment-methods:read');
  const canCreatePaymentMethods = hasPermission('payment-methods:create');
  const canUpdatePaymentMethods = hasPermission('payment-methods:update');
  const canDeletePaymentMethods = hasPermission('payment-methods:delete');
  
  const canReadPayroll = hasPermission('payroll:read');
  const canCreatePayroll = hasPermission('payroll:create');
  const canUpdatePayroll = hasPermission('payroll:update');
  const canDeletePayroll = hasPermission('payroll:delete');

  // User management permissions
  const canReadUsers = hasPermission('users:read');
  const canCreateUsers = hasPermission('users:create');
  const canUpdateUsers = hasPermission('users:update');
  const canDeleteUsers = hasPermission('users:delete');

  const canReadRoles = hasPermission('roles:read');
  const canCreateRoles = hasPermission('roles:create');
  const canUpdateRoles = hasPermission('roles:update');
  const canDeleteRoles = hasPermission('roles:delete');

  const canReadPermissions = hasPermission('permissions:read');
  const canCreatePermissions = hasPermission('permissions:create');
  const canUpdatePermissions = hasPermission('permissions:update');
  const canDeletePermissions = hasPermission('permissions:delete');

  const canManageSystem = hasPermission('system:admin');

  // Dashboard permissions
  const canReadDashboard = hasPermission('dashboard:read');

  // Analytics permissions
  const canReadAnalytics = hasPermission('analytics:read');

  // Composite permissions
  const canAccessAcademic = hasPermission('academic:read') || 
    canReadStudents || canReadCourses || canReadBatches || 
    canReadEnrollments || canReadDiscounts;

  const canAccessFinancial = hasPermission('financial:read') || 
    canReadPayments || canReadExpenses || canReadRefunds || 
    canReadPaymentMethods || canReadPayroll;

  return {
    // Individual permissions
    canReadStudents,
    canReadCourses,
    canReadBatches,
    canReadEnrollments,
    canReadDiscounts,
    
    // Financial permissions
    canReadPayments,
    canCreatePayments,
    canUpdatePayments,
    canDeletePayments,
    
    canReadExpenses,
    canCreateExpenses,
    canUpdateExpenses,
    canDeleteExpenses,
    
    canReadRefunds,
    canCreateRefunds,
    canUpdateRefunds,
    canDeleteRefunds,
    
    canReadPaymentMethods,
    canCreatePaymentMethods,
    canUpdatePaymentMethods,
    canDeletePaymentMethods,
    
    canReadPayroll,
    canCreatePayroll,
    canUpdatePayroll,
    canDeletePayroll,
    
    // User management permissions
    canReadUsers,
    canCreateUsers,
    canUpdateUsers,
    canDeleteUsers,

    canReadRoles,
    canCreateRoles,
    canUpdateRoles,
    canDeleteRoles,

    canReadPermissions,
    canCreatePermissions,
    canUpdatePermissions,
    canDeletePermissions,

    // System permissions
    canManageSystem,
    
    // Dashboard permissions
    canReadDashboard,
    canReadAnalytics,

    // Composite permissions
    canAccessAcademic,
    canAccessFinancial,
  };
};

export default usePermissions;
