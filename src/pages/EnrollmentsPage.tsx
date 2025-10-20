"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
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
  IconButton,
  Chip,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Autocomplete,
  Snackbar,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { 
  Search, 
  Edit, 
  Delete, 
  PersonAdd, 
  CheckCircle,
  Pending,
  Cancel,
  School,
  TrendingUp,
} from "@mui/icons-material"
import { useEnrollments } from '../hooks/useEnrollments'
import { useStudents } from '../hooks/useStudents'
import { useBatches } from '../hooks/useBatches'
import { useDiscountCodes } from '../hooks/useDiscountCodes'
import { useAuth } from '../context/AuthContext'
import type { Enrollment, CreateEnrollmentDto } from "../types"
import type { DiscountCode } from "../types/discount"

const EnrollmentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterBatch, setFilterBatch] = useState<string>("all")
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]) // For bulk enrollment
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  })

  // Hooks
  const { user } = useAuth()
  const { 
    enrollments, 
    loading: enrollmentsLoading, 
    error: enrollmentsError,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
    getEnrollmentsByStatus,
  } = useEnrollments()

  const { students, loading: studentsLoading } = useStudents()
  const { batches, loading: batchesLoading } = useBatches()
  const { discountCodes, loading: discountCodesLoading } = useDiscountCodes()

  const [enrollmentForm, setEnrollmentForm] = useState<CreateEnrollmentDto>({
    student_id: 0,
    batch_id: 0,
    user_id: user?.id || 0,
    discount_code: "",
    total_price: undefined,
    currency: "IQD",
    enrolled_at: "",
    status: "pending",
    notes: "",
  })

  // Calculate total price automatically
  const calculateTotalPrice = useCallback((batchId: number, discountCode: string): number | undefined => {
    const batch = batches.find(b => b.id === batchId)
    if (!batch || !batch.actual_price) return undefined

    let totalPrice = batch.actual_price

    // Apply discount if code is provided
    if (discountCode) {
      const discount = discountCodes.find(d => d.code === discountCode)
      if (discount && discount.active) {
        // Check currency match
        if (discount.currency && batch.currency && discount.currency !== batch.currency) {
          // Currency mismatch - don't apply discount
          return totalPrice
        }

        // Apply discount based on type
        if (discount.percent) {
          // Percentage discount
          totalPrice = totalPrice - (totalPrice * discount.percent / 100)
        } else if (discount.amount) {
          // Fixed amount discount
          totalPrice = totalPrice - discount.amount
        }
      }
    }

    return Math.max(0, totalPrice) // Ensure non-negative
  }, [batches, discountCodes])

  // Get filtered discount codes based on batch currency
  const getFilteredDiscountCodes = (batchId: number): DiscountCode[] => {
    const batch = batches.find(b => b.id === batchId)
    if (!batch) return discountCodes.filter(d => d.active)

    return discountCodes.filter(d => {
      if (!d.active) return false
      // If discount has no currency, it can be used anywhere
      if (!d.currency) return true
      // If batch has no currency, allow all discounts
      if (!batch.currency) return true
      // Otherwise, currencies must match
      return d.currency === batch.currency
    })
  }

  // Auto-calculate total price when batch or discount code changes
  useEffect(() => {
    if (enrollmentForm.batch_id && batches.length > 0) {
      const calculatedPrice = calculateTotalPrice(enrollmentForm.batch_id, enrollmentForm.discount_code || "")
      const batch = batches.find(b => b.id === enrollmentForm.batch_id)
      
      // Only update if price or currency actually changed
      if (calculatedPrice !== enrollmentForm.total_price || (batch && batch.currency !== enrollmentForm.currency)) {
        setEnrollmentForm(prev => ({
          ...prev,
          total_price: calculatedPrice,
          currency: batch?.currency || prev.currency,
        }))
      }
    }
  }, [enrollmentForm.batch_id, enrollmentForm.discount_code, batches, calculateTotalPrice, enrollmentForm.total_price, enrollmentForm.currency])

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const formData = { ...enrollmentForm }

      // Calculate total price if not manually set
      if (formData.batch_id) {
        const calculatedPrice = calculateTotalPrice(formData.batch_id, formData.discount_code || "")
        if (calculatedPrice !== undefined) {
          formData.total_price = calculatedPrice
        }
      }

      // Set currency from batch
      const batch = batches.find(b => b.id === formData.batch_id)
      if (batch && batch.currency) {
        formData.currency = batch.currency
      }

      if (!formData.enrolled_at) {
        formData.enrolled_at = new Date().toISOString()
      }

      if (editingEnrollment) {
        // Single update when editing
        const cleanPayload: any = {
          student_id: formData.student_id,
          batch_id: formData.batch_id,
          user_id: formData.user_id,
          status: formData.status,
        }

        if (formData.discount_code) cleanPayload.discount_code = formData.discount_code
        if (formData.total_price !== undefined && formData.total_price !== null) {
          cleanPayload.total_price = Number(formData.total_price)
        }
        if (formData.currency) cleanPayload.currency = formData.currency
        if (formData.enrolled_at) cleanPayload.enrolled_at = formData.enrolled_at
        if (formData.notes) cleanPayload.notes = formData.notes

        await updateEnrollment(editingEnrollment.id, cleanPayload)
        setSnackbar({ open: true, message: "تم تحديث التسجيل بنجاح", severity: "success" })
      } else {
        // Bulk enrollment when creating
        if (selectedStudents.length === 0) {
          setSnackbar({ open: true, message: "يرجى اختيار طالب واحد على الأقل", severity: "error" })
          return
        }

        let successCount = 0
        let errorCount = 0
        const errors: string[] = []

        for (const studentId of selectedStudents) {
          try {
            const cleanPayload: any = {
              student_id: studentId,
              batch_id: formData.batch_id,
              user_id: formData.user_id,
              status: formData.status,
            }

            if (formData.discount_code) cleanPayload.discount_code = formData.discount_code
            if (formData.total_price !== undefined && formData.total_price !== null) {
              cleanPayload.total_price = Number(formData.total_price)
            }
            if (formData.currency) cleanPayload.currency = formData.currency
            if (formData.enrolled_at) cleanPayload.enrolled_at = formData.enrolled_at
            if (formData.notes) cleanPayload.notes = formData.notes

            await createEnrollment(cleanPayload)
            successCount++
          } catch (error: any) {
            errorCount++
            const studentName = students.find(s => s.id === studentId)?.full_name || `ID: ${studentId}`
            errors.push(`${studentName}: ${error.response?.data?.message || "خطأ"}`)
          }
        }

        if (successCount > 0 && errorCount === 0) {
          setSnackbar({ 
            open: true, 
            message: `تم تسجيل ${successCount} طالب بنجاح`, 
            severity: "success" 
          })
        } else if (successCount > 0 && errorCount > 0) {
          setSnackbar({ 
            open: true, 
            message: `تم تسجيل ${successCount} طالب، فشل ${errorCount}. ${errors.slice(0, 2).join(", ")}`, 
            severity: "error" 
          })
        } else {
          setSnackbar({ 
            open: true, 
            message: `فشل تسجيل جميع الطلاب. ${errors[0] || "حدث خطأ"}`, 
            severity: "error" 
          })
        }
      }
      handleCloseDialog()
    } catch (error: any) {
      console.error('Failed to save enrollment:', error)
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || "حدث خطأ أثناء حفظ التسجيل", 
        severity: "error" 
      })
    }
  }  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا التسجيل؟")) {
      try {
        await deleteEnrollment(id)
        setSnackbar({ open: true, message: "تم حذف التسجيل بنجاح", severity: "success" })
      } catch (error: any) {
        console.error('Failed to delete enrollment:', error)
        setSnackbar({ 
          open: true, 
          message: error.response?.data?.message || "حدث خطأ أثناء حذف التسجيل", 
          severity: "error" 
        })
      }
    }
  }

  // Dialog handlers
  const handleOpenDialog = () => {
    setEnrollmentForm({
      student_id: 0,
      batch_id: 0,
      user_id: user?.id || 0,
      discount_code: "",
      total_price: undefined,
      currency: "IQD",
      enrolled_at: "",
      status: "pending",
      notes: "",
    })
    setSelectedStudents([]) // Reset selected students for bulk enrollment
    setEditingEnrollment(null)
    setOpenDialog(true)
  }

  const handleEditEnrollment = (enrollment: Enrollment) => {
    setEnrollmentForm({
      student_id: enrollment.student_id,
      batch_id: enrollment.batch_id,
      user_id: enrollment.user_id,
      discount_code: enrollment.discount_code || "",
      total_price: enrollment.total_price,
      currency: enrollment.currency || "IQD",
      enrolled_at: enrollment.enrolled_at ? enrollment.enrolled_at.split('T')[0] : "",
      status: enrollment.status || "pending",
      notes: enrollment.notes || "",
    })
    setEditingEnrollment(enrollment)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingEnrollment(null)
  }

  // Data filtering
  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = students.find(s => s.id === enrollment.student_id)
    const batch = batches.find(b => b.id === enrollment.batch_id)
    
    const matchesSearch = student?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         batch?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         enrollment.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || enrollment.status === filterStatus
    const matchesBatch = filterBatch === "all" || enrollment.batch_id.toString() === filterBatch
    
    return matchesSearch && matchesStatus && matchesBatch
  })

  // Stats calculations
  const totalEnrollments = enrollments.length
  const pendingEnrollments = getEnrollmentsByStatus("pending").length
  const acceptedEnrollments = getEnrollmentsByStatus("accepted").length
  const completedEnrollments = getEnrollmentsByStatus("completed").length

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: "student_id",
      headerName: "الطالب",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const student = students.find(s => s.id === params.value)
        return (
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {student?.full_name || "غير محدد"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {student?.phone}
            </Typography>
          </Box>
        )
      },
    },
    {
      field: "batch_id",
      headerName: "الدفعة",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const batch = batches.find(b => b.id === params.value)
        return <Chip label={batch?.name || "غير محدد"} size="small" color="primary" />
      },
    },
    {
      field: "status",
      headerName: "الحالة",
      width: 120,
      renderCell: (params) => {
        const statusConfig = {
          pending: { label: "قيد الانتظار", color: "warning" as const, icon: <Pending fontSize="small" /> },
          accepted: { label: "مقبول", color: "success" as const, icon: <CheckCircle fontSize="small" /> },
          dropped: { label: "منسحب", color: "error" as const, icon: <Cancel fontSize="small" /> },
          completed: { label: "مكتمل", color: "info" as const, icon: <School fontSize="small" /> },
        }
        const config = statusConfig[params.value as keyof typeof statusConfig] || statusConfig.pending
        return (
          <Chip 
            label={config.label} 
            size="small" 
            color={config.color}
            icon={config.icon}
          />
        )
      },
    },
    {
      field: "total_price",
      headerName: "المبلغ الإجمالي",
      width: 130,
      renderCell: (params) => {
        if (!params.value) return "-"
        const currency = params.row.currency === "USD" ? "$" : "د.ع"
        return `${params.value.toLocaleString()} ${currency}`
      },
    },
    {
      field: "enrolled_at",
      headerName: "تاريخ التسجيل",
      width: 130,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString('ar') : "-",
    },
    {
      field: "discount_code",
      headerName: "رمز الخصم",
      width: 100,
      renderCell: (params) => params.value ? (
        <Chip label={params.value} size="small" color="secondary" />
      ) : "-",
    },
    {
      field: "actions",
      headerName: "الإجراءات",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton 
            size="small" 
            color="primary" 
            onClick={() => handleEditEnrollment(params.row)}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            color="error" 
            onClick={() => handleDelete(params.row.id)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ]

  if (enrollmentsLoading || studentsLoading || batchesLoading || discountCodesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          إدارة التسجيلات
        </Typography>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={handleOpenDialog}>
          تسجيل طالب
        </Button>
      </Box>

      {/* Error Alert */}
      {enrollmentsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {enrollmentsError}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { 
            label: "إجمالي التسجيلات", 
            value: totalEnrollments, 
            icon: <School sx={{ color: "white" }} />, 
            color: "primary.main" 
          },
          { 
            label: "قيد الانتظار", 
            value: pendingEnrollments, 
            icon: <Pending sx={{ color: "white" }} />, 
            color: "warning.main" 
          },
          { 
            label: "المقبولين", 
            value: acceptedEnrollments, 
            icon: <CheckCircle sx={{ color: "white" }} />, 
            color: "success.main" 
          },
          { 
            label: "المكتملين", 
            value: completedEnrollments, 
            icon: <TrendingUp sx={{ color: "white" }} />, 
            color: "info.main" 
          }
        ].map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ bgcolor: card.color, p: 1.5, borderRadius: 2 }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {card.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {card.value.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters and Search */}
      <Paper>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="البحث في التسجيلات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={filterStatus}
                  label="الحالة"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">جميع الحالات</MenuItem>
                  <MenuItem value="pending">قيد الانتظار</MenuItem>
                  <MenuItem value="accepted">مقبول</MenuItem>
                  <MenuItem value="dropped">منسحب</MenuItem>
                  <MenuItem value="completed">مكتمل</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>الدفعة</InputLabel>
                <Select
                  value={filterBatch}
                  label="الدفعة"
                  onChange={(e) => setFilterBatch(e.target.value)}
                >
                  <MenuItem value="all">جميع المجموعات</MenuItem>
                  {batches.map((batch) => (
                    <MenuItem key={batch.id} value={batch.id.toString()}>
                      {batch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* DataGrid */}
          <DataGrid
            rows={filteredEnrollments}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": { borderColor: "divider" },
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "background.default",
                borderColor: "divider",
              },
            }}
          />
        </Box>
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEnrollment ? "تعديل التسجيل" : "تسجيل طالب جديد"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {editingEnrollment ? (
                  // Single selection when editing
                  <Autocomplete
                    options={students}
                    getOptionLabel={(option) => `${option.full_name} - ${option.phone}`}
                    value={students.find(s => s.id === enrollmentForm.student_id) || null}
                    onChange={(_, newValue) => {
                      setEnrollmentForm({ 
                        ...enrollmentForm, 
                        student_id: newValue ? newValue.id : 0 
                      })
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="الطالب" required />
                    )}
                  />
                ) : (
                  // Multiple selection when creating new
                  <Autocomplete
                    multiple
                    options={students}
                    getOptionLabel={(option) => `${option.full_name} - ${option.phone}`}
                    value={students.filter(s => selectedStudents.includes(s.id))}
                    onChange={(_, newValues) => {
                      setSelectedStudents(newValues.map(v => v.id))
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="الطلاب (اختر متعدد)" required />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...otherProps } = getTagProps({ index })
                        return (
                          <Chip
                            key={key}
                            label={option.full_name}
                            size="small"
                            {...otherProps}
                          />
                        )
                      })
                    }
                  />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={batches}
                  getOptionLabel={(option) => {
                    const currency = option.currency === "USD" ? "$" : "د.ع"
                    const price = option.actual_price ? ` - ${option.actual_price.toLocaleString()} ${currency}` : ""
                    return `${option.name}${price}`
                  }}
                  value={batches.find(b => b.id === enrollmentForm.batch_id) || null}
                  onChange={(_, newValue) => {
                    if (newValue) {
                      setEnrollmentForm({ ...enrollmentForm, batch_id: newValue.id })
                    } else {
                      setEnrollmentForm({ ...enrollmentForm, batch_id: 0, total_price: undefined })
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="الدفعة" required />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={getFilteredDiscountCodes(enrollmentForm.batch_id)}
                  getOptionLabel={(option) => {
                    let label = `${option.code} - ${option.name}`
                    if (option.percent) {
                      label += ` (${option.percent}%)`
                    } else if (option.amount) {
                      const currency = option.currency === "USD" ? "$" : "د.ع"
                      label += ` (${option.amount} ${currency})`
                    }
                    return label
                  }}
                  value={discountCodes.find(d => d.code === enrollmentForm.discount_code) || null}
                  onChange={(_, newValue) => {
                    setEnrollmentForm({ ...enrollmentForm, discount_code: newValue ? newValue.code : "" })
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="رمز الخصم (اختياري)" />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props
                    return (
                      <li key={key} {...otherProps}>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {option.code} - {option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.percent ? `خصم ${option.percent}%` : 
                             option.amount ? `خصم ${option.amount} ${option.currency === "USD" ? "$" : "د.ع"}` : 
                             "خصم"}
                          </Typography>
                        </Box>
                      </li>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>الحالة</InputLabel>
                  <Select
                    value={enrollmentForm.status || "pending"}
                    label="الحالة"
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, status: e.target.value as any })}
                  >
                    <MenuItem value="pending">قيد الانتظار</MenuItem>
                    <MenuItem value="accepted">مقبول</MenuItem>
                    <MenuItem value="dropped">منسحب</MenuItem>
                    <MenuItem value="completed">مكتمل</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="المبلغ الإجمالي"
                  type="number"
                  value={enrollmentForm.total_price || ""}
                  disabled
                  helperText="يتم حسابه تلقائياً من سعر الدفعة والخصم"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {enrollmentForm.currency === "USD" ? "$" : "د.ع"}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="تاريخ التسجيل"
                  type="date"
                  value={enrollmentForm.enrolled_at}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, enrolled_at: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="ملاحظات"
              multiline
              rows={3}
              value={enrollmentForm.notes}
              onChange={(e) => setEnrollmentForm({ ...enrollmentForm, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEnrollment ? "تحديث" : "تسجيل"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default EnrollmentsPage