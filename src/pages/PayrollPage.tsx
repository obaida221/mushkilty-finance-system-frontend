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
  AccountBalance as AccountBalanceIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility,
} from '@mui/icons-material';
import  payrollsAPI  from '../api/payrollsAPI';
import type { Payroll, PayrollFormData } from '../types/payroll';

const PayrollsPage: React.FC = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDetailsPayroll, setSelectedDetailsPayroll] = useState<Payroll | null>(null);

  const [payrollForm, setPayrollForm] = useState<PayrollFormData>({
    user_id: 0,
    amount: 0,
    currency: 'IQD',
    period_start: '',
    period_end: '',
    paid_at: null,
    note: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // الحصول على ID المستخدم الحالي
  const getCurrentUserId = (): number => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }
    return 1;
  };

  // تحميل كشوف المرتبات
  const fetchPayrolls = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await payrollsAPI.getAll();
      setPayrolls(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'فشل في تحميل كشوف المرتبات');
    } finally {
      setLoading(false);
    }
  };

  // تحديث البيانات
  const refreshPayrolls = () => {
    fetchPayrolls();
  };

  // تحديد حالة الراتب بناءً على paid_at
  const getPayrollStatus = (payroll: Payroll): string => {
    return payroll.paid_at ? 'مدفوع' : 'معلق';
  };

  // تحديد لون الحالة
  const getStatusColor = (payroll: Payroll): "success" | "warning" => {
    return payroll.paid_at ? "success" : "warning";
  };

  // عمليات كشوف المرتبات باستخدام payrollsAPI مباشرة
  const handleCreatePayroll = async () => {
    try {
      setLoading(true);
      const formDataWithUserId = {
        ...payrollForm,
        user_id: getCurrentUserId()
      };
      
      await payrollsAPI.create(formDataWithUserId);
      setSnackbar({ open: true, message: 'تم إنشاء كشف المرتب بنجاح', severity: 'success' });
      setDialogOpen(false);
      resetForm();
      fetchPayrolls(); // إعادة تحميل البيانات
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'فشل في إنشاء كشف المرتب', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayroll = async () => {
    if (!selectedPayroll) return;

    try {
      setLoading(true);
      await payrollsAPI.update(selectedPayroll.id, payrollForm);
      setSnackbar({ open: true, message: 'تم تحديث كشف المرتب بنجاح', severity: 'success' });
      setDialogOpen(false);
      resetForm();
      fetchPayrolls(); // إعادة تحميل البيانات
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'فشل في تحديث كشف المرتب', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayroll = async () => {
    if (!selectedPayroll) return;

    try {
      setLoading(true);
      await payrollsAPI.delete(selectedPayroll.id);
      setSnackbar({ open: true, message: 'تم حذف كشف المرتب بنجاح', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedPayroll(null);
      fetchPayrolls(); // إعادة تحميل البيانات
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'فشل في حذف كشف المرتب', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // الحصول على تفاصيل كشف مرتب باستخدام API مباشرة
  const handleGetPayrollDetails = async (id: number) => {
    try {
      const response = await payrollsAPI.getById(id);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'فشل في جلب التفاصيل');
    }
  };

  // دوال المساعدة للنماذج
  const resetForm = () => {
    setPayrollForm({
      user_id: getCurrentUserId(),
      amount: 0,
      currency: 'IQD',
      period_start: '',
      period_end: '',
      paid_at: null,
      note: '',
    });
    setSelectedPayroll(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setPayrollForm({
      user_id: payroll.user_id,
      amount: payroll.amount,
      currency: payroll.currency as 'IQD' | 'USD',
      period_start: payroll.period_start,
      period_end: payroll.period_end,
      paid_at: payroll.paid_at,
      note: payroll.note || '',
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setDeleteDialogOpen(true);
  };

  const openDetailsDialog = async (payroll: Payroll) => {
    try {
      const freshPayrollData = await handleGetPayrollDetails(payroll.id);
      setSelectedDetailsPayroll(freshPayrollData);
      setDetailsDialogOpen(true);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'فشل في تحميل التفاصيل', severity: 'error' });
    }
  };

  // تصفية كشوف المرتبات
  const filteredPayrolls = payrolls.filter(payroll => {
    // تطبيق فلتر العملة
    if (currencyFilter && payroll.currency !== currencyFilter) {
      return false;
    }
    
    // تطبيق فلتر الحالة
    if (statusFilter) {
      const isPaid = payroll.paid_at !== null;
      if (statusFilter === 'paid' && !isPaid) return false;
      if (statusFilter === 'pending' && isPaid) return false;
    }
    
    // تطبيق بحث الاستعلام
    return (
      payroll.id.toString().includes(searchQuery) ||
      payroll.amount.toString().includes(searchQuery) ||
      payroll.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payroll.period_start.includes(searchQuery) ||
      payroll.period_end.includes(searchQuery) ||
      (payroll.note && payroll.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      getPayrollStatus(payroll).includes(searchQuery)
    );
  });

  // الإحصائيات
  const totalPayrolls = payrolls.length;
  const paidPayrolls = payrolls.filter(p => p.paid_at).length;
  const pendingPayrolls = payrolls.filter(p => !p.paid_at).length;
  const totalAmountIQD = payrolls.filter(p => p.currency === 'IQD').reduce((sum, p) => sum + p.amount, 0);
  const totalAmountUSD = payrolls.filter(p => p.currency === 'USD').reduce((sum, p) => sum + p.amount, 0);

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    fetchPayrolls();
  }, []);

  if (loading && payrolls.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: { xs: 2, sm: 3 }, flexWrap: 'wrap', gap: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1.5rem', sm: 'inherit' } }}>
          <AccountBalanceIcon sx={{ fontSize: { xs: 28, sm: 32 } }} /> إدارة كشوف المرتبات
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshPayrolls}
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
            إضافة كشف مرتب
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
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                <AccountBalanceIcon color="primary" sx={{ fontSize: { xs: 28, sm: 32 } }} />
                <Box>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: 'inherit' } }}>{totalPayrolls}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    إجمالي الكشوف
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                <Box sx={{ bgcolor: "success.main", p: { xs: 1, sm: 1.5 }, borderRadius: 2 }}>
                  <AccountBalanceIcon sx={{ color: "white", fontSize: { xs: 24, sm: 28 } }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: 'inherit' } }}>
                    {paidPayrolls}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    كشوف مدفوعة
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                <Box sx={{ bgcolor: "warning.main", p: { xs: 1, sm: 1.5 }, borderRadius: 2 }}>
                  <AccountBalanceIcon sx={{ color: "white", fontSize: { xs: 24, sm: 28 } }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: 'inherit' } }}>
                    {pendingPayrolls}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    كشوف معلقة
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  إجمالي المبالغ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  IQD: {totalAmountIQD.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  USD: {totalAmountUSD.toLocaleString()}
                </Typography>
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
              placeholder="بحث في كشوف المرتبات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: { xs: 20, sm: 24 } }} /></InputAdornment> }}
              sx={{ flex: 1, minWidth: 250 }}
              size="medium"
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>العملة</InputLabel>
              <Select
                value={currencyFilter}
                label="العملة"
                onChange={(e) => setCurrencyFilter(e.target.value)}
              >
                <MenuItem value="">جميع العملات</MenuItem>
                <MenuItem value="IQD">IQD</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={statusFilter}
                label="الحالة"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">جميع الحالات</MenuItem>
                <MenuItem value="paid">مدفوع</MenuItem>
                <MenuItem value="pending">معلق</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#94A3B8' }}>
                <TableRow>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>#id</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>المبلغ</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>العملة</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>الفترة من</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>الفترة إلى</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>الحالة</TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem'} }}>إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayrolls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                        {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد كشوف مرتبات متاحة'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  ) : (
                    filteredPayrolls.map((payroll) => (
                      <TableRow key={payroll.id}>
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{payroll.id}</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{payroll.amount.toLocaleString()}</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{payroll.currency}</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{new Date(payroll.period_start).toLocaleDateString('ar-EG')}</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{new Date(payroll.period_end).toLocaleDateString('ar-EG')}</TableCell>
                        <TableCell>
                          <Chip
                            label={getPayrollStatus(payroll)}
                            color={getStatusColor(payroll)}
                            size="small"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="عرض التفاصيل">
                            <IconButton size="small" color="primary" onClick={() => openDetailsDialog(payroll)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="تعديل">
                            <IconButton size="small" color="primary" onClick={() => openEditDialog(payroll)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton size="small" color="error" onClick={() => openDeleteDialog(payroll)}>
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
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>{selectedPayroll ? "تعديل كشف المرتب" : "إضافة كشف مرتب جديد"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="المبلغ"
              type="number"
              value={payrollForm.amount}
              onChange={(e) => setPayrollForm({ ...payrollForm, amount: Number(e.target.value) })}
              size="medium"
            />
            <FormControl fullWidth>
              <InputLabel>العملة</InputLabel>
              <Select
                value={payrollForm.currency}
                label="العملة"
                onChange={(e) => setPayrollForm({ ...payrollForm, currency: e.target.value as 'IQD' | 'USD' })}
              >
                <MenuItem value="IQD">IQD</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="الفترة من"
              type="date"
              value={payrollForm.period_start}
              onChange={(e) => setPayrollForm({ ...payrollForm, period_start: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="الفترة إلى"
              type="date"
              value={payrollForm.period_end}
              onChange={(e) => setPayrollForm({ ...payrollForm, period_end: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="تاريخ الدفع (اختياري)"
              type="datetime-local"
              value={payrollForm.paid_at || ''}
              onChange={(e) => setPayrollForm({ ...payrollForm, paid_at: e.target.value || null })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="ملاحظات (اختياري)"
              value={payrollForm.note}
              onChange={(e) => setPayrollForm({ ...payrollForm, note: e.target.value })}
              multiline
              rows={3}
              size="medium"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={selectedPayroll ? handleUpdatePayroll : handleCreatePayroll}
            disabled={!payrollForm.amount || !payrollForm.period_start || !payrollForm.period_end || loading}
          >
            {loading ? <CircularProgress size={24} /> : (selectedPayroll ? "تحديث" : "إنشاء")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            هل أنت متأكد من حذف كشف المرتب #{selectedPayroll?.id}؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} size="small">إلغاء</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeletePayroll}
            size="small"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "حذف"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>تفاصيل كشف المرتب</DialogTitle>
        <DialogContent>
          {selectedDetailsPayroll && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontSize: "1em", fontWeight: "bold", mb: 1.5, textDecoration: "underline" }}>معلومات عامة:</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography><strong>المعرف:</strong> {selectedDetailsPayroll.id}</Typography>
                        <Typography><strong>المبلغ:</strong> {selectedDetailsPayroll.amount.toLocaleString()} {selectedDetailsPayroll.currency}</Typography>
                        <Typography><strong>العملة:</strong> {selectedDetailsPayroll.currency}</Typography>
                        <Typography><strong>الحالة:</strong> 
                          <Chip 
                            label={getPayrollStatus(selectedDetailsPayroll)} 
                            color={getStatusColor(selectedDetailsPayroll)} 
                            size="small"
                            sx={{ ml: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                          />
                        </Typography>
                        {selectedDetailsPayroll.note && (
                          <Typography><strong>ملاحظات:</strong> {selectedDetailsPayroll.note}</Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{fontSize: "1em", fontWeight: "bold", mb: 1.5, textDecoration: "underline"}}>معلومات الفترة:</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography><strong>الفترة من:</strong> {new Date(selectedDetailsPayroll.period_start).toLocaleDateString('ar-EG')}</Typography>
                        <Typography><strong>الفترة إلى:</strong> {new Date(selectedDetailsPayroll.period_end).toLocaleDateString('ar-EG')}</Typography>
                        {selectedDetailsPayroll.paid_at && (
                          <Typography><strong>تاريخ الدفع:</strong> {new Date(selectedDetailsPayroll.paid_at).toLocaleString('ar-EG')}</Typography>
                        )}
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                        <Box>
                          <Typography><strong>تاريخ الإنشاء:</strong></Typography>
                          <Typography>{new Date(selectedDetailsPayroll.created_at).toLocaleString('ar-EG')}</Typography>
                        </Box>
                        <Box>
                          <Typography><strong>آخر تعديل:</strong></Typography>
                          <Typography>{new Date(selectedDetailsPayroll.updated_at).toLocaleString('ar-EG')}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
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

export default PayrollsPage;