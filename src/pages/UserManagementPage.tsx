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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { usePermissions } from '../hooks/usePermissions';
import { userManagementService } from '../services/userManagementService';
import { User, Role, CreateUserRequest, UpdateUserRequest } from '../types';

const UserManagementPage: React.FC = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form state
  const [userForm, setUserForm] = useState<CreateUserRequest>({
    email: '',
    name: '',
    password: '',
    role_id: 0,
  });
  
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
      if (!userManagementPermissions.canViewUsers) {
        setError('ليس لديك صلاحية لعرض المستخدمين');
        return;
      }

      const [usersData, rolesData] = await Promise.all([
        userManagementService.getAllUsers(),
        userManagementService.getAllRoles(),
      ]);
      
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setError(
        `فشل في تحميل البيانات: ${error.message ? error.response.data.message : 'خطأ غير معروف'}`
        // error.message || 'فشل في تحميل البيانات'
      );
    } finally {
      setLoading(false);
    }
  };

  // User operations
  const handleCreateUser = async () => {
    try {
      await userManagementService.createUser(userForm);
      setSnackbar({ open: true, message: 'تم إنشاء المستخدم بنجاح', severity: 'success' });
      setUserDialogOpen(false);
      resetUserForm();
      loadData();
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: `فشل في إنشاء المستخدم: ${error.message ? error.response.data.message : 'خطأ غير معروف'}`, 
        severity: 'error' 
      });
      console.error('Create user error:', error ? error.response : 'non-object error' );
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const updateData: UpdateUserRequest = {
        email: userForm.email,
        name: userForm.name,
        role_id: userForm.role_id,
      };
      
      if (userForm.password) {
        updateData.password = userForm.password;
      }
      
      await userManagementService.updateUser(selectedUser.id, updateData);
      setSnackbar({ open: true, message: 'تم تحديث المستخدم بنجاح', severity: 'success' });
      setUserDialogOpen(false);
      resetUserForm();
      loadData();
    } catch (error: any) {
      setSnackbar({
        open: true, 
        message: `فشل في تحديث المستخدم: ${error.message ? error.response.data.message : 'خطأ غير معروف'}`,
        // error.message || 'فشل في تحديث المستخدم', 
        severity: 'error' });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await userManagementService.deleteUser(selectedUser.id);
      setSnackbar({ open: true, message: 'تم حذف المستخدم بنجاح', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      loadData();
    } catch (error: any) {
      setSnackbar({ open: true, 
        message: `فشل في حذف المستخدم: ${error.message ? error.response.data.message : 'خطأ غير معروف'}`,
        // error.message || 'فشل في حذف المستخدم', 
        severity: 'error' });
    }
  };

  // Form helpers
  const resetUserForm = () => {
    setUserForm({ email: '', name: '', password: '', role_id: 0 });
    setSelectedUser(null);
  };

  const openCreateUserDialog = () => {
    resetUserForm();
    setUserDialogOpen(true);
  };

  const openEditUserDialog = (user: User) => {
    setSelectedUser(user);
    setUserForm({
      email: user.email,
      name: user.name || '',
      password: '',
      role_id: user.role_id || 0,
    });
    setUserDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!userManagementPermissions.canViewUsers) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          ليس لديك صلاحية للوصول إلى إدارة المستخدمين
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon /> إدارة المستخدمين
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
          {userManagementPermissions.canCreateUsers && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateUserDialog}
            >
              إضافة مستخدم
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{users.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المستخدمين
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
                <LockIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {users.filter(u => u.role?.name === 'admin').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    المديرون
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
                <PersonIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {users.filter(u => u.role?.name !== 'admin').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    المستخدمون العاديون
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
                <PersonIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{roles.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    الأدوار المتاحة
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="البحث في المستخدمين (البريد الإلكتروني، الاسم، الدور)..."
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

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>المعرف</TableCell>
                <TableCell>البريد الإلكتروني</TableCell>
                <TableCell>الاسم</TableCell>
                <TableCell>الدور</TableCell>
                <TableCell>تاريخ الإنشاء</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد مستخدمون'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name || 'غير محدد'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role?.name || 'غير محدد'}
                        color={user.role?.name === 'admin' ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.created_at 
                        ? new Date(user.created_at).toLocaleDateString('ar')
                        : 'غير محدد'
                      }
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {userManagementPermissions.canUpdateUsers && (
                          <Tooltip title="تعديل">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => openEditUserDialog(user)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {userManagementPermissions.canDeleteUsers && (
                          <Tooltip title="حذف">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => openDeleteDialog(user)}
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

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="البريد الإلكتروني"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              required
              fullWidth
              helperText="يجب أن يكون البريد الإلكتروني صحيحاً وفريداً"
            />
            <TextField
              label="الاسم"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              fullWidth
              helperText="الاسم الكامل للمستخدم (اختياري)"
            />
            <TextField
              label={selectedUser ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور'}
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              required={!selectedUser}
              fullWidth
              helperText={selectedUser ? 'اتركه فارغاً إذا كنت لا تريد تغيير كلمة المرور' : 'يجب أن تكون على الأقل 6 أحرف'}
            />
            <FormControl fullWidth required>
              <InputLabel>الدور</InputLabel>
              <Select
                value={userForm.role_id}
                onChange={(e) => setUserForm({ ...userForm, role_id: e.target.value as number })}
              >
                <MenuItem value={0} disabled>
                  اختر دور المستخدم
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name} - {role.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={selectedUser ? handleUpdateUser : handleCreateUser}
            variant="contained"
            disabled={!userForm.email || !userForm.role_id || (!selectedUser && !userForm.password)}
          >
            {selectedUser ? 'تحديث' : 'إنشاء'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف المستخدم "{selectedUser?.name || selectedUser?.email}"؟
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات المرتبطة بهذا المستخدم
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
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

export default UserManagementPage;