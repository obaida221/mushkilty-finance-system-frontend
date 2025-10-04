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
  IconButton,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Add, MoneyOff, Edit, Delete } from "@mui/icons-material"
import type { Expense } from "../types"

// Mock data
const mockExpenses: Expense[] = [
  { id: "1", category: "utilities", description: "فواتير الكهرباء والماء", amount: 150000, transactionId: "2", date: "2024-03-14", createdBy: "1", createdAt: "2024-03-14T14:20:00" },
  { id: "2", category: "rent", description: "إيجار المبنى - مارس 2024", amount: 500000, transactionId: "7", date: "2024-03-01", createdBy: "1", createdAt: "2024-03-01T10:00:00" },
  { id: "3", category: "supplies", description: "قرطاسية ومستلزمات مكتبية", amount: 75000, transactionId: "8", date: "2024-03-10", createdBy: "2", createdAt: "2024-03-10T15:30:00" },
]

const ExpensesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)

  const [expenseForm, setExpenseForm] = useState({
    category: "",
    description: "",
    amount: 0,
  })

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      utilities: "مرافق",
      rent: "إيجار",
      supplies: "مستلزمات",
      maintenance: "صيانة",
      marketing: "تسويق",
      other: "أخرى",
    }
    return labels[category] || category
  }

  // فتح صندوق الحوار للإضافة أو التعديل
  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingId(expense.id)
      setExpenseForm({ category: expense.category, description: expense.description, amount: expense.amount })
    } else {
      setEditingId(null)
      setExpenseForm({ category: "", description: "", amount: 0 })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => setOpenDialog(false)

  // حفظ مصروف جديد أو تحديث الموجود
  const handleSaveExpense = () => {
    if (!expenseForm.category || !expenseForm.description || !expenseForm.amount) return

    if (editingId) {
      setExpenses(prev => prev.map(exp => exp.id === editingId ? { ...exp, ...expenseForm } : exp))
    } else {
      const newExpense: Expense = {
        id: (expenses.length + 1).toString(),
        ...expenseForm,
        date: new Date().toISOString().split("T")[0],
        transactionId: null,
        createdBy: "1",
        createdAt: new Date().toISOString(),
      }
      setExpenses(prev => [...prev, newExpense])
    }
    handleCloseDialog()
  }

  // حذف مصروف
  const handleDeleteExpense = (id: string) => setExpenses(prev => prev.filter(exp => exp.id !== id))

  // تعريف أعمدة الجدول
  const columns: GridColDef[] = [
    { field: "date", headerName: "التاريخ", width: 120 },
    { field: "category", headerName: "الفئة", width: 130, renderCell: (params) => <Chip label={getCategoryLabel(params.value)} size="small" color="secondary" /> },
    { field: "description", headerName: "الوصف", flex: 2, minWidth: 250 },
    { field: "amount", headerName: "المبلغ", width: 150, renderCell: (params) => <Typography sx={{ fontWeight: 600, color: "error.main" }}>{params.value.toLocaleString()} د.ع</Typography> },
    {
      field: "actions",
      headerName: "الإجراءات",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" size="small" onClick={() => handleOpenDialog(params.row)}><Edit fontSize="small" /></IconButton>
          <IconButton color="error" size="small" onClick={() => handleDeleteExpense(params.row.id)}><Delete fontSize="small" /></IconButton>
        </Box>
      ),
    },
  ]

  // تصفية الجدول بناءً على البحث
  const filteredExpenses = expenses.filter(exp =>
    exp.description.includes(searchQuery) || getCategoryLabel(exp.category).includes(searchQuery)
  )

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>المصروفات</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>إضافة مصروف</Button>
      </Box>

      {/* Search & Table */}
      <Paper>
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="البحث في المصروفات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ mb: 3 }}
          />
          <DataGrid
            rows={filteredExpenses}
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
            <MoneyOff /> {editingId ? "تعديل مصروف" : "إضافة مصروف جديد"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>الفئة</InputLabel>
              <Select
                value={expenseForm.category}
                label="الفئة"
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              >
                <MenuItem value="utilities">مرافق</MenuItem>
                <MenuItem value="rent">إيجار</MenuItem>
                <MenuItem value="supplies">مستلزمات</MenuItem>
                <MenuItem value="maintenance">صيانة</MenuItem>
                <MenuItem value="marketing">تسويق</MenuItem>
                <MenuItem value="other">أخرى</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="الوصف"
              multiline
              rows={3}
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="المبلغ (دينار عراقي)"
              type="number"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSaveExpense} variant="contained">{editingId ? "تحديث" : "إضافة"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ExpensesPage
