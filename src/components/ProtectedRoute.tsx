import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, usePermission } from '../context/AuthContext';
import AccessDeniedPage from './AccessDeniedPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallback?: React.ReactNode;
  redirectTo?: string;
  showAccessDenied?: boolean;
}

/**
 * ProtectedRoute Component
 * Protects routes based on authentication and optionally specific permissions
 * 
 * @param children - The component to render if authorized
 * @param requiredPermission - Optional permission name required to access the route
 * @param fallback - Optional fallback component for permission denied
 * @param redirectTo - Optional redirect path instead of showing access denied
 * @param showAccessDenied - Whether to show access denied page or use fallback/redirect
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission, 
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

  // Check specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
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
      return (
        <AccessDeniedPage 
          requiredPermission={requiredPermission}
          message={`تحتاج إلى صلاحية "${requiredPermission}" للوصول إلى هذه الصفحة`}
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