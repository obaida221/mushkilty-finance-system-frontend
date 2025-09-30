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
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Add, Undo } from "@mui/icons-material"
import type { Refund } from "../types"

// Mock data
const mockRefunds: Refund[] = [
  {
    id: "1",
    studentId: "3",
    amount: 100000,
    reason: "إلغاء التسجيل في الدورة",
    transactionId: "5",
    date: "2024-03-12",
    approvedBy: "1",
    createdAt: "2024-03-12T16:45:00",
  },
]

const RefundsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [refunds] = useState<Refund[]>(mockRefunds)

  const [refundForm, setRefundForm] = useState({
    studentId: "",
    amount: "",
    reason: "",
  })

  const handleOpenDialog = () => {
    setRefundForm({ studentId: "", amount: "", reason: "" })
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleCreateRefund = () => {
    console.log("Creating refund:", refundForm)
    handleCloseDialog()
  }

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "التاريخ",
      width: 120,
    },
    {
      field: "studentId",
      headerName: "الطالب",
      flex: 1,
      minWidth: 150,
      renderCell: () => <Typography>حسن علي</Typography>, // In production, fetch student name
    },
    {
      field: "amount",
      headerName: "المبلغ",
      width: 150,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: "warning.main" }}>{params.value.toLocaleString()} د.ع</Typography>
      ),
    },
    {
      field: "reason",
      headerName: "السبب",
      flex: 2,
      minWidth: 250,
    },
    {
      field: "approvedBy",
      headerName: "تمت الموافقة بواسطة",
      width: 150,
      renderCell: () => <Typography>أحمد محمد</Typography>, // In production, fetch user name
    },
  ]

  const filteredRefunds = refunds.filter((refund) => refund.reason.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          المرتجعات
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          إضافة مرتجع
        </Button>
      </Box>

      <Paper>
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="البحث في المرتجعات..."
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
            rows={filteredRefunds}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
              sorting: {
                sortModel: [{ field: "date", sort: "desc" }],
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

      {/* Create Refund Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Undo />
            إضافة مرتجع جديد
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>الطالب</InputLabel>
              <Select
                value={refundForm.studentId}
                label="الطالب"
                onChange={(e) => setRefundForm({ ...refundForm, studentId: e.target.value })}
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
              value={refundForm.amount}
              onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
            />
            <TextField
              fullWidth
              label="السبب"
              multiline
              rows={3}
              value={refundForm.reason}
              onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleCreateRefund} variant="contained" color="warning">
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default RefundsPage
