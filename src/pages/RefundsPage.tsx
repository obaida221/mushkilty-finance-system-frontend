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
  IconButton,
  Card,
  CardContent,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Add, Undo, Edit, Delete } from "@mui/icons-material"
import type { Refund } from "../types"

// Mock data
const mockRefunds: Refund[] = [
  {
    id: "1",
    studentId: "3",
    studentName: "حسن علي",
    amount: 100000,
    reason: "إلغاء التسجيل في الدورة",
    transactionId: "5",
    date: "2024-03-12",
    approvedBy: "1",
    approvedByName: "أحمد محمد",
    createdAt: "2024-03-12T16:45:00",
  },
]

const RefundsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [refunds, setRefunds] = useState<Refund[]>(mockRefunds)

  const [refundForm, setRefundForm] = useState({
    studentId: "",
    studentName: "",
    amount: 0,
    reason: "",
  })

  const studentsList = [
    { id: "1", name: "علي أحمد" },
    { id: "2", name: "سارة محمد" },
    { id: "3", name: "حسن علي" },
  ]

  const handleOpenDialog = (refund?: Refund) => {
    if (refund) {
      setEditingId(refund.id)
      setRefundForm({
        studentId: refund.studentId,
        studentName: refund.studentName,
        amount: refund.amount,
        reason: refund.reason,
      })
    } else {
      setEditingId(null)
      setRefundForm({ studentId: "", studentName: "", amount: 0, reason: "" })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => setOpenDialog(false)

  const handleSaveRefund = () => {
    if (editingId) {
      setRefunds((prev) =>
        prev.map((r) =>
          r.id === editingId ? { ...r, ...refundForm } : r
        )
      )
    } else {
      const newRefund: Refund = {
        id: (refunds.length + 1).toString(),
        studentId: refundForm.studentId,
        studentName: studentsList.find(s => s.id === refundForm.studentId)?.name || "",
        amount: Number(refundForm.amount),
        reason: refundForm.reason,
        transactionId: null,
        date: new Date().toISOString().split("T")[0],
        approvedBy: "1",
        approvedByName: "أحمد محمد",
        createdAt: new Date().toISOString(),
      }
      setRefunds((prev) => [...prev, newRefund])
    }
    handleCloseDialog()
  }

  const handleDeleteRefund = (id: string) => {
    setRefunds((prev) => prev.filter((r) => r.id !== id))
  }

  const columns: GridColDef[] = [
    { field: "date", headerName: "التاريخ", width: 120 },
    { field: "studentName", headerName: "الطالب", flex: 1, minWidth: 150 },
    { field: "amount", headerName: "المبلغ", width: 150, renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: "warning.main" }}>
          {params.value.toLocaleString()} د.ع
        </Typography>
      )
    },
    { field: "reason", headerName: "السبب", flex: 2, minWidth: 250 },
    { field: "approvedByName", headerName: "تمت الموافقة بواسطة", width: 150 },
    { field: "actions", headerName: "الإجراءات", width: 120, sortable: false, renderCell: (params) => (
        <Box>
          <IconButton color="primary" size="small" onClick={() => handleOpenDialog(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton color="error" size="small" onClick={() => handleDeleteRefund(params.row.id)}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      )
    },
  ]

  const filteredRefunds = refunds.filter((r) =>
    r.studentName.includes(searchQuery) ||
    r.reason.includes(searchQuery) ||
    r.date.includes(searchQuery)
  )

  const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0)

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>المرتجعات</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>إضافة مرتجع</Button>
      </Box>

      {/* Stats Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">إجمالي المرتجعات</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "warning.main" }}>
                {totalRefunds.toLocaleString()} د.ع
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search & Table */}
      <Paper>
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="البحث في المرتجعات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Search /></InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
          <DataGrid
            rows={filteredRefunds}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: { sortModel: [{ field: "date", sort: "desc" }] },
            }}
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

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Undo /> {editingId ? "تعديل مرتجع" : "إضافة مرتجع جديد"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>الطالب</InputLabel>
              <Select
                value={refundForm.studentId}
                label="الطالب"
                onChange={(e) => {
                  const student = studentsList.find(s => s.id === e.target.value)
                  setRefundForm({ ...refundForm, studentId: e.target.value, studentName: student?.name || "" })
                }}
              >
                {studentsList.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="المبلغ (دينار عراقي)"
              type="number"
              value={refundForm.amount}
              onChange={(e) => setRefundForm({ ...refundForm, amount: Number(e.target.value) })}
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
          <Button onClick={handleSaveRefund} variant="contained" color="warning">
            {editingId ? "تحديث" : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default RefundsPage
