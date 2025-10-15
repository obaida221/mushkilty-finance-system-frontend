"use client"

import { useState, useEffect } from "react"
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, MenuItem, FormControl, InputLabel, Select, Chip, Grid, Card, CardContent, IconButton, CircularProgress, Alert, Snackbar
} from "@mui/material"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { Search, Add, Payment as PaymentIcon, Edit, Delete } from "@mui/icons-material"
import { usePayments } from "../hooks/usePayments"
import { useEnrollments } from "../hooks/useEnrollments"

const paymentMethods = [
  { id: 1, description: "نقداً" },
  { id: 2, description: "بطاقة" },
  { id: 3, description: "تحويل بنكي" },
]

const PaymentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingPayment, setEditingPayment] = useState<any>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("")
  const [filteredEnrollments, setFilteredEnrollments] = useState<any[]>([])
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: "success" | "error"}>({open: false, message: "", severity: "success"})

  const { payments, loading: paymentsLoading, error: paymentsError, createPayment, updatePayment, deletePayment } = usePayments()
  const { enrollments, loading: enrollmentsLoading } = useEnrollments()

  const [paymentForm, setPaymentForm] = useState({
    source: "student",
    enrollmentId: "",
    payer: "",
    payment_method_id: "",
    amount: "",
    currency: "IQD",
    type: "full",
    note: "",
  })

  useEffect(() => {
    if (selectedStudentId) {
      const filtered = enrollments.filter(e => e.student?.id === selectedStudentId)
      setFilteredEnrollments(filtered)
      if (!filtered.some(e => e.id === paymentForm.enrollmentId)) {
        setPaymentForm(prev => ({ ...prev, enrollmentId: "" }))
      }
    } else {
      setFilteredEnrollments([])
      setPaymentForm(prev => ({ ...prev, enrollmentId: "" }))
    }
  }, [selectedStudentId, enrollments])

  const handleOpenDialog = (payment?: any) => {
    if (payment) {
      setEditingPayment(payment)
      setPaymentForm({
        source: payment.enrollment ? "student" : "external",
        enrollmentId: payment.enrollment?.id || "",
        payer: payment.payer || "",
        payment_method_id: payment.payment_method_id,
        amount: payment.amount.toString(),
        currency: payment.currency,
        type: payment.type,
        note: payment.note,
      })
      if (payment.enrollment?.student?.id) setSelectedStudentId(payment.enrollment.student.id)
    } else {
      setEditingPayment(null)
      setPaymentForm({
        source: "student",
        enrollmentId: "",
        payer: "",
        payment_method_id: "",
        amount: "",
        currency: "IQD",
        type: "full",
        note: "",
      })
      setSelectedStudentId("")
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => setOpenDialog(false)

  const handleSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity })
  }

  const handleSavePayment = async () => {
    if (paymentForm.source === "student" && !paymentForm.enrollmentId) {
      handleSnackbar("اختر الطالب والدورة", "error")
      return
    }
    if (!paymentForm.payment_method_id || !paymentForm.amount || Number(paymentForm.amount) <= 0) {
      handleSnackbar("أدخل جميع البيانات بشكل صحيح", "error")
      return
    }
    try {
      const payload = {
        ...paymentForm,
        enrollmentId: paymentForm.enrollmentId ? Number(paymentForm.enrollmentId) : null,
        payment_method_id: Number(paymentForm.payment_method_id),
        amount: Number(paymentForm.amount),
      }

      if (editingPayment) {
        await updatePayment(editingPayment.id, payload)
        handleSnackbar("تم تحديث الدفعة بنجاح", "success")
      } else {
        await createPayment(payload)
        handleSnackbar("تم تسجيل الدفعة بنجاح", "success")
      }
      handleCloseDialog()
    } catch (err) {
      console.error(err)
      handleSnackbar("حدث خطأ أثناء الحفظ", "error")
    }
  }

  const handleDeletePayment = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الدفعة؟")) {
      try {
        await deletePayment(id)
        handleSnackbar("تم حذف الدفعة بنجاح", "success")
      } catch (err) {
        console.error(err)
        handleSnackbar("حدث خطأ أثناء الحذف", "error")
      }
    }
  }

  const filtered = payments.filter(p =>
    (p.note || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.payer || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const total = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  const columns: GridColDef[] = [
    { field: "paid_at", headerName: "التاريخ", width: 120 },
    {
      field: "source",
      headerName: "المصدر",
      flex: 1,
      renderCell: (params) => {
        const row = params.row
        if (row.enrollment) {
          return <Typography>{row.enrollment.student?.name || "—"}</Typography>
        } else {
          return <Typography color="text.secondary">{row.payer}</Typography>
        }
      },
    },
    {
      field: "amount",
      headerName: "المبلغ",
      width: 150,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: "success.main" }}>
          {Number(params.value).toLocaleString()} {params.row.currency}
        </Typography>
      ),
    },
    {
      field: "payment_method_id",
      headerName: "طريقة الدفع",
      width: 130,
      renderCell: (params) => {
        const method = paymentMethods.find(m => m.id === params.value)
        return <Chip label={method?.description || "غير محدد"} size="small" color="primary" />
      },
    },
    { field: "type", headerName: "النوع", width: 100 },
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
        </Box>
      ),
    },
  ]

  if (paymentsLoading || enrollmentsLoading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px"><CircularProgress /></Box>
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
            sx={{ border: "none", "& .MuiDataGrid-cell": { borderColor: "divider" }, "& .MuiDataGrid-columnHeaders": { bgcolor: "background.default", borderColor: "divider" } }}
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
                onChange={(e) => setPaymentForm({ ...paymentForm, source: e.target.value })}
              >
                <MenuItem value="student">طالب</MenuItem>
                <MenuItem value="external">جهة خارجية</MenuItem>
              </Select>
            </FormControl>

            {paymentForm.source === "student" ? (
              <>
                <FormControl fullWidth>
                  <InputLabel>الطالب</InputLabel>
                  <Select value={selectedStudentId} onChange={(e) => setSelectedStudentId(Number(e.target.value))}>
                    {enrollments.map((s) => (
                      <MenuItem key={s.id} value={s.student?.id}>{s.student?.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedStudentId && (
                  <FormControl fullWidth>
                    <InputLabel>الدورة</InputLabel>
                    <Select
                      value={paymentForm.enrollmentId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, enrollmentId: Number(e.target.value) })}
                    >
                      {filteredEnrollments.map((e) => (
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
                value={paymentForm.payment_method_id}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method_id: Number(e.target.value) })}
              >
                {paymentMethods.map((m) => (
                  <MenuItem key={m.id} value={m.id}>{m.description}</MenuItem>
                ))}
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
                onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
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
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  )
}

export default PaymentsPage
