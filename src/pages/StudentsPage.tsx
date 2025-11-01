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
  Snackbar,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { 
  Search, 
  Edit, 
  Delete, 
  PersonAdd, 
  School, 
  Phone,
  LocationOn,
  CheckCircle,
  Pending,
  Cancel,
  ContactPhone,
  Quiz,
  Person,
  CalendarToday,
  Description,
  Visibility,
} from "@mui/icons-material"
import { useStudents } from '../hooks/useStudents'
import { useEnrollments } from '../hooks/useEnrollments'
import { usePermissions } from '../hooks/usePermissions.ts'
import type { Student, CreateStudentDto } from "../types"
import DeleteConfirmDialog from "../components/global-ui/DeleteConfirmDialog"

const StudentsPage: React.FC = () => {
  const {
    canReadStudents,
    canCreateStudents,
    canUpdateStudents,
    canDeleteStudents
  } = usePermissions();

  console.log("permission st:", 
    canReadStudents,
    canCreateStudents,
    canUpdateStudents,
    canDeleteStudents)

  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCourseType, setFilterCourseType] = useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success"
  })

  // Hooks
  const { 
    students, 
    loading: studentsLoading, 
    error: studentsError,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentsByStatus,
  } = useStudents()

  const { getEnrollmentsByStudent } = useEnrollments()

  const [studentForm, setStudentForm] = useState<CreateStudentDto>({
    full_name: "",
    age: undefined,
    dob: null,
    education_level: "",
    gender: "",
    phone: "",
    city: "",
    area: "",
    course_type: undefined,
    previous_course: "",
    is_returning: false,
    status: "pending",
  })
  
  const showSnackbar = (message: string, severity: "success" | "error" = "success") => {
    setSnackbar({ open: true, message, severity })
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingStudent) {
        const updatedForm = {
          ...studentForm,
          dob: studentForm.dob !== null && studentForm.dob !== "" ? studentForm.dob : null
        }
        await updateStudent(editingStudent.id, updatedForm)
        showSnackbar("تم تحديث بيانات الطالب بنجاح")
      } else {
        await createStudent(studentForm)
        showSnackbar("تم إضافة الطالب بنجاح")
      }
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save student:', error)
      showSnackbar("حدث خطأ أثناء حفظ بيانات الطالب", "error")
    }
  }

  // Handle delete with dialog
  const handleDeleteWithDialog = (student: Student) => {
    setStudentToDelete(student)
    setDeleteDialogOpen(true)
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return
    
    setDeleteLoading(true)
    try {
      await deleteStudent(studentToDelete.id)
      setDeleteDialogOpen(false)
      setStudentToDelete(null)
      showSnackbar("تم حذف الطالب بنجاح")
    } catch (error) {
      console.error('Failed to delete student:', error)
      showSnackbar("حدث خطأ أثناء حذف الطالب", "error")
    } finally {
      setDeleteLoading(false)
    }
  }

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setStudentToDelete(null)
  }

  // Handle view details
  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student)
    setDetailsDialogOpen(true)
  }

  // Close details dialog
  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false)
    setSelectedStudent(null)
  }

  // Dialog handlers
  const handleOpenDialog = () => {
    setStudentForm({
      full_name: "",
      age: undefined,
      dob: null,
      education_level: "",
      gender: "",
      phone: "",
      city: "",
      area: "",
      course_type: undefined,
      previous_course: "",
      is_returning: false,
      status: "pending",
    })
    setEditingStudent(null)
    setOpenDialog(true)
  }

  const handleEditStudent = (student: Student) => {
    setStudentForm({
      full_name: student.full_name,
      age: student.age,
      dob: student.dob ? student.dob.split('T')[0] : null,
      education_level: student.education_level || "",
      gender: student.gender || "",
      phone: student.phone,
      city: student.city || "",
      area: student.area || "",
      course_type: student.course_type,
      previous_course: student.previous_course || "",
      is_returning: student.is_returning,
      status: student.status,
    })
    setEditingStudent(student)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingStudent(null)
  }

  // Data filtering
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.phone.includes(searchQuery) ||
                         student.city?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || student.status === filterStatus
    const matchesCourseType = filterCourseType === "all" || student.course_type === filterCourseType
    
    return matchesSearch && matchesStatus && matchesCourseType
  })

  // Stats calculations
  const totalStudents = students.length
  const pendingStudents = getStudentsByStatus("pending").length
  const acceptedStudents = getStudentsByStatus("accepted").length
  const testedStudents = getStudentsByStatus("tested").length

  // الحصول على تسجيلات الطالب
  const getStudentEnrollmentsCount = (studentId: number) => {
    return getEnrollmentsByStudent(studentId).length
  }

  // الحصول على معلومات الطالب المفصلة
  const getStudentDetails = (studentId: number) => {
    const student = students.find(s => s.id === studentId)
    if (!student) return null
    
    const enrollments = getEnrollmentsByStudent(studentId)
    
    return {
      student,
      enrollments,
      enrollmentCount: enrollments.length,
      statusInfo: getStatusInfo(student.status),
      courseTypeInfo: getCourseTypeInfo(student.course_type)
    }
  }

  // معلومات الحالة
  const getStatusInfo = (status: string) => {
    const statusConfig = {
      pending: { label: "قيد الانتظار", color: "default" as const, icon: <Pending fontSize="small" /> },
      "contacted with": { label: "تم التواصل", color: "info" as const, icon: <ContactPhone fontSize="small" /> },
      tested: { label: "تم الاختبار", color: "warning" as const, icon: <Quiz fontSize="small" /> },
      accepted: { label: "مقبول", color: "success" as const, icon: <CheckCircle fontSize="small" /> },
      rejected: { label: "مرفوض", color: "error" as const, icon: <Cancel fontSize="small" /> },
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  // معلومات نوع الدورة
  const getCourseTypeInfo = (courseType: string | undefined) => {
    const typeLabels = {
      online: { label: "أونلاين", color: "primary" as const },
      onsite: { label: "حضوري", color: "success" as const },
      kids: { label: "أطفال", color: "info" as const },
      ielts: { label: "آيلتس", color: "secondary" as const }
    }
    return courseType ? typeLabels[courseType as keyof typeof typeLabels] : { label: "غير محدد", color: "default" as const }
  }
      // DataGrid columns
    const columns: GridColDef[] = [
      { 
        field: "id", 
        headerName: "ID", 
        flex: 0.5, 
        minWidth: 50,
        maxWidth: 80 
      },
      { 
        field: "full_name", 
        headerName: "اسم الطالب", 
        flex: 2, 
        minWidth: 150 
      },
      { 
        field: "phone", 
        headerName: "رقم الهاتف", 
        flex: 1,
        minWidth: 130,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Phone fontSize="small" color="action" />
            {params.value}
          </Box>
        )
      },
      {
        field: "status",
        headerName: "الحالة",
        flex: 1,
        minWidth: 130,
        renderCell: (params) => {
          const config = getStatusInfo(params.value)
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
        field: "course_type",
        headerName: "نوع الدورة",
        flex: 0.8,
        minWidth: 100,
        renderCell: (params) => {
          const config = getCourseTypeInfo(params.value)
          return <Chip label={config.label} size="small" color={config.color} />
        },
      },
      {
        field: "city",
        headerName: "المدينة",
        flex: 0.8,
        minWidth: 100,
        renderCell: (params) => params.value ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOn fontSize="small" color="action" />
            {params.value}
          </Box>
        ) : "-",
      },
      {
        field: "age",
        headerName: "العمر",
        flex: 0.5,
        minWidth: 80,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => params.value || "-",
      },
      {
        field: "enrollments",
        headerName: "التسجيلات",
        flex: 0.8,
        minWidth: 100,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
          const studentEnrollments = getEnrollmentsByStudent(params.row.id)
          return (
            <Chip 
              label={studentEnrollments.length} 
              size="small" 
              color={studentEnrollments.length > 0 ? "success" : "default"}
            />
          )
        },
      },
      {
        field: "created_at",
        headerName: "تاريخ التسجيل",
        flex: 1,
        minWidth: 130,
        renderCell: (params) => new Date(params.value).toLocaleDateString('ar'),
      },
      {
        field: "actions",
        headerName: "الإجراءات",
        flex: 1,
        minWidth: 120,
        maxWidth: 150,
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
            { canUpdateStudents && (
              <IconButton 
                size="small" 
                color="primary" 
                onClick={() => handleEditStudent(params.row)}
                disabled={deleteLoading}
              >
                <Edit fontSize="small" />
              </IconButton>
            )}
            {canDeleteStudents &&
              (<IconButton 
                size="small" 
                color="error" 
                onClick={() => handleDeleteWithDialog(params.row)}
                disabled={deleteLoading}
              >
                <Delete fontSize="small" />
              </IconButton>
              )}
          </Box>
        ),
      },
    ]

    if (studentsLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      )
    }

    // Check if user has permission to view students
    if (!canReadStudents) {
      return (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70vh',
          textAlign: 'center',
          p: 3
        }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            ليس لديك صلاحية للوصول إلى صفحة الطلاب
          </Alert>
          <Typography variant="body1">
            للوصول إلى هذه الصفحة، يجب أن تملك صلاحية "عرض الطلاب"
          </Typography>
        </Box>
      );
    }

    return (
    <Box>
        {/* Header */}      
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            إدارة الطلاب
          </Typography>

        {canCreateStudents && (
          <Button variant="contained" startIcon={<PersonAdd />} onClick={handleOpenDialog}>
            إضافة طالب
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {studentsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {studentsError}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { 
            label: "إجمالي الطلاب", 
            value: totalStudents, 
            icon: <School sx={{ color: "white" }} />, 
            color: "primary.main" 
          },
          { 
            label: "قيد الانتظار", 
            value: pendingStudents, 
            icon: <Pending sx={{ color: "white" }} />, 
            color: "warning.main" 
          },
          { 
            label: "تم اختبارهم", 
            value: testedStudents, 
            icon: <Quiz sx={{ color: "white" }} />, 
            color: "info.main" 
          },
          { 
            label: "المقبولين", 
            value: acceptedStudents, 
            icon: <CheckCircle sx={{ color: "white" }} />, 
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

      {/* Filters and Search */}
      <Paper>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="البحث عن طالب..."
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
                  <MenuItem value="contacted with">تم التواصل</MenuItem>
                  <MenuItem value="tested">تم الاختبار</MenuItem>
                  <MenuItem value="accepted">مقبول</MenuItem>
                  <MenuItem value="rejected">مرفوض</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>نوع الدورة</InputLabel>
                <Select
                  value={filterCourseType}
                  label="نوع الدورة"
                  onChange={(e) => setFilterCourseType(e.target.value)}
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

          {/* DataGrid */}
          <DataGrid
            rows={filteredStudents}
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
          {editingStudent ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  label="الاسم الكامل" 
                  value={studentForm.full_name} 
                  onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  label="رقم الهاتف" 
                  value={studentForm.phone} 
                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField 
                  fullWidth 
                  label="العمر" 
                  type="number"
                  value={studentForm.age || ""} 
                  onChange={(e) => setStudentForm({ ...studentForm, age: Number(e.target.value) || undefined })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField 
                  fullWidth 
                  label="تاريخ الميلاد"
                  type="date"
                  value={studentForm.dob} 
                  onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>الجنس</InputLabel>
                  <Select
                    value={studentForm.gender || ""}
                    label="الجنس"
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                  >
                    <MenuItem value="">غير محدد</MenuItem>
                    <MenuItem value="male">ذكر</MenuItem>
                    <MenuItem value="female">أنثى</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  label="المدينة" 
                  value={studentForm.city} 
                  onChange={(e) => setStudentForm({ ...studentForm, city: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  label="المنطقة" 
                  value={studentForm.area} 
                  onChange={(e) => setStudentForm({ ...studentForm, area: e.target.value })}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  label="المستوى التعليمي" 
                  value={studentForm.education_level} 
                  onChange={(e) => setStudentForm({ ...studentForm, education_level: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>نوع الدورة</InputLabel>
                  <Select
                    value={studentForm.course_type || ""}
                    label="نوع الدورة"
                    onChange={(e) => setStudentForm({ ...studentForm, course_type: e.target.value as any })}
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

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>الحالة</InputLabel>
                  <Select
                    value={studentForm.status || "pending"}
                    label="الحالة"
                    onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as any })}
                  >
                    <MenuItem value="pending">قيد الانتظار</MenuItem>
                    <MenuItem value="contacted with">تم التواصل</MenuItem>
                    <MenuItem value="tested">تم الاختبار</MenuItem>
                    <MenuItem value="accepted">مقبول</MenuItem>
                    <MenuItem value="rejected">مرفوض</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>طالب عائد؟</InputLabel>
                  <Select
                    value={studentForm.is_returning?.toString()}
                    label="طالب عائد؟"
                    onChange={(e) => setStudentForm({ ...studentForm, is_returning: e.target.value === "true" })}
                  >
                    <MenuItem value="false">لا</MenuItem>
                    <MenuItem value="true">نعم</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="الدورات السابقة"
              multiline
              rows={2}
              value={studentForm.previous_course}
              onChange={(e) => setStudentForm({ ...studentForm, previous_course: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStudent ? "تعديل" : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف الطالب"
        itemName={studentToDelete ? `"${studentToDelete.full_name}"` : ""}
        loading={deleteLoading}
        message={
          studentToDelete && getStudentEnrollmentsCount(studentToDelete.id) > 0 
            ? `هل أنت متأكد من حذف هذا الطالب؟ سيتم حذف ${getStudentEnrollmentsCount(studentToDelete.id)} تسجيل مرتبط به.`
            : "هل أنت متأكد من حذف هذا الطالب؟"
        }
      />

      {/* Student Details Dialog */}
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
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Person color="primary" />
            <Typography variant="h6">
              تفاصيل الطالب
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 1 }}>
          {selectedStudent && (() => {
            const studentDetails = getStudentDetails(selectedStudent.id)
            if (!studentDetails) return null
            
            const { student, enrollments, enrollmentCount, statusInfo, courseTypeInfo } = studentDetails
            
            return (
              <Grid container spacing={2}>
                {/*  المعلومات الأساسية */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                        <Description color="primary" fontSize="small" />
                        المعلومات الأساسية
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              الاسم الكامل
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                              {student.full_name}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              رقم الهاتف
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Phone fontSize="small" color="action" />
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {student.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} >
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              العمر
                            </Typography>
                            <Typography variant="body1">
                              {student.age || "غير محدد"}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              الجنس
                            </Typography>
                            <Typography variant="body1">
                              {student.gender === "male" ? "ذكر" : student.gender === "female" ? "أنثى" : "غير محدد"}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              المدينة
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOn fontSize="small" color="action" />
                              <Typography variant="body1">
                                {student.city || "غير محدد"}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              المنطقة
                            </Typography>
                            <Typography variant="body1">
                              {student.area || "غير محدد"}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              المستوى التعليمي
                            </Typography>
                            <Typography variant="body1">
                              {student.education_level || "غير محدد"}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              تاريخ الميلاد
                            </Typography>
                            <Typography variant="body1">
                              {student.dob ? new Date(student.dob).toLocaleDateString('ar') : "غير محدد"}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              تاريخ التسجيل
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarToday fontSize="small" color="action" />
                              <Typography variant="body1">
                                {new Date(student.created_at).toLocaleDateString('ar')}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* معلومات الدورة والحالة */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                        <School color="primary" fontSize="small" />
                        معلومات الدورة والحالة
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                              نوع الدورة
                            </Typography>
                            <Chip 
                              label={courseTypeInfo.label} 
                              size="medium"
                              color={courseTypeInfo.color}
                              sx={{ fontSize: '0.9rem', padding: '8px 12px' }}
                            />
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                              الحالة
                            </Typography>
                            <Chip 
                              label={statusInfo.label} 
                              size="medium"
                              color={statusInfo.color}
                              icon={statusInfo.icon}
                              sx={{ fontSize: '0.9rem', padding: '8px 12px' }}
                            />
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              طالب عائد
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: student.is_returning ? 600 : 400 }}>
                              {student.is_returning ? "نعم" : "لا"}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              عدد التسجيلات
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <School fontSize="small" color="action" />
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {enrollmentCount} تسجيل
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* الدورات السابقة */}
                  <Card sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                        <Description color="primary" fontSize="small" />
                        الدورات السابقة
                      </Typography>
                      
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'background.default',
                          minHeight: '100px'
                        }}
                      >
                        <Typography variant="body1">
                          {student.previous_course || "لا توجد دورات سابقة"}
                        </Typography>
                      </Paper>
                    </CardContent>
                  </Card>

                  {/* قائمة التسجيلات */}
                  <Card>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                        <School color="primary" fontSize="small" />
                        التسجيلات ({enrollmentCount})
                      </Typography>
                      
                      {enrollments.length === 0 ? (
                        <Alert severity="info" sx={{ py: 1 }}>
                          لا توجد تسجيلات للطالب
                        </Alert>
                      ) : (
                        <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {enrollments.map((enrollment) => (
                            <Paper 
                              key={enrollment.id}
                              variant="outlined" 
                              sx={{ 
                                p: 1.5, 
                                mb: 1,
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                تسجيل #{enrollment.id}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                تاريخ التسجيل: {new Date(enrollment.created_at).toLocaleDateString('ar')}
                              </Typography>
                            </Paper>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
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
          {canUpdateStudents && selectedStudent && (
            <Button 
              onClick={() => {
                handleCloseDetailsDialog()
                handleEditStudent(selectedStudent)
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
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
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

export default StudentsPage