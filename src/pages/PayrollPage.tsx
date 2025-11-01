"use client"

import React, { useState } from "react"
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
  Autocomplete,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Add, AccountBalance, CheckCircle, Schedule, Refresh } from "@mui/icons-material"
import { usePayrolls } from "../hooks/usePayrolls"
import usersAPI from "../api/usersAPI"
import type { Payroll, User } from "../types"
import { ActionsCell, DeleteConfirmDialog, PayrollViewDialog } from "../components/global-ui"

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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null; name: string }>({
    open: false,
    id: null,
    name: ""
  })
  const [viewDialog, setViewDialog] = useState<{ open: boolean; payroll: Payroll | null }>({
    open: false,
    payroll: null
  })

  const { payrolls, loading, error, createPayroll, updatePayroll, deletePayroll } = usePayrolls()
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)

  React.useEffect(() => {
    if (payrolls.length > 0 && !lastRefreshTime) {
      setLastRefreshTime(new Date())
    }
  }, [payrolls, lastRefreshTime])

  const refreshPayrolls = async () => {
    try {
      setLastRefreshTime(new Date())
    } catch (err) {
      console.error("فشل في تحديث البيانات:", err)
    }
  }

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const response = await usersAPI.getAll()
      setUsers(response)
    } catch (err) {
      console.error("فشل في جلب المستخدمين:", err)
    } finally {
      setUsersLoading(false)
    }
  }

  const [payrollForm, setPayrollForm] = useState({
    user_id: "",
    amount: "",
    currency: "IQD" as "IQD" | "USD",
    period_start: "",
    period_end: "",
    paid_at: "",
    note: "",
  })

  const handleOpenDialog = async (payroll?: Payroll) => {
    await fetchUsers()
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

      if (payroll.user) {
        setSelectedUser(payroll.user)
      } else {
        const foundUser = users.find(u => u.id === payroll.user_id)
        setSelectedUser(foundUser || null)
      }
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
      setSelectedUser(null)
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

    if (!selectedUser) {
      handleSnackbar("يجب اختيار مستخدم صحيح", "error")
      return
    }

    try {
      const payload = {
        user_id: selectedUser.id,
        amount: Number(payrollForm.amount),
        currency: payrollForm.currency,
        period_start: payrollForm.period_start,
        period_end: payrollForm.period_end,
        paid_at: payrollForm.paid_at || undefined,
        note: payrollForm.note || undefined,
      }

      if (editingPayroll) {
        await updatePayroll(editingPayroll.id, payload)
        handleSnackbar(`تم تحديث راتب ${selectedUser?.name || "الموظف"} بنجاح`, "success")
      } else {
        await createPayroll(payload)
        handleSnackbar(`تم إضافة راتب جديد لـ ${selectedUser?.name || "الموظف"} بنجاح`, "success")
      }
      setLastRefreshTime(new Date())
      handleCloseDialog()
    } catch (err) {
      console.error(err)
      handleSnackbar("حدث خطأ أثناء الحفظ", "error")
    }
  }

  const handleDeleteClick = (id: number) => {
    const payroll = payrolls.find(p => p.id === id)
    setDeleteDialog({
      open: true,
      id,
      name: payroll?.user?.name || "الموظف"
    })
  }

  const handleDeleteConfirm = async () => {
    if (deleteDialog.id === null) return

    try {
      await deletePayroll(deleteDialog.id)
      handleSnackbar(`تم حذف راتب ${deleteDialog.name} بنجاح`, "success")
      setLastRefreshTime(new Date())
      setDeleteDialog({ open: false, id: null, name: "" })
    } catch (err) {
      console.error(err)
      handleSnackbar("حدث خطأ أثناء حذف الراتب، يرجى المحاولة مرة أخرى", "error")
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null, name: "" })
  }

  const handleViewPayroll = (payroll: Payroll) => {
    setViewDialog({ open: true, payroll })
  }

  const handleCloseViewDialog = () => {
    setViewDialog({ open: false, payroll: null })
  }

  const handleMarkAsPaid = async (payroll: Payroll) => {
    try {
      await updatePayroll(payroll.id, {
        paid_at: new Date().toISOString()
      })
      handleSnackbar("تم تحديد الراتب كمدفوع", "success")
      setLastRefreshTime(new Date())
    } catch (err) {
      console.error(err)
      handleSnackbar("حدث خطأ أثناء تحديث الحالة", "error")
    }
  }

  // Filter by search and status
  const filteredPayrolls = payrolls.filter((p) => {
    // console.log('Filtering payrolls:', p)
    const matchesSearch = p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.note?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" ? true :
                         statusFilter === "paid" ? p.paid_at !== null :
                         p.paid_at === null
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const totalIQD = payrolls.filter(p => p.currency === "IQD").reduce((sum, p) => sum + +p.amount, 0)
  const totalUSD = payrolls.filter(p => p.currency === "USD").reduce((sum, p) => sum + +p.amount, 0)
  const unpaidCount = payrolls.filter(p => !p.paid_at).length
  const paidCount = payrolls.filter(p => p.paid_at).length

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 50 },
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
          {params.row.user?.name || params.row.user?.email || `User #${params.row.user_id}`}
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
          {params.row.paid_at ? new Date(params.row.paid_at).toLocaleDateString("en-IQ") : "-"}
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
          <ActionsCell
            rowId={params.row.id}
            row={params.row}
            onEdit={handleOpenDialog}
            onDelete={handleDeleteClick}
            onView={handleViewPayroll}
            viewButton={true}
          />
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {lastRefreshTime ? `آخر تحديث: ${lastRefreshTime.toLocaleTimeString("ar-EN")}` : ""}
          </Typography>
          <Button variant="outlined" startIcon={<Refresh />} onClick={refreshPayrolls}>
            تحديث
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            إضافة راتب
          </Button>
        </Box>
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
            <Autocomplete
              fullWidth
              options={users}
              loading={usersLoading}
              getOptionLabel={(option) => `${option.name} (${option.email}) - ID: ${option.id}`}
              value={selectedUser}
              onChange={(_, newValue) => {
                setSelectedUser(newValue);
                setPayrollForm({ ...payrollForm, user_id: newValue ? newValue.id.toString() : "" });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="اختر المستخدم"
                  helperText="ابحث عن الموظف/المعلم بالاسم أو البريد الإلكتروني"
                  required
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
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
                  required
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
                  required
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
                  required
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSavePayroll} variant="contained">
            {editingPayroll ? "تحديث" : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="تأكيد حذف الراتب"
        message="هل أنت متأكد من حذف راتب"
        itemName={deleteDialog.name}
      />

      {/* Payroll View Dialog */}
      <PayrollViewDialog
        open={viewDialog.open}
        onClose={handleCloseViewDialog}
        payroll={viewDialog.payroll}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default PayrollPage
