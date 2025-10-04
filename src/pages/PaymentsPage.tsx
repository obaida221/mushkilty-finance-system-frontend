"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Add, Payment as PaymentIcon, Edit, Delete } from "@mui/icons-material"
import type { Payment } from "../types"

// Mock data
const mockPayments: Payment[] = [
  { id: "1", studentId: "1", amount: 500000, paymentMethod: "cash", transactionId: "1", date: "2024-03-15", notes: "دفعة كاملة للدورة", createdAt: "2024-03-15T10:30:00" },
  { id: "2", studentId: "2", amount: 400000, paymentMethod: "card", transactionId: "4", date: "2024-03-13", notes: "دفعة كاملة", createdAt: "2024-03-13T11:15:00" },
  { id: "3", studentId: "1", amount: 250000, paymentMethod: "bank_transfer", transactionId: "6", date: "2024-03-10", notes: "دفعة أولى", createdAt: "2024-03-10T09:20:00" },
]

const PaymentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)

  const [paymentForm, setPaymentForm] = useState({
    studentId: "",
    amount: "",
    paymentMethod: "",
    notes: "",
  })

  const handleOpenDialog = (payment?: Payment) => {
    if (payment) {
      setEditingPayment(payment)
      setPaymentForm({
        studentId: payment.studentId,
        amount: payment.amount.toString(),
        paymentMethod: payment.paymentMethod,
        notes: payment.notes,
      })
    } else {
      setEditingPayment(null)
      setPaymentForm({ studentId: "", amount: "", paymentMethod: "", notes: "" })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleCreateOrUpdatePayment = () => {
    if (editingPayment) {
      // Update existing payment
      setPayments((prev) =>
        prev.map((p) =>
          p.id === editingPayment.id
            ? { ...p, studentId: paymentForm.studentId, amount: Number(paymentForm.amount), paymentMethod: paymentForm.paymentMethod, notes: paymentForm.notes }
            : p
        )
      )
    } else {
      // Create new payment
      const newPayment: Payment = {
        id: (payments.length + 1).toString(),
        studentId: paymentForm.studentId,
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        transactionId: (payments.length + 1).toString(),
        date: new Date().toISOString().split("T")[0],
        notes: paymentForm.notes,
        createdAt: new Date().toISOString(),
      }
      setPayments((prev) => [...prev, newPayment])
    }
    handleCloseDialog()
  }

  const handleDeletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id))
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "نقدي",
      card: "بطاقة",
      bank_transfer: "تحويل بنكي",
      online: "أونلاين",
    }
    return labels[method] || method
  }

  const columns: GridColDef[] = [
    { field: "date", headerName: "التاريخ", width: 120 },
    {
      field: "studentId",
      headerName: "الطالب",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const studentNameMap: Record<string, string> = { "1": "علي أحمد", "2": "سارة محمد", "3": "حسن علي" }
        return <Typography>{studentNameMap[params.value]}</Typography>
      },
    },
    {
      field: "amount",
      headerName: "المبلغ",
      width: 150,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: "success.main" }}>{params.value.toLocaleString()} د.ع</Typography>
      ),
    },
    {
      field: "paymentMethod",
      headerName: "طريقة الدفع",
      width: 130,
      renderCell: (params) => <Chip label={getPaymentMethodLabel(params.value)} size="small" color="primary" />,
    },
    { field: "notes", headerName: "ملاحظات", flex: 1, minWidth: 200 },
    {
      field: "actions",
      headerName: "الإجراءات",
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

  const filteredPayments = payments.filter(
    (payment) =>
      payment.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          المدفوعات
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          تسجيل دفعة
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
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المدفوعات
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {totalPayments.toLocaleString()} د.ع
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
            placeholder="البحث في المدفوعات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <DataGrid
            rows={filteredPayments}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: { sortModel: [{ field: "date", sort: "desc" }] },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            autoHeight
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
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PaymentIcon />
            {editingPayment ? "تعديل الدفعة" : "تسجيل دفعة جديدة"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>الطالب</InputLabel>
              <Select
                value={paymentForm.studentId}
                label="الطالب"
                onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
              >
                <MenuItem value="1">علي أحمد</MenuItem>
                <MenuItem value="2">سارة محمد</MenuItem>
                <MenuItem value="3">حسن علي</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="المبلغ (دينار عراقي)"
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>طريقة الدفع</InputLabel>
              <Select
                value={paymentForm.paymentMethod}
                label="طريقة الدفع"
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              >
                <MenuItem value="cash">نقدي</MenuItem>
                <MenuItem value="card">بطاقة</MenuItem>
                <MenuItem value="bank_transfer">تحويل بنكي</MenuItem>
                <MenuItem value="online">أونلاين</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="ملاحظات"
              multiline
              rows={3}
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleCreateOrUpdatePayment} variant="contained">
            {editingPayment ? "تحديث" : "تسجيل"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PaymentsPage
