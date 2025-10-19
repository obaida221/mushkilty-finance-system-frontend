"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Chip, InputAdornment,
  MenuItem, FormControl, InputLabel, Select, Grid, Alert,
  Snackbar, Card, CardContent, Tooltip, CircularProgress
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Edit, Delete, Add, Discount as DiscountIcon, Refresh, Visibility } from "@mui/icons-material"
import type { DiscountCode, DiscountFormData } from "../types/discount"
import { discountCodesAPI } from "../api/discountCodesAPI"

const DiscountsPage: React.FC = () => {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null)
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountCode | null>(null)
  const [selectedDetailsDiscount, setSelectedDetailsDiscount] = useState<DiscountCode | null>(null)

  const [discountType, setDiscountType] = useState<"percentage" | "fixed" | "">("")

  const [discountForm, setDiscountForm] = useState<DiscountFormData>({
    code: "",
    name: "",
    purpose: "",
    amount: null,
    currency: null,
    percent: null,
    usage_limit: undefined,
    valid_from: null,
    valid_to: null,
    active: true,
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  const getCurrentUserId = (): number => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      return user.id
    }
    return 0
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await discountCodesAPI.getAll()
      setDiscounts(response.data)
    } catch (error: any) {
      console.error('Failed to load discounts:', error)
      setError(error.response?.data?.message || 'فشل في تحميل أكواد الخصم')
    } finally {
      setLoading(false)
    }
  }

  // عمليات CRUD
  const handleCreateDiscount = async () => {
    try {
      const formDataWithUserId = {
        ...discountForm,
        user_id: getCurrentUserId()
      }
      
      await discountCodesAPI.create(formDataWithUserId)
      setSnackbar({ open: true, message: 'تم إنشاء كود الخصم بنجاح', severity: 'success' })
      setDialogOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'فشل في إنشاء كود الخصم', severity: 'error' })
    }
  }

  const handleUpdateDiscount = async () => {
    if (!selectedDiscount) return

    try {
      await discountCodesAPI.update(selectedDiscount.id, discountForm)
      setSnackbar({ open: true, message: 'تم تحديث كود الخصم بنجاح', severity: 'success' })
      setDialogOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'فشل في تحديث كود الخصم', severity: 'error' })
    }
  }

  const handleDeleteDiscount = async () => {
    if (!selectedDiscount) return

    try {
      await discountCodesAPI.delete(selectedDiscount.id)
      setSnackbar({ open: true, message: 'تم حذف كود الخصم بنجاح', severity: 'success' })
      setDeleteDialogOpen(false)
      setSelectedDiscount(null)
      loadData()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'فشل في حذف كود الخصم', severity: 'error' })
    }
  }

  // دوال المساعدة
  const resetForm = () => {
    setDiscountType("")
    setDiscountForm({
      code: "",
      name: "",
      purpose: "",
      amount: null,
      currency: null,
      percent: null,
      usage_limit: undefined,
      valid_from: null,
      valid_to: null,
      active: true,
    })
    setSelectedDiscount(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (discount: DiscountCode) => {
    setSelectedDiscount(discount)
    setDiscountType(discount.percent ? "percentage" : discount.amount ? "fixed" : "")
    setDiscountForm({
      code: discount.code,
      name: discount.name,
      purpose: discount.purpose,
      amount: discount.amount,
      currency: discount.currency,
      percent: discount.percent,
      usage_limit: discount.usage_limit,
      valid_from: discount.valid_from,
      valid_to: discount.valid_to,
      active: discount.active,
    })
    setDialogOpen(true)
  }

  const openDeleteDialog = (discount: DiscountCode) => {
    setSelectedDiscount(discount)
    setDeleteDialogOpen(true)
  }

  const openDetailsDialog = (discount: DiscountCode) => {
    setSelectedDetailsDiscount(discount)
    setDetailsDialogOpen(true)
  }

  const filteredDiscounts = discounts.filter(discount => {

    if (statusFilter !== null && discount.active !== statusFilter) {
      return false
    }
    
    return (
      discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.id.toString().includes(searchQuery) ||
      (discount.active ? 'نشط' : 'غير نشط').includes(searchQuery)
    )
  })

  const columns: GridColDef[] = [
    { 
      field: "code", 
      headerName: "كود الخصم", 
      width: 150, 
      renderCell: (params) => (
        <Typography sx={{ fontFamily: "monospace", fontWeight: 600 }}>
          {params.value}
        </Typography>
      ) 
    },
    { field: "name", headerName: "الاسم", width: 180 },
    { field: "purpose", headerName: "الغرض", width: 150 },
    { 
      field: "value", 
      headerName: "القيمة", 
      width: 120, 
      renderCell: (params) => {
        const discount = params.row as DiscountCode
        if (discount.percent) {
          return `${discount.percent}%`
        } else if (discount.amount) {
          return `${discount.amount.toLocaleString()}${discount.currency === "USD" ? "$" : discount.currency} `
        }
        return "غير محدد"
      }
    },
    { 
      field: "usage", 
      headerName: "الاستخدام", 
      width: 120, 
      renderCell: (params) => {
        const discount = params.row as DiscountCode
        return `${discount.used_count} / ${discount.usage_limit || "∞"}`
      }
    },
    { 
      field: "active", 
      headerName: "الحالة", 
      width: 100, 
      renderCell: (params) => (
        <Chip 
          label={params.value ? "نشط" : "غير نشط"} 
          size="small" 
          color={params.value ? "success" : "default"} 
        />
      ) 
    },
    {
      field: "actions", 
      headerName: "الإجراءات", 
      width: 150, 
      sortable: false, 
      renderCell: (params) => {
        const discount = params.row as DiscountCode
        return (
          <Box>
            <Tooltip title="عرض التفاصيل">
              <IconButton size="small" color="primary" onClick={() => openDetailsDialog(discount)}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="تعديل">
              <IconButton size="small" color="primary" onClick={() => openEditDialog(discount)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="حذف">
              <IconButton size="small" color="error" onClick={() => openDeleteDialog(discount)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    },
  ]

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* الهيدر */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DiscountIcon /> الخصومات والأكواد الترويجية
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadData} disabled={loading}>
            تحديث
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>
            إضافة كود خصم
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* إحصائيات */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DiscountIcon color="primary" />
                <Box>
                  <Typography variant="h5">{discounts.length}</Typography>
                  <Typography variant="body2" color="text.secondary">إجمالي أكواد الخصم</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ bgcolor: "success.main", p: 1.5, borderRadius: 2 }}>
                  <DiscountIcon sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="h5">
                    {discounts.filter(d => d.active).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">أكواد نشطة</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ bgcolor: "info.main", p: 1.5, borderRadius: 2 }}>
                  <DiscountIcon sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="h5">
                    {discounts.filter(d => d.percent).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">خصومات نسبية</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ bgcolor: "warning.main", p: 1.5, borderRadius: 2 }}>
                  <DiscountIcon sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="h5">
                    {discounts.filter(d => d.amount).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">خصومات مقطوعة</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* البحث والجدول */}
      <Paper>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <TextField
              fullWidth
              placeholder="البحث في أكواد الخصم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{ flex: 1, minWidth: 250 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={statusFilter?.toString() || ""}
                label="الحالة"
                onChange={(e) => setStatusFilter(e.target.value === "" ? null : e.target.value === "true")}
              >
                <MenuItem value="">جميع الحالات</MenuItem>
                <MenuItem value="true">نشط</MenuItem>
                <MenuItem value="false">غير نشط</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <DataGrid
            rows={filteredDiscounts}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": { borderColor: "divider" },
              "& .MuiDataGrid-columnHeaders": { 
                bgcolor: "background.default", 
                borderColor: "divider",
                fontWeight: 'bold'
              },
            }}
          />
        </Box>
      </Paper>

      {/* حوار الإنشاء/التعديل */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DiscountIcon /> 
            {selectedDiscount ? "تعديل كود خصم" : "إضافة كود خصم جديد"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="كود الخصم" 
                  value={discountForm.code} 
                  onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })} 
                  placeholder="SUMMER2024" 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="اسم الخصم" 
                  value={discountForm.name} 
                  onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })} 
                />
              </Grid>
            </Grid>

            <TextField 
              fullWidth 
              label="الغرض" 
              value={discountForm.purpose} 
              onChange={(e) => setDiscountForm({ ...discountForm, purpose: e.target.value })} 
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>نوع الخصم</InputLabel>
                  <Select
                    value={ discountType }
                    label="نوع الخصم"
                    onChange={(e) => {
                      setDiscountType(e.target.value as "percentage" | "fixed")
                      if (e.target.value === "percentage") {
                        setDiscountForm({ ...discountForm, percent: 0, amount: null })
                      } else if (e.target.value === "fixed") {
                        setDiscountForm({ ...discountForm, amount: 0, percent: null })
                      }
                    }}
                  >
                    <MenuItem value="percentage">نسبة مئوية</MenuItem>
                    <MenuItem value="fixed">مبلغ ثابت</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {discountType === "fixed" && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>العملة</InputLabel>
                    <Select
                      value={discountForm.currency}
                      label="العملة"
                      onChange={(e) => setDiscountForm({ ...discountForm, currency: e.target.value })}
                    >
                      <MenuItem value="IQD">دينار عراقي</MenuItem>
                      <MenuItem value="USD">دولار أمريكي</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>

            {discountForm.percent !== null && (
              <TextField 
                fullWidth 
                label="النسبة المئوية" 
                type="number"
                value={discountForm.percent} 
                onChange={(e) => setDiscountForm({ ...discountForm, percent: Number(e.target.value) })} 
              />
            )}

            {discountForm.amount !== null && (
              <TextField 
                fullWidth 
                label="المبلغ" 
                type="number"
                value={discountForm.amount} 
                onChange={(e) => setDiscountForm({ ...discountForm, amount: Number(e.target.value) })} 
              />
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="تاريخ البداية" 
                  type="date" 
                  value={discountForm.valid_from} 
                  onChange={(e) => setDiscountForm({ ...discountForm, valid_from: e.target.value })} 
                  InputLabelProps={{ shrink: true }} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="تاريخ النهاية" 
                  type="date" 
                  value={discountForm.valid_to} 
                  onChange={(e) => setDiscountForm({ ...discountForm, valid_to: e.target.value })} 
                  InputLabelProps={{ shrink: true }} 
                />
              </Grid>
            </Grid>


            <Grid container spacing={2} sx={{display: "flex", alignItems:"center" }}>

              <Grid item xs={2} sm={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography>الحالة:</Typography>
                  <Chip
                    label={discountForm.active ? "نشط" : "غير نشط"}
                    color={discountForm.active ? "success" : "default"}
                    onClick={() => setDiscountForm({ ...discountForm, active: !discountForm.active })}
                    clickable
                    sx={{ fontSize: "1rem", fontWeight: "medium" }}
                  />
                </Box>
              </Grid>

              <Grid item xs={10} sm={10}>
                <TextField 
                  fullWidth 
                  label="الحد الأقصى للاستخدام (اتركه فارغًا لعدد غير محدود)" 
                  type="number" 
                  value={discountForm.usage_limit || ''} 
                  onChange={(e) => setDiscountForm({ ...discountForm, usage_limit: e.target.value ? Number(e.target.value) : undefined })} 
                />
              </Grid>

            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={selectedDiscount ? handleUpdateDiscount : handleCreateDiscount} 
            variant="contained"
            disabled={!discountForm.code.trim() || !discountForm.name.trim() || !discountForm.purpose.trim()}
          >
            {selectedDiscount ? "تحديث" : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار الحذف */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف كود الخصم "{selectedDiscount?.code}"؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
          <Button variant="contained" color="error" onClick={handleDeleteDiscount}>
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار التفاصيل */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>تفاصيل كود الخصم</DialogTitle>
        <DialogContent>
          {selectedDetailsDiscount && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>المعلومات الأساسية</Typography>
                      <Typography><strong>الكود:</strong> {selectedDetailsDiscount.code}</Typography>
                      <Typography><strong>الاسم:</strong> {selectedDetailsDiscount.name}</Typography>
                      <Typography><strong>الغرض:</strong> {selectedDetailsDiscount.purpose}</Typography>
                      <Typography><strong>القيمة:</strong> 
                        {selectedDetailsDiscount.percent && ` ${selectedDetailsDiscount.percent}%`}
                        {selectedDetailsDiscount.amount && ` ${selectedDetailsDiscount.currency === "USD" ? "$" : selectedDetailsDiscount.currency} ${selectedDetailsDiscount.amount.toLocaleString()}`}
                      </Typography>
                      <Typography><strong>الحالة:</strong> 
                        <Chip 
                          label={selectedDetailsDiscount.active ? "نشط" : "غير نشط"} 
                          size="small"
                          color={selectedDetailsDiscount.active ? "success" : "default"}
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>الاستخدام والصلاحية</Typography>
                      <Typography><strong>الاستخدام:</strong> {selectedDetailsDiscount.used_count} / {selectedDetailsDiscount.usage_limit || "∞"}</Typography>
                      <Typography><strong>تاريخ البداية:</strong> {selectedDetailsDiscount.valid_from ? new Date(selectedDetailsDiscount.valid_from).toLocaleDateString('ar-EG') : "غير محدد"}</Typography>
                      <Typography><strong>تاريخ النهاية:</strong> {selectedDetailsDiscount.valid_to ? new Date(selectedDetailsDiscount.valid_to).toLocaleDateString('ar-EG') : "غير محدد"}</Typography>
                      <Typography><strong>أنشئ بواسطة:</strong> {selectedDetailsDiscount.user?.name}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)} variant="outlined">إغلاق</Button>
        </DialogActions>
      </Dialog>

      {/* الإشعارات */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default DiscountsPage