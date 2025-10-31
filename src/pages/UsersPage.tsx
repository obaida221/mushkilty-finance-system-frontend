"use client"

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  VpnKey as KeyIcon,
} from '@mui/icons-material';
import { usePermissions } from '../hooks/usePermissions';
import UserManagementPage from './UserManagementPage';
import RoleManagementPage from './RoleManagementPage';
import PermissionManagementPage from './PermissionManagementPage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-management-tabpanel-${index}`}
      aria-labelledby={`user-management-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const UsersPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { 
    canReadUsers: canViewUsers,
    canReadRoles: canViewRoles,
    canReadPermissions: canViewPermissions,
    canCreateUsers,
    canUpdateUsers,
    canDeleteUsers,
    canCreateRoles,
    canUpdateRoles,
    canDeleteRoles,
    canCreatePermissions,
    canUpdatePermissions,
    canDeletePermissions,
    canManageSystem
  } = usePermissions();

  // Check if user has any permission to access user management
  const canAccessUserManagement = 
    canViewUsers ||
    canViewRoles ||
    canViewPermissions;

  if (!canAccessUserManagement) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          ليس لديك صلاحية للوصول إلى إدارة المستخدمين والصلاحيات
        </Alert>
      </Box>
    );
  }

  // Determine which tabs to show based on permissions
  const availableTabs = [];
  let tabIndex = 0;

  // if (canViewUsers) {
    availableTabs.push({
      label: 'المستخدمون',
      icon: <PersonIcon />,
      component: <UserManagementPage />,
      index: tabIndex++
    });
  // }

  if (canViewRoles) {
    availableTabs.push({
      label: 'الأدوار',
      icon: <SecurityIcon />,
      component: <RoleManagementPage />,
      index: tabIndex++
    });
  }

  if (canViewPermissions) {
    availableTabs.push({
      label: 'الصلاحيات',
      icon: <KeyIcon />,
      component: <PermissionManagementPage />,
      index: tabIndex++
    });
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, px: 3, pt: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon /> إدارة المستخدمين والصلاحيات
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          إدارة شاملة للمستخدمين والأدوار والصلاحيات في النظام
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 0 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              fontSize: '1rem',
            }
          }}
        >
          {availableTabs.map((tab) => (
            <Tab 
              key={tab.index}
              label={tab.label} 
              icon={tab.icon} 
              iconPosition="start"
            />
          ))}
        </Tabs>

        {/* Tab Panels */}
        {availableTabs.map((tab) => (
          <TabPanel key={tab.index} value={tabValue} index={tab.index}>
            {tab.component}
          </TabPanel>
        ))}
      </Paper>
    </Box>
  );
};

export default UsersPage;
