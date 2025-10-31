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
  List,
  ListItem,
  // ListItemText,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  VpnKey as KeyIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import usePermissions from '../hooks/usePermissions';
import { userManagementService } from '../services/userManagementService';
import { Role, Permission, CreateRoleRequest, UpdateRoleRequest, AssignPermissionsRequest } from '../types';

const RoleManagementPage: React.FC = () => {
  // State management
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<number[]>([]);
  
  // Form state
  const [roleForm, setRoleForm] = useState<CreateRoleRequest>({
    name: '',
    description: '',
  });
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  
  // Permissions
  const { canReadRoles, canCreateRoles, canUpdateRoles, canDeleteRoles, canReadPermissions } = usePermissions();
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!canReadRoles) {
        setError('ليس لديك صلاحية لعرض الأدوار');
        return;
      }

      const [rolesData, permissionsData] = await Promise.all([
        userManagementService.getAllRoles(),
        canReadPermissions ? 
          userManagementService.getAllPermissions() : 
          Promise.resolve([]),
      ]);
      
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setError(error.message || 'فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Role operations
  const handleCreateRole = async () => {
    try {
      await userManagementService.createRole(roleForm);
      setSnackbar({ open: true, message: 'تم إنشاء الدور بنجاح', severity: 'success' });
      setRoleDialogOpen(false);
      resetRoleForm();
      loadData();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'فشل في إنشاء الدور', severity: 'error' });
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;
    
    try {
      const updateData: UpdateRoleRequest = {
        name: roleForm.name,
        description: roleForm.description,
      };
      
      await userManagementService.updateRole(selectedRole.id, updateData);
      setSnackbar({ open: true, message: 'تم تحديث الدور بنجاح', severity: 'success' });
      setRoleDialogOpen(false);
      resetRoleForm();
      loadData();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'فشل في تحديث الدور', severity: 'error' });
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    
    try {
      await userManagementService.deleteRole(selectedRole.id);
      setSnackbar({ open: true, message: 'تم حذف الدور بنجاح', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedRole(null);
      loadData();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'فشل في حذف الدور', severity: 'error' });
    }
  };

  // Permission assignment
  const handleAssignPermissions = async () => {
    if (!selectedRole) return;

    try {
      const assignData: AssignPermissionsRequest = {
        permissionIds: selectedRolePermissions,
        replace: true, // Replace all existing permissions
      };

      await userManagementService.assignPermissionsToRole(selectedRole.id, assignData);
      setSnackbar({ open: true, message: 'تم تحديث صلاحيات الدور بنجاح', severity: 'success' });
      setPermissionDialogOpen(false);
      setSelectedRole(null);
      setSelectedRolePermissions([]);
      loadData();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'فشل في تحديث صلاحيات الدور', severity: 'error' });
    }
  };

  // System setup
  const handleSeedRoles = async () => {
    try {
      setLoading(true);
      await userManagementService.seedRoles();
      setSnackbar({ open: true, message: 'تم إنشاء الأدوار الافتراضية بنجاح', severity: 'success' });
      loadData();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'فشل في إنشاء الأدوار الافتراضية', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Form helpers
  const resetRoleForm = () => {
    setRoleForm({ name: '', description: '' });
    setSelectedRole(null);
  };

  const openCreateRoleDialog = () => {
    resetRoleForm();
    setRoleDialogOpen(true);
  };

  const openEditRoleDialog = (role: Role) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
    });
    setRoleDialogOpen(true);
  };

  const openPermissionDialog = async (role: Role) => {
    setSelectedRole(role);
    
    try {
      // Get current role permissions
      const rolePermissions = await userManagementService.getRolePermissions(role.id);
      const currentPermissionIds = rolePermissions.permissions.map(p => p.id);
      setSelectedRolePermissions(currentPermissionIds);
      setPermissionDialogOpen(true);
    } catch (error: any) {
      setSnackbar({ open: true, message: 'فشل في جلب صلاحيات الدور', severity: 'error' });
    }
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedRolePermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Filter roles based on search query
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!canReadRoles) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          ليس لديك صلاحية للوصول إلى إدارة الأدوار
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon /> إدارة الأدوار
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
          {canCreateRoles && (
            <>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<SecurityIcon />}
                onClick={handleSeedRoles}
                disabled={loading}
              >
                إنشاء الأدوار الافتراضية
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateRoleDialog}
              >
                إضافة دور
              </Button>
            </>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SecurityIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{roles.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي الأدوار
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <KeyIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {roles.reduce((total, role) => total + (role.rolePermissions?.length || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي الصلاحيات المعينة
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssignmentIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {roles.reduce((total, role) => total + (role.users?.length || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    المستخدمون المعينون
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="البحث في الأدوار (الاسم، الوصف)..."
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
      </Paper>

      {/* Roles Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>المعرف</TableCell>
                <TableCell>اسم الدور</TableCell>
                <TableCell>الوصف</TableCell>
                <TableCell>عدد الصلاحيات</TableCell>
                <TableCell>عدد المستخدمين</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد أدوار'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id} hover>
                    <TableCell>{role.id}</TableCell>
                    <TableCell>
                      <Chip
                        label={role.name}
                        color={role.name === 'admin' ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <Chip 
                        label={role.rolePermissions?.length || 0}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={role.users?.length || 0}
                        color="secondary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {canUpdateRoles && (
                          <>
                            <Tooltip title="تعديل الدور">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => openEditRoleDialog(role)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="إدارة الصلاحيات">
                              <IconButton 
                                size="small" 
                                color="secondary"
                                onClick={() => openPermissionDialog(role)}
                              >
                                <KeyIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {canDeleteRoles && role.name !== 'admin' && (
                          <Tooltip title="حذف">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => openDeleteDialog(role)}
                            >
                              <DeleteIcon />
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

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedRole ? 'تعديل الدور' : 'إضافة دور جديد'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="اسم الدور"
              value={roleForm.name}
              onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
              required
              fullWidth
              helperText="اسم فريد للدور (مثل: admin, manager, user)"
            />
            <TextField
              label="الوصف"
              value={roleForm.description}
              onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
              helperText="وصف مفصل للدور ومسؤولياته"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRoleDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={selectedRole ? handleUpdateRole : handleCreateRole}
            variant="contained"
            disabled={!roleForm.name.trim()}
          >
            {selectedRole ? 'تحديث' : 'إنشاء'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permission Assignment Dialog */}
      <Dialog 
        open={permissionDialogOpen} 
        onClose={() => setPermissionDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          إدارة صلاحيات الدور: {selectedRole?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            اختر الصلاحيات التي تريد تعيينها لهذا الدور
          </Typography>
          
          {permissions.length === 0 ? (
            <Alert severity="info">
              لا توجد صلاحيات متاحة. يرجى إنشاء الصلاحيات الافتراضية أولاً.
            </Alert>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {permissions.map((permission) => (
                <ListItem key={permission.id} dense>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedRolePermissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {permission.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {permission.description || 'لا يوجد وصف'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            الصلاحيات المحددة: {selectedRolePermissions.length} من {permissions.length}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPermissionDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={handleAssignPermissions}
            variant="contained"
            disabled={permissions.length === 0}
          >
            حفظ الصلاحيات
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف الدور "{selectedRole?.name}"؟
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            هذا الإجراء لا يمكن التراجع عنه وسيؤثر على جميع المستخدمين المعينين لهذا الدور
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
          <Button onClick={handleDeleteRole} color="error" variant="contained">
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

export default RoleManagementPage;