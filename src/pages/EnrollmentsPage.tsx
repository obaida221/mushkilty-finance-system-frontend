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
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { 
  Search, 
  Edit, 
  Delete, 
  Add, 
  PersonAdd, 
  CheckCircle,
  Pending,
  Cancel,
  School,
  TrendingUp,
  People,
} from "@mui/icons-material"
import { useEnrollments } from '../hooks/useEnrollments'
import { useStudents } from '../hooks/useStudents'
import { useBatches } from '../hooks/useBatches'
import { useAuth } from '../context/AuthContext'
import type { Enrollment, CreateEnrollmentDto } from "../types"

const EnrollmentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterBatch, setFilterBatch] = useState<string>("all")

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

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const formData = { ...enrollmentForm }
      if (!formData.enrolled_at) {
        formData.enrolled_at = new Date().toISOString()
      }
      
      if (editingEnrollment) {
        await updateEnrollment(editingEnrollment.id, formData)
      } else {
        await createEnrollment(formData)
      }
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save enrollment:', error)
    }
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا التسجيل؟")) {
      try {
        await deleteEnrollment(id)
      } catch (error) {
        console.error('Failed to delete enrollment:', error)
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

  if (enrollmentsLoading || studentsLoading || batchesLoading) {
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
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>الدفعة</InputLabel>
                  <Select
                    value={enrollmentForm.batch_id || ""}
                    label="الدفعة"
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, batch_id: Number(e.target.value) })}
                  >
                    {batches.map((batch) => (
                      <MenuItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="المبلغ الإجمالي"
                  type="number"
                  value={enrollmentForm.total_price || ""}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, total_price: Number(e.target.value) || undefined })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>العملة</InputLabel>
                  <Select
                    value={enrollmentForm.currency || "IQD"}
                    label="العملة"
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, currency: e.target.value as any })}
                  >
                    <MenuItem value="IQD">دينار عراقي</MenuItem>
                    <MenuItem value="USD">دولار أمريكي</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="رمز الخصم"
                  value={enrollmentForm.discount_code}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, discount_code: e.target.value })}
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
    </Box>
  )
}

export default EnrollmentsPage