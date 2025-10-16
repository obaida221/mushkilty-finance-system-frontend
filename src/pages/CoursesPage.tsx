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
  Tab,
  Tabs,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { 
  Search, 
  Edit, 
  Delete, 
  Add, 
  Class, 
  Person, 
  School,
  Group,
  OnlinePrediction,
  LocationOn,
  ChildCare,
  Quiz,
} from "@mui/icons-material"
import { useCourses } from '../hooks/useCourses'
import { useBatches } from '../hooks/useBatches'
import { useEnrollments } from '../hooks/useEnrollments'
import type { Course, CreateCourseDto } from "../types"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

const CoursesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [tabValue, setTabValue] = useState(0)

  // Hooks
  const { 
    courses, 
    loading: coursesLoading, 
    error: coursesError,
    createCourse,
    updateCourse,
    deleteCourse,
    getCoursesByType,
  } = useCourses()

  const { batches, getBatchesByCourse } = useBatches()
  const { enrollments } = useEnrollments()

  const getCurrentUserId = (): number => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }
    return 0;
  };
  
  const [courseForm, setCourseForm] = useState<CreateCourseDto>({
    user_id: getCurrentUserId(),
    name: "",
    project_type: undefined,
    description: "",
  })

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, courseForm)
      } else {
        await createCourse(courseForm)
      }
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save course:', error)
    }
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    const courseBatches = getBatchesByCourse(id)
    const confirmMessage = courseBatches.length > 0 
      ? `هل أنت متأكد من حذف هذه الدورة؟ سيتم حذف ${courseBatches.length} مجموعة و جميع التسجيلات المرتبطة بها.`
      : "هل أنت متأكد من حذف هذه الدورة؟"
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteCourse(id)
      } catch (error) {
        console.error('Failed to delete course:', error)
      }
    }
  }

  // Dialog handlers
  const handleOpenDialog = () => {
    setCourseForm({
      user_id: getCurrentUserId(),
      name: "",
      project_type: undefined,
      description: "",
    })
    setEditingCourse(null)
    setOpenDialog(true)
  }

  const handleEditCourse = (course: Course) => {
    setCourseForm({
      user_id: course.user_id,
      name: course.name,
      project_type: course.project_type,
      description: course.description || "",
    })
    setEditingCourse(course)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingCourse(null)
  }

  // Data filtering
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === "all" || course.project_type === filterType
    
    return matchesSearch && matchesType
  })

  // Stats calculations
  const totalCourses = courses.length
  const onlineCourses = getCoursesByType("online").length
  const onsiteCourses = getCoursesByType("onsite").length
  const totalBatches = batches.length
  const totalEnrollments = enrollments.length

  // Get course statistics
  const getCourseStats = (courseId: number) => {
    const courseBatches = getBatchesByCourse(courseId)
    const courseEnrollments = enrollments.filter(enrollment => 
      courseBatches.some(batch => batch.id === enrollment.batch_id)
    )
    return {
      batchCount: courseBatches.length,
      enrollmentCount: courseEnrollments.length,
      activeBatches: courseBatches.filter(batch => batch.status === "open").length,
    }
  }

  // DataGrid columns
  const columns: GridColDef[] = [
    { 
      field: "name", 
      headerName: "اسم الدورة", 
      flex: 1, 
      minWidth: 200 
    },
    {
      field: "project_type",
      headerName: "النوع",
      width: 120,
      renderCell: (params) => {
        if (!params.value) return "-"
        const typeConfig = {
          online: { label: "أونلاين", color: "primary" as const, icon: <OnlinePrediction fontSize="small" /> },
          onsite: { label: "حضوري", color: "secondary" as const, icon: <LocationOn fontSize="small" /> },
          kids: { label: "أطفال", color: "warning" as const, icon: <ChildCare fontSize="small" /> },
          ielts: { label: "آيلتس", color: "info" as const, icon: <Quiz fontSize="small" /> },
        }
        const config = typeConfig[params.value as keyof typeof typeConfig]
        if (!config) return <Chip label={params.value} size="small" />
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
      field: "user_id",
      headerName: "أُضيفت بواسطة",
      width: 150,
      renderCell: (params) => {
        const user = params.row.user
        return user ? (
          <Chip label={user.name} size="small" color="secondary" />
        ) : (
          <Chip label="غير محدد" size="small" />
        )
      },
    },
    {
      field: "batches",
      headerName: "الدُفعات",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const stats = getCourseStats(params.row.id)
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight={500}>
              {stats.batchCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {stats.activeBatches} نشط
            </Typography>
          </Box>
        )
      },
    },
    {
      field: "enrollments",
      headerName: "المسجلين",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const stats = getCourseStats(params.row.id)
        return (
          <Chip 
            label={stats.enrollmentCount} 
            size="small" 
            color={stats.enrollmentCount > 0 ? "success" : "default"}
          />
        )
      },
    },
    {
      field: "created_at",
      headerName: "تاريخ الإنشاء",
      width: 130,
      renderCell: (params) => new Date(params.value).toLocaleDateString('ar'),
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
            onClick={() => handleEditCourse(params.row)}
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

  if (coursesLoading) {
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
          إدارة الدورات
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          إضافة دورة
        </Button>
      </Box>

      {/* Error Alert */}
      {coursesError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {coursesError}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { 
            label: "إجمالي الدورات", 
            value: totalCourses, 
            icon: <Class sx={{ color: "white" }} />, 
            color: "primary.main" 
          },
          { 
            label: "الدورات الأونلاين", 
            value: onlineCourses, 
            icon: <OnlinePrediction sx={{ color: "white" }} />, 
            color: "info.main" 
          },
          { 
            label: "الدورات الحضورية", 
            value: onsiteCourses, 
            icon: <LocationOn sx={{ color: "white" }} />, 
            color: "secondary.main" 
          },
          { 
            label: "إجمالي المجموعات", 
            value: totalBatches, 
            icon: <Group sx={{ color: "white" }} />, 
            color: "success.main" 
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

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          aria-label="course tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="جميع الدورات" />
          <Tab label="الدورات الأونلاين" />
          <Tab label="الدورات الحضورية" />
          <Tab label="دورات الأطفال" />
          <Tab label="دورات الآيلتس" />
        </Tabs>
      </Paper>

      {/* Content */}
      <Paper>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="البحث في الدورات..."
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>نوع الدورة</InputLabel>
                <Select
                  value={filterType}
                  label="نوع الدورة"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">جميع الأنواع</MenuItem>
                  <MenuItem value="online">أونلاين</MenuItem>
                  <MenuItem value="onsite">حضوري</MenuItem>
                  <MenuItem value="kids">أطفال</MenuItem>
                  <MenuItem value="ielts">آيلتس</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            <DataGrid
              rows={filteredCourses}
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
          </TabPanel>

          {[1, 2, 3, 4].map((tabIndex) => {
            const typeFilters = ["online", "onsite", "kids", "ielts"]
            const filteredByType = courses.filter(course => course.project_type === typeFilters[tabIndex - 1])
            
            return (
              <TabPanel value={tabValue} index={tabIndex} key={tabIndex}>
                <DataGrid
                  rows={filteredByType}
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
              </TabPanel>
            )
          })}
        </Box>
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCourse ? "تعديل الدورة" : "إضافة دورة جديدة"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="اسم الدورة"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="معرف المدرس"
                  type="number"
                  value={courseForm.user_id || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, user_id: Number(e.target.value) || 0 })}
                  required
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="وصف الدورة"
              multiline
              rows={4}
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCourse ? "تحديث" : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CoursesPage
