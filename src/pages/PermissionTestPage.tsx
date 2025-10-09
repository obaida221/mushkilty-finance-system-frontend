import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useAuth, usePermission } from '../context/AuthContext';
import { authService } from '../services/authService';

const PermissionTestPage: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  const testPermission = (permissionName: string) => {
    console.log('Testing permission:', permissionName);
    console.log('User:', user);
    console.log('Has permission:', hasPermission(permissionName));
    console.log('Direct authService check:', authService.hasPermission(user, permissionName));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Permission Test Page
      </Typography>

      {user ? (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            Logged in as: {user.name} ({user.email})
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Test Permissions:</Typography>
            
            <Button 
              variant="outlined" 
              onClick={() => testPermission('dashboard:read')}
              sx={{ mr: 1, mb: 1 }}
            >
              Test dashboard:read
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => testPermission('users:read')}
              sx={{ mr: 1, mb: 1 }}
            >
              Test users:read
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => testPermission('nonexistent:permission')}
              sx={{ mr: 1, mb: 1 }}
            >
              Test nonexistent:permission
            </Button>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Permission Results:</Typography>
            <Typography variant="body2">
              dashboard:read: {hasPermission('dashboard:read') ? '✅ ALLOWED' : '❌ DENIED'}
            </Typography>
            <Typography variant="body2">
              users:read: {hasPermission('users:read') ? '✅ ALLOWED' : '❌ DENIED'}
            </Typography>
            <Typography variant="body2">
              nonexistent:permission: {hasPermission('nonexistent:permission') ? '✅ ALLOWED' : '❌ DENIED'}
            </Typography>
          </Box>

          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Debug Info:</Typography>
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
              User permissions count: {user.permissions?.length || 0}
              {'\n'}
              Role permissions count: {user.role?.rolePermissions?.length || 0}
              {'\n'}
              Direct permissions: {user.permissions?.map(p => p.name).join(', ') || 'None'}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Alert severity="warning">
          Please log in to test permissions
        </Alert>
      )}
    </Box>
  );
};

export default PermissionTestPage;