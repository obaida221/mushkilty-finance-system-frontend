import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, MenuItem, FormControl, InputLabel, Select, Chip, Grid, Card, CardContent,
  IconButton, CircularProgress, Alert, Snackbar, Tooltip, Autocomplete, Divider
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Search, Add, Payment as PaymentIcon, Edit, Delete, Visibility,
  Refresh, Person, CreditCard, Close
} from "@mui/icons-material";
import { usePayments } from "../hooks/usePayments";
import { usePaymentMethods } from "../hooks/usePaymentMethods";
import { useStudents } from "../hooks/useStudents";
import { useEnrollments } from "../hooks/useEnrollments";
import { useBatches } from "../hooks/useBatches";
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
  payment_source: "student_enrollment" | "external";
};

const DetailItem = ({ label, value, fallback = "غير محدد", multiline = false }: { label: string; value: any; fallback?: string; multiline?: boolean }) => (
  <Box>
    <Typography component="span" fontWeight="bold">{label}:</Typography>
    {multiline ? (
      <Box 
      sx={{ 
        mt: 0.5,
        p: 1.5, 
        bgcolor: 'grey.50', 
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'grey.200',
        minHeight: '60px'
      }}>
        <Typography variant="body2">
          {value || fallback}
        </Typography>
      </Box>
    ) : (
      <Typography component="span" sx={{ ml: 1 }}>
        {value || fallback}
      </Typography>
    )}
  </Box>
);

const PaymentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDetailsPayment, setSelectedDetailsPayment] = useState<Payment | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error"
  }>({
    open: false,
    message: "",
    severity: "success"
  });

  const [paymentSourceFilter, setPaymentSourceFilter] = useState("all");

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
  const { students } = useStudents();
  const { enrollments } = useEnrollments();
  const { batches } = useBatches();

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
    paid_at: new Date().toISOString().split('T')[0],
    payment_source: "student_enrollment"
  });

  const [selectedStudent, setSelectedStudent] = useState<any>(null);

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
        paid_at: payment.paid_at.split('T')[0],
        payment_source: payment.enrollment_id ? "student_enrollment" : "external"
      });

      // If there's an enrollment, set the student
      if (payment.enrollment_id) {
        const enrollment = enrollments.find(e => e.id === payment.enrollment_id);
        if (enrollment) {
          const student = students.find(s => s.id === enrollment.student_id);
          setSelectedStudent(student || null);
        }
      }
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
        paid_at: new Date().toISOString().split('T')[0],
        payment_source: "student_enrollment"
      });
      setSelectedStudent(null);
    }
    setOpenDialog(true);
  };

  const openDetailsDialog = (payment: Payment) => {
    setSelectedDetailsPayment(payment);
    setDetailsDialogOpen(true);
  };



  const handleCloseDialog = () => setOpenDialog(false);
  const handleCloseDetailsDialog = () => setDetailsDialogOpen(false);

  const handleSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSavePayment = async () => {
    if (!paymentForm.payment_method_id || paymentForm.amount <= 0) {
      handleSnackbar("أدخل جميع البيانات بشكل صحيح", "error");
      return;
    }

    // Validate based on payment source
    if (paymentForm.payment_source === "student_enrollment" && !paymentForm.enrollment_id) {
      handleSnackbar("يرجى اختيار تسجيل الطالب", "error");
      return;
    }

    if (paymentForm.payment_source === "external" && !paymentForm.payer) {
      handleSnackbar("يرجى إدخال اسم الدافع", "error");
      return;
    }

    // Check payment type compatibility with existing payments
    if (paymentForm.payment_source === "student_enrollment" && paymentForm.enrollment_id) {
      const existingPayments = payments.filter(p => 
        p.enrollment_id === paymentForm.enrollment_id && 
        p.status !== 'returned'
      );

      // Check if there are existing installments when trying to add a full payment
      if (paymentForm.type === "full" && 
          existingPayments.some(p => p.type === "installment")) {
        handleSnackbar(
          "لا يمكن إضافة دفعة كاملة لتسجيل لديه أقساط مسجلة بالفعل",
          "error"
        );
        return;
      }

      // Check if there's an existing full payment when trying to add an installment
      if (paymentForm.type === "installment" && 
          existingPayments.some(p => p.type === "full")) {
        handleSnackbar(
          "لا يمكن إضافة قسط لتسجيل تم دفعه بالكامل",
          "error"
        );
        return;
      }
    }

    // For installment payments, check if total exceeds enrollment price
    if (paymentForm.payment_source === "student_enrollment" && 
        paymentForm.enrollment_id && 
        paymentForm.type === "installment") {

      const enrollment = enrollments.find(e => e.id === paymentForm.enrollment_id);
      if (enrollment) {
        // Calculate previous payments for this enrollment (excluding returned payments)
        let previousPayments = payments
          .filter(p => p.enrollment_id === paymentForm.enrollment_id && p.status !== 'returned')
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        // If editing a payment, exclude it from previous payments calculation
        if (editingPayment && editingPayment.enrollment_id === paymentForm.enrollment_id) {
          const editingPaymentAmount = Number(editingPayment.amount || 0);
          // If the payment being edited is not returned, subtract it from previous payments
          if (editingPayment.status !== 'returned') {
            previousPayments -= editingPaymentAmount;
          }
        }

        const totalAfterPayment = previousPayments + paymentForm.amount;
        const enrollmentPrice = Number(enrollment.total_price || 0);

        if (totalAfterPayment > enrollmentPrice) {
          handleSnackbar(
            `المبلغ المدفوع سيتجاوز السعر الإجمالي. المبلغ المدفوع حالياً: ${previousPayments} ${enrollment.currency}. المبلغ المتبقي: ${enrollmentPrice - previousPayments} ${enrollment.currency}`,
            "error"
          );
          return;
        }

        // If this is the final payment, show a success message
        if (totalAfterPayment === enrollmentPrice && previousPayments > 0) {
          handleSnackbar(
            `سيتم إكمال دفع المبلغ المتبقي للتسجيل بعد هذا القسط`,
            "success"
          );
        }
      }
    }

    try {
      const payload: CreatePaymentDto = {
        user_id: paymentForm.user_id,
        enrollment_id: paymentForm.enrollment_id,
        payment_method_id: paymentForm.payment_method_id,
        payer: paymentForm.payer || null,
        amount: Number(paymentForm.amount),
        currency: paymentForm.currency,
        type: paymentForm.type,
        status: paymentForm.status,
        note: paymentForm.note || null,
        paid_at: paymentForm.paid_at
      };

      if (editingPayment) {
        await updatePayment(editingPayment.id, payload);
        handleSnackbar("تم تحديث الواردة بنجاح", "success");
      } else {
        await createPayment(payload);
        handleSnackbar("تم تسجيل الواردة بنجاح", "success");
      }
      handleCloseDialog();
      // Refresh payments to ensure UI is updated
      refreshPayments();
    } catch (err: any) {
      console.error(err);
      handleSnackbar(err.response?.data?.message || "حدث خطأ أثناء الحفظ", "error");
    }
  };

  // دوال الحذف
    const openDeleteDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setDeleteDialogOpen(true);
  };

  const handleDeletePayment = async () => {
    if (!selectedPayment) return;

    try {
      await deletePayment(selectedPayment.id);
      handleSnackbar("تم حذف الواردة بنجاح", "success");
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

  // فلترة الواردات
  const filteredPayments = payments.filter((payment: Payment) => {
    console.log("Filtering payment:", payment);
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
    const matchesPaymentSource = paymentSourceFilter === "all" || 
      (paymentSourceFilter === "external" && !payment.enrollment_id) ||
      (paymentSourceFilter === "student_enrollment" && payment.enrollment_id);

    return matchesSearch && matchesCurrency && matchesType && matchesStatus && matchesPaymentSource;
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
      flex:0.5,
    },
    {
      field: "paid_at",
      headerName: "تاريخ الاستلام",
      minWidth: 145,
      valueGetter: (params) => new Date(params.value).toLocaleDateString('en-IQ')
    },
    {
      field: "user",
      headerName: "المستلم",
      minWidth: 180,
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
      flex:1.5,
      minWidth: 150,
      renderCell: (params) => (
        <Typography color={params.value ? "text.primary" : "text.secondary"}>
          {params.value || params.row.enrollment.student.full_name || "—"}
        </Typography>
      )
    },
    {
      field: "paymentMethod",
      headerName: "وسيلة الدفع",
      minWidth: 100,
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
      minWidth: 150,
        renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: "success.main" }}>
          {params.row.amount.toLocaleString()} {params.row.currency}
        </Typography>
      ),
    },
    {
      field: "type",
      headerName: "النوع",
      minWidth: 100,     
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
      minWidth: 100,
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
      minWidth: 120,
       renderCell: (params) => (
        <Typography variant="body2" color={params.value ? "text.primary" : "text.secondary"}>
          {params.value || "لا توجد ملاحظات"}
        </Typography>
      )
    },
    {
      field: "actions",
      headerName: "إجراءات",
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="عرض التفاصيل">
            <IconButton size="small" color="primary" onClick={() => openDetailsDialog(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
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
          <PaymentIcon /> إدارة الواردات
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
            واردة جديدة
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
                  <Typography variant="body2" color="text.secondary">إجمالي الواردات</Typography>
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
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              fullWidth
              placeholder="بحث في الواردات..."
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
          <Grid item xs={12} sm={6} md={2.5}>
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
          <Grid item xs={12} sm={6} md={3.5}>
            <FormControl fullWidth>
              <InputLabel>مصدر الدفع</InputLabel>
              <Select
                value={paymentSourceFilter}
                label="مصدر الدفع"
                onChange={(e) => setPaymentSourceFilter(e.target.value)}
              >
                <MenuItem value="all">جميع المصادر</MenuItem>
                <MenuItem value="external">جهة خارجية</MenuItem>
                <MenuItem value="student_enrollment">تسجيل طالب</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>نوع الدفع</InputLabel>
              <Select
                value={typeFilter}
                label="نوع الدفع"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">جميع الأنواع</MenuItem>
                <MenuItem value="full">واردة كاملة</MenuItem>
                <MenuItem value="installment">قسط</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
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
              {filteredPayments.length} من {payments.length} واردة
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* جدول الواردات */}
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

      {/* نافذة إضافة/تعديل الواردة */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPayment ? "تعديل الواردة" : "إضافة واردة جديدة"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {/* Info about automatic status change on refund */}
            <Alert severity="info" sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>ملاحظة:</strong> عند إنشاء مرتجع لواردة، سيتم تغيير حالتها تلقائياً إلى "مرتجعة"
              </Typography>
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>جهة الدفع</InputLabel>
                  <Select
                    value={paymentForm.payment_source || "student_enrollment"}
                    label="جهة الدفع"
                    onChange={(e) => {
                      const value = e.target.value as "student_enrollment" | "external";
                      setPaymentForm({
                        ...paymentForm,
                        payment_source: value,
                        enrollment_id: null,
                        payer: value === "external" ? paymentForm.payer || "" : "",
                        amount: value === "student_enrollment" ? 0 : paymentForm.amount
                      });
                      if (value === "external") {
                        setSelectedStudent(null);
                      }
                    }}
                  >
                    <MenuItem value="student_enrollment">تسجيل طالب</MenuItem>
                    <MenuItem value="external">جهة خارجية</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {paymentForm.payment_source === "student_enrollment" && (
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={students}
                    getOptionLabel={(option: any) => `${option.full_name} - ${option.phone}`}
                    value={students.find(s => s.id === (selectedStudent?.id || 0)) || null}
                    onChange={(_, newValue: any) => {
                      setSelectedStudent(newValue);
                      setPaymentForm({
                        ...paymentForm,
                        enrollment_id: null,
                        amount: 0
                      });
                    }}
                    renderInput={(params: any) => (
                      <TextField {...params} label="اختر الطالب" required />
                    )}
                  />
                </Grid>
              )}

              {paymentForm.payment_source === "external" && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="اسم الدافع"
                    value={paymentForm.payer || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payer: e.target.value })}
                  />
                </Grid>
              )}
            </Grid>

            {paymentForm.payment_source === "student_enrollment" && selectedStudent && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={enrollments.filter(e => {
                      // Filter by student and status
                      if (e.student_id !== selectedStudent.id || 
                          e.status === 'completed' || 
                          e.status === 'dropped') {
                        return false;
                      }

                      // Check if enrollment is fully paid (excluding returned payments)
                      const totalPaid = payments
                        .filter(p => p.enrollment_id === e.id && p.status !== 'returned')
                        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

                      const enrollmentPrice = Number(e.total_price || 0);

                      // Show enrollment if there's any remaining amount
                      return totalPaid < enrollmentPrice;
                    })}
                    getOptionLabel={(option: any) => {
                      const batch = batches.find(b => b.id === option.batch_id);
                      const totalPaid = payments
                        .filter(p => p.enrollment_id === option.id && p.status !== 'returned')
                        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
                      const remaining = Number(option.total_price || 0) - totalPaid;

                      return `${batch?.name || 'غير محدد'} - ${option.status} - ${option.total_price} ${option.currency} (متبقي: ${remaining} ${option.currency})`;
                    }}
                    value={enrollments.find(e => e.id === paymentForm.enrollment_id) || null}
                    onChange={(_, enrollmentValue: any) => {
                      // Always use enrollment currency
                      // For full payments, use enrollment total price
                      // For installments, allow manual input
                      if (paymentForm.type === "full") {
                        setPaymentForm({
                          ...paymentForm,
                          enrollment_id: enrollmentValue ? enrollmentValue.id : null,
                          amount: enrollmentValue ? Number(enrollmentValue.total_price) || +enrollmentValue.total_price : 0,
                          currency: enrollmentValue ? enrollmentValue.currency : paymentForm.currency
                        });
                      } else {
                        setPaymentForm({
                          ...paymentForm,
                          enrollment_id: enrollmentValue ? enrollmentValue.id : null,
                          currency: enrollmentValue ? enrollmentValue.currency : paymentForm.currency
                        });
                      }
                    }}
                    renderInput={(params: any) => (
                      <TextField {...params} label="اختر التسجيل" required />
                    )}
                  />
                </Grid>
              </Grid>
            )}

            <Grid container spacing={2}>
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
                {paymentForm.payment_source === "student_enrollment" && paymentForm.enrollment_id && paymentForm.type === "full" ? (
                  <TextField
                    fullWidth
                    label="المبلغ"
                    value={`${paymentForm.amount.toLocaleString()} ${paymentForm.currency}`}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PaymentIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label="المبلغ *"
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    InputProps={{ 
                      inputProps: { min: 0 },
                      endAdornment: paymentForm.payment_source === "student_enrollment" && paymentForm.enrollment_id ? (
                        <InputAdornment position="end">
                          {paymentForm.currency}
                        </InputAdornment>
                      ) : null
                    }}
                  />
                )}
              </Grid>

              {paymentForm.payment_source === "external" && (
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
              )}

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>نوع الواردة</InputLabel>
                  <Select
                    value={paymentForm.type}
                    label="نوع الواردة"
                    onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value as "full" | "installment" })}
                  >
                    <MenuItem value="full">واردة كاملة</MenuItem>
                    <MenuItem value="installment">قسط</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>حالة الواردة</InputLabel>
                  <Select
                    value={paymentForm.status}
                    label="حالة الواردة"
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
                  value={paymentForm.note || ""}
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
            disabled={!paymentForm.payment_method_id || paymentForm.amount <= 0 ||
              (paymentForm.payment_source === "student_enrollment" && !paymentForm.enrollment_id) ||
              (paymentForm.payment_source === "external" && !paymentForm.payer)}
          >
            {editingPayment ? "تحديث" : "حفظ"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* نافذة التفاصيل  */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleCloseDetailsDialog} 
        maxWidth="md" 
        fullWidth
        aria-labelledby="payment-details-title"
      >
        <DialogTitle 
          id="payment-details-title"
          sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
        >
          تفاصيل الواردة
        </DialogTitle>
        
        <DialogContent>
          {!selectedDetailsPayment ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{
                          fontSize: "1em",
                          fontWeight: "bold",
                          mb: 1.5,
                          textDecoration: "underline"
                        }}>
                          المعلومات الأساسية
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              <DetailItem label="المعرف" value={selectedDetailsPayment.id} />
                              <DetailItem label="المبلغ" value={`${selectedDetailsPayment.amount.toLocaleString()} ${selectedDetailsPayment.currency}`} />
                              <DetailItem label="نوع الواردة" value={selectedDetailsPayment.type === "full" ? "كاملة" : "قسط"} />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography component="span" fontWeight="bold">الحالة:</Typography>
                                <Chip
                                  label={
                                    selectedDetailsPayment.status === "completed" ? "مكتملة" :
                                      selectedDetailsPayment.status === "pending" ? "معلقة" : "مرتجعة"
                                  }
                                  color={
                                    selectedDetailsPayment.status === "completed" ? "success" :
                                      selectedDetailsPayment.status === "pending" ? "warning" : "error"
                                  }
                                  size="small"
                                />
                              </Box>
                              <DetailItem
                                label="ملاحظات"
                                value={selectedDetailsPayment.note}
                                fallback="لا توجد ملاحظات"
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              <DetailItem
                                label="طريقة الدفع"
                                value={selectedDetailsPayment.paymentMethod?.name}
                              />
                              <DetailItem
                                label="تاريخ الدفع"
                                value={selectedDetailsPayment.paid_at ?
                                  new Date(selectedDetailsPayment.paid_at).toLocaleString('en-IQ') :
                                  undefined
                                }
                              />
                              
                              <DetailItem
                                label="أنشئت بواسطة"
                                value={selectedDetailsPayment.user?.name || "غير محدد"}
                              />

                              <DetailItem
                                label="تاريخ الإنشاء"
                                value={selectedDetailsPayment.created_at ?
                                  new Date(selectedDetailsPayment.created_at).toLocaleString('en-IQ') :
                                  undefined
                                }
                              />
                              <DetailItem
                                label="آخر تعديل"
                                value={selectedDetailsPayment.updated_at ?
                                  new Date(selectedDetailsPayment.updated_at).toLocaleString('en-IQ') :
                                  undefined
                                }
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>


                  {/* معلومات المصدر */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{
                          fontSize: "1em",
                          fontWeight: "bold",
                          mb: 1.5,
                          textDecoration: "underline"
                        }}>
                          معلومات المصدر
                        </Typography>

                        {selectedDetailsPayment.payer ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Alert severity="info" sx={{ mb: 2 }}>
                              <Typography variant="body2">
                                واردة من جهة خارجية
                              </Typography>
                            </Alert>
                            <DetailItem label="اسم المصدر" value={selectedDetailsPayment.payer} />
                          </Box>
                        ) : selectedDetailsPayment.enrollment ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Alert severity="info" sx={{ mb: 2 }}>
                              <Typography variant="body2">
                                واردة تابعة لتسجيل طالب
                              </Typography>
                            </Alert>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                  <DetailItem
                                    label="اسم الطالب"
                                    value={(selectedDetailsPayment.enrollment as any).student?.full_name ||
                                      selectedDetailsPayment.enrollment.student?.full_name ||
                                      `طالب #${(selectedDetailsPayment.enrollment as any).student_id}`}
                                  />
                                  <DetailItem label="هاتف الطالب" value={selectedDetailsPayment.enrollment.student?.phone} />
                                  <DetailItem label="مدينة الطالب" value={(selectedDetailsPayment.enrollment as any).student?.city} />
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                  <DetailItem label="رمز الخصم" value={selectedDetailsPayment.enrollment.discount_code} />
                                  <DetailItem label="السعر الإجمالي" value={`${selectedDetailsPayment.enrollment.total_price || 0} ${selectedDetailsPayment.currency}`} />
                                  <DetailItem
                                    label="حالة التسجيل"
                                    value={
                                      selectedDetailsPayment.enrollment.status === "accepted" ? "مقبول" :
                                        selectedDetailsPayment.enrollment.status === "pending" ? "قيد الانتظار" :
                                          selectedDetailsPayment.enrollment.status
                                    }
                                  />
                                  <DetailItem
                                    label="تاريخ التسجيل"
                                    value={selectedDetailsPayment.enrollment.enrolled_at ?
                                      new Date(selectedDetailsPayment.enrollment.enrolled_at).toLocaleDateString('ar') :
                                      undefined
                                    }
                                  />
                                </Box>
                              </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{
                                  fontSize: "1em",
                                  fontWeight: "bold",
                                  mb: 1.5,
                                  textDecoration: "underline"
                                }}>
                                  معلومات الدُفعة المسجل فيها
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                  <DetailItem
                                    label="اسم الدفعة"
                                    value={(selectedDetailsPayment.enrollment as any).batch?.name || selectedDetailsPayment.enrollment.batch_id || "غير محدد"}
                                  />
                                  <DetailItem
                                    label="المستوى"
                                    value={(selectedDetailsPayment.enrollment as any).batch?.level || "غير محدد"}
                                  />
                                  <DetailItem
                                    label="الموقع"
                                    value={(selectedDetailsPayment.enrollment as any).batch?.location || "غير محدد"}
                                  />
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                  <DetailItem
                                    label="تاريخ البدء"
                                    value={(selectedDetailsPayment.enrollment as any).batch?.start_date ?
                                      new Date((selectedDetailsPayment.enrollment as any).batch?.start_date).toLocaleDateString('ar') :
                                      "غير محدد"
                                    }
                                  />
                                  <DetailItem
                                    label="تاريخ الانتهاء"
                                    value={(selectedDetailsPayment.enrollment as any).batch?.end_date ?
                                      new Date((selectedDetailsPayment.enrollment as any).batch?.end_date).toLocaleDateString('ar') :
                                      "غير محدد"
                                    }
                                  />
                                  <DetailItem
                                    label="الجدول"
                                    value={(selectedDetailsPayment.enrollment as any).batch?.schedule || "غير محدد"}
                                  />
                                </Box>
                              </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{
                                  fontSize: "1em",
                                  fontWeight: "bold",
                                  mb: 1.5,
                                  textDecoration: "underline"
                                }}>
                                  معلومات الدورة
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                  <DetailItem
                                    label="اسم الدورة"
                                    value={(selectedDetailsPayment.enrollment as any).batch?.course?.name || "غير محدد"}
                                  />
                                  <DetailItem
                                    label="نوع الدورة"
                                    value={
                                      (selectedDetailsPayment.enrollment as any).batch?.course?.project_type === "online" ? "أونلاين" :
                                        (selectedDetailsPayment.enrollment as any).batch?.course?.project_type === "onsite" ? "حضوري" :
                                          (selectedDetailsPayment.enrollment as any).batch?.course?.project_type === "kids" ? "أطفال" :
                                            (selectedDetailsPayment.enrollment as any).batch?.course?.project_type === "ielts" ? "IELTS" :
                                              "غير محدد"
                                    }
                                  />
                                  <DetailItem
                                    label="وصف الدورة"
                                    value={(selectedDetailsPayment.enrollment as any).batch?.course?.description || "غير محدد"}
                                    multiline
                                  />
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                  <DetailItem
                                    label="المدرب"
                                    value={(selectedDetailsPayment.enrollment as any).batch?.trainer?.name || "غير محدد"}
                                  />
                                  <DetailItem
                                    label="سعر الدورة"
                                    value={
                                      (selectedDetailsPayment.enrollment as any).batch?.actual_price ?
                                        `${(selectedDetailsPayment.enrollment as any).batch?.actual_price.toLocaleString()} ${(selectedDetailsPayment.enrollment as any).batch?.currency || selectedDetailsPayment.currency}` :
                                        "غير محدد"
                                    }
                                  />
                                  <DetailItem
                                    label="السعة"
                                    value={(selectedDetailsPayment.enrollment as any).batch?.capacity ?
                                      `${(selectedDetailsPayment.enrollment as any).batch?.capacity} طالب` :
                                      "غير محدد"
                                    }
                                  />
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        ) : (
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              لا توجد معلومات كافية عن الدافع
                            </Typography>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                </Grid>
              </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleCloseDetailsDialog} 
            variant="outlined"
            startIcon={<Close />}
          >
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار الحذف */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف الواردة الخاصة بـ "{selectedPayment?.payer || selectedPayment?.user?.name}" بقيمة {selectedPayment?.amount.toLocaleString()} {selectedPayment?.currency}؟
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