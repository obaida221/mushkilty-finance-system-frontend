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
  Class, 
  Group,
  OnlinePrediction,
  LocationOn,
  ChildCare,
  Quiz,
  Visibility,
  CalendarToday,
  Person,
  Description,
} from "@mui/icons-material"
import { useCourses } from '../hooks/useCourses'
import { useBatches } from '../hooks/useBatches'
import type { Course, CreateCourseDto } from "../types"
import DeleteConfirmDialog from "../components/global-ui/DeleteConfirmDialog"

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
  const tabValue = 0
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

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
  // const { enrollments } = useEnrollments()

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

  // Handle delete with dialog
  const handleDeleteWithDialog = (course: Course) => {
    setCourseToDelete(course)
    setDeleteDialogOpen(true)
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!courseToDelete) return
    
    setDeleteLoading(true)
    try {
      await deleteCourse(courseToDelete.id)
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
    } catch (error) {
      console.error('Failed to delete course:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setCourseToDelete(null)
  }

  // Handle view details
  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course)
    setDetailsDialogOpen(true)
  }

  // Close details dialog
  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false)
    setSelectedCourse(null)
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

  // Get course statistics
  const getCourseStats = (courseId: number) => {
    const courseBatches = getBatchesByCourse(courseId)
    const courseEnrollments = courseBatches.filter(
      batche => batche.enrollments
    )
    console.log('courseEnrollments', courseEnrollments)
    return {
      batchCount: courseBatches.length,
      enrollmentCount: courseEnrollments.length,
      activeBatches: courseBatches.filter(batch => batch.status === "open").length,
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
        field: "name", 
        headerName: "اسم الدورة", 
        flex: 2, 
        minWidth: 200 
      },
      {
        field: "project_type",
        headerName: "النوع",
        flex: 0.8,
        minWidth: 120,
        maxWidth: 140,
        renderCell: (params) => {
          if (!params.value) return "-"
          const typeConfig = {
            online: { label: "أونلاين", color: "primary" as const, icon: <OnlinePrediction fontSize="small" /> },
            onsite: { label: "حضوري", color: "success" as const, icon: <LocationOn fontSize="small" /> },
            kids: { label: "أطفال", color: "info" as const, icon: <ChildCare fontSize="small" /> },
            ielts: { label: "آيلتس", color: "secondary" as const, icon: <Quiz fontSize="small" /> },
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
        flex: 1,
        minWidth: 150,
        maxWidth: 180,
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
        flex: 0.7,
        minWidth: 100,
        maxWidth: 120,
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
        flex: 0.7,
        minWidth: 100,
        maxWidth: 120,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
          const stats = getCourseStats(params.row.id)
          console.log('stats', stats)
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
        flex: 0.8,
        minWidth: 130,
        maxWidth: 150,
        renderCell: (params) => new Date(params.value).toLocaleDateString('ar'),
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
            <IconButton 
              size="small" 
              color="primary" 
              onClick={() => handleEditCourse(params.row)}
              disabled={deleteLoading}
              title="تعديل"
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => handleDeleteWithDialog(params.row)}
              disabled={deleteLoading}
              title="حذف"
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
            label: "إجمالي الدُفعات", 
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
                <FormControl fullWidth>
                  <InputLabel>نوع الدورة</InputLabel>
                  <Select
                    value={courseForm.project_type || ""}
                    label="نوع الدورة"
                    onChange={(e) => setCourseForm({ ...courseForm, project_type: e.target.value as any })}
                  >
                    <MenuItem value="">غير محدد</MenuItem>
                    <MenuItem value="online">أونلاين</MenuItem>
                    <MenuItem value="onsite">حضوري</MenuItem>
                    <MenuItem value="kids">أطفال</MenuItem>
                    <MenuItem value="ielts">آيلتس</MenuItem>
                  </Select>
                </FormControl>
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCourse ? "تحديث" : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف الدورة"
        itemName={courseToDelete ? `"${courseToDelete.name}"` : ""}
        loading={deleteLoading}
        message={
          courseToDelete && getBatchesByCourse(courseToDelete.id).length > 0 
            ? `هل أنت متأكد من حذف هذه الدورة؟ سيتم حذف ${getBatchesByCourse(courseToDelete.id).length} دُفعة و جميع التسجيلات المرتبطة بها.`
            : "هل أنت متأكد من حذف هذه الدورة؟"
        }
      />

      {/* Course Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleCloseDetailsDialog} 
        maxWidth="sm" 
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
            <Class color="primary" />
            <Typography variant="h6">
              تفاصيل الدورة
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {selectedCourse && (
            <Box>
              {/* Basic Information */}
              <Card sx={{ mb: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <Description color="primary" fontSize="small" />
                    المعلومات الأساسية
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          اسم الدورة
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {selectedCourse.name}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          النوع
                        </Typography>
                        <Box>
                          {selectedCourse.project_type ? (
                            <Chip 
                              label={
                                selectedCourse.project_type === "online" ? "أونلاين" :
                                selectedCourse.project_type === "onsite" ? "حضوري" :
                                selectedCourse.project_type === "kids" ? "أطفال" :
                                selectedCourse.project_type === "ielts" ? "آيلتس" : selectedCourse.project_type
                              }
                              size="small"
                              color={
                                selectedCourse.project_type === "online" ? "primary" :
                                selectedCourse.project_type === "onsite" ? "success" :
                                selectedCourse.project_type === "kids" ? "info" :
                                selectedCourse.project_type === "ielts" ? "secondary" : "default"
                              }
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              غير محدد
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Person fontSize="small" />
                          أُضيفت بواسطة
                        </Typography>
                        {selectedCourse.user ? (
                          <Chip 
                            label={selectedCourse.user.name} 
                            size="small" 
                            color="secondary" 
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            غير محدد
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CalendarToday fontSize="small" />
                          تاريخ الإنشاء
                        </Typography>
                        <Typography variant="body2">
                          {new Date(selectedCourse.created_at).toLocaleDateString('ar')}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {/* Description */}
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      وصف الدورة
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 1.5, 
                        bgcolor: 'background.default',
                        mt: 0.5
                      }}
                    >
                      <Typography variant="body2">
                        {selectedCourse.description || "لا يوجد وصف للدورة"}
                      </Typography>
                    </Paper>
                  </Box>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card sx={{ mb: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <Group color="primary" fontSize="small" />
                    الإحصائيات
                  </Typography>
                  <Grid container spacing={2}>
                    {(() => {
                      const stats = getCourseStats(selectedCourse.id)
                      
                      return [
                        {
                          label: "إجمالي الدُفعات",
                          value: stats.batchCount,
                          color: "primary.main",
                          icon: <Group fontSize="small" />,
                        },
                        {
                          label: " اجمالي المسجلين",
                          value: stats.enrollmentCount,
                          color: "success.main",
                          icon: <Person fontSize="small" />,
                        },
                        {
                          label:  "الدُفعات النشطة",
                          value: stats.activeBatches,
                          color: "info.main",
                          icon: <Class fontSize="small" />,                         
                        },
                        {
                          label: "الدُفعات غير النشطة",
                          value: stats.batchCount - stats.activeBatches,
                          color: "warning.main",
                          icon: <Class fontSize="small" />,
                        }
                      ]
                    })().map((stat, index) => (
                      <Grid item xs={3} key={index}>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 1.5, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            borderLeft: `3px solid`,
                            borderLeftColor: stat.color
                          }}
                        >
                          <Box sx={{ color: stat.color }}>
                            {stat.icon}
                          </Box>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1 }}>
                              {stat.value}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {stat.label}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              {/* Batches List */}
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <Group color="primary" fontSize="small" />
                    الدُفعات ({getBatchesByCourse(selectedCourse.id).length})
                  </Typography>
                  
                  {(() => {
                    const courseBatches = getBatchesByCourse(selectedCourse.id)
                    
                    if (courseBatches.length === 0) {
                      return (
                        <Alert severity="info" sx={{ py: 1 }}>
                          لا توجد دُفعات مرتبطة
                        </Alert>
                      )
                    }
                    
                    return (
                      <Box>
                        {courseBatches.map((batch) => (
                          <Paper 
                            key={batch.id}
                            variant="outlined" 
                            sx={{ 
                              p: 1.5, 
                              mb: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {batch.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip 
                                  label={batch.status === "open" ? "مفتوحة" : "مغلقة"} 
                                  size="small"
                                  color={batch.status === "open" ? "success" : "default"}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {batch?.start_date ? new Date(batch.start_date).toLocaleDateString('ar') : "تاريخ غير محدد"}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    )
                  })()}
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDetailsDialog}
            variant="outlined"
            size="small"
          >
            إغلاق
          </Button>
          {selectedCourse && (
            <Button 
              onClick={() => {
                handleCloseDetailsDialog()
                handleEditCourse(selectedCourse)
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
    </Box>
  )
}

export default CoursesPage