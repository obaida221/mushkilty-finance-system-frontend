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
  TableContainer,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Snackbar,
  Tooltip,
  Divider,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { 
  Search, 
  Edit, 
  Delete, 
  Add, 
  Group, 
  School,
  CheckCircle,
  Cancel,
  People,
  Refresh,
  Visibility,
  Close,
} from "@mui/icons-material"
import { useBatches } from '../hooks/useBatches'
import { useCourses } from '../hooks/useCourses'
import { useEnrollments } from '../hooks/useEnrollments'
import { useUsers } from '../hooks/useUsers'
import type { Batch, CreateBatchDto, User } from "../types"

const BatchesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [openCourseDialog, setOpenCourseDialog] = useState(false)
  const [openTrainerDialog, setOpenTrainerDialog] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [viewingBatch, setViewingBatch] = useState<Batch | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCourse, setFilterCourse] = useState<string>("all")
  const [trainerSearch, setTrainerSearch] = useState<string>("")
  const [courseSearch, setCourseSearch] = useState<string>("")
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" })
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Hooks
  const { 
    batches, 
    loading: batchesLoading, 
    error: batchesError,
    createBatch,
    updateBatch,
    deleteBatch,
    getBatchesByStatus,
    refreshBatches,
  } = useBatches()

  const { courses, loading: coursesLoading } = useCourses()
  const { enrollments } = useEnrollments()
  const { users, loading: usersLoading } = useUsers()

  const [batchForm, setBatchForm] = useState<CreateBatchDto>({
    course_id: 0,
    trainer_id: 0,
    name: "",
    description: "",
    level: undefined,
    location: "",
    start_date: null,
    end_date: null,
    schedule: "",
    capacity: 0,
    status: "open",
    actual_price: 0,
    currency: "IQD",
  })

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingBatch) {
        await updateBatch(editingBatch.id, batchForm)
        setSnackbar({ open: true, message: "تم تحديث الدفعة بنجاح", severity: "success" })
      } else {
        await createBatch(batchForm)
        setSnackbar({ open: true, message: "تم إنشاء الدفعة بنجاح", severity: "success" })
      }
      setLastUpdated(new Date())
      handleCloseDialog()
    } catch (error: any) {
      console.error('Failed to save batch:', error)
      let errorMessage = "حدث خطأ ما، يرجى المحاولة مرة أخرى"
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = "البيانات المرسلة غير صالحة، يرجى التحقق من جميع الحقول المطلوبة"
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message
          }
        } else if (error.response.status === 401) {
          errorMessage = "غير مصرح لك بالقيام بهذه العملية"
        } else if (error.response.status === 403) {
          errorMessage = "ليس لديك صلاحية للقيام بهذه العملية"
        } else if (error.response.status === 404) {
          errorMessage = "المورد المطلوب غير موجود"
        } else if (error.response.status === 500) {
          errorMessage = "خطأ في الخادم، يرجى المحاولة مرة أخرى لاحقاً"
        }
      } else if (error.request) {
        errorMessage = "لا يمكن الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت"
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: "error" })
    }
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الدُفعة؟ سيتم حذف جميع التسجيلات المرتبطة بها.")) {
      try {
        await deleteBatch(id)
        setSnackbar({ open: true, message: "تم حذف الدفعة بنجاح", severity: "success" })
        setLastUpdated(new Date())
      } catch (error: any) {
        console.error('Failed to delete batch:', error)
        let errorMessage = "فشل حذف الدفعة، يرجى المحاولة مرة أخرى"
        
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = "الدفعة غير موجودة"
          } else if (error.response.status === 403) {
            errorMessage = "ليس لديك صلاحية لحذف هذه الدفعة"
          }
        }
        
        setSnackbar({ open: true, message: errorMessage, severity: "error" })
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
      start_date: null,
      end_date: null,
      schedule: "",
      capacity: undefined,
      status: "open",
      actual_price: undefined,
    })
    setCourseSearch("")
    setTrainerSearch("")
    setEditingBatch(null)
    setOpenDialog(true)
  }

  const handleEditBatch = (batch: Batch) => {
    setBatchForm({
      course_id: batch.course_id,
      trainer_id: batch.trainer_id || 0,
      name: batch.name,
      description: batch.description || "",
      level: batch.level,
      location: batch.location || "",
      start_date: batch.start_date ? batch.start_date.split('T')[0] : null,
      end_date: batch.end_date ? batch.end_date.split('T')[0] : null,
      schedule: batch.schedule || "",
      capacity: batch.capacity,
      status: batch.status,
      actual_price: parseFloat(batch.actual_price?.toString() || "0"),
    })    
    setEditingBatch(batch)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingBatch(null)
    setCourseSearch("")
    setTrainerSearch("")
  }

  // Course dialog handlers
  const handleOpenCourseDialog = () => {
    setCourseSearch("")
    setOpenCourseDialog(true)
  }

  const handleCloseCourseDialog = () => {
    setOpenCourseDialog(false)
  }

  // Trainer dialog handlers
  const handleOpenTrainerDialog = () => {
    setTrainerSearch("")
    setOpenTrainerDialog(true)
  }

  const handleCloseTrainerDialog = () => {
    setOpenTrainerDialog(false)
  }

  const handleOpenViewDialog = (batch: Batch) => {
    setViewingBatch(batch)
    setOpenViewDialog(true)
  }

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false)
    setViewingBatch(null)
  }

  // Handle trainer selection
  const handleTrainerSelect = (trainerId: number) => {
    setBatchForm({ ...batchForm, trainer_id: trainerId })
  }

  // Handle course selection
  const handleCourseSelect = (courseId: number) => {
    setBatchForm({ ...batchForm, course_id: courseId })
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

  // Filter courses based on search input
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(courseSearch.toLowerCase()) || 
    course.project_type?.toLowerCase().includes(courseSearch.toLowerCase())
  )

  // Filter users based on search input
  const filteredUsers = users.filter((user: User) => 
    user.name.toLowerCase().includes(trainerSearch.toLowerCase())  || 
    user.email.toLowerCase().includes(trainerSearch.toLowerCase())
  )

  // Stats calculations
  const totalBatches = batches.length
  const activeBatches = getBatchesByStatus("open").length
  const totalEnrollments = batches.reduce((sum, batch) => sum + (batch.enrollments?.length || 0), 0)
  const averageEnrollments = totalBatches > 0 ? Math.round(totalEnrollments / totalBatches) : 0

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 20
    }, 
    { 
      field: "name", 
      headerName: "اسم الدُفعة",  
      minWidth: 200 
    },
    {
      field: "course_id",
      headerName: "الدورة",
      minWidth: 200,
      renderCell: (params) => {
        const course = courses.find(c => c.id === params.value)
        return <Chip label={course?.name || "غير محدد"} size="small" color="primary" />
      },
    },
    {
      field: "project_type",
      headerName: "النوع",
      minWidth: 100,
      renderCell: (params) => {
        return <Chip label={params.row.course?.project_type || "غير محدد"} size="small" color="primary" />
      },
    },
    {
      field: "level",
      headerName: "المستوى",
      width: 130,
      renderCell: (params) => params.value ? (
        <Chip label={params.value} size="small" color="secondary" />
      ) : "-",
    },
    {
      field: "status",
      headerName: "الحالة",
      minWidth: 100,
      renderCell: (params) => {
        const statusConfig = {
          open: { label: "مفتوحة", color: "success" as const, icon: <CheckCircle fontSize="small" /> },
          closed: { label: "مغلقة", color: "error" as const, icon: <Cancel fontSize="small" /> },
          full: { label: "مكتملة", color: "warning" as const, icon: <People fontSize="small" /> },
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
      minWidth: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => params.value || "-",
    },
    {
      field: "enrollments",
      headerName: "المسجلين",
      minWidth: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const batchEnrollments = params.row.enrollments
        return batchEnrollments.length || 0
      },
    },
    {
      field: "start_date",
      headerName: "تاريخ البداية",
      minWidth: 100,
      width: 150,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString('ar') : "-",
    },
    {
      field: "end_date",
      headerName: "تاريخ النهاية",
      minWidth: 100,
      width: 150,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString('ar') : "-",
    },
    {
      field: "location",
      headerName: "الموقع",
      minWidth: 150,
      width: 200,
      renderCell: (params) => params.value || "-",
    },
    {
      field: "actions",
      headerName: "الإجراءات",
      minWidth: 100,
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="عرض التفاصيل">
            <IconButton size="small" color="primary" onClick={() => handleOpenViewDialog(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="تعديل">
            <IconButton 
              size="small" 
              color="primary" 
              onClick={() => handleEditBatch(params.row)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  if (batchesLoading || coursesLoading || usersLoading) {
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
          إدارة الدُفعات
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              آخر تحديث: {lastUpdated.toLocaleTimeString("ar-EN")}
            </Typography>
          )}
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={async () => {
              try {
                refreshBatches();
                setLastUpdated(new Date());
                setSnackbar({ open: true, message: "تم تحديث البيانات بنجاح", severity: "success" });
              } catch (error: any) {
                console.error("Failed to refresh batches:", error);
                setSnackbar({ open: true, message: "فشل تحديث البيانات، يرجى المحاولة مرة أخرى", severity: "error" });
              }
            }}
          >
            تحديث
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
            إضافة دُفعة
          </Button>
        </Box>
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
            label: "إجمالي الدُفعات", 
            value: totalBatches, 
            icon: <Group sx={{ color: "white" }} />, 
            color: "primary.main" 
          },
          { 
            label: "الدُفعات النشطة", 
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
                placeholder="البحث في الدُفعات..."
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
                  <MenuItem value="open">مفتوحة</MenuItem>
                  <MenuItem value="closed">مغلقة</MenuItem>
                  <MenuItem value="full">مكتملة</MenuItem>
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
          {editingBatch ? "تعديل الدُفعة" : "إضافة دُفعة جديدة"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="اسم الدُفعة"
                  value={batchForm.name}
                  onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  {/* <InputLabel>الدورة</InputLabel> */}
                  <TextField
                    value={batchForm.course_id ? courses.find(c => c.id === batchForm.course_id)?.name || "" : ""}
                    label="الدورة"
                    onClick={handleOpenCourseDialog}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <TextField
                    value={batchForm.trainer_id ? users.find(u => u.id === batchForm.trainer_id)?.name || "" : ""}
                    label="المدرب المسؤول"
                    onClick={handleOpenTrainerDialog}
                  />
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
                    <MenuItem value="open">مفتوحة</MenuItem>
                    <MenuItem value="closed">مغلقة</MenuItem>
                    <MenuItem value="full">مكتملة</MenuItem>
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
                  required
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
              <Grid item xs={10} md={4}>
                <TextField
                  fullWidth
                  label="السعر الفعلي"
                  type="number"
                  value={batchForm.actual_price || ""}
                  onChange={(e) => setBatchForm({ ...batchForm, actual_price: Number(e.target.value) || undefined })}
                />
              </Grid>
              <Grid item xs={2} md={2}>
                <Select
                  fullWidth
                  label="العملة"
                  value={batchForm.currency || "IQD"}
                  onChange={(e) => setBatchForm({ ...batchForm, currency: e.target.value || "IQD" as any })}
                >
                <MenuItem value="IQD"> IQD </MenuItem>
                <MenuItem value="USD"> USD </MenuItem>
                </Select>
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBatch ? "تحديث" : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Course Selection Dialog */}
      <Dialog open={openCourseDialog} onClose={handleCloseCourseDialog} maxWidth="lg">
        <DialogTitle>اختيار الدورة</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              placeholder="البحث في الدورات..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ height: 400 }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                      <TableCell>اسم الدورة</TableCell>
                      <TableCell>النوع</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course.id} onClick={() => {
                        handleCourseSelect(course.id);
                        handleCloseCourseDialog();
                      }}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{course.project_type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {filteredCourses.length === 0 && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    ما من دورات مطابقة للبحث.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseCourseDialog}>إلغاء</Button>
        </DialogActions>
      </Dialog>

      {/* Trainer Selection Dialog */}
      <Dialog open={openTrainerDialog} onClose={handleCloseTrainerDialog} maxWidth="lg">
        <DialogTitle>اختيار المدرب المسؤول</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              placeholder="البحث في المدربين..."
              value={trainerSearch}
              onChange={(e) => setTrainerSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Group />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ height: 400, overflow: "auto" }}>
              {filteredUsers.map((user) => (
                <Box 
                  key={user.id} 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    padding: 1, 
                    borderBottom: "1px solid #e0e0e0",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#f5f5f5" }
                  }}
                  onClick={() => {
                    handleTrainerSelect(user.id);
                    handleCloseTrainerDialog();
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">{user.name}</Typography>
                    {/* <Typography variant="body2" color="text.secondary">{user.role}</Typography> */}
                    <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                  </Box>
                  {/* <Select color="primary" /> */}
                  <Button variant="outlined" size="small">اختيار</Button>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseTrainerDialog}>إلغاء</Button>
        </DialogActions>
      </Dialog>

      {/* View Batch Details Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">تفاصيل الدفعة</Typography>
            <IconButton onClick={handleCloseViewDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewingBatch && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontSize: "1em", fontWeight: "bold", mb: 1.5, textDecoration: "underline" }}>معلومات الدفعة:</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography><strong>المعرف:</strong> {viewingBatch.id}</Typography>
                        <Typography><strong>اسم الدفعة:</strong> {viewingBatch.name}</Typography>
                        <Typography><strong>الدورة:</strong> {viewingBatch.course?.name || "-"}</Typography>
                        <Typography><strong>المستوى:</strong> {viewingBatch.level || "-"}</Typography>
                        <Typography><strong>السعة:</strong> {viewingBatch.capacity || "-"}</Typography>
                        <Typography><strong>الحالة:</strong>
                          <Chip
                            label={viewingBatch.status === "open" ? "مفتوحة" : viewingBatch.status === "closed" ? "مغلقة" : viewingBatch.status}
                            color={viewingBatch.status === "open" ? "success" : viewingBatch.status === "closed" ? "error" : "default"}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        <Typography><strong>السعر:</strong> {viewingBatch.actual_price} {viewingBatch.currency || "-"}</Typography>
                        <Typography><strong>الوصف:</strong> {viewingBatch.description || "-"}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontSize: "1em", fontWeight: "bold", mb: 1.5, textDecoration: "underline" }}>الزمان والمكان:</Typography>

                      <Typography><strong>الموعد:</strong> {viewingBatch.schedule || "-"}</Typography>

                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                        <Box>
                          <Typography><strong>تاريخ البدء:</strong></Typography>
                          <Typography>{viewingBatch.start_date ? new Date(viewingBatch.start_date).toLocaleDateString('ar') : "-"}</Typography>
                        </Box>
                        <Box>
                          <Typography><strong>تاريخ الانتهاء:</strong></Typography>
                          <Typography>{viewingBatch.end_date ? new Date(viewingBatch.end_date).toLocaleDateString('ar') : "-"}</Typography>
                        </Box>
                      </Box>

                      <Typography><strong>الموقع:</strong> {viewingBatch.location || "-"}</Typography>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                        <Box>
                          <Typography><strong>تاريخ الإنشاء:</strong></Typography>
                          <Typography>{new Date(viewingBatch.created_at).toLocaleString('ar-EG')}</Typography>
                        </Box>
                        <Box>
                          <Typography><strong>آخر تعديل:</strong></Typography>
                          <Typography>{new Date(viewingBatch.updated_at).toLocaleString('ar-EG')}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontSize: "1em", fontWeight: "bold", mb: 1.5, textDecoration: "underline" }}>
                        الطلاب المسجلون ({viewingBatch.enrollments?.length || 0})
                      </Typography>
                      {viewingBatch.enrollments && viewingBatch.enrollments.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                          <Table>
                            <TableHead sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>الطالب</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>رمز الخصم</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>السعر الإجمالي</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>تاريخ التسجيل</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>ملاحظات</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {viewingBatch.enrollments.map((enrollment) => (
                                <TableRow key={enrollment.id} hover>
                                  <TableCell>{enrollment.student_id}</TableCell>
                                  <TableCell>
                                    {(enrollment as any).student?.full_name || 
                                     (enrollments.find(e => e.student_id === enrollment.student_id) as any)?.student?.full_name || 
                                     `طالب #${enrollment.student_id}`}
                                  </TableCell>
                                  <TableCell>{enrollment.discount_code || "-"}</TableCell>
                                  <TableCell>{enrollment.total_price} {enrollment.currency}</TableCell>
                                  <TableCell>{enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString('ar') : "-"}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={enrollment.status === "accepted" ? "مقبول" : enrollment.status === "pending" ? "قيد الانتظار" : enrollment.status}
                                      color={enrollment.status === "accepted" ? "success" : enrollment.status === "pending" ? "warning" : "default"}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>{enrollment.notes || "-"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          لا يوجد طلاب مسجلون في هذه الدفعة
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseViewDialog} variant="outlined">إغلاق</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default BatchesPage