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
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Add, AccountBalance, Edit, Delete } from "@mui/icons-material"
import { usePayrolls } from "../hooks/usePayrolls"
import type { Payroll } from "../types"

const PayrollPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" })

  const { payrolls, loading, error, createPayroll, updatePayroll, deletePayroll } = usePayrolls()

  const [payrollForm, setPayrollForm] = useState({
    teacherId: "",
    month: "",
    year: new Date().getFullYear(),
    amount: "",
    bonus: "",
    deductions: "",
  })

  const handleOpenDialog = (payroll?: Payroll) => {
    if (payroll) {
      setEditingPayroll(payroll)
      setPayrollForm({
        teacherId: payroll.teacherId,
        month: payroll.month,
        year: payroll.year,
        amount: payroll.amount.toString(),
        bonus: payroll.bonus.toString(),
        deductions: payroll.deductions.toString(),
      })
    } else {
      setEditingPayroll(null)
      setPayrollForm({ teacherId: "", month: "", year: new Date().getFullYear(), amount: "", bonus: "", deductions: "" })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => setOpenDialog(false)

  const handleSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity })
  }

  const handleSavePayroll = async () => {
    if (!payrollForm.teacherId || !payrollForm.month || !payrollForm.amount) {
      handleSnackbar("أدخل جميع البيانات المطلوبة", "error")
      return
    }

    try {
      const payload = {
        ...payrollForm,
        amount: Number(payrollForm.amount),
        bonus: Number(payrollForm.bonus),
        deductions: Number(payrollForm.deductions),
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

  const filteredPayrolls = payrolls.filter((p) => p.month.includes(searchQuery))

  const columns: GridColDef[] = [
    {
      field: "teacherId",
      headerName: "المدرس",
      flex: 1,
      minWidth: 150,
      renderCell: () => <Typography>د. محمد أحمد</Typography>, // يمكن تعديلها لجلب الاسم من relation
    },
    { field: "month", headerName: "الشهر", width: 100 },
    { field: "year", headerName: "السنة", width: 80 },
    {
      field: "amount",
      headerName: "الراتب الأساسي",
      width: 140,
      renderCell: (params) => `${Number(params.value).toLocaleString()} د.ع`,
    },
    {
      field: "bonus",
      headerName: "المكافآت",
      width: 120,
      renderCell: (params) => (Number(params.value) > 0 ? `+${Number(params.value).toLocaleString()} د.ع` : "-"),
    },
    {
      field: "deductions",
      headerName: "الخصومات",
      width: 120,
      renderCell: (params) => (Number(params.value) > 0 ? `-${Number(params.value).toLocaleString()} د.ع` : "-"),
    },
    {
      field: "netAmount",
      headerName: "الصافي",
      width: 140,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: "success.main" }}>
          {Number(params.row.amount + params.row.bonus - params.row.deductions).toLocaleString()} د.ع
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "الحالة",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value === "paid" ? "مدفوع" : "معلق"}
          size="small"
          color={params.value === "paid" ? "success" : "warning"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "إجراءات",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
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

      <Paper>
        <Box sx={{ p: 3 }}>
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
            sx={{ mb: 3 }}
          />

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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountBalance />
            {editingPayroll ? "تحديث الراتب" : "إضافة راتب جديد"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>المدرس</InputLabel>
              <Select
                value={payrollForm.teacherId}
                label="المدرس"
                onChange={(e) => setPayrollForm({ ...payrollForm, teacherId: e.target.value })}
              >
                <MenuItem value="1">د. محمد أحمد</MenuItem>
                <MenuItem value="2">د. فاطمة علي</MenuItem>
                <MenuItem value="3">د. حسن محمود</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>الشهر</InputLabel>
              <Select
                value={payrollForm.month}
                label="الشهر"
                onChange={(e) => setPayrollForm({ ...payrollForm, month: e.target.value })}
              >
                <MenuItem value="يناير">يناير</MenuItem>
                <MenuItem value="فبراير">فبراير</MenuItem>
                <MenuItem value="مارس">مارس</MenuItem>
                <MenuItem value="أبريل">أبريل</MenuItem>
                <MenuItem value="مايو">مايو</MenuItem>
                <MenuItem value="يونيو">يونيو</MenuItem>
                <MenuItem value="يوليو">يوليو</MenuItem>
                <MenuItem value="أغسطس">أغسطس</MenuItem>
                <MenuItem value="سبتمبر">سبتمبر</MenuItem>
                <MenuItem value="أكتوبر">أكتوبر</MenuItem>
                <MenuItem value="نوفمبر">نوفمبر</MenuItem>
                <MenuItem value="ديسمبر">ديسمبر</MenuItem>
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="الراتب الأساسي"
                  type="number"
                  value={payrollForm.amount}
                  onChange={(e) => setPayrollForm({ ...payrollForm, amount: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="المكافآت"
                  type="number"
                  value={payrollForm.bonus}
                  onChange={(e) => setPayrollForm({ ...payrollForm, bonus: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="الخصومات"
                  type="number"
                  value={payrollForm.deductions}
                  onChange={(e) => setPayrollForm({ ...payrollForm, deductions: e.target.value })}
                />
              </Grid>
            </Grid>
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
