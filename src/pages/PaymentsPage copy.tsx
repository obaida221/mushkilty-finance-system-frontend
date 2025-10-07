"use client"

import { useState } from "react"
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, MenuItem, FormControl, InputLabel, Select, Chip, Grid, Card, CardContent, IconButton, Divider
} from "@mui/material"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { Search, Add, Payment as PaymentIcon, Edit, Delete, CreditCard } from "@mui/icons-material"

// -----------------------------------------------------------------------------
// 🧩 Mock Data (مطابقة لهيكل قاعدة البيانات الحالي من ملف ME-DB2.text)
// -----------------------------------------------------------------------------

const mockStudents = [
  { id: 1, full_name: "علي أحمد" },
  { id: 2, full_name: "سارة محمد" },
  { id: 3, full_name: "حسن علي" },
]

const mockBatches = [
  { id: 1, name: "IELTS A1" },
  { id: 2, name: "Kids Coding B2" },
]

const mockEnrollments = [
  { id: 1, student_id: 1, batch_id: 1, total_price: 500000, currency: "IQD" },
  { id: 2, student_id: 2, batch_id: 2, total_price: 400000, currency: "USD" },
]

const mockPaymentMethods = [
  { id: 1, name: "cash", description: "نقدي", method_number: null, is_valid: true },
  { id: 2, name: "card", description: "بطاقة مصرفية", method_number: "1234-5678", is_valid: true },
  { id: 3, name: "transfer", description: "تحويل بنكي", method_number: "IQD-10025-999", is_valid: true },
]

const mockPayments = [
  {
    id: 1,
    payment_method_id: 1,
    user_id: 1,
    enrollment_id: 1,
    payer: null,
    note: "دفعة كاملة للدورة",
    amount: 500000,
    currency: "IQD",
    type: "full",
    paid_at: "2024-03-15T10:00:00Z",
  },
  {
    id: 2,
    payment_method_id: 2,
    user_id: 1,
    enrollment_id: null,
    payer: "شركة فلق",
    note: "دفعة خارجية بالدولار",
    amount: 300,
    currency: "USD",
    type: "installment",
    paid_at: "2024-03-18T13:00:00Z",
  },
]

// -----------------------------------------------------------------------------

export default function PaymentsPage() {
  const [payments, setPayments] = useState(mockPayments)
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods)
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [openMethodDialog, setOpenMethodDialog] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)

  const [paymentForm, setPaymentForm] = useState({
    source: "student",
    enrollment_id: "",
    payer: "",
    payment_method_id: "",
    amount: "",
    currency: "IQD",
    type: "full",
    note: "",
  })

  const [methodForm, setMethodForm] = useState({
    name: "cash",
    description: "",
    method_number: "",
    is_valid: true,
  })

  // ---------------------------------------------------------------------------
  // 🔄 Dialog Handling
  // ---------------------------------------------------------------------------

  const handleOpenDialog = (payment) => {
    if (payment) {
      setEditingPayment(payment)
      setPaymentForm({
        source: payment.enrollment_id ? "student" : "external",
        enrollment_id: payment.enrollment_id || "",
        payer: payment.payer || "",
        payment_method_id: payment.payment_method_id.toString(),
        amount: payment.amount.toString(),
        currency: payment.currency,
        type: payment.type,
        note: payment.note || "",
      })
    } else {
      setEditingPayment(null)
      setPaymentForm({
        source: "student",
        enrollment_id: "",
        payer: "",
        payment_method_id: "",
        amount: "",
        currency: "IQD",
        type: "full",
        note: "",
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => setOpenDialog(false)

  const handleSavePayment = () => {
    const newData = {
      ...paymentForm,
      id: editingPayment ? editingPayment.id : payments.length + 1,
      amount: Number(paymentForm.amount),
      payment_method_id: Number(paymentForm.payment_method_id),
      paid_at: new Date().toISOString(),
    }

    if (editingPayment) {
      setPayments(prev => prev.map(p => p.id === editingPayment.id ? newData : p))
    } else {
      setPayments(prev => [...prev, newData])
    }
    handleCloseDialog()
  }

  const handleDeletePayment = (id) => setPayments(prev => prev.filter(p => p.id !== id))

  // ---------------------------------------------------------------------------
  // 💳 Payment Methods (Add / Edit)
  // ---------------------------------------------------------------------------

  const handleOpenMethodDialog = () => setOpenMethodDialog(true)
  const handleCloseMethodDialog = () => setOpenMethodDialog(false)

  const handleSaveMethod = () => {
    const newMethod = {
      id: paymentMethods.length + 1,
      name: methodForm.name,
      description: methodForm.description,
      method_number: methodForm.method_number || null,
      is_valid: methodForm.is_valid,
    }
    setPaymentMethods(prev => [...prev, newMethod])
    setOpenMethodDialog(false)
  }

  // ---------------------------------------------------------------------------
  // 🧮 Derived Helpers
  // ---------------------------------------------------------------------------

  const getStudentName = (enrollmentId) => {
    const e = mockEnrollments.find(en => en.id === enrollmentId)
    const s = mockStudents.find(st => st.id === e?.student_id)
    return s?.full_name || "—"
  }

  const getBatchName = (enrollmentId) => {
    const e = mockEnrollments.find(en => en.id === enrollmentId)
    const b = mockBatches.find(bt => bt.id === e?.batch_id)
    return b?.name || ""
  }

  const getPaymentMethodLabel = (id) => {
    const method = paymentMethods.find(m => m.id === id)
    return method ? method.description : "—"
  }

  const filteredPayments = payments.filter((p) => {
    const student = getStudentName(p.enrollment_id)
    const batch = getBatchName(p.enrollment_id)
    const method = getPaymentMethodLabel(p.payment_method_id)
    return (
      student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.payer || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.currency || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (method || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.note || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const totalIQD = payments.filter(p => p.currency === "IQD").reduce((sum, p) => sum + p.amount, 0)
  const totalUSD = payments.filter(p => p.currency === "USD").reduce((sum, p) => sum + p.amount, 0)

  // ---------------------------------------------------------------------------
  // 📊 Columns
  // ---------------------------------------------------------------------------

  const columns: GridColDef[] = [
    { field: "paid_at", headerName: "التاريخ", width: 130, valueGetter: (p) => new Date(p.row.paid_at).toLocaleDateString() },
    {
      field: "source",
      headerName: "المصدر",
      flex: 1,
      renderCell: (params) => {
        const row = params.row
        if (row.enrollment_id) {
          return (
            <Typography>
              {getStudentName(row.enrollment_id)} <Typography variant="caption" color="text.secondary">({getBatchName(row.enrollment_id)})</Typography>
            </Typography>
          )
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
      width: 140,
      renderCell: (params) => (
        <Chip label={getPaymentMethodLabel(params.value)} color="primary" size="small" />
      ),
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

  // ---------------------------------------------------------------------------
  // 🧱 UI Layout
  // ---------------------------------------------------------------------------

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>الواردات</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<CreditCard />} onClick={handleOpenMethodDialog}>
            إدارة طرق الدفع
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            تسجيل واردة جديدة
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">إجمالي الدينار</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalIQD.toLocaleString()} د.ع</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">إجمالي الدولار</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalUSD.toLocaleString()} $</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* Table */}
      <Paper>
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="بحث حسب الطالب، الدورة، الجهة، العملة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
            }}
            sx={{ mb: 3 }}
          />
          <DataGrid
            rows={filteredPayments}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            autoHeight
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>

      {/* Payment Dialog */}
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
              <FormControl fullWidth>
                <InputLabel>الطالب / الدورة</InputLabel>
                <Select
                  value={paymentForm.enrollment_id}
                  onChange={(e) => setPaymentForm({ ...paymentForm, enrollment_id: e.target.value })}
                >
                  {mockEnrollments.map((e) => {
                    const s = mockStudents.find(st => st.id === e.student_id)
                    const b = mockBatches.find(bt => bt.id === e.batch_id)
                    return <MenuItem key={e.id} value={e.id}>{s.full_name} – {b.name}</MenuItem>
                  })}
                </Select>
              </FormControl>
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
                label="طريقة الدفع"
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method_id: e.target.value })}
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
              <InputLabel>العملة</InputLabel>
              <Select
                value={paymentForm.currency}
                onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value })}
              >
                <MenuItem value="IQD">IQD</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
              </Select>
            </FormControl>

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
          <Button variant="contained" onClick={handleSavePayment}>
            {editingPayment ? "تحديث" : "تسجيل"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Methods Dialog */}
      <Dialog open={openMethodDialog} onClose={handleCloseMethodDialog} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة طريقة دفع</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>النوع</InputLabel>
              <Select
                value={methodForm.name}
                label="النوع"
                onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
              >
                <MenuItem value="cash">نقدي</MenuItem>
                <MenuItem value="card">بطاقة</MenuItem>
                <MenuItem value="transfer">تحويل</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="الوصف"
              fullWidth
              value={methodForm.description}
              onChange={(e) => setMethodForm({ ...methodForm, description: e.target.value })}
            />

            <TextField
              label="رقم البطاقة / الحساب (اختياري)"
              fullWidth
              value={methodForm.method_number}
              onChange={(e) => setMethodForm({ ...methodForm, method_number: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMethodDialog}>إلغاء</Button>
          <Button variant="contained" onClick={handleSaveMethod}>حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
