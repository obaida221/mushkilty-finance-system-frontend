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
  FormControl,
  Grid,
  IconButton,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Autocomplete,
  CircularProgress,
  Divider,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Add, Undo, Edit, Delete, TrendingDown } from "@mui/icons-material"
import { useRefunds } from "../hooks/useRefunds"
import { usePayments } from "../hooks/usePayments"
import type { Refund } from "../types/financial"
import type { Payment } from "../types/payment"

interface RefundFormType {
  payment_id: string;
  reason: string;
  refunded_at: string;
}

const RefundsPage: React.FC = () => {
  const { refunds, loading, error, createRefund, updateRefund, deleteRefund } = useRefunds();
  const { payments, loading: paymentsLoading } = usePayments();
  
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingRefund, setEditingRefund] = useState<Refund | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: "success" | "error" }>({ 
    open: false, 
    message: "", 
    severity: "success" 
  });

  const [refundForm, setRefundForm] = useState<RefundFormType>({
    payment_id: "",
    reason: "",
    refunded_at: new Date().toISOString().split('T')[0],
  })

  const handleSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (refund?: Refund) => {
    if (refund) {
      setEditingRefund(refund)
      setRefundForm({
        payment_id: refund.payment_id.toString(),
        reason: refund.reason || "",
        refunded_at: refund.refunded_at ? refund.refunded_at.split('T')[0] : new Date().toISOString().split('T')[0],
      })
    } else {
      setEditingRefund(null)
      setRefundForm({
        payment_id: "",
        reason: "",
        refunded_at: new Date().toISOString().split('T')[0],
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRefund(null);
  }

  const handleOpenDetailsDialog = (refund: Refund) => {
    setSelectedRefund(refund);
    setDetailsDialogOpen(true);
  }

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedRefund(null);
  }

  const handleSaveRefund = async () => {
    if (!refundForm.payment_id) {
      handleSnackbar("يرجى اختيار الواردة", "error");
      return;
    }

    try {
      const payload = {
        payment_id: Number(refundForm.payment_id),
        refunded_at: new Date(refundForm.refunded_at).toISOString(),
        reason: refundForm.reason || undefined,
      };

      if (editingRefund) {
        await updateRefund(editingRefund.id, payload);
        handleSnackbar("تم تحديث المرتجع بنجاح", "success");
      } else {
        await createRefund(payload);
        handleSnackbar("تم إضافة المرتجع بنجاح", "success");
      }
      handleCloseDialog();
    } catch (err: any) {
      console.error("Failed to save refund:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "حدث خطأ أثناء الحفظ";
      handleSnackbar(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg, "error");
    }
  }

  const handleDeleteRefund = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المرتجع؟")) return;
    
    try {
      await deleteRefund(id);
      handleSnackbar("تم حذف المرتجع بنجاح", "success");
    } catch (err: any) {
      console.error("Failed to delete refund:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "حدث خطأ أثناء الحذف";
      handleSnackbar(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg, "error");
    }
  }

  // Calculate totals by currency
  const totalIQD = refunds
    .filter(r => r.payment?.currency === "IQD")
    .reduce((sum, r) => sum + Number(r.payment?.amount || 0), 0);
  
  const totalUSD = refunds
    .filter(r => r.payment?.currency === "USD")
    .reduce((sum, r) => sum + Number(r.payment?.amount || 0), 0);

  const columns: GridColDef[] = [
    { 
      field: "refunded_at", 
      headerName: "تاريخ الإرجاع", 
      width: 120,
      valueGetter: (params) => {
        if (!params.row.refunded_at) return "—";
        const date = new Date(params.row.refunded_at);
        return date.toLocaleDateString();
      }
    },
    { 
      field: "payment_date", 
      headerName: "تاريخ الدفع", 
      width: 120,
      valueGetter: (params) => {
        const date = new Date(params.row.payment?.paid_at);
        return date.toLocaleDateString();
      }
    },
    { 
      field: "type", 
      headerName: "المصدر", 
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => {
        if (params.row.payment?.enrollment) {
          return "تسجيل طالب";
        }
        else if (params.row.payment?.payer) {
          return "واردة خارجية";
        }
        return "—";
      }
    },
    {
      field: "student",
      headerName: "الطالب/المؤسسة",
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => {
        return params.row.payment?.enrollment?.student?.full_name ||
          params.row.payment?.payer ||
          "—";
      }
    },
    { 
      field: "amount", 
      headerName: "المبلغ", 
      width: 150, 
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: "warning.main" }}>
          {Number(params.row.payment?.amount || 0).toLocaleString()} {params.row.payment?.currency}
        </Typography>
      )
    },
    { 
      field: "reason", 
      headerName: "السبب", 
      flex: 2, 
      minWidth: 200,
      valueGetter: (params) => params.row.reason || "—"
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
          <IconButton color="error" size="small" onClick={() => handleDeleteRefund(params.row.id)}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      )
    },
  ]

  const filteredRefunds = refunds.filter((r) => {
    console.log("Filtering refund:", r);
    const searchLower = searchQuery.toLowerCase();
    return (
      (r.payment?.enrollment?.student?.name || "").toLowerCase().includes(searchLower) ||
      (r.payment?.payer || "").toLowerCase().includes(searchLower) ||
      (r.reason || "").toLowerCase().includes(searchLower) ||
      r.payment?.amount.toString().includes(searchLower)
    );
  });

  // Get available payments for dropdown (payments without refunds and not already returned)
  const availablePayments = payments.filter(p => {
    // Filter out returned payments
    if (p.status === 'returned') return false;
    
    // Check if this payment already has a refund (excluding current editing refund)
    const hasRefund = refunds.some(r => 
      r.payment_id === p.id && 
      (!editingRefund || r.id !== editingRefund.id)
    );
    return !hasRefund;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>المرتجعات</Typography>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          إضافة مرتجع
        </Button>
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
                  <Undo sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">إجمالي المرتجعات (IQD)</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700}}>
                    {totalIQD.toLocaleString()} IQD
                  </Typography>
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
                  <Typography variant="body2" color="text.secondary">إجمالي المرتجعات (USD)</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ${totalUSD.toLocaleString()}
                  </Typography>
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
                  <Undo sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">عدد المرتجعات</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {refunds.length}
                  </Typography>
                </Box>
              </Box>
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
            loading={loading}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: { sortModel: [{ field: "refunded_at", sort: "desc" }] },
            }}
            disableRowSelectionOnClick
            autoHeight
            onRowClick={(params) => handleOpenDetailsDialog(params.row)}
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": { borderColor: "divider", cursor: "pointer" },
              "& .MuiDataGrid-columnHeaders": { bgcolor: "background.default", borderColor: "divider" },
              "& .MuiDataGrid-row:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
            }}
          />
        </Box>
      </Paper>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Undo /> {editingRefund ? "تعديل مرتجع" : "إضافة مرتجع جديد"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {/* Info about automatic status change */}
            {!editingRefund && (
              <Alert severity="info" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>ملاحظة:</strong> عند إنشاء المرتجع، سيتم تغيير حالة الواردة تلقائياً إلى "مرتجعة"
                </Typography>
              </Alert>
            )}
            
            <FormControl fullWidth>
              <Autocomplete
                options={editingRefund ? 
                  [...availablePayments, payments.find(p => p.id === editingRefund.payment_id)].filter((p): p is Payment => p !== undefined) : 
                  availablePayments
                }
                getOptionLabel={(option) => {
                  if (!option) return "";
                  // Payment type from payment.ts doesn't have enrollment relation, but we handle both cases
                  const studentName = option.payer || "واردة خارجية";
                  const amount = `${option.amount.toLocaleString()} ${option.currency}`;
                  const date = new Date(option.paid_at).toLocaleDateString();
                  return `${studentName} - ${amount} (${date})`;
                }}
                value={payments.find(p => p.id === Number(refundForm.payment_id)) || null}
                onChange={(_, newValue) => {
                  setRefundForm({ ...refundForm, payment_id: newValue ? newValue.id.toString() : "" });
                }}
                loading={paymentsLoading}
                disabled={!!editingRefund}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="الواردة المراد إرجاعها *"
                    placeholder="ابحث عن واردة..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {paymentsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        <Divider/>
                        </>
                      ),
                    }}
                  />
                )}
                noOptionsText="لا توجد دفعات متاحة للإرجاع"
              />
            </FormControl>

            <TextField
              fullWidth
              label="تاريخ الإرجاع *"
              type="date"
              value={refundForm.refunded_at}
              onChange={(e) => setRefundForm({ ...refundForm, refunded_at: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="السبب"
              multiline
              rows={3}
              value={refundForm.reason}
              onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
              placeholder="سبب الإرجاع (اختياري)..."
            />

            {/* Show payment details if payment selected */}
            {refundForm.payment_id && (
              <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  تفاصيل الواردة:
                </Typography>
                {(() => {
                  const payment = payments.find(p => p.id === Number(refundForm.payment_id));
                  if (!payment) return null;
                  console.log("Selected payment details:", payment);
                  return (
                    <Box>
                      <Typography variant="body2">
                        <strong>المبلغ:</strong> {payment.amount.toLocaleString()} {payment.currency}
                      </Typography>
                      <Typography variant="body2">
                        <strong>المصدر:</strong> {payment.enrollment ? `${payment.enrollment.student.full_name} (تسجيل)` : `${payment.payer} (واردة خارجية)` || "—"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>تاريخ الدفع:</strong> {new Date(payment.paid_at).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>النوع:</strong> {payment.type === "full" ? "دفعة كاملة" : "أقساط"}
                      </Typography>
                    </Box>
                  );
                })()}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSaveRefund} variant="contained" color="warning">
            {editingRefund ? "تحديث" : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TrendingDown /> تفاصيل المرتجع
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRefund && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              {/* Refund Details */}
              <>
                <Typography variant="h6" gutterBottom>معلومات المرتجع</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">رقم المرتجع</Typography>
                    <Typography variant="body1">{selectedRefund.id}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">تاريخ الإرجاع</Typography>
                    <Typography variant="body1">
                      {selectedRefund.refunded_at ? new Date(selectedRefund.refunded_at).toLocaleDateString() : "—"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">سبب الإرجاع</Typography>
                    <Typography variant="body1">{selectedRefund.reason || "—"}</Typography>
                  </Grid>
                </Grid>
              </>
              <Divider/>

              {/* Payment Details */}
              {selectedRefund.payment && (
                <>
                  <Typography variant="h6" gutterBottom>معلومات الواردة</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">رقم الواردة</Typography>
                      <Typography variant="body1">{selectedRefund.payment.id}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">المبلغ</Typography>
                      <Typography variant="body1" sx={{ fontWeight: "bold", color: "warning.main" }}>
                        {Number(selectedRefund.payment.amount || 0).toLocaleString()} {selectedRefund.payment.currency}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">تاريخ الدفع</Typography>
                      <Typography variant="body1">
                        {selectedRefund.payment.paid_at ? new Date(selectedRefund.payment.paid_at).toLocaleDateString() : "—"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">نوع الواردة</Typography>
                      <Typography variant="body1">{selectedRefund.payment.type === "full" ? "دفعة كاملة" : "أقساط"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">حالة الواردة</Typography>
                      <Typography variant="body1">{selectedRefund.payment.status === "returned" ? "مرتجعة" : selectedRefund.payment.status}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">طريقة الدفع</Typography>
                      <Typography variant="body1">{selectedRefund.payment.payment_method_id || "—"}</Typography>
                    </Grid>
                  </Grid>
                </>
              )}
              <Divider />

              {/* Student/External Payer Details */}
              {selectedRefund.payment?.enrollment?.student ? (
                <>
                  <Typography variant="h6" gutterBottom>معلومات الطالب</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">الاسم الكامل</Typography>
                      <Typography variant="body1">{selectedRefund.payment.enrollment.student?.full_name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">الهاتف</Typography>
                      <Typography variant="body1">{selectedRefund.payment.enrollment.student.phone || "—"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">المدينة</Typography>
                      <Typography variant="body1">{selectedRefund.payment.enrollment.student.city || "—"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">الحالة</Typography>
                      <Typography variant="body1">{selectedRefund.payment.enrollment.student.status || "—"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">تاريخ الإنشاء</Typography>
                      <Typography variant="body1">
                        {selectedRefund.payment.enrollment.student.created_at ? 
                          new Date(selectedRefund.payment.enrollment.student.created_at).toLocaleDateString() : "—"}
                      </Typography>
                    </Grid>
                  </Grid>
                </>
              ) : selectedRefund.payment?.payer ? (
                <>
                  <Typography variant="h6" gutterBottom>معلومات الدافع</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">اسم الدافع</Typography>
                      <Typography variant="body1">{selectedRefund.payment.payer}</Typography>
                    </Grid>
                  </Grid>
                </>
              ) : null}
              <Divider />

              {/* Enrollment Details (if available) */}
              {selectedRefund.payment?.enrollment && (
                <>
                  <Typography variant="h6" gutterBottom>معلومات التسجيل</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">رقم التسجيل</Typography>
                      <Typography variant="body1">{selectedRefund.payment.enrollment.id}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">السعر الإجمالي</Typography>
                      <Typography variant="body1">
                        {Number(selectedRefund.payment.enrollment.total_price || 0).toLocaleString()} {selectedRefund.payment.enrollment.currency}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">حالة التسجيل</Typography>
                      <Typography variant="body1">{selectedRefund.payment.enrollment.status}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">تاريخ التسجيل</Typography>
                      <Typography variant="body1">
                        {selectedRefund.payment.enrollment.enrolled_at ? 
                          new Date(selectedRefund.payment.enrollment.enrolled_at).toLocaleDateString() : "—"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">ملاحظات</Typography>
                      <Typography variant="body1">{selectedRefund.payment.enrollment.notes || "—"}</Typography>
                    </Grid>
                  </Grid>
                </>
              )}
              <Divider/>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>إغلاق</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default RefundsPage
