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
  Select,
  MenuItem,
  InputLabel,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CreditCard as CreditCardIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility,
} from '@mui/icons-material';
import { paymentMethodsAPI, type PaymentMethodWithUser } from '../api/paymentMethodsAPI';
// import { authService } from '../services/authService';
import type { PaymentMethodFormData } from '../types/paymentMethods';

const PaymentMethodsPage: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null); // null for all, true for active, false for inactive

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodWithUser | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDetailsPaymentMethod, setSelectedDetailsPaymentMethod] = useState<PaymentMethodWithUser | null>(null);

  const [paymentMethodForm, setPaymentMethodForm] = useState<PaymentMethodFormData>({
    name: '',
    method_number: '',
    description: '',
    is_valid: true,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const getCurrentUserId = (): number => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }
    return 0;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentMethodsAPI.getAll();
      setPaymentMethods(response.data);
      console.log('Loaded payment methods:', response.data);
    } catch (error: any) {
      console.error('Failed to load payment methods:', error);
      setError(error.response.data.message  || 'فشل في تحميل وسائل الدفع');
    } finally {
      setLoading(false);
    }
  };

  // Payment method operations
  const handleCreatePaymentMethod = async () => {
    try {
      // Add user_id to the form data from current user
      const formDataWithUserId = {
        ...paymentMethodForm,
        user_id: getCurrentUserId()
      };
      
      await paymentMethodsAPI.create(formDataWithUserId);
      setSnackbar({ open: true, message: 'تم إنشاء طريقة الدفع بنجاح', severity: 'success' });
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response.data.message || 'فشل في إنشاء طريقة الدفع', severity: 'error' });
    }
  };

  const handleUpdatePaymentMethod = async () => {
    if (!selectedPaymentMethod) return;

    try {
      await paymentMethodsAPI.update(selectedPaymentMethod.id, paymentMethodForm);
      setSnackbar({ open: true, message: 'تم تحديث طريقة الدفع بنجاح', severity: 'success' });
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response.data.message  || 'فشل في تحديث طريقة الدفع', severity: 'error' });
    }
  };

  const handleDeletePaymentMethod = async () => {
    if (!selectedPaymentMethod) return;

    try {
      await paymentMethodsAPI.delete(selectedPaymentMethod.id);
      setSnackbar({ open: true, message: 'تم حذف طريقة الدفع بنجاح', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedPaymentMethod(null);
      loadData();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response.data.message  || 'فشل في حذف طريقة الدفع', severity: 'error' });
    }
  };

  // Form helpers
  const resetForm = () => {
    setPaymentMethodForm({
      name: '',
      method_number: '',
      description: '',
      is_valid: true,
    });
    setSelectedPaymentMethod(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (paymentMethod: PaymentMethodWithUser) => {
    setSelectedPaymentMethod(paymentMethod);
    setPaymentMethodForm({
      name: paymentMethod.name,
      method_number: paymentMethod.method_number,
      description: paymentMethod.description,
      is_valid: paymentMethod.is_valid,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (paymentMethod: PaymentMethodWithUser) => {
    setSelectedPaymentMethod(paymentMethod);
    setDeleteDialogOpen(true);
  };

  const openDetailsDialog = (paymentMethod: PaymentMethodWithUser) => {
    setSelectedDetailsPaymentMethod(paymentMethod);
    setDetailsDialogOpen(true);
  };

  // Filter payment methods based on search query and status
  const filteredPaymentMethods = paymentMethods.filter(paymentMethod => {
    // Apply status filter if not null
    if (statusFilter !== null && paymentMethod.is_valid !== statusFilter) {
      return false;
    }
    
    // Apply search query filter
    return (
      paymentMethod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (paymentMethod.method_number !== undefined) && paymentMethod.method_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paymentMethod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paymentMethod.id.toString().includes(searchQuery) ||
      (paymentMethod.is_valid ? 'نشط' : 'غير نشط').includes(searchQuery)
    );
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: { xs: 'flex-start', sm: 'center' }, mb: { xs: 2, sm: 3 }, flexWrap: 'wrap', gap: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
            size="medium"
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            تحديث
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
            size="medium"
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            إضافة طريقة دفع
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                <CreditCardIcon color="primary" sx={{ fontSize: { xs: 28, sm: 32 } }} />
                <Box>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: 'inherit' } }}>{paymentMethods.length}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    إجمالي وسائل الدفع
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                <Box sx={{ bgcolor: "success.main", p: { xs: 1, sm: 1.5 }, borderRadius: 2 }}>
                  <CreditCardIcon sx={{ color: "white", fontSize: { xs: 24, sm: 28 } }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: 'inherit' } }}>
                    {paymentMethods.filter(pm => pm.is_valid).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    وسائل دفع نشطة
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                <Box sx={{ bgcolor: "error.main", p: { xs: 1, sm: 1.5 }, borderRadius: 2 }}>
                  <CreditCardIcon sx={{ color: "white", fontSize: { xs: 24, sm: 28 } }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: 'inherit' } }}>
                    {paymentMethods.filter(pm => !pm.is_valid).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    وسائل دفع غير نشطة
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Table */}
      <Paper>
        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <TextField
              fullWidth
              placeholder="بحث في وسائل الدفع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: { xs: 20, sm: 24 } }} /></InputAdornment> }}
              sx={{ flex: 1, minWidth: 250 }}
              size="medium"
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={statusFilter?.toString() || ""}
                label="الحالة"
                onChange={(e) => setStatusFilter(e.target.value === "" ? null : e.target.value === "true")}
              >
                <MenuItem value="">جميع الحالات</MenuItem>
                <MenuItem value="true">نشط</MenuItem>
                <MenuItem value="false">غير نشط</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>#id</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>الاسم</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>الرقم</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>بواسطة</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>الوصف</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>الحالة</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem'} }}>إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPaymentMethods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                        {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد وسائل دفع متاحة'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  ) : (
                    filteredPaymentMethods.map((paymentMethod) => (
                      <TableRow key={paymentMethod.id}>
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{paymentMethod.id}</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{paymentMethod.name}</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{paymentMethod.method_number}</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{paymentMethod.user?.name}</TableCell>
                        { paymentMethod.description ? 
                          <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{paymentMethod.description}</TableCell> : 
                          <TableCell sx={{color: "gray", fontSize: { xs: '0.8rem', sm: '0.9rem' }}}>لا يوجد وصف</TableCell>
                        }
                        <TableCell>
                          <Chip
                            label={paymentMethod.is_valid ? "نشط" : "غير نشط"}
                            color={paymentMethod.is_valid ? "success" : "default"}
                            size="small"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="عرض التفاصيل">
                            <IconButton size="small" color="primary" onClick={() => openDetailsDialog(paymentMethod)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="تعديل">
                            <IconButton size="small" color="primary" onClick={() => openEditDialog(paymentMethod)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton size="small" color="error" onClick={() => openDeleteDialog(paymentMethod)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>{selectedPaymentMethod ? "تعديل طريقة الدفع" : "إضافة طريقة دفع جديدة"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="اسم طريقة الدفع"
              value={paymentMethodForm.name}
              onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, name: e.target.value })}
              size="medium"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                label="الرقم"
                value={paymentMethodForm.method_number}
                onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, method_number: e.target.value })}
                size="medium"
              />
              {/* <Typography>الحالة:</Typography> */}
              <Chip
                label={paymentMethodForm.is_valid ? "نشط" : "غير نشط"}
                color={paymentMethodForm.is_valid ? "success" : "default"}
                onClick={() => setPaymentMethodForm({ ...paymentMethodForm, is_valid: !paymentMethodForm.is_valid })}
                clickable
                sx={{ fontSize: "1rem", fontWeight: "medium" }}
              />
            </Box>
            <TextField
              fullWidth
              label="وصف طريقة الدفع"
              value={paymentMethodForm.description}
              onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, description: e.target.value })}
              multiline
              rows={3}
              size="medium"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={selectedPaymentMethod ? handleUpdatePaymentMethod : handleCreatePaymentMethod}
            disabled={!paymentMethodForm.name.trim()}
          >
            {selectedPaymentMethod ? "تحديث" : "إنشاء"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            هل أنت متأكد من حذف طريقة الدفع "{selectedPaymentMethod?.name}"؟
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} size="small">إلغاء</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeletePaymentMethod}
            size="small"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>تفاصيل طريقة الدفع</DialogTitle>
        <DialogContent>
          {selectedDetailsPaymentMethod && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontSize: "1em", fontWeight: "bold", mb: 1.5, textDecoration: "underline" }}>معلومات عامة:</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography><strong>المعرف:</strong> {selectedDetailsPaymentMethod.id}</Typography>
                        <Typography><strong>الاسم:</strong> {selectedDetailsPaymentMethod.name}</Typography>
                        <Typography><strong>الرقم:</strong> {selectedDetailsPaymentMethod.method_number || "غير محدد"}</Typography>
                        <Typography><strong>الحالة:</strong> 
                          <Chip 
                            label={selectedDetailsPaymentMethod.is_valid ? "نشط" : "غير نشط"} 
                            color={selectedDetailsPaymentMethod.is_valid ? "success" : "default"} 
                            size="small"
                            sx={{ ml: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                          />
                        </Typography>
                        <Typography><strong>الوصف:</strong> {selectedDetailsPaymentMethod.description || "لا يوجد وصف"}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{fontSize: "1em", fontWeight: "bold", mb: 1.5, textDecoration: "underline"}}>تم إنشاؤها من قبل:</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography><strong>اسم المستخدم:</strong> {selectedDetailsPaymentMethod.user?.name || "غير محدد"}</Typography>
                        <Typography><strong>بريد المستخدم:</strong> {selectedDetailsPaymentMethod.user?.email || "غير محدد"}</Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                        <Box>
                          <Typography><strong>تاريخ الإنشاء:</strong></Typography>
                          <Typography>{new Date(selectedDetailsPaymentMethod.created_at).toLocaleString('ar-EG')}</Typography>
                        </Box>
                        <Box>
                          <Typography><strong>آخر تعديل:</strong></Typography>
                          <Typography>{new Date(selectedDetailsPaymentMethod.updated_at).toLocaleString('ar-EG')}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>معلومات التاريخ</Typography>
                      
                    </CardContent>
                  </Card>
                </Grid> */}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailsDialogOpen(false)} variant="outlined">إغلاق</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentMethodsPage;
