import React from 'react';
import { Box, Typography, Button, Card, CardContent, Alert } from '@mui/material';
import { Block, Home, Login } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AccessDeniedPageProps {
  requiredPermission?: string;
  message?: string;
  showLoginButton?: boolean;
  showHomeButton?: boolean;
}

/**
 * Access Denied Boundary Page
 * Shows when user tries to access a protected resource without proper permissions
 */
const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  requiredPermission,
  message,
  showLoginButton = true,
  showHomeButton = true
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleLogin = () => {
    logout(); // Clear current session
    navigate('/login');
  };

  const getDefaultMessage = () => {
    if (!user) {
      return 'يجب تسجيل الدخول أولاً للوصول إلى هذه الصفحة';
    }
    
    if (requiredPermission) {
      return `ليس لديك صلاحية "${requiredPermission}" للوصول إلى هذه الصفحة`;
    }
    
    return 'ليس لديك الصلاحية المطلوبة للوصول إلى هذه الصفحة';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3
      }}
    >
      <Card sx={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Icon */}
          <Box sx={{ mb: 3 }}>
            <Block
              sx={{
                fontSize: 80,
                color: 'error.main',
                mb: 2
              }}
            />
          </Box>

          {/* Title */}
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            الوصول مرفوض
          </Typography>

          {/* Message */}
          <Alert severity="warning" sx={{ mb: 3, textAlign: 'right' }}>
            <Typography variant="body1" gutterBottom>
              {message || getDefaultMessage()}
            </Typography>
            
            {user && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>المستخدم الحالي:</strong> {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>الدور:</strong> {user.role?.name || 'غير محدد'}
                </Typography>
                {requiredPermission && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>الصلاحية المطلوبة:</strong> {requiredPermission}
                  </Typography>
                )}
              </Box>
            )}
          </Alert>

          {/* Additional Info */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع مدير النظام للحصول على الصلاحيات المناسبة.
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {showHomeButton && (
              <Button
                variant="contained"
                startIcon={<Home />}
                onClick={handleGoHome}
                size="large"
              >
                العودة للرئيسية
              </Button>
            )}
            
            {showLoginButton && (
              <Button
                variant="outlined"
                startIcon={<Login />}
                onClick={handleLogin}
                size="large"
              >
                {user ? 'تسجيل دخول بحساب آخر' : 'تسجيل الدخول'}
              </Button>
            )}
          </Box>

          {/* Help Section */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              تحتاج مساعدة؟
            </Typography>
            <Typography variant="body2" color="text.secondary">
              تواصل مع مدير النظام أو قم بمراجعة دليل المستخدم للحصول على معلومات حول الصلاحيات المطلوبة.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AccessDeniedPage;