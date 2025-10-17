// src/pages/PaymentsPage.tsx
import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, MenuItem, FormControl, InputLabel, Select, Chip, Grid, Card, CardContent, IconButton, CircularProgress, Alert, Snackbar
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Search, Add, Payment as PaymentIcon, Edit, Delete, Visibility } from "@mui/icons-material";
import { usePayments, CreatePaymentDto } from "../hooks/usePayments";
import { useEnrollments } from "../hooks/useEnrollments";

type PaymentFormType = {
  source: "student" | "external";
  enrollmentId?: string;
  payer?: string;
  payment_method_id?: string;
  amount: string;
  type?: "full" | "installment";
  note?: string;
};

const PaymentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState<null | any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);
  const [filteredEnrollments, setFilteredEnrollments] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

  const { payments, loading: paymentsLoading, error: paymentsError, createPayment, updatePayment, deletePayment } = usePayments();
  const { enrollments, loading: enrollmentsLoading } = useEnrollments();

  const [paymentForm, setPaymentForm] = useState<PaymentFormType>({
    source: "student",
    enrollmentId: "",
    payer: "",
    payment_method_id: "",
    amount: "",
    type: "full",
    note: "",
  });

  // Filter enrollments based on selected student
  useEffect(() => {
    if (selectedStudentId) {
      const filtered = enrollments.filter((e: any) => e.student?.id === Number(selectedStudentId));
      setFilteredEnrollments(filtered);
      if (!filtered.some((e: any) => e.id === Number(paymentForm.enrollmentId))) {
        setPaymentForm(prev => ({ ...prev, enrollmentId: "" }));
      }
    } else {
      setFilteredEnrollments([]);
      setPaymentForm(prev => ({ ...prev, enrollmentId: "" }));
    }
  }, [selectedStudentId, enrollments, paymentForm.enrollmentId]);

  const handleOpenDialog = (payment?: any) => {
    if (payment) {
      setEditingPayment(payment);
      setPaymentForm({
        source: payment.user ? "student" : "external",
        enrollmentId: payment.enrollment_id?.toString() || "",
        payer: payment.payer || "",
        payment_method_id: payment.payment_method_id?.toString() || "",
        amount: payment.amount?.toString() || "",
        type: payment.type || "full",
        note: payment.note || "",
      });
      if (payment.user?.id) setSelectedStudentId(payment.user.id.toString());
    } else {
      setEditingPayment(null);
      setPaymentForm({
        source: "student",
        enrollmentId: "",
        payer: "",
        payment_method_id: "",
        amount: "",
        type: "full",
        note: "",
      });
      setSelectedStudentId(undefined);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSavePayment = async () => {
    if (paymentForm.source === "student" && !paymentForm.enrollmentId) {
      handleSnackbar("اختر الطالب والدورة", "error");
      return;
    }
    if (!paymentForm.payment_method_id || !paymentForm.amount || Number(paymentForm.amount) <= 0) {
      handleSnackbar("أدخل جميع البيانات بشكل صحيح", "error");
      return;
    }

      const payload: CreatePaymentDto = {
        user_id: Number(selectedStudentId),        
        enrollment_id: paymentForm.enrollmentId ? Number(paymentForm.enrollmentId) : undefined,
        payment_method_id: Number(paymentForm.payment_method_id), 
        payer: paymentForm.source === "external" ? paymentForm.payer : undefined,
        amount: Number(paymentForm.amount),
        currency: "IQD", 
        type: paymentForm.type,
        note: paymentForm.note || undefined,
      };
    try {
      if (editingPayment) {
        await updatePayment(editingPayment.id, payload);
        handleSnackbar("تم تحديث الدفعة بنجاح", "success");
      } else {
        await createPayment(payload);
        handleSnackbar("تم تسجيل الدفعة بنجاح", "success");
      }
      handleCloseDialog();
    } catch (err) {
      console.error(err);
      handleSnackbar("حدث خطأ أثناء الحفظ", "error");
    }
  };

  const handleDeletePayment = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الدفعة؟")) {
      try {
        await deletePayment(id);
        handleSnackbar("تم حذف الدفعة بنجاح", "success");
      } catch (err) {
        console.error(err);
        handleSnackbar("حدث خطأ أثناء الحذف", "error");
      }
    }
  };

  const filtered = payments.filter((p: any) =>
    (p.note || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.payer || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const total = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  const columns: GridColDef[] = [
    { field: "paid_at", headerName: "التاريخ", width: 150 },
    {
      field: "source",
      headerName: "المصدر",
      flex: 1,
      renderCell: (params) =>
        params.row.user
          ? <Typography>{params.row.user.name}</Typography>
          : <Typography color="text.secondary">{params.row.payer || "—"}</Typography>
    },
    {
      field: "enrollment",
      headerName: "الدورة",
      flex: 1,
      valueGetter: (params) => params.row.enrollment?.batch_name || "—"
    },
    {
      field: "amount",
      headerName: "المبلغ",
      width: 150,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: "success.main" }}>
          {Number(params.value).toLocaleString()} {params.row.currency || "IQD"}
        </Typography>
      ),
    },
    {
      field: "payment_method",
      headerName: "طريقة الدفع",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.row.payment_method?.name || "—"}
          size="small"
          color="primary"
        />
      ),
    },
    { field: "type", headerName: "النوع", width: 120 },
    { field: "note", headerName: "ملاحظات", flex: 1 },
    {
      field: "actions",
      headerName: "إجراءات",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDeletePayment(params.row.id)}>
            <Delete fontSize="small" />
          </IconButton>
          {params.row.payment_proof && (
            <IconButton size="small" color="info" onClick={() => window.open(params.row.payment_proof, "_blank")}>
              <Visibility fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  if (paymentsLoading || enrollmentsLoading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px"><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>الواردات</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          تسجيل واردة جديدة
        </Button>
      </Box>

      {paymentsError && <Alert severity="error" sx={{ mb: 3 }}>{paymentsError}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "primary.main", p: 1.5, borderRadius: 2 }}>
                  <PaymentIcon sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">إجمالي الواردات</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{total.toLocaleString()} د.ع</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ mb: 3 }}
          />

          <DataGrid
            rows={filtered}
            columns={columns}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[5, 10, 25]}
            autoHeight
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": { borderColor: "divider" },
              "& .MuiDataGrid-columnHeaders": { bgcolor: "background.default", borderColor: "divider" }
            }}
          />
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPayment ? "تعديل الدفعة" : "تسجيل دفعة جديدة"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>المصدر</InputLabel>
              <Select
                value={paymentForm.source}
                label="المصدر"
                onChange={(e) => setPaymentForm({ ...paymentForm, source: e.target.value as "student" | "external" })}
              >
                <MenuItem value="student">طالب</MenuItem>
                <MenuItem value="external">جهة خارجية</MenuItem>
              </Select>
    </FormControl>

    {paymentForm.source === "student" ? (
      <>
        <FormControl fullWidth>
          <InputLabel>الطالب</InputLabel>
          <Select
            value={selectedStudentId || ""}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            {enrollments?.length ? (
              enrollments.map((enrollment: any) => {
                const studentId = enrollment.student?.id?.toString() || "";
                const studentName = enrollment.student?.fullName || "—";
                return (
                  <MenuItem key={`${studentId}-${enrollment.id}`} value={studentId}>
                    {studentName}
                  </MenuItem>
                );
              })
            ) : (
              <MenuItem disabled>لا يوجد طلاب</MenuItem>
            )}

          </Select>
        </FormControl>

    {selectedStudentId && (
      <FormControl fullWidth>
        <InputLabel>الدورة</InputLabel>
        <Select
          value={paymentForm.enrollmentId}
          onChange={(e) => setPaymentForm({ ...paymentForm, enrollmentId: String(e.target.value) })}
        >
          {filteredEnrollments.map((e: any) => (
            <MenuItem key={e.id} value={e.id}>{e.batch_name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    )}
  </>
) : (
  <TextField
    fullWidth
    label="اسم الجهة الدافعة"
    value={paymentForm.payer}
    onChange={(e) => setPaymentForm({ ...paymentForm, payer: e.target.value })}
  />
)}

            <FormControl fullWidth>
              <InputLabel>طريقة الدفع</InputLabel>
              <Select
                value={paymentForm.payment_method_id || ""}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method_id: e.target.value as any })}
              >
                <MenuItem value="1">نقد</MenuItem>
                <MenuItem value="2">بطاقة</MenuItem>
                <MenuItem value="3">تحويل بنكي</MenuItem>
                <MenuItem value="4">أونلاين</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="المبلغ"
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>نوع الدفعة</InputLabel>
              <Select
                value={paymentForm.type}
                onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value as "full" | "installment" })}
              >
                <MenuItem value="full">كاملة</MenuItem>
                <MenuItem value="installment">قسط</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="ملاحظات"
              multiline
              rows={3}
              value={paymentForm.note}
              onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button variant="contained" onClick={handleSavePayment}>{editingPayment ? "تحديث" : "تسجيل"}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentsPage;
