
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, usePermission } from '../context/AuthContext';
import AccessDeniedPage from './AccessDeniedPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
  showAccessDenied?: boolean;
}

/**
 * ProtectedRoute Component
 * Protects routes based on authentication and optionally specific permissions
 * Can accept either a single permission or an array of permissions (any of which grants access)
 *
 * @param children - The component to render if authorized
 * @param requiredPermission - Optional single permission name required to access route
 * @param requiredPermissions - Optional array of permission names (any one grants access)
 * @param fallback - Optional fallback component for permission denied
 * @param redirectTo - Optional redirect path instead of showing access denied
 * @param showAccessDenied - Whether to show access denied page or use fallback/redirect
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissions,
  fallback,
  redirectTo,
  showAccessDenied = true
}) => {
  const { user, loading } = useAuth();
  const { hasPermission } = usePermission();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required permission
  const hasRequiredPermission = requiredPermission ? hasPermission(requiredPermission) : true;

  // Check if user has any of required permissions
  const hasAnyRequiredPermission = requiredPermissions 
    ? requiredPermissions.some(permission => hasPermission(permission))
    : true;

  // If user doesn't have required permissions
  if (!hasRequiredPermission && !hasAnyRequiredPermission) {
    // Use custom redirect if specified
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Use custom fallback if specified
    if (fallback) {
      return <>{fallback}</>;
    }

    // Show access denied page by default
    if (showAccessDenied) {
      // If we have multiple permissions, show them in message
      const permissionText = requiredPermissions 
        ? requiredPermissions.join(" أو ")
        : requiredPermission;

      return (
        <AccessDeniedPage
          requiredPermission={permissionText}
          message={`تحتاج إلى إحدى الصلاحيات التالية: "${permissionText}" للوصول إلى هذه الصفحة`}
        />
      );
    }

    // Fallback to simple access denied message
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">الوصول مرفوض</h2>
          <p className="text-gray-600">ليس لديك الصلاحية المطلوبة للوصول إلى هذه الصفحة.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
