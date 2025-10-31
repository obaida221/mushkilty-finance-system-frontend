"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, TrendingUp, TrendingDown, Receipt, AccountBalance, Add, Edit, Delete } from "@mui/icons-material"
import type { Transaction } from "../types"

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "payment",
    amount: 500000,
    description: "دفعة من الطالب علي أحمد - دورة البرمجة",
    date: "2024-03-15",
    referenceId: "PAY001",
    createdBy: "1",
    createdAt: "2024-03-15T10:30:00",
  },
  {
    id: "2",
    type: "expense",
    amount: 150000,
    description: "فواتير الكهرباء والماء",
    date: "2024-03-14",
    referenceId: "EXP001",
    createdBy: "1",
    createdAt: "2024-03-14T14:20:00",
  },
]

const TransactionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)

  const [openDialog, setOpenDialog] = useState(false)
  const [transactionForm, setTransactionForm] = useState({
    type: "",
    amount: "",
    description: "",
    date: "",
    referenceId: "",
  })

  const handleTypeFilterChange = (event: any) => setTypeFilter(event.target.value)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "payment": return <TrendingUp sx={{ fontSize: 18 }} />
      case "expense": return <TrendingDown sx={{ fontSize: 18 }} />
      case "refund": return <Receipt sx={{ fontSize: 18 }} />
      case "payroll": return <AccountBalance sx={{ fontSize: 18 }} />
      default: return null
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = { payment: "دفعة", expense: "مصروف", refund: "مرتجع", payroll: "راتب" }
    return labels[type] || type
  }

  const getTypeColor = (type: string): "success" | "error" | "warning" | "info" => {
    const colors: Record<string, "success" | "error" | "warning" | "info"> = {
      payment: "success",
      expense: "error",
      refund: "warning",
      payroll: "info",
    }
    return colors[type] || "info"
  }

  const handleOpenDialog = () => {
    setTransactionForm({ type: "", amount: "", description: "", date: "", referenceId: "" })
    setOpenDialog(true)
  }

  const handleCloseDialog = () => setOpenDialog(false)

  const handleCreateTransaction = () => {
    const newTransaction: Transaction = {
      id: (transactions.length + 1).toString(),
      type: transactionForm.type,
      amount: Number(transactionForm.amount),
      description: transactionForm.description,
      date: transactionForm.date,
      referenceId: transactionForm.referenceId,
      createdBy: "1",
      createdAt: new Date().toISOString(),
    }
    setTransactions([newTransaction, ...transactions])
    handleCloseDialog()
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  const columns: GridColDef[] = [
    { field: "date", headerName: "التاريخ", width: 120 },
    {
      field: "type",
      headerName: "النوع",
      width: 130,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {getTypeIcon(params.value)}
          <Chip label={getTypeLabel(params.value)} size="small" color={getTypeColor(params.value)} />
        </Box>
      ),
    },
    { field: "description", headerName: "الوصف", flex: 2, minWidth: 250 },
    {
      field: "amount",
      headerName: "المبلغ",
      width: 150,
      renderCell: (params) => {
        const row = params.row as Transaction
        const isIncome = row.type === "payment"
        return (
          <Typography color={isIncome ? "success.main" : "error.main"} sx={{ fontWeight: 600 }}>
            {isIncome ? "+" : "-"}{params.value.toLocaleString()} د.ع
          </Typography>
        )
      },
    },
    { field: "referenceId", headerName: "رقم المرجع", width: 130 },
    {
      field: "actions",
      headerName: "الإجراءات",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button color="error" onClick={() => handleDeleteTransaction(params.row.id)} startIcon={<Delete />}>
            حذف
          </Button>
        </Box>
      ),
    },
  ]

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.referenceId?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || transaction.type === typeFilter
    return matchesSearch && matchesType
  })

  const totalIncome = transactions.filter((t) => t.type === "payment").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses =
    transactions.filter((t) => t.type === "expense" || t.type === "payroll").reduce((sum, t) => sum + t.amount, 0) +
    transactions.filter((t) => t.type === "refund").reduce((sum, t) => sum + t.amount, 0)

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        المعاملات المالية
      </Typography>

      <Button variant="contained" startIcon={<Add />} sx={{ mb: 3 }} onClick={handleOpenDialog}>
        إضافة معاملة جديدة
      </Button>

      <Paper>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <TextField
              placeholder="البحث في المعاملات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
              sx={{ flex: 1, minWidth: 250 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>نوع المعاملة</InputLabel>
              <Select value={typeFilter} label="نوع المعاملة" onChange={handleTypeFilterChange}>
                <MenuItem value="all">جميع المعاملات</MenuItem>
                <MenuItem value="payment">الدفعات</MenuItem>
                <MenuItem value="expense">المصروفات</MenuItem>
                <MenuItem value="refund">المرتجعات</MenuItem>
                <MenuItem value="payroll">الرواتب</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <DataGrid
            rows={filteredTransactions}
            columns={columns}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[5, 10, 25, 50]}
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

      {/* Create Transaction Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة معاملة جديدة</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>نوع المعاملة</InputLabel>
              <Select
                value={transactionForm.type}
                onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}
              >
                <MenuItem value="payment">دفعة</MenuItem>
                <MenuItem value="expense">مصروف</MenuItem>
                <MenuItem value="refund">مرتجع</MenuItem>
                <MenuItem value="payroll">راتب</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="الوصف"
              value={transactionForm.description}
              onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="المبلغ"
              type="number"
              value={transactionForm.amount}
              onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
            />
            <TextField
              fullWidth
              label="تاريخ المعاملة"
              type="date"
              value={transactionForm.date}
              onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="رقم المرجع"
              value={transactionForm.referenceId}
              onChange={(e) => setTransactionForm({ ...transactionForm, referenceId: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleCreateTransaction} variant="contained">
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TransactionsPage
