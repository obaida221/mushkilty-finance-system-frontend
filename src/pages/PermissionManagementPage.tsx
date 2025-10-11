"use client"

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Snackbar,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  VpnKey as KeyIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { usePermissions } from '../hooks/usePermissions';
import { userManagementService } from '../services/userManagementService';
import { Permission} from '../types';

// Permission categories for better organization
const PERMISSION_CATEGORIES = {
  users: 'إدارة المستخدمين',
  roles: 'إدارة الأدوار',
  permissions: 'إدارة الصلاحيات',
  students: 'إدارة الطلاب',
  courses: 'إدارة الدورات',
  batches: 'إدارة المجموعات',
  enrollments: 'إدارة التسجيلات',
  'discount-codes': 'أكواد الخصم',
  'payment-methods': 'طرق الدفع',
  payments: 'إدارة المدفوعات',
  refunds: 'إدارة المبالغ المسترجعة',
  expenses: 'إدارة المصاريف',
  payroll: 'إدارة كشوف المرتبات',
  system: 'إدارة النظام',
  dashboard: 'لوحة التحكم',
};

const PermissionManagementPage: React.FC = () => {
  // State management
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Dialog states
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  

  // Snackbar
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  
  // Permissions
  const { userManagementPermissions } = usePermissions();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!userManagementPermissions.canViewPermissions) {
        setError('ليس لديك صلاحية لعرض الصلاحيات');
        return;
      }

      const permissionsData = await userManagementService.getAllPermissions();
      setPermissions(permissionsData);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setError(error.message || 'فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };



  const openDeleteDialog = (permission: Permission) => {
    setSelectedPermission(permission);
    setDeleteDialogOpen(true);
  };

  // Utility functions
  const getPermissionCategory = (permissionName: string): string => {
    const category = permissionName.split(':')[0];
    return PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES] || 'أخرى';
  };

  const getPermissionAction = (permissionName: string): string => {
    const action = permissionName.split(':')[1];
    const actionMap: { [key: string]: string } = {
      create: 'إنشاء',
      read: 'عرض',
      update: 'تحديث',
      delete: 'حذف',
      search: 'بحث',
      validate: 'تحقق',
      reports: 'تقارير',
      admin: 'إدارة',
    };
    return actionMap[action] || action || 'غير محدد';
  };

  // Filter permissions
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (permission.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    const matchesCategory = categoryFilter === 'all' || 
                           permission.name.startsWith(categoryFilter + ':');
    
    return matchesSearch && matchesCategory;
  });



  // Get unique categories from permissions
  const availableCategories = [...new Set(permissions.map(p => p.name.split(':')[0]))];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!userManagementPermissions.canViewPermissions) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          ليس لديك صلاحية للوصول إلى إدارة الصلاحيات
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyIcon /> إدارة الصلاحيات
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
          >
            تحديث
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <KeyIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{permissions.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي الصلاحيات
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SecurityIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{availableCategories.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    الفئات
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BuildIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {permissions.filter(p => p.name.includes('system')).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    صلاحيات النظام
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <KeyIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {permissions.filter(p => p.name.includes('admin')).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    صلاحيات الإدارة
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="البحث في الصلاحيات (الاسم، الوصف)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>تصفية حسب الفئة</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">جميع الفئات</MenuItem>
                {availableCategories.map(category => (
                  <MenuItem key={category} value={category}>
                    {PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES] || category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Permissions Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>المعرف</TableCell>
                <TableCell>اسم الصلاحية</TableCell>
                <TableCell>الفئة</TableCell>
                <TableCell>الإجراء</TableCell>
                <TableCell>الوصف</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPermissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      {searchQuery || categoryFilter !== 'all' ? 'لا توجد نتائج للبحث' : 'لا يوجد صلاحيات'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPermissions.map((permission) => (
                  <TableRow key={permission.id} hover>
                    <TableCell>{permission.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {permission.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPermissionCategory(permission.name)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPermissionAction(permission.name)}
                        size="small"
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {permission.description || 'لا يوجد وصف'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {userManagementPermissions.canDeletePermissions && (
                          <Tooltip title="حذف">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => openDeleteDialog(permission)}
                            >
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Permission Dialog */}
      <Dialog open={permissionDialogOpen} onClose={() => setPermissionDialogOpen(false)} maxWidth="sm" fullWidth>

      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف الصلاحية "{selectedPermission?.name}"؟
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            هذا الإجراء لا يمكن التراجع عنه وسيؤثر على جميع الأدوار المعينة لهذه الصلاحية
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
          <Button color="error" variant="contained">
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PermissionManagementPage;