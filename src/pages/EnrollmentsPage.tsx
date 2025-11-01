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
  Visibility,
  Person,
  CalendarToday,
  Receipt,
  Discount,
  Description,
  Class,
} from "@mui/icons-material"
import { useEnrollments } from '../hooks/useEnrollments'
import { useStudents } from '../hooks/useStudents'
import { useBatches } from '../hooks/useBatches'
import { useDiscountCodes } from '../hooks/useDiscountCodes'
import { useAuth } from '../context/AuthContext'
import type { Enrollment, CreateEnrollmentDto } from "../types"
import type { DiscountCode } from "../types/discount"
import DeleteConfirmDialog from "../components/global-ui/DeleteConfirmDialog"
import { usePermissions } from '../hooks/usePermissions.ts'

const EnrollmentsPage: React.FC = () => {
  const {
    canReadEnrollments,
    canCreateEnrollments,
    canUpdateEnrollments,
    canDeleteEnrollments,
  } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterBatch, setFilterBatch] = useState<string>("all")
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<Enrollment | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)

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
    if (!canReadEnrollments) return false
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
  }

  // Handle delete with dialog
  const handleDeleteWithDialog = (enrollment: Enrollment) => {
    setEnrollmentToDelete(enrollment)
    setDeleteDialogOpen(true)
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!enrollmentToDelete) return
    
    setDeleteLoading(true)
    try {
      await deleteEnrollment(enrollmentToDelete.id)
      setDeleteDialogOpen(false)
      setEnrollmentToDelete(null)
      setSnackbar({ open: true, message: "تم حذف التسجيل بنجاح", severity: "success" })
    } catch (error: any) {
      console.error('Failed to delete enrollment:', error)
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || "حدث خطأ أثناء حذف التسجيل", 
        severity: "error" 
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setEnrollmentToDelete(null)
  }

  // Handle view details
  const handleViewDetails = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment)
    setDetailsDialogOpen(true)
  }

  // Close details dialog
  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false)
    setSelectedEnrollment(null)
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
    setSelectedStudents([]) 
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

  // Get enrollment details for display
  const getEnrollmentDetails = (enrollment: Enrollment) => {
    const student = students.find(s => s.id === enrollment.student_id)
    const batch = batches.find(b => b.id === enrollment.batch_id)
    const discount = discountCodes.find(d => d.code === enrollment.discount_code)
    const user = enrollment.user

    return {
      student,
      batch,
      discount,
      user,
      originalPrice: batch?.actual_price || 0,
      discountAmount: discount ? 
        (discount.percent ? 
          (batch?.actual_price || 0) * discount.percent / 100 : 
          discount.amount || 0) : 0,
      finalPrice: enrollment.total_price || 0
    }
  }

// DataGrid columns
   const columns: GridColDef[] = [
    { 
      field: "id", 
      headerName: "ID", 
      flex: 0.3, 
      minWidth: 50,
      maxWidth: 70 
    },
    {
      field: "student_id",
      headerName: "اسم الطالب",
      flex: 1.5,
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
      maxWidth: 200,
      renderCell: (params) => {
        const batch = batches.find(b => b.id === params.value)
        return <Chip label={batch?.name || "غير محدد"} size="small" color="primary" />
      },
    },
    {
      field: "batch.course.name",
      headerName: "الدورة",
      flex: 1,
      minWidth: 150,
      maxWidth: 200,
      renderCell: (params) => {
        return <Chip label={params.row?.batch?.course?.name || "غير محدد"} size="small" color="primary" />
      },
    },
    {
      field: "status",
      headerName: "الحالة",
      flex: 0.8,
      minWidth: 120,
      maxWidth: 140,
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
      flex: 1,
      minWidth: 130,
      maxWidth: 160,
      renderCell: (params) => {
        if (!params.value) return "-"
        const currency = params.row.currency === "USD" ? "$" : "د.ع"
        return `${params.value.toLocaleString()} ${currency}`
      },
    },
    {
      field: "enrolled_at",
      headerName: "تاريخ التسجيل",
      flex: 0.8,
      minWidth: 130,
      maxWidth: 150,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString('ar') : "-",
    },
    {
      field: "discount_code",
      headerName: "رمز الخصم",
      flex: 0.6,
      minWidth: 100,
      maxWidth: 120,
      renderCell: (params) => params.value ? (
        <Chip label={params.value} size="small" color="secondary" />
      ) : "-",
    },
    {
      field: "actions",
      headerName: "الإجراءات",
      flex: 0.8,
      minWidth: 120,
      maxWidth: 140,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton 
            size="small" 
            color="primary" 
            onClick={() => handleViewDetails(params.row)}
            title="عرض التفاصيل"
          >
            <Visibility fontSize="small" />
          </IconButton>
          {canUpdateEnrollments &&
            <IconButton 
              size="small" 
              color="primary" 
              onClick={() => handleEditEnrollment(params.row)}
              disabled={deleteLoading}
              title="تعديل"
            >
              <Edit fontSize="small" />
            </IconButton>
          }
          { canDeleteEnrollments &&
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => handleDeleteWithDialog(params.row)}
              disabled={deleteLoading}
              title="حذف"
            >
              <Delete fontSize="small" />
            </IconButton>}
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
        { canCreateEnrollments &&
        <Button variant="contained" startIcon={<PersonAdd />} onClick={handleOpenDialog}>
          تسجيل طالب
        </Button>}
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEnrollment ? "تحديث" : "تسجيل"}
          </Button>
        </DialogActions>
      </Dialog>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
              open={deleteDialogOpen}
              onClose={handleCloseDeleteDialog}
              onConfirm={handleConfirmDelete}
              title="تأكيد حذف التسجيل"
              itemName={enrollmentToDelete ? `تسجيل الطالب ${students.find(s => s.id === enrollmentToDelete.student_id)?.full_name || ''}` : ""}
              loading={deleteLoading}
              message="هل أنت متأكد من حذف هذا التسجيل؟ سيتم حذف جميع البيانات المرتبطة به."
            />

          {/* Enrollment Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleCloseDetailsDialog} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: 1, 
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <School color="primary" />
            <Typography variant="h6">
              تفاصيل التسجيل
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {selectedEnrollment && (() => {
            const details = getEnrollmentDetails(selectedEnrollment)
            
            return (
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                {/*- المعلومات الأساسية */}
                <Box sx={{ flex: 1 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                        <Description color="primary" fontSize="small" />
                        المعلومات الأساسية
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Student Information */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                            <Person fontSize="small" />
                            الطالب
                          </Typography>
                          {details.student ? (
                            <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {details.student.full_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {details.student.phone}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ p: 1.5 }}>
                              غير محدد
                            </Typography>
                          )}
                        </Box>
                        
                        {/* Course and Batch Information */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                            <Class fontSize="small" />
                            الدورة والدفعة
                          </Typography>
                          {details.batch ? (
                            <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {details.batch.course?.name || "غير محدد"} - {details.batch.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {details.batch.start_date ? new Date(details.batch.start_date).toLocaleDateString('ar') : "غير محدد"}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ p: 1.5 }}>
                              غير محدد
                            </Typography>
                          )}
                        </Box>

                        {/* Enrollment Date */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                            <CalendarToday fontSize="small" />
                            تاريخ التسجيل
                          </Typography>
                          <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                            <Typography variant="body2">
                              {selectedEnrollment.enrolled_at ? new Date(selectedEnrollment.enrolled_at).toLocaleDateString('ar') : "غير محدد"}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Registration Officer */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                            <Person fontSize="small" />
                            مسؤول التسجيل
                          </Typography>
                          <Box sx={{ p: 1.5 }}>
                            {details.user ? (
                              <Chip 
                                label={details.user.name} 
                                size="small" 
                                color="secondary" 
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                غير محدد
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                {/*  المعلومات الإضافية */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Status and Payment Information */}
                  <Card>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                        <Receipt color="primary" fontSize="small" />
                        حالة التسجيل والدفع
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 1.5, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1.5,
                              borderLeft: `3px solid`,
                              borderLeftColor: 
                                selectedEnrollment.status === "accepted" ? "success.main" :
                                selectedEnrollment.status === "pending" ? "warning.main" :
                                selectedEnrollment.status === "completed" ? "info.main" : "error.main"
                            }}
                          >
                            <Box sx={{ 
                              color: 
                                selectedEnrollment.status === "accepted" ? "success.main" :
                                selectedEnrollment.status === "pending" ? "warning.main" :
                                selectedEnrollment.status === "completed" ? "info.main" : "error.main"
                            }}>
                              {selectedEnrollment.status === "accepted" ? <CheckCircle fontSize="small" /> :
                              selectedEnrollment.status === "pending" ? <Pending fontSize="small" /> :
                              selectedEnrollment.status === "completed" ? <School fontSize="small" /> :
                              <Cancel fontSize="small" />}
                            </Box>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1 }}>
                                {selectedEnrollment.status === "accepted" ? "مقبول" :
                                selectedEnrollment.status === "pending" ? "قيد الانتظار" :
                                selectedEnrollment.status === "completed" ? "مكتمل" : "منسحب"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                حالة التسجيل
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 1.5, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1.5,
                              borderLeft: `3px solid`,
                              borderLeftColor: "primary.main"
                            }}
                          >
                            <Box sx={{ color: "primary.main" }}>
                              <Receipt fontSize="small" />
                            </Box>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1 }}>
                                {details.finalPrice.toLocaleString()} {selectedEnrollment.currency === "USD" ? "$" : "د.ع"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                المبلغ النهائي
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>

                      {/* Price Breakdown */}
                      {details.batch && (
                        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            تفاصيل السعر:
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">سعر الدورة:</Typography>
                            <Typography variant="caption">{details.originalPrice.toLocaleString()} {selectedEnrollment.currency === "USD" ? "$" : "د.ع"}</Typography>
                          </Box>
                          {details.discount && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption">
                                خصم {details.discount.code}:
                              </Typography>
                              <Typography variant="caption" color="success.main">
                                -{details.discountAmount.toLocaleString()} {selectedEnrollment.currency === "USD" ? "$" : "د.ع"}
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid', borderColor: 'divider', pt: 0.5, mt: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>المبلغ الإجمالي:</Typography>
                            <Typography variant="body2" fontWeight={600}>{details.finalPrice.toLocaleString()} {selectedEnrollment.currency === "USD" ? "$" : "د.ع"}</Typography>
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>

                  {/* Discount Information */}
                  {details.discount && (
                    <Card>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                          <Discount color="primary" fontSize="small" />
                          معلومات الخصم
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                رمز الخصم
                              </Typography>
                              <Chip 
                                label={details.discount.code} 
                                size="small" 
                                color="secondary"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                قيمة الخصم
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>
                                {details.discount.percent ? `${details.discount.percent}%` : 
                                details.discount.amount ? `${details.discount.amount.toLocaleString()} ${details.discount.currency === "USD" ? "$" : "د.ع"}` : 
                                "غير محدد"}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )}

                  {/* Notes */}
                  {selectedEnrollment.notes && (
                    <Card>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                          <Description color="primary" fontSize="small" />
                          ملاحظات
                        </Typography>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 1.5, 
                            bgcolor: 'background.default',
                          }}
                        >
                          <Typography variant="body2">
                            {selectedEnrollment.notes}
                          </Typography>
                        </Paper>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              </Box>
            )
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDetailsDialog}
            variant="outlined"
            size="small"
          >
            إغلاق
          </Button>
          {selectedEnrollment && canUpdateEnrollments && (
            <Button 
              onClick={() => {
                handleCloseDetailsDialog()
                handleEditEnrollment(selectedEnrollment)
              }}
              variant="contained"
              size="small"
              startIcon={<Edit />}
            >
              تعديل
            </Button>
          )}
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