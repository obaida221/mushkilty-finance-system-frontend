"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  Divider,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Add, MoneyOff, Edit, Delete, Receipt, Visibility, Refresh } from "@mui/icons-material"
import { useExpenses, type CreateExpenseDto } from "../hooks/useExpenses"
import { useAuth } from "../context/AuthContext"
import { usePermissions } from "../hooks/usePermissions"
import { useExchangeRate } from "../context/ExchangeRateContext"
import type { Expense, Currency } from "../types/financial"
import DeleteConfirmDialog from "../components/global-ui/DeleteConfirmDialog"

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
  const { canCreateExpenses, canReadExpenses, canUpdateExpenses, canDeleteExpenses } = usePermissions()
  const { convertToIQD } = useExchangeRate()
  const [searchQuery, setSearchQuery] = useState("")
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: "success" | "error" }>({ 
    open: false, message: "", severity: "success" 
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    expenseId: number | null
    expenseName: string
  }>({
    open: false,
    expenseId: null,
    expenseName: ""
  })

  // تعيين وقت آخر تحديث عند تحميل البيانات
  useEffect(() => {
    if (expenses.length > 0 && !lastRefreshTime) {
      setLastRefreshTime(new Date())
    }
  }, [expenses, lastRefreshTime])

  // دالة تحديث البيانات
  const handleRefreshExpenses = async () => {
    try {
      // سيتم تحديث البيانات هنا
      setLastRefreshTime(new Date())
    } catch (err) {
      console.error("فشل في تحديث البيانات:", err)
    }
  }
  const [deleteLoading, setDeleteLoading] = useState(false)

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [expenseForm, setExpenseForm] = useState<ExpenseFormType>({
    beneficiary: "",
    description: "",
    amount: "",
    currency: "IQD",
    expense_date: new Date().toISOString().split('T')[0],
  });

  const handleOpenDetailDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedExpense(null);
  };

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

  const handleOpenDeleteDialog = (expense: Expense) => {
    setDeleteDialog({
      open: true,
      expenseId: expense.id,
      expenseName: expense.beneficiary
    })
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      expenseId: null,
      expenseName: ""
    })
    setDeleteLoading(false)
  }

  const handleConfirmDelete = async () => {
    if (!deleteDialog.expenseId) return

    setDeleteLoading(true)
    try {
      await deleteExpense(deleteDialog.expenseId)
      handleSnackbar("تم حذف المصروف بنجاح", "success")
      handleCloseDeleteDialog()
    } catch (err: any) {
      console.error("Failed to delete expense:", err)
      const errorMsg = err?.response?.data?.message || err?.message || "حدث خطأ أثناء الحذف"
      handleSnackbar(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg, "error")
      setDeleteLoading(false)
    }
  }

  const handleSaveExpense = async () => {
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

  // Calculate totals
  const totalIQD = expenses
    .filter(e => e.currency === "IQD")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  
  const totalUSD = expenses
    .filter(e => e.currency === "USD")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const totalInIQD = totalIQD + convertToIQD(totalUSD, "USD");

  const columns: GridColDef[] = [
  { 
    field: "id", 
    headerName: "ID", 
    flex: isMobile ? 0.2 : 0.3,
    minWidth: isMobile ? 40 : 50,
    maxWidth: isMobile ? 60 : 70,
    hideable: true,
  },
  { 
    field: "expense_date", 
    headerName: "التاريخ", 
    flex: isMobile ? 0.6 : 0.8,
    minWidth: isMobile ? 90 : 120,
    maxWidth: isMobile ? 110 : 140,
    valueGetter: (params) => {
      const date = new Date(params.row.expense_date);
      return isMobile 
        ? date.toLocaleDateString('ar-EN', { month: 'numeric', day: 'numeric' })
        : date.toLocaleDateString('ar-EN');
    }
  },
  { 
    field: "beneficiary", 
    headerName: "المستفيد", 
    flex: isMobile ? 1.2 : 1.5,
    minWidth: isMobile ? 100 : 150,
    maxWidth: isTablet ? 200 : 400,
  },
  { 
    field: "description", 
    headerName: "الوصف", 
    flex: isMobile ? 1 : 1.2, 
    minWidth: isMobile ? 120 : 200,
    hideable: true,
    // hide: isMobile,
    valueGetter: (params) => params.row.description || "—"
  },
  { 
    field: "amount", 
    headerName: "المبلغ", 
    flex: isMobile ? 0.8 : 1,
    minWidth: isMobile ? 100 : 150,
    maxWidth: isMobile ? 120 : 180,
    renderCell: (params) => (
      <Typography sx={{ 
        fontWeight: 600, 
        color: "error.main",
        fontSize: isMobile ? '0.75rem' : '0.875rem'
      }}>
        {Number(params.row.amount).toLocaleString()} {params.row.currency === "USD" ? "$" : "د.ع"}
      </Typography>
    )
  },
  {
    field: "actions",
    headerName: isMobile ? "" : "الإجراءات",
    flex: isMobile ? 0.6 : 0.8,
    minWidth: isMobile ? 80 : 160,
    maxWidth: isMobile ? 100 : 180,
    sortable: false,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: isMobile ? 0.5 : 1 }}>
        <IconButton 
          color="primary" 
          size={isMobile ? "small" : "medium"}
          onClick={() => handleOpenDetailDialog(params.row)}
          title="عرض التفاصيل"
        >
          <Visibility fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
        {canUpdateExpenses && 
          <IconButton 
            color="primary" 
            size={isMobile ? "small" : "medium"}
            onClick={() => handleOpenDialog(params.row)}
            title="تعديل"
          >
            <Edit fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        }
        {canDeleteExpenses &&
          <IconButton
            color="error"
            size={isMobile ? "small" : "medium"}
            onClick={() => handleOpenDeleteDialog(params.row)}
            title="حذف"
          >
            <Delete fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        }
      </Box>
    ),
  },
];

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

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {lastRefreshTime ? `آخر تحديث: ${lastRefreshTime.toLocaleTimeString("ar-EN")}` : ""}
        </Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefreshExpenses}>
          تحديث
        </Button>
        {canCreateExpenses && (
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>إضافة مصروف</Button>
        )}
      </Box>
    </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "error.main", p: 1.5, borderRadius: 2 }}>
                  <MoneyOff sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">إجمالي المصروفات (IQD+USD)</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalInIQD.toLocaleString()} د.ع</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "info.main", p: 1.5, borderRadius: 2 }}>
                  <Receipt sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">عدد المصروفات</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{expenses.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "error.main", p: 1.5, borderRadius: 2 }}>
                  <Typography sx={{ color: "white", fontWeight: 'bold' }}>IQD</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">إجمالي العراقي (IQD)</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalIQD.toLocaleString()} د.ع</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {totalUSD > 0 && (
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "warning.main", p: 1.5, borderRadius: 2 }}>
                  <Typography sx={{ color: "white", fontWeight: 'bold' }}>USD</Typography>
                </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">إجمالي الدولار (USD)</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>${totalUSD.toLocaleString()}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
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
          <Box sx={{ 
            // height: isMobile ? 400 : 500,
            width: '100%'
          }}>
            {canReadExpenses && (
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
              />)
              }
            {!canReadExpenses && (
              <Box>ليس لديك صلاحية لعرض المصروفات.</Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MoneyOff />
            <Typography>{editingExpense ? "تعديل مصروف" : "إضافة مصروف جديد"}</Typography>
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSaveExpense} variant="contained">{editingExpense ? "تحديث" : "إضافة"}</Button>
        </DialogActions>
      </Dialog>

      {/* Expense Details Dialog */}
      <Dialog 
        open={openDetailDialog} 
        onClose={handleCloseDetailDialog} 
        maxWidth= "sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ p: isMobile ? 2 : 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Visibility /> 
            <Typography variant={isMobile ? "h6" : "h5"}>
              تفاصيل المصروف
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          {selectedExpense && (
            <Grid container spacing={isMobile ? 2 : 4}>
              
              {/* المعلومات الأساسية  */}
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2,
                      fontWeight: 600
                    }}
                  >
                    المعلومات الأساسية
                  </Typography>
                  
                  <Stack spacing={2}>
                    {/* المستفيد */}
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        المستفيد
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 600,
                        }}
                      >
                        {selectedExpense.beneficiary}
                      </Typography>
                    </Box>

                    {/* المبلغ */}
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        المبلغ
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700,
                          direction: 'ltr',
                          textAlign: 'left'
                        }}
                      >
                        {Number(selectedExpense.amount).toLocaleString()} {selectedExpense.currency}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* معلومات النظام */}
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2,
                      fontWeight: 600
                    }}
                  >
                    معلومات النظام
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        معرف المصروف
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontFamily: 'monospace',
                          fontWeight: 600
                        }}
                      >
                        #{selectedExpense.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        معرف المستخدم
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontFamily: 'monospace',
                          fontWeight: 600
                        }}
                      >
                        {selectedExpense.user_id}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* المعلومات الإضافية  */}
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2,
                      fontWeight: 600
                    }}
                  >
                    المعلومات الإضافية
                  </Typography>
                  
                  <Stack spacing={2}>
                    {/* الوصف */}
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        الوصف
                      </Typography>
                      <Typography variant="body1">
                        {selectedExpense.description || "لا يوجد وصف"}
                      </Typography>
                    </Box>

                    {/* العملة */}
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        العملة
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedExpense.currency === "IQD" ? "دينار عراقي (IQD)" : "دولار أمريكي (USD)"}
                      </Typography>
                    </Box>

                    {/* التاريخ */}
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        تاريخ المصروف
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(selectedExpense.expense_date).toLocaleDateString('ar-EN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button 
            onClick={handleCloseDetailDialog}
            size={isMobile ? "small" : "medium"}
            variant="outlined"
          >
            إغلاق
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Edit />}
            onClick={() => {
              handleCloseDetailDialog();
              handleOpenDialog(selectedExpense!);
            }}
            size={isMobile ? "small" : "medium"}
          >
            تعديل المصروف
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف المصروف"
        message="هل أنت متأكد من حذف المصروف الخاص بـ"
        itemName={deleteDialog.expenseName}
        loading={deleteLoading}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{
          vertical: isMobile ? 'bottom' : 'top',
          horizontal: 'center'
        }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ExpensesPage