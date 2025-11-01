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

    // Check role permissions
    if (user.role?.rolePermissions?.some(rp => rp.permission.name === permissionName)) {
      return true;
    }

    return false;
  };

  // Academic permissions
  const canReadStudents = hasPermission('students:read');
  const canCreateStudents = hasPermission('students:create');
  const canUpdateStudents = hasPermission('students:update');
  const canDeleteStudents = hasPermission('students:delete');
  const canAccessStudents =
    canReadStudents || canCreateStudents ||
    canUpdateStudents || canDeleteStudents;
  const studentsManagementPermissions = {
    canReadStudents,
    canCreateStudents,
    canUpdateStudents,
    canDeleteStudents,
  };

  const canReadCourses = hasPermission('courses:read');
  const canCreateCourses = hasPermission('courses:create');
  const canUpdateCourses = hasPermission('courses:update');
  const canDeleteCourses = hasPermission('courses:delete');
  const canAccessCourses =
    canReadCourses || canCreateCourses ||
    canUpdateCourses || canDeleteCourses;
  const coursesManagementPermissions = {
    canReadCourses,
    canCreateCourses,
    canUpdateCourses,
    canDeleteCourses,
  };

  const canReadBatches = hasPermission('batches:read');
  const canCreateBatches = hasPermission('batches:create');
  const canUpdateBatches = hasPermission('batches:update');
  const canDeleteBatches = hasPermission('batches:delete');
  const canAccessBatches =
    canReadBatches || canCreateBatches ||
    canUpdateBatches || canDeleteBatches;
  const batchesManagementPermissions = {
    canReadBatches,
    canCreateBatches,
    canUpdateBatches,
    canDeleteBatches,
  };

  const canReadEnrollments = hasPermission('enrollments:read');
  const canCreateEnrollments = hasPermission('enrollments:create');
  const canUpdateEnrollments = hasPermission('enrollments:update');
  const canDeleteEnrollments = hasPermission('enrollments:delete');
  const canAccessEnrollments =
    canReadEnrollments || canCreateEnrollments ||
    canUpdateEnrollments || canDeleteEnrollments;
  const enrollmentsManagementPermissions = {
    canReadEnrollments,
    canCreateEnrollments,
    canUpdateEnrollments,
    canDeleteEnrollments,
  };

  const canReadDiscounts = hasPermission('discounts:read');
  const canCreateDiscounts = hasPermission('discounts:create');
  const canUpdateDiscounts = hasPermission('discounts:update');
  const canDeleteDiscounts = hasPermission('discounts:delete');
  const canAccessDiscounts =
    canReadDiscounts || canCreateDiscounts ||
    canUpdateDiscounts || canDeleteDiscounts;
  const discountsManagementPermissions = {
    canReadDiscounts,
    canCreateDiscounts,
    canUpdateDiscounts,
    canDeleteDiscounts,
  };

  // Financial permissions
  const canReadPayments = hasPermission('payments:read');
  const canCreatePayments = hasPermission('payments:create');
  const canUpdatePayments = hasPermission('payments:update');
  const canDeletePayments = hasPermission('payments:delete');
  const canAccessPayments =
    canReadPayments || canCreatePayments ||
    canUpdatePayments || canDeletePayments;
  const paymentsManagementPermissions = {
    canReadPayments,
    canCreatePayments,
    canUpdatePayments,
    canDeletePayments,
  };

  const canReadExpenses = hasPermission('expenses:read');
  const canCreateExpenses = hasPermission('expenses:create');
  const canUpdateExpenses = hasPermission('expenses:update');
  const canDeleteExpenses = hasPermission('expenses:delete');
  const canAccessExpenses =
    canReadExpenses || canCreateExpenses ||
    canUpdateExpenses || canDeleteExpenses;
  const expensesManagementPermissions = {
    canReadExpenses,
    canCreateExpenses,
    canUpdateExpenses,
    canDeleteExpenses,
  };

  const canReadRefunds = hasPermission('refunds:read');
  const canCreateRefunds = hasPermission('refunds:create');
  const canUpdateRefunds = hasPermission('refunds:update');
  const canDeleteRefunds = hasPermission('refunds:delete');
  const canAccessRefunds =
    canReadRefunds || canCreateRefunds ||
    canUpdateRefunds || canDeleteRefunds;
  const refundsManagementPermissions = {
    canReadRefunds,
    canCreateRefunds,
    canUpdateRefunds,
    canDeleteRefunds,
  };

  // Payment methods permissions
  const canReadPaymentMethods = hasPermission('payment-methods:read');
  const canCreatePaymentMethods = hasPermission('payment-methods:create');
  const canUpdatePaymentMethods = hasPermission('payment-methods:update');
  const canDeletePaymentMethods = hasPermission('payment-methods:delete');
  const canAccessPaymentMethods =
    canReadPaymentMethods || canCreatePaymentMethods ||
    canUpdatePaymentMethods || canDeletePaymentMethods;
  const paymentMethodsManagementPermissions = {
    canReadPaymentMethods,
    canCreatePaymentMethods,
    canUpdatePaymentMethods,
    canDeletePaymentMethods,
  };

  // Payroll permissions
  const canReadPayroll = hasPermission('payroll:read');
  const canCreatePayroll = hasPermission('payroll:create');
  const canUpdatePayroll = hasPermission('payroll:update');
  const canDeletePayroll = hasPermission('payroll:delete');
  const canAccessPayroll =
    canReadPayroll || canCreatePayroll ||
    canUpdatePayroll || canDeletePayroll;
  const payrollManagementPermissions = {
    canReadPayroll,
    canCreatePayroll,
    canUpdatePayroll,
    canDeletePayroll,
  };

  // User management permissions
  const canReadUsers = hasPermission('users:read');
  const canCreateUsers = hasPermission('users:create');
  const canUpdateUsers = hasPermission('users:update');
  const canDeleteUsers = hasPermission('users:delete');
  const canAccessUsers =
    canReadUsers || canCreateUsers || canUpdateUsers || canDeleteUsers;
  const userManagementPermissions = {
    canReadUsers,
    canCreateUsers,
    canUpdateUsers,
    canDeleteUsers,
  };

  // Role management permissions
  const canReadRoles = hasPermission('roles:read');
  const canCreateRoles = hasPermission('roles:create');
  const canUpdateRoles = hasPermission('roles:update');
  const canDeleteRoles = hasPermission('roles:delete');
  const canAccessRoles =
    canReadRoles || canCreateRoles || canUpdateRoles || canDeleteRoles;
  const roleManagementPermissions = {
    canReadRoles,
    canCreateRoles,
    canUpdateRoles,
    canDeleteRoles,
  };

  const canReadPermissions = hasPermission('permissions:read');
  const canCreatePermissions = hasPermission('permissions:create');
  const canUpdatePermissions = hasPermission('permissions:update');
  const canDeletePermissions = hasPermission('permissions:delete');
  const canAccessPermissions =
    canReadPermissions || canCreatePermissions ||
    canUpdatePermissions || canDeletePermissions;
  const permissionsManagementPermissions = {
    canReadPermissions,
    canCreatePermissions,
    canUpdatePermissions,
    canDeletePermissions,
  };

  const canAccessUsersManagement =
    canAccessUsers || canAccessRoles || canAccessPermissions;

  const canManageSystem = hasPermission('system:admin');

  // Dashboard permissions
  const canReadDashboard = hasPermission('dashboard:read');

  // Analytics permissions
  const canReadAnalytics = hasPermission('analytics:read');

  // Composite permissions
  const canAccessAcademic =
    hasPermission('academic:read') || canAccessStudents ||
    canAccessCourses || canAccessBatches ||
    canAccessEnrollments || canAccessDiscounts;

  const canAccessFinancial = hasPermission('financial:read') ||
    canAccessPayments || canAccessExpenses || canAccessRefunds ||
    canAccessPaymentMethods || canAccessPayroll;

  // Get default tab for each section based on permissions
  const getDefaultAcademicTab = () => {
    if (canAccessStudents) return 'students';
    if (canAccessCourses) return 'courses';
    if (canAccessBatches) return 'batches';
    if (canAccessEnrollments) return 'enrollments';
    if (canAccessDiscounts) return 'discounts';
    return 'students'; // Default fallback
  };

  const getDefaultFinancialTab = () => {
    if (canAccessExpenses) return 'expenses';
    if (canAccessPayments) return 'payments';
    if (canAccessRefunds) return 'refunds';
    if (canAccessPaymentMethods) return 'payment-methods';
    if (canAccessPayroll) return 'payroll';
    return 'expenses'; // Default fallback
  };

  const getDefaultUserManagementTab = () => {
    if (canAccessUsers) return 'users';
    if (canAccessRoles) return 'roles';
    if (canAccessPermissions) return 'permissions';
    return 'users'; // Default fallback
  };

  // Get first accessible route based on permissions
  const getFirstAccessibleRoute = () => {
    if (canReadDashboard) return '/';
    if (canAccessUsers || canAccessRoles || canAccessPermissions) return '/users';
    if (canAccessAcademic) return '/academic';
    if (canAccessFinancial) return '/financial';
    return '/dashboard'; // Default fallback
  };

  return {
    // Permission checker
    hasPermission,

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
    canAccessUsersManagement,
    canAccessAcademic,
    canAccessFinancial,
    canAccessUsers,
    canAccessRoles,
    canAccessPermissions,
    canAccessPayments,
    canAccessExpenses,
    canAccessRefunds,
    canAccessPaymentMethods,
    canAccessPayroll,

    // Default tabs
    getDefaultAcademicTab,
    getDefaultFinancialTab,
    getDefaultUserManagementTab,

    // Navigation
    getFirstAccessibleRoute,

    // Grouped permissions
    studentsManagementPermissions,
    coursesManagementPermissions,
    batchesManagementPermissions,
    enrollmentsManagementPermissions,
    discountsManagementPermissions,
    paymentsManagementPermissions,
    expensesManagementPermissions,
    refundsManagementPermissions,
    paymentMethodsManagementPermissions,
    payrollManagementPermissions,
    userManagementPermissions,
    roleManagementPermissions,
    permissionsManagementPermissions,
  };
};

export default usePermissions;
