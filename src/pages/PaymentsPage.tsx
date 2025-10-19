import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, MenuItem, FormControl, InputLabel, Select, Chip, Grid, Card, CardContent, 
  IconButton, CircularProgress, Alert, Snackbar, Tooltip
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { 
  Search, Add, Payment as PaymentIcon, Edit, Delete, Visibility, 
  Refresh, Person, CreditCard
} from "@mui/icons-material";
import { usePayments } from "../hooks/usePayments";
import { usePaymentMethods } from "../hooks/usePaymentMethods";
import type { Payment } from "../types/payment";
import type { CreatePaymentDto, PaymentStatus } from "../hooks/usePayments";

type PaymentFormType = {
  user_id: number;
  enrollment_id?: number | null;
  payment_method_id: number;
  payer?: string;
  amount: number;
  currency: "IQD" | "USD";
  type?: "full" | "installment";
  status?: PaymentStatus;
  note?: string;
  paid_at: string;
};

const PaymentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    severity: "success" | "error" 
  }>({ 
    open: false, 
    message: "", 
    severity: "success" 
  });

  const { 
    payments, 
    loading: paymentsLoading, 
    error: paymentsError, 
    createPayment, 
    updatePayment, 
    deletePayment,
    refreshPayments 
  } = usePayments();

  const { paymentMethods } = usePaymentMethods();

  const [paymentForm, setPaymentForm] = useState<PaymentFormType>({
    user_id: 0, 
    enrollment_id: null,
    payment_method_id: 0,
    payer: "",
    amount: 0,
    currency: "IQD",
    type: "full",
    status: "completed",
    note: "",
    paid_at: new Date().toISOString().split('T')[0] 
  });

  const getCurrentUserId = (): number => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }
    return 1;
  };

  useEffect(() => {
    const userId = getCurrentUserId();
    setPaymentForm(prev => ({ ...prev, user_id: userId }));
  }, []);

  const handleOpenDialog = (payment?: Payment) => {
    if (payment) {
      setEditingPayment(payment);
      setPaymentForm({
        user_id: payment.user_id,
        enrollment_id: payment.enrollment_id || null,
        payment_method_id: payment.payment_method_id,
        payer: payment.payer || "",
        amount: payment.amount,
        currency: payment.currency as "IQD" | "USD",
        type: payment.type as "full" | "installment" || "full",
        status: payment.status || "completed",
        note: payment.note || "",
        paid_at: payment.paid_at.split('T')[0]
      });
    } else {
      setEditingPayment(null);
      setPaymentForm({
        user_id: getCurrentUserId(),
        enrollment_id: null,
        payment_method_id: 0,
        payer: "",
        amount: 0,
        currency: "IQD",
        type: "full",
        status: "completed",
        note: "",
        paid_at: new Date().toISOString().split('T')[0]
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSavePayment = async () => {
    if (!paymentForm.payment_method_id || paymentForm.amount <= 0) {
      handleSnackbar("أدخل جميع البيانات بشكل صحيح", "error");
      return;
    }

    try {
      const payload: CreatePaymentDto = {
        user_id: paymentForm.user_id,
        enrollment_id: paymentForm.enrollment_id,
        payment_method_id: paymentForm.payment_method_id,
        payer: paymentForm.payer || null,
        amount: paymentForm.amount,
        currency: paymentForm.currency,
        type: paymentForm.type,
        status: paymentForm.status,
        note: paymentForm.note || null,
        paid_at: paymentForm.paid_at
      };

      if (editingPayment) {
        await updatePayment(editingPayment.id, payload);
        handleSnackbar("تم تحديث الدفعة بنجاح", "success");
      } else {
        await createPayment(payload);
        handleSnackbar("تم تسجيل الدفعة بنجاح", "success");
      }
      handleCloseDialog();
    } catch (err: any) {
      console.error(err);
      handleSnackbar(err.response?.data?.message || "حدث خطأ أثناء الحفظ", "error");
    }
  };

  // دوال الحذف الجديدة - مشابهة لصفحة الخصومات
  const openDeleteDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setDeleteDialogOpen(true);
  };

  const handleDeletePayment = async () => {
    if (!selectedPayment) return;

    try {
      await deletePayment(selectedPayment.id);
      handleSnackbar("تم حذف الدفعة بنجاح", "success");
      setDeleteDialogOpen(false);
      setSelectedPayment(null);
    } catch (err: any) {
      console.error(err);
      handleSnackbar(err.response?.data?.message || "حدث خطأ أثناء الحذف", "error");
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedPayment(null);
  };

  // فلترة الدفعات
  const filteredPayments = payments.filter((payment: Payment) => {
    // console.log('Filtering payment:', payment);
    const matchesSearch =
      (payment.payer?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (payment.note?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (payment.user?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (payment.paymentMethod?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      payment.amount.toString().includes(searchQuery) ||
      payment.id.toString().includes(searchQuery);

    const matchesCurrency = currencyFilter === "all" || payment.currency === currencyFilter;
    const matchesType = typeFilter === "all" || payment.type === typeFilter;
    const matchesStatus = statusFilter === "all" || (payment.status || "completed") === statusFilter;

    return matchesSearch && matchesCurrency && matchesType && matchesStatus;
  });

  // الإحصائيات
  const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const iqdAmount = payments
    .filter(p => p.currency === "IQD")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const usdAmount = payments
    .filter(p => p.currency === "USD")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  
  const columns: GridColDef[] = [
    { 
      field: "id", 
      headerName: "ID", 
      width: 80 
    },
    { 
      field: "paid_at", 
      headerName: "تاريخ الدفع", 
      width: 120,
      valueGetter: (params) => new Date(params.value).toLocaleDateString('ar-EG')
    },
    {
      field: "user",
      headerName: "المستلم",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person fontSize="small" color="action" />
            <Typography color={params.row.user?.name ? "text.primary" : "text.secondary"}>
              {params.row.user?.name || "—"}
            </Typography>
        </Box>
      )
    },
    {
      field: "payer",
      headerName: "الدافع",
      flex: 1,
      renderCell: (params) => (
        <Typography color={params.value ? "text.primary" : "text.secondary"}>
          {params.value || "—"}
        </Typography>
      )
    },
    {
      field: "paymentMethod",
      headerName: "طريقة الدفع",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.row.paymentMethod?.name || "غير معروف"}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    {
      field: "amount",
      headerName: "المبلغ",
      width: 150,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: "success.main" }}>
          {params.row.amount.toLocaleString()} {params.row.currency}
        </Typography>
      ),
    },
    // {
    //   field: "currency",
    //   headerName: "العملة",
    //   width: 100,
    //   renderCell: (params) => (
    //     <Chip
    //       label={params.value}
    //       size="small"
    //       color={params.value === "IQD" ? "primary" : "secondary"}
    //       variant="filled"
    //     />
    //   )
    // },
    {
      field: "type",
      headerName: "النوع",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === "full" ? "كاملة" : "قسط"}
          size="small"
          color={params.value === "full" ? "success" : "warning"}
        />
      )
    },
    {
      field: "status",
      headerName: "الحالة",
      width: 120,
      renderCell: (params) => {
        const status = params.value || "completed";
        const statusConfig = {
          completed: { label: "مكتملة", color: "success" as const },
          pending: { label: "معلقة", color: "warning" as const },
          returned: { label: "مرتجعة", color: "error" as const },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
        return (
          <Chip
            label={config.label}
            size="small"
            color={config.color}
          />
        );
      }
    },
    { 
      field: "note", 
      headerName: "ملاحظات", 
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" color={params.value ? "text.primary" : "text.secondary"}>
          {params.value || "لا توجد ملاحظات"}
        </Typography>
      )
    },
    {
      field: "actions",
      headerName: "إجراءات",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="تعديل">
            <IconButton size="small" color="primary" onClick={() => handleOpenDialog(params.row)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton size="small" color="error" onClick={() => openDeleteDialog(params.row)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.payment_proof && (
            <Tooltip title="عرض إثبات الدفع">
              <IconButton size="small" color="info" onClick={() => window.open(params.row.payment_proof, "_blank")}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  if (paymentsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* الرأس */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon /> إدارة الدفعات
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={refreshPayments}
            disabled={paymentsLoading}
          >
            تحديث
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            دفعة جديدة
          </Button>
        </Box>
      </Box>

      {paymentsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {paymentsError}
        </Alert>
      )}

      {/* بطاقات الإحصائيات */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "primary.main", p: 1.5, borderRadius: 2 }}>
                  <PaymentIcon sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">إجمالي الدفعات</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{payments.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "success.main", p: 1.5, borderRadius: 2 }}>
                  <CreditCard sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">إجمالي المبالغ</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {totalAmount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "info.main", p: 1.5, borderRadius: 2 }}>
                  <Typography sx={{ color: "white", fontWeight: 'bold' }}>IQD</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">الدينار العراقي</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {iqdAmount.toLocaleString()} IQD
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "warning.main", p: 1.5, borderRadius: 2 }}>
                  <Typography sx={{ color: "white", fontWeight: 'bold' }}>USD</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">الدولار الأمريكي</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {usdAmount.toLocaleString()} USD
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* البحث والفلترة */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="بحث في الدفعات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ 
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ) 
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>العملة</InputLabel>
              <Select
                value={currencyFilter}
                label="العملة"
                onChange={(e) => setCurrencyFilter(e.target.value)}
              >
                <MenuItem value="all">جميع العملات</MenuItem>
                <MenuItem value="IQD">دينار عراقي</MenuItem>
                <MenuItem value="USD">دولار أمريكي</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>نوع الدفع</InputLabel>
              <Select
                value={typeFilter}
                label="نوع الدفع"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">جميع الأنواع</MenuItem>
                <MenuItem value="full">دفعة كاملة</MenuItem>
                <MenuItem value="installment">قسط</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={statusFilter}
                label="الحالة"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">جميع الحالات</MenuItem>
                <MenuItem value="completed">مكتملة</MenuItem>
                <MenuItem value="pending">معلقة</MenuItem>
                <MenuItem value="returned">مرتجعة</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary" align="center">
              {filteredPayments.length} من {payments.length} دفعة
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* جدول الدفعات */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <DataGrid
            rows={filteredPayments}
            columns={columns}
            initialState={{ 
              pagination: { paginationModel: { pageSize: 10 } } 
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            autoHeight
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            loading={paymentsLoading}
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": { borderColor: "divider" },
              "& .MuiDataGrid-columnHeaders": { 
                bgcolor: "background.default", 
                borderColor: "divider" 
              }
            }}
          />
        </Box>
      </Paper>

      {/* نافذة إضافة/تعديل الدفعة */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPayment ? "تعديل الدفعة" : "إضافة دفعة جديدة"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {/* Info about automatic status change on refund */}
            <Alert severity="info" sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>ملاحظة:</strong> عند إنشاء مرتجع لدفعة، سيتم تغيير حالتها تلقائياً إلى "مرتجعة"
              </Typography>
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="اسم الدافع (اختياري)"
                  value={paymentForm.payer}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payer: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>طريقة الدفع *</InputLabel>
                  <Select
                    value={paymentForm.payment_method_id}
                    label="طريقة الدفع *"
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method_id: Number(e.target.value) })}
                  >
                    {paymentMethods
                      .filter(method => method.is_valid)
                      .map((method) => (
                        <MenuItem key={method.id} value={method.id}>
                          {method.name} {method.method_number && `(${method.method_number})`}
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="المبلغ *"
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>العملة *</InputLabel>
                  <Select
                    value={paymentForm.currency}
                    label="العملة *"
                    onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value as "IQD" | "USD" })}
                  >
                    <MenuItem value="IQD">دينار عراقي (IQD)</MenuItem>
                    <MenuItem value="USD">دولار أمريكي (USD)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>نوع الدفعة</InputLabel>
                  <Select
                    value={paymentForm.type}
                    label="نوع الدفعة"
                    onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value as "full" | "installment" })}
                  >
                    <MenuItem value="full">دفعة كاملة</MenuItem>
                    <MenuItem value="installment">قسط</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>حالة الدفعة</InputLabel>
                  <Select
                    value={paymentForm.status}
                    label="حالة الدفعة"
                    onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value as PaymentStatus })}
                  >
                    <MenuItem value="completed">مكتملة</MenuItem>
                    <MenuItem value="pending">معلقة</MenuItem>
                    <MenuItem value="returned">مرتجعة</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="تاريخ الدفع *"
                  type="date"
                  value={paymentForm.paid_at}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paid_at: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ملاحظات (اختياري)"
                  multiline
                  rows={3}
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button 
            variant="contained" 
            onClick={handleSavePayment}
            disabled={!paymentForm.payment_method_id || paymentForm.amount <= 0}
          >
            {editingPayment ? "تحديث" : "حفظ"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار الحذف - مشابه لصفحة الخصومات */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف الدفعة الخاصة بـ "{selectedPayment?.payer || selectedPayment?.user?.name}" بقيمة {selectedPayment?.amount.toLocaleString()} {selectedPayment?.currency}؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>إلغاء</Button>
          <Button variant="contained" color="error" onClick={handleDeletePayment}>
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      {/* الإشعارات */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ width: "100%" }}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentsPage;