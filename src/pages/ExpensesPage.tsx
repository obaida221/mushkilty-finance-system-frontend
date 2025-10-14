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
  CircularProgress,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Add, MoneyOff, Edit, Delete } from "@mui/icons-material"
import { useExpenses, type Expense } from "../hooks/useExpenses"

const ExpensesPage: React.FC = () => {
  const { expenses, loading, error, createExpense, updateExpense, deleteExpense } = useExpenses()
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [expenseForm, setExpenseForm] = useState({
    category: "",
    note: "",
    amount: 0,
  })

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      utilities: "فواتير",
      rent: "إيجار",
      supplies: "مستلزمات",
      maintenance: "صيانة",
      marketing: "تسويق",
      other: "أخرى",
    }
    return labels[category] || category
  }

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense)
      setExpenseForm({ category: expense.category || "", note: expense.note || "", amount: expense.amount })
    } else {
      setEditingExpense(null)
      setExpenseForm({ category: "", note: "", amount: 0 })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => setOpenDialog(false)

  const handleSaveExpense = async () => {
    if (!expenseForm.category || !expenseForm.note || !expenseForm.amount) return

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          category: expenseForm.category,
          note: expenseForm.note,
          amount: expenseForm.amount,
        })
      } else {
        await createExpense({
          category: expenseForm.category,
          note: expenseForm.note,
          amount: expenseForm.amount,
        })
      }
      handleCloseDialog()
    } catch (err) {
      console.error("Failed to save expense:", err)
    }
  }

  const handleDeleteExpense = async (id: number) => {
    try {
      await deleteExpense(id)
    } catch (err) {
      console.error("Failed to delete expense:", err)
    }
  }

  const columns: GridColDef[] = [
    { field: "date", headerName: "التاريخ", width: 120 },
    { field: "category", headerName: "الفئة", width: 130, renderCell: (params) => <Chip label={getCategoryLabel(params.value)} size="small" color="secondary" /> },
    { field: "note", headerName: "الوصف", flex: 2, minWidth: 250 },
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

  const filteredExpenses = expenses.filter(exp =>
    (exp.note?.includes(searchQuery) || false) || getCategoryLabel(exp.category || "").includes(searchQuery)
    
  )
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>المصروفات</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>إضافة مصروف</Button>
      </Box>

      {/* Loading/Error */}
      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {/* Table */}
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
            getRowId={(row) => row.id}
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
            <MoneyOff /> {editingExpense ? "تعديل مصروف" : "إضافة مصروف جديد"}
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
                <MenuItem value="utilities">فواتير</MenuItem>
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
              value={expenseForm.note}
              onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
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
          <Button onClick={handleSaveExpense} variant="contained">{editingExpense ? "تحديث" : "إضافة"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ExpensesPage
