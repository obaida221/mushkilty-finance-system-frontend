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
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Add, AccountBalance } from "@mui/icons-material"
import type { Payroll } from "../types"

// Mock data
const mockPayrolls: Payroll[] = [
  {
    id: "1",
    teacherId: "1",
    amount: 1000000,
    bonus: 100000,
    deductions: 50000,
    netAmount: 1050000,
    month: "مارس",
    year: 2024,
    transactionId: "3",
    status: "paid",
    paidDate: "2024-03-01",
    createdAt: "2024-03-01T09:00:00",
  },
  {
    id: "2",
    teacherId: "2",
    amount: 900000,
    bonus: 0,
    deductions: 0,
    netAmount: 900000,
    month: "مارس",
    year: 2024,
    transactionId: "9",
    status: "paid",
    paidDate: "2024-03-01",
    createdAt: "2024-03-01T09:15:00",
  },
  {
    id: "3",
    teacherId: "3",
    amount: 850000,
    bonus: 50000,
    deductions: 0,
    netAmount: 900000,
    month: "أبريل",
    year: 2024,
    transactionId: null,
    status: "pending",
    paidDate: null,
    createdAt: "2024-04-01T08:00:00",
  },
]

const PayrollPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [payrolls] = useState<Payroll[]>(mockPayrolls)

  const [payrollForm, setPayrollForm] = useState({
    teacherId: "",
    amount: "",
    bonus: "",
    deductions: "",
    month: "",
  })

  const handleOpenDialog = () => {
    setPayrollForm({ teacherId: "", amount: "", bonus: "", deductions: "", month: "" })
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleCreatePayroll = () => {
    console.log("Creating payroll:", payrollForm)
    handleCloseDialog()
  }

  const columns: GridColDef[] = [
    {
      field: "teacherId",
      headerName: "المدرس",
      flex: 1,
      minWidth: 150,
      renderCell: () => <Typography>د. محمد أحمد</Typography>, // In production, fetch teacher name
    },
    {
      field: "month",
      headerName: "الشهر",
      width: 100,
    },
    {
      field: "year",
      headerName: "السنة",
      width: 80,
    },
    {
      field: "amount",
      headerName: "الراتب الأساسي",
      width: 140,
      renderCell: (params) => `${params.value.toLocaleString()} د.ع`,
    },
    {
      field: "bonus",
      headerName: "المكافآت",
      width: 120,
      renderCell: (params) => (params.value > 0 ? `+${params.value.toLocaleString()} د.ع` : "-"),
    },
    {
      field: "deductions",
      headerName: "الخصومات",
      width: 120,
      renderCell: (params) => (params.value > 0 ? `-${params.value.toLocaleString()} د.ع` : "-"),
    },
    {
      field: "netAmount",
      headerName: "الصافي",
      width: 140,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: "success.main" }}>{params.value.toLocaleString()} د.ع</Typography>
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
  ]

  const filteredPayrolls = payrolls.filter((payroll) => payroll.month.includes(searchQuery))

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          إدارة الرواتب
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          إضافة راتب
        </Button>
      </Box>

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
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": {
                borderColor: "divider",
              },
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "background.default",
                borderColor: "divider",
              },
            }}
          />
        </Box>
      </Paper>

      {/* Create Payroll Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountBalance />
            إضافة راتب جديد
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
          <Button onClick={handleCreatePayroll} variant="contained">
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PayrollPage
