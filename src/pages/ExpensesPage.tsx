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
  IconButton,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Add, MoneyOff, Edit, Delete, TrendingDown } from "@mui/icons-material"
import { useExpenses, type CreateExpenseDto } from "../hooks/useExpenses"
import { useAuth } from "../context/AuthContext"
import type { Expense, Currency } from "../types/financial"

type ExpenseFormType = {
  beneficiary: string;
  description: string;
  amount: string;
  currency: Currency;
  expense_date: string;
};

const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const { expenses, error, createExpense, updateExpense, deleteExpense } = useExpenses()
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: "success" | "error" }>({ 
    open: false, message: "", severity: "success" 
  });

  const [expenseForm, setExpenseForm] = useState<ExpenseFormType>({
    beneficiary: "",
    description: "",
    amount: "",
    currency: "IQD",
    expense_date: new Date().toISOString().split('T')[0],
  });

  const handleSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense)
      setExpenseForm({
        beneficiary: expense.beneficiary,
        description: expense.description || "",
        amount: expense.amount.toString(),
        currency: expense.currency,
        expense_date: expense.expense_date.split('T')[0],
      })
    } else {
      setEditingExpense(null)
      setExpenseForm({
        beneficiary: "",
        description: "",
        amount: "",
        currency: "IQD",
        expense_date: new Date().toISOString().split('T')[0],
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExpense(null);
  }

  const handleSaveExpense = async () => {
    // Validation
    if (!expenseForm.beneficiary || !expenseForm.amount || Number(expenseForm.amount) <= 0) {
      handleSnackbar("يرجى إدخال المستفيد والمبلغ بشكل صحيح", "error");
      return;
    }
    if (!user?.id) {
      handleSnackbar("خطأ: لم يتم العثور على معرف المستخدم", "error");
      return;
    }

    try {
      const payload: CreateExpenseDto = {
        user_id: user.id,
        beneficiary: expenseForm.beneficiary,
        amount: Number(expenseForm.amount),
        currency: expenseForm.currency,
        expense_date: new Date(expenseForm.expense_date).toISOString(),
      };

      // Add optional description field
      if (expenseForm.description) payload.description = expenseForm.description;

      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
        handleSnackbar("تم تحديث المصروف بنجاح", "success");
      } else {
        await createExpense(payload);
        handleSnackbar("تم إضافة المصروف بنجاح", "success");
      }
      handleCloseDialog();
    } catch (err: any) {
      console.error("Failed to save expense:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "حدث خطأ أثناء الحفظ";
      handleSnackbar(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg, "error");
    }
  }

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المصروف؟")) return;

    try {
      await deleteExpense(id);
      handleSnackbar("تم حذف المصروف بنجاح", "success");
    } catch (err: any) {
      console.error("Failed to delete expense:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "حدث خطأ أثناء الحذف";
      handleSnackbar(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg, "error");
    }
  }

  // Calculate totals
  const totalIQD = expenses
    .filter(e => e.currency === "IQD")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  
  const totalUSD = expenses
    .filter(e => e.currency === "USD")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const columns: GridColDef[] = [
    { 
      field: "expense_date", 
      headerName: "التاريخ", 
      width: 120,
      valueGetter: (params) => {
        const date = new Date(params.row.expense_date);
        return date.toLocaleDateString('ar-IQ');
      }
    },
    { 
      field: "beneficiary", 
      headerName: "المستفيد", 
      flex: 1,
      minWidth: 150,
    },
    { 
      field: "description", 
      headerName: "الوصف", 
      flex: 1, 
      minWidth: 200,
      valueGetter: (params) => params.row.description || "—"
    },
    { 
      field: "amount", 
      headerName: "المبلغ", 
      width: 150, 
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: "error.main" }}>
          {Number(params.row.amount).toLocaleString()} {params.row.currency}
        </Typography>
      )
    },
    {
      field: "actions",
      headerName: "الإجراءات",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" size="small" onClick={() => handleOpenDialog(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton color="error" size="small" onClick={() => handleDeleteExpense(params.row.id)}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ]

  const filteredExpenses = expenses.filter((exp) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (exp.beneficiary || "").toLowerCase().includes(searchLower) ||
      (exp.description || "").toLowerCase().includes(searchLower) ||
      exp.amount.toString().includes(searchLower) ||
      exp.currency.toLowerCase().includes(searchLower)
    );
  })
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>المصروفات</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>إضافة مصروف</Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "error.main", p: 1.5, borderRadius: 2 }}>
                  <MoneyOff sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">إجمالي المصروفات (IQD)</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalIQD.toLocaleString()} د.ع</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {totalUSD > 0 && (
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ bgcolor: "warning.main", p: 1.5, borderRadius: 2 }}>
                    <TrendingDown sx={{ color: "white" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">إجمالي المصروفات (USD)</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>${totalUSD.toLocaleString()}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "info.main", p: 1.5, borderRadius: 2 }}>
                  <MoneyOff sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">عدد المصروفات</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{expenses.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            <TextField
              fullWidth
              label="المستفيد *"
              value={expenseForm.beneficiary}
              onChange={(e) => setExpenseForm({ ...expenseForm, beneficiary: e.target.value })}
              placeholder="Ahmed Ali - Trainer"
              inputProps={{ maxLength: 255 }}
            />

            <TextField
              fullWidth
              label="المبلغ *"
              type="number"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              inputProps={{ min: 0, step: "0.01" }}
            />

            <FormControl fullWidth>
              <InputLabel>العملة</InputLabel>
              <Select
                value={expenseForm.currency}
                label="العملة"
                onChange={(e) => setExpenseForm({ ...expenseForm, currency: e.target.value as Currency })}
              >
                <MenuItem value="IQD">دينار عراقي (IQD)</MenuItem>
                <MenuItem value="USD">دولار أمريكي (USD)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="تاريخ المصروف *"
              type="date"
              value={expenseForm.expense_date}
              onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="الوصف"
              multiline
              rows={3}
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              placeholder="تفاصيل إضافية..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSaveExpense} variant="contained">{editingExpense ? "تحديث" : "إضافة"}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ExpensesPage
