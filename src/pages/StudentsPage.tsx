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
  // TrendingUp, 
  // TrendingDown,
  Phone,
  LocationOn,
  CheckCircle,
  Pending,
  Cancel,
  ContactPhone,
  Quiz,
} from "@mui/icons-material"
import { useStudents } from '../hooks/useStudents'
import { useEnrollments } from '../hooks/useEnrollments'
import type { Student, CreateStudentDto } from "../types"

const StudentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCourseType, setFilterCourseType] = useState<string>("all")
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
    // getStudentsByCourseType,
    // updateStudentStatus,
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
        // Ensure dob is valid date string or null
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

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الطالب؟ سيتم حذف جميع التسجيلات المرتبطة به.")) {
      try {
        await deleteStudent(id)
      } catch (error) {
        console.error('Failed to delete student:', error)
      }
    }
  }

  // // Handle status update
  // const handleUpdateStatus = async (id: number, newStatus: string) => {
  //   try {
  //     await updateStudentStatus(id, newStatus)
  //   } catch (error) {
  //     console.error('Failed to update status:', error)
  //   }
  // }

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

  // DataGrid columns
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 50 },
    { 
      field: "full_name", 
      headerName: "اسم الطالب", 
      flex: 1, 
      minWidth: 150 
    },
    { 
      field: "phone", 
      headerName: "رقم الهاتف", 
      width: 130,
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
      width: 130,
      renderCell: (params) => {
        const statusConfig = {
          pending: { label: "قيد الانتظار", color: "default" as const, icon: <Pending fontSize="small" /> },
          "contacted with": { label: "تم التواصل", color: "info" as const, icon: <ContactPhone fontSize="small" /> },
          tested: { label: "تم الاختبار", color: "warning" as const, icon: <Quiz fontSize="small" /> },
          accepted: { label: "مقبول", color: "success" as const, icon: <CheckCircle fontSize="small" /> },
          rejected: { label: "مرفوض", color: "error" as const, icon: <Cancel fontSize="small" /> },
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
      field: "course_type",
      headerName: "نوع الدورة",
      width: 100,
      renderCell: (params) => {
        if (!params.value) return "-"
        const typeLabels = {
          online: "أونلاين",
          onsite: "حضوري",
          kids: "أطفال",
          ielts: "آيلتس"
        }
        return <Chip label={typeLabels[params.value as keyof typeof typeLabels]} size="small" color="primary" />
      },
    },
    {
      field: "city",
      headerName: "المدينة",
      width: 100,
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
      width: 80,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => params.value || "-",
    },
    {
      field: "enrollments",
      headerName: "التسجيلات",
      width: 100,
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
            onClick={() => handleEditStudent(params.row)}
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

  if (studentsLoading) {
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
          إدارة الطلاب
        </Typography>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={handleOpenDialog}>
          إضافة طالب
        </Button>
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
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStudent ? "تعديل" : "إضافة"}
          </Button>
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
