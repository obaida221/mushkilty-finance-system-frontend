"use client"

import { useState } from "react"
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, MenuItem, FormControl, InputLabel, Select, Chip, Grid, Card, CardContent, IconButton
} from "@mui/material"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { Search, Add, Payment as PaymentIcon, Edit, Delete } from "@mui/icons-material"

// Mock data
const mockPayments = [
  {
    id: "1",
    enrollmentId: "1",
    payer: null,
    payment_method_id: "1",
    amount: 500000,
    currency: "IQD",
    type: "full",
    note: "دفعة كاملة للدورة",
    paid_at: "2024-03-15",
  },
  {
    id: "2",
    enrollmentId: null,
    payer: "شركة الحياة",
    payment_method_id: "2",
    amount: 300000,
    currency: "IQD",
    type: "installment",
    note: "دفعة خارجية",
    paid_at: "2024-03-18",
  },
]

const mockPaymentMethods = [
  { id: "1", name: "cash", description: "نقدي" },
  { id: "2", name: "card", description: "بطاقة مصرفية" },
  { id: "3", name: "transfer", description: "تحويل بنكي" },
]

const mockEnrollments = [
  { id: "1", student_name: "علي أحمد", batch_name: "IELTS A1" },
  { id: "2", student_name: "سارة محمد", batch_name: "Kids A2" },
]

const PaymentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [payments, setPayments] = useState(mockPayments)
  const [editingPayment, setEditingPayment] = useState(null)
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    source: "student", // student | external
    enrollmentId: "",
    payer: "",
    payment_method_id: "",
    amount: "",
    currency: "IQD",
    type: "full",
    note: "",
  })

  const handleOpenDialog = (payment) => {
    if (payment) {
      setEditingPayment(payment)
      setPaymentForm({
        source: payment.enrollmentId ? "student" : "external",
        enrollmentId: payment.enrollmentId || "",
        payer: payment.payer || "",
        payment_method_id: payment.payment_method_id,
        amount: payment.amount.toString(),
        currency: payment.currency,
        type: payment.type,
        note: payment.note,
      })
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
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => setOpenDialog(false)

  const handleSavePayment = () => {
    if (editingPayment) {
      setPayments(prev =>
        prev.map(p => p.id === editingPayment.id ? { ...p, ...paymentForm } : p)
      )
    } else {
      const newPayment = {
        id: (payments.length + 1).toString(),
        ...paymentForm,
        paid_at: new Date().toISOString().split("T")[0],
      }
      setPayments(prev => [...prev, newPayment])
    }
    handleCloseDialog()
  }

  const handleDeletePayment = (id: any) => {
    setPayments(prev => prev.filter(p => p.id !== id))
  }

  const handleStudentSelect = (id: any) => {
    setSelectedStudentId(id);
    const filtered = mockEnrollments.filter(e => e.id === id);
    setFilteredEnrollments(filtered);
  }


  const columns: GridColDef[] = [
    { field: "paid_at", headerName: "التاريخ", width: 120 },
    {
      field: "source",
      headerName: "المصدر",
      flex: 1,
      // minWidth: 150,
      renderCell: (params) => {
        const row = params.row
        if (row.enrollmentId) {
          const enrollment = mockEnrollments.find(e => e.id === row.enrollmentId)
          return <Typography>{enrollment?.student_name || "—"}</Typography>
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
        const method = mockPaymentMethods.find(m => m.id === params.value)
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

  const filtered = payments.filter(p =>
    (p.note || "").includes(searchQuery) ||
    (p.payer || "").includes(searchQuery)
  )

  const total = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>الواردات</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          تسجيل واردة جديدة
        </Button>
      </Box>

      {/* Stats Card */}
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
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {total.toLocaleString()} د.ع
                  </Typography>
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
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
            }}
            sx={{ mb: 3 }}
          />

          <DataGrid
            rows={filtered}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: { sortModel: [{ field: "date", sort: "desc" }] },
            }}
            pageSizeOptions={[5, 10, 25]}
            autoHeight
            disableRowSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": { borderColor: "divider" },
              "& .MuiDataGrid-columnHeaders": { bgcolor: "background.default", borderColor: "divider" },
            }}
          />
        </Box>
      </Paper>

      {/* Create / Edit Payment Dialog */}
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
                <Select value={selectedStudentId} onChange={(e) => handleStudentSelect(e.target.value)}>
                    {mockEnrollments.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.student_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedStudentId && (
                <FormControl fullWidth>
                  <InputLabel>الدورة</InputLabel>
                  <Select
                    value={paymentForm.enrollmentId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, enrollmentId: e.target.value })}
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
                label="طريقة الدفع"
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method_id: e.target.value })}
              >
                {mockPaymentMethods.map((m) => (
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
                label="نوع الدفعة"
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
    </Box>
  )
}

export default PaymentsPage
