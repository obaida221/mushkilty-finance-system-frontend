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
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Add, AccountBalance, Edit, Delete, CheckCircle, Schedule } from "@mui/icons-material"
import { usePayrolls } from "../hooks/usePayrolls"
import type { Payroll } from "../types"

const PayrollPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all")
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ 
    open: false, 
    message: "", 
    severity: "success" 
  })

  const { payrolls, loading, error, createPayroll, updatePayroll, deletePayroll } = usePayrolls()

  const [payrollForm, setPayrollForm] = useState({
    user_id: "",
    amount: "",
    currency: "IQD" as "IQD" | "USD",
    period_start: "",
    period_end: "",
    paid_at: "",
    note: "",
  })

  const handleOpenDialog = (payroll?: Payroll) => {
    if (payroll) {
      setEditingPayroll(payroll)
      setPayrollForm({
        user_id: payroll.user_id.toString(),
        amount: payroll.amount.toString(),
        currency: payroll.currency,
        period_start: payroll.period_start,
        period_end: payroll.period_end,
        paid_at: payroll.paid_at || "",
        note: payroll.note || "",
      })
    } else {
      setEditingPayroll(null)
      setPayrollForm({ 
        user_id: "", 
        amount: "", 
        currency: "IQD", 
        period_start: "", 
        period_end: "", 
        paid_at: "", 
        note: "" 
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => setOpenDialog(false)

  const handleSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity })
  }

  const handleSavePayroll = async () => {
    if (!payrollForm.user_id || !payrollForm.amount || !payrollForm.period_start || !payrollForm.period_end) {
      handleSnackbar("أدخل جميع البيانات المطلوبة", "error")
      return
    }

    try {
      const payload = {
        user_id: Number(payrollForm.user_id),
        amount: Number(payrollForm.amount),
        currency: payrollForm.currency,
        period_start: payrollForm.period_start,
        period_end: payrollForm.period_end,
        paid_at: payrollForm.paid_at || undefined,
        note: payrollForm.note || undefined,
      }

      if (editingPayroll) {
        await updatePayroll(editingPayroll.id, payload)
        handleSnackbar("تم تحديث الراتب بنجاح", "success")
      } else {
        await createPayroll(payload)
        handleSnackbar("تم إضافة الراتب بنجاح", "success")
      }
      handleCloseDialog()
    } catch (err) {
      console.error(err)
      handleSnackbar("حدث خطأ أثناء الحفظ", "error")
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الراتب؟")) {
      try {
        await deletePayroll(id)
        handleSnackbar("تم حذف الراتب بنجاح", "success")
      } catch (err) {
        console.error(err)
        handleSnackbar("حدث خطأ أثناء الحذف", "error")
      }
    }
  }

  const handleMarkAsPaid = async (payroll: Payroll) => {
    try {
      await updatePayroll(payroll.id, { 
        paid_at: new Date().toISOString() 
      })
      handleSnackbar("تم تحديد الراتب كمدفوع", "success")
    } catch (err) {
      console.error(err)
      handleSnackbar("حدث خطأ أثناء تحديث الحالة", "error")
    }
  }

  // Filter by search and status
  const filteredPayrolls = payrolls.filter((p) => {
    const matchesSearch = p.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.note?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" ? true :
                         statusFilter === "paid" ? p.paid_at !== null :
                         p.paid_at === null
    
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const totalIQD = payrolls.filter(p => p.currency === "IQD").reduce((sum, p) => sum + p.amount, 0)
  const totalUSD = payrolls.filter(p => p.currency === "USD").reduce((sum, p) => sum + p.amount, 0)
  const unpaidCount = payrolls.filter(p => !p.paid_at).length
  const paidCount = payrolls.filter(p => p.paid_at).length

  const columns: GridColDef[] = [
    {
      field: "period",
      headerName: "الفترة",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography>
          {params.row.period_start} → {params.row.period_end}
        </Typography>
      ),
    },
    {
      field: "user",
      headerName: "الموظف",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography>
          {params.row.user?.full_name || params.row.user?.username || `User #${params.row.user_id}`}
        </Typography>
      ),
    },
    {
      field: "amount",
      headerName: "المبلغ",
      width: 140,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600 }}>
          {Number(params.value).toLocaleString()} {params.row.currency === "IQD" ? "د.ع" : "$"}
        </Typography>
      ),
    },
    {
      field: "paid_at",
      headerName: "الحالة",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? "مدفوع" : "معلق"}
          size="small"
          color={params.value ? "success" : "warning"}
          icon={params.value ? <CheckCircle /> : <Schedule />}
        />
      ),
    },
    {
      field: "paid_date",
      headerName: "تاريخ الدفع",
      width: 140,
      renderCell: (params) => (
        <Typography>
          {params.row.paid_at ? new Date(params.row.paid_at).toLocaleDateString("ar-IQ") : "-"}
        </Typography>
      ),
    },
    {
      field: "note",
      headerName: "ملاحظات",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => <Typography>{params.value || "-"}</Typography>,
    },
    {
      field: "actions",
      headerName: "إجراءات",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          {!params.row.paid_at && (
            <Button 
              size="small" 
              variant="outlined"
              color="success"
              onClick={() => handleMarkAsPaid(params.row)}
              startIcon={<CheckCircle />}
            >
              دفع
            </Button>
          )}
          <Button size="small" onClick={() => handleOpenDialog(params.row)} startIcon={<Edit />} />
          <Button size="small" color="error" onClick={() => handleDelete(params.row.id)} startIcon={<Delete />} />
        </Box>
      ),
    },
  ]

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px"><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          إدارة الرواتب
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          إضافة راتب
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                إجمالي IQD
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
                {totalIQD.toLocaleString()} د.ع
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                إجمالي USD
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "success.main" }}>
                ${totalUSD.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                غير مدفوعة
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "warning.main" }}>
                {unpaidCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                مدفوعة
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "success.main" }}>
                {paidCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="البحث في الرواتب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={statusFilter}
                label="الحالة"
                onChange={(e) => setStatusFilter(e.target.value as "all" | "paid" | "unpaid")}
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="paid">مدفوع</MenuItem>
                <MenuItem value="unpaid">معلق</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <DataGrid
            rows={filteredPayrolls}
            columns={columns}
            getRowId={(row) => row.id}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
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

      {/* Payroll Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountBalance />
            {editingPayroll ? "تحديث الراتب" : "إضافة راتب جديد"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="معرف المستخدم (User ID)"
              type="number"
              value={payrollForm.user_id}
              onChange={(e) => setPayrollForm({ ...payrollForm, user_id: e.target.value })}
              helperText="أدخل معرف الموظف/المعلم"
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="بداية الفترة"
                  type="date"
                  value={payrollForm.period_start}
                  onChange={(e) => setPayrollForm({ ...payrollForm, period_start: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="نهاية الفترة"
                  type="date"
                  value={payrollForm.period_end}
                  onChange={(e) => setPayrollForm({ ...payrollForm, period_end: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="المبلغ"
                  type="number"
                  value={payrollForm.amount}
                  onChange={(e) => setPayrollForm({ ...payrollForm, amount: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>العملة</InputLabel>
                  <Select
                    value={payrollForm.currency}
                    label="العملة"
                    onChange={(e) => setPayrollForm({ ...payrollForm, currency: e.target.value as "IQD" | "USD" })}
                  >
                    <MenuItem value="IQD">دينار عراقي (IQD)</MenuItem>
                    <MenuItem value="USD">دولار ($)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="تاريخ الدفع (اختياري)"
              type="datetime-local"
              value={payrollForm.paid_at}
              onChange={(e) => setPayrollForm({ ...payrollForm, paid_at: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="اترك فارغاً إذا لم يتم الدفع بعد"
            />

            <TextField
              fullWidth
              label="ملاحظات (اختياري)"
              multiline
              rows={3}
              value={payrollForm.note}
              onChange={(e) => setPayrollForm({ ...payrollForm, note: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSavePayroll} variant="contained">
            {editingPayroll ? "تحديث" : "إضافة"}
          </Button>
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

export default PayrollPage
