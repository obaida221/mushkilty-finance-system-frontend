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
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { 
  Search, 
  Edit, 
  Delete, 
  Add, 
  Group, 
  Event, 
  LocationOn,
  School,
  CheckCircle,
  Cancel,
  People,
} from "@mui/icons-material"
import { useBatches } from '../hooks/useBatches'
import { useCourses } from '../hooks/useCourses'
import { useEnrollments } from '../hooks/useEnrollments'
import type { Batch, CreateBatchDto } from "../types"

const BatchesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCourse, setFilterCourse] = useState<string>("all")

  // Hooks
  const { 
    batches, 
    loading: batchesLoading, 
    error: batchesError,
    createBatch,
    updateBatch,
    deleteBatch,
    getBatchesByStatus,
  } = useBatches()

  const { courses, loading: coursesLoading } = useCourses()
  const { enrollments, getEnrollmentsByBatch } = useEnrollments()

  const [batchForm, setBatchForm] = useState<CreateBatchDto>({
    course_id: 0,
    trainer_id: 0,
    name: "",
    description: "",
    level: undefined,
    location: "",
    start_date: "",
    end_date: "",
    schedule: "",
    capacity: undefined,
    status: "open",
    actual_price: undefined,
  })

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingBatch) {
        await updateBatch(editingBatch.id, batchForm)
      } else {
        await createBatch(batchForm)
      }
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save batch:', error)
    }
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف جميع التسجيلات المرتبطة بها.")) {
      try {
        await deleteBatch(id)
      } catch (error) {
        console.error('Failed to delete batch:', error)
      }
    }
  }

  // Dialog handlers
  const handleOpenDialog = () => {
    setBatchForm({
      course_id: 0,
      trainer_id: 0,
      name: "",
      description: "",
      level: undefined,
      location: "",
      start_date: "",
      end_date: "",
      schedule: "",
      capacity: undefined,
      status: "open",
      actual_price: undefined,
    })
    setEditingBatch(null)
    setOpenDialog(true)
  }

  const handleEditBatch = (batch: Batch) => {
    setBatchForm({
      course_id: batch.course_id,
      trainer_id: batch.trainer_id,
      name: batch.name,
      description: batch.description || "",
      level: batch.level,
      location: batch.location || "",
      start_date: batch.start_date ? batch.start_date.split('T')[0] : "",
      end_date: batch.end_date ? batch.end_date.split('T')[0] : "",
      schedule: batch.schedule || "",
      capacity: batch.capacity,
      status: batch.status,
      actual_price: batch.actual_price,
    })
    setEditingBatch(batch)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingBatch(null)
  }

  // Data filtering
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         batch.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         batch.location?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || batch.status === filterStatus
    const matchesCourse = filterCourse === "all" || batch.course_id.toString() === filterCourse
    
    return matchesSearch && matchesStatus && matchesCourse
  })

  // Stats calculations
  const totalBatches = batches.length
  const activeBatches = getBatchesByStatus("open").length
  const totalEnrollments = enrollments.length
  const averageEnrollments = totalBatches > 0 ? Math.round(totalEnrollments / totalBatches) : 0

  // DataGrid columns
  const columns: GridColDef[] = [
    { 
      field: "name", 
      headerName: "اسم المجموعة", 
      flex: 1, 
      minWidth: 200 
    },
    {
      field: "course_id",
      headerName: "الدورة",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const course = courses.find(c => c.id === params.value)
        return <Chip label={course?.name || "غير محدد"} size="small" color="primary" />
      },
    },
    {
      field: "level",
      headerName: "المستوى",
      width: 100,
      renderCell: (params) => params.value ? (
        <Chip label={params.value} size="small" color="secondary" />
      ) : "-",
    },
    {
      field: "status",
      headerName: "الحالة",
      width: 120,
      renderCell: (params) => {
        const statusConfig = {
          open: { label: "مفتوح", color: "success" as const, icon: <CheckCircle fontSize="small" /> },
          closed: { label: "مغلق", color: "error" as const, icon: <Cancel fontSize="small" /> },
          full: { label: "مكتمل", color: "warning" as const, icon: <People fontSize="small" /> },
        }
        const config = statusConfig[params.value as keyof typeof statusConfig] || statusConfig.open
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
      field: "capacity",
      headerName: "السعة",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => params.value || "-",
    },
    {
      field: "enrollments",
      headerName: "المسجلين",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const batchEnrollments = getEnrollmentsByBatch(params.row.id)
        return batchEnrollments.length
      },
    },
    {
      field: "start_date",
      headerName: "تاريخ البداية",
      width: 130,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString('ar') : "-",
    },
    {
      field: "location",
      headerName: "الموقع",
      width: 120,
      renderCell: (params) => params.value || "-",
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
            onClick={() => handleEditBatch(params.row)}
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

  if (batchesLoading || coursesLoading) {
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
          إدارة المجموعات
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          إضافة مجموعة
        </Button>
      </Box>

      {/* Error Alert */}
      {batchesError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {batchesError}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { 
            label: "إجمالي المجموعات", 
            value: totalBatches, 
            icon: <Group sx={{ color: "white" }} />, 
            color: "primary.main" 
          },
          { 
            label: "المجموعات النشطة", 
            value: activeBatches, 
            icon: <CheckCircle sx={{ color: "white" }} />, 
            color: "success.main" 
          },
          { 
            label: "إجمالي التسجيلات", 
            value: totalEnrollments, 
            icon: <School sx={{ color: "white" }} />, 
            color: "info.main" 
          },
          { 
            label: "متوسط المسجلين", 
            value: averageEnrollments, 
            icon: <People sx={{ color: "white" }} />, 
            color: "warning.main" 
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
                placeholder="البحث في المجموعات..."
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
                  <MenuItem value="open">مفتوح</MenuItem>
                  <MenuItem value="closed">مغلق</MenuItem>
                  <MenuItem value="full">مكتمل</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>الدورة</InputLabel>
                <Select
                  value={filterCourse}
                  label="الدورة"
                  onChange={(e) => setFilterCourse(e.target.value)}
                >
                  <MenuItem value="all">جميع الدورات</MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* DataGrid */}
          <DataGrid
            rows={filteredBatches}
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
          {editingBatch ? "تعديل المجموعة" : "إضافة مجموعة جديدة"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="اسم المجموعة"
                  value={batchForm.name}
                  onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>الدورة</InputLabel>
                  <Select
                    value={batchForm.course_id || ""}
                    label="الدورة"
                    onChange={(e) => setBatchForm({ ...batchForm, course_id: Number(e.target.value) })}
                  >
                    {courses.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="الوصف"
              multiline
              rows={2}
              value={batchForm.description}
              onChange={(e) => setBatchForm({ ...batchForm, description: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>المستوى</InputLabel>
                  <Select
                    value={batchForm.level || ""}
                    label="المستوى"
                    onChange={(e) => setBatchForm({ ...batchForm, level: e.target.value as any })}
                  >
                    <MenuItem value="">غير محدد</MenuItem>
                    <MenuItem value="A1">A1</MenuItem>
                    <MenuItem value="A2">A2</MenuItem>
                    <MenuItem value="B1">B1</MenuItem>
                    <MenuItem value="B2">B2</MenuItem>
                    <MenuItem value="C1">C1</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>الحالة</InputLabel>
                  <Select
                    value={batchForm.status || "open"}
                    label="الحالة"
                    onChange={(e) => setBatchForm({ ...batchForm, status: e.target.value as any })}
                  >
                    <MenuItem value="open">مفتوح</MenuItem>
                    <MenuItem value="closed">مغلق</MenuItem>
                    <MenuItem value="full">مكتمل</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="السعة"
                  type="number"
                  value={batchForm.capacity || ""}
                  onChange={(e) => setBatchForm({ ...batchForm, capacity: Number(e.target.value) || undefined })}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="تاريخ البداية"
                  type="date"
                  value={batchForm.start_date}
                  onChange={(e) => setBatchForm({ ...batchForm, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="تاريخ النهاية"
                  type="date"
                  value={batchForm.end_date}
                  onChange={(e) => setBatchForm({ ...batchForm, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="الموقع"
                  value={batchForm.location}
                  onChange={(e) => setBatchForm({ ...batchForm, location: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="السعر الفعلي"
                  type="number"
                  value={batchForm.actual_price || ""}
                  onChange={(e) => setBatchForm({ ...batchForm, actual_price: Number(e.target.value) || undefined })}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="الجدول الزمني"
              value={batchForm.schedule}
              onChange={(e) => setBatchForm({ ...batchForm, schedule: e.target.value })}
              placeholder="مثال: الأحد والثلاثاء 6:00-8:00 مساءً"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBatch ? "تحديث" : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BatchesPage