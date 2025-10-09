import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth, usePermission } from '../context/AuthContext';
import { authService } from '../services/authService';

/**
 * Debug page to show user permissions and test permission system
 * Access this page at /debug-permissions
 */
const DebugPermissionsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const { hasPermission } = usePermission();
  const navigate = useNavigate();

  const testPermission = (permissionName: string) => {
    console.log('Testing permission:', permissionName);
    console.log('User:', user);
    console.log('Has permission (hook):', hasPermission(permissionName));
    console.log('Has permission (service):', authService.hasPermission(user, permissionName));
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">جاري التحميل...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          يجب تسجيل الدخول أولاً لعرض معلومات الصلاحيات
        </Alert>
        <Button variant="contained" onClick={() => navigate('/login')}>
          تسجيل الدخول
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          🐛 صفحة تشخيص الصلاحيات
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/')}>
          العودة للرئيسية
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        هذه الصفحة مخصصة للمطورين لتشخيص مشاكل الصلاحيات. يجب حذفها في الإنتاج.
      </Alert>

      {/* User Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            معلومات المستخدم
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2">المعرف:</Typography>
              <Typography variant="body2">{user.id}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">البريد الإلكتروني:</Typography>
              <Typography variant="body2">{user.email}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">الاسم:</Typography>
              <Typography variant="body2">{user.name}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">معرف الدور:</Typography>
              <Typography variant="body2">{user.role_id || 'غير محدد'}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Role Info */}
      {user.role && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              معلومات الدور
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2">المعرف:</Typography>
                <Typography variant="body2">{user.role.id}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">الاسم:</Typography>
                <Typography variant="body2">{user.role.name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">الوصف:</Typography>
                <Typography variant="body2">{user.role.description}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Direct Permissions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            الصلاحيات المباشرة ({user.permissions?.length || 0})
          </Typography>
          {user.permissions && user.permissions.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {user.permissions.map((permission) => (
                <Chip
                  key={permission.id}
                  label={permission.name}
                  color={permission.name === 'dashboard:read' ? 'success' : 'default'}
                  size="small"
                  variant={permission.name === 'dashboard:read' ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              لا توجد صلاحيات مباشرة
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions */}
      {user.role?.rolePermissions && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              صلاحيات الدور ({user.role.rolePermissions.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {user.role.rolePermissions.map((rp) => (
                <Chip
                  key={rp.permission.id}
                  label={rp.permission.name}
                  color={rp.permission.name === 'dashboard:read' ? 'success' : 'default'}
                  size="small"
                  variant={rp.permission.name === 'dashboard:read' ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Permission Tests */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            اختبار الصلاحيات
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>أزرار الاختبار:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => testPermission('dashboard:read')}
              >
                اختبار dashboard:read
              </Button>
              
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => testPermission('users:read')}
              >
                اختبار users:read
              </Button>
              
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => testPermission('students:read')}
              >
                اختبار students:read
              </Button>
              
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => testPermission('nonexistent:permission')}
              >
                اختبار صلاحية وهمية
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>نتائج الاختبار:</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 1 }}>
              <Typography variant="body2">
                dashboard:read: {hasPermission('dashboard:read') ? '✅ مسموح' : '❌ مرفوض'}
              </Typography>
              <Typography variant="body2">
                users:read: {hasPermission('users:read') ? '✅ مسموح' : '❌ مرفوض'}
              </Typography>
              <Typography variant="body2">
                students:read: {hasPermission('students:read') ? '✅ مسموح' : '❌ مرفوض'}
              </Typography>
              <Typography variant="body2">
                nonexistent:permission: {hasPermission('nonexistent:permission') ? '✅ مسموح' : '❌ مرفوض'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Raw JSON Data */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            البيانات الخام (JSON)
          </Typography>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'grey.100', 
            borderRadius: 1, 
            maxHeight: 400, 
            overflow: 'auto',
            border: '1px solid',
            borderColor: 'grey.300'
          }}>
            <Typography 
              variant="body2" 
              component="pre" 
              sx={{ 
                fontFamily: 'monospace', 
                fontSize: '0.75rem',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {JSON.stringify(user, null, 2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          تعليمات للمطورين:
        </Typography>
        <Typography variant="body2">
          1. تحقق من وجود "dashboard:read" في قائمة الصلاحيات المباشرة
          <br />
          2. تأكد من أن اختبار "dashboard:read" يظهر "✅ مسموح"
          <br />
          3. افحص وحدة التحكم (Console) للمزيد من التفاصيل
          <br />
          4. احذف هذه الصفحة بعد حل المشكلة
        </Typography>
      </Alert>
    </Box>
  );
};

export default DebugPermissionsPage;