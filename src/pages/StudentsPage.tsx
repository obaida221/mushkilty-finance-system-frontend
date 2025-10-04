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
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Edit, Delete, PersonAdd, School, TrendingUp, TrendingDown } from "@mui/icons-material"
import type { Student, Course } from "../types"

// Mock data
const mockCourses: Course[] = [
  { id: "1", name: "Programming", nameAr: "البرمجة", description: "دورة برمجة متقدمة", price: 500000, duration: 6, teacherId: "1", enrolledCount: 35, status: "active", createdAt: "2024-01-01" },
  { id: "2", name: "Design", nameAr: "التصميم", description: "دورة تصميم جرافيك", price: 400000, duration: 4, teacherId: "2", enrolledCount: 25, status: "active", createdAt: "2024-01-15" },
]

const mockStudents: Student[] = [
  { id: "1", fullName: "علي أحمد", email: "ali@example.com", phone: "07701234567", courseId: "1", enrollmentDate: "2024-01-15", status: "active", totalPaid: 300000, totalDue: 200000, discountId: null, createdAt: "2024-01-15" },
  { id: "2", fullName: "سارة محمد", email: "sara@example.com", phone: "07709876543", courseId: "2", enrollmentDate: "2024-02-01", status: "active", totalPaid: 400000, totalDue: 0, discountId: null, createdAt: "2024-02-01" },
  { id: "3", fullName: "حسن علي", email: "hassan@example.com", phone: "07705555555", courseId: "1", enrollmentDate: "2024-01-20", status: "active", totalPaid: 500000, totalDue: 0, discountId: null, createdAt: "2024-01-20" },
]

const StudentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [courses] = useState<Course[]>(mockCourses)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)

  const [studentForm, setStudentForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    courseId: "",
  })

  // فتح نافذة إضافة/تعديل الطالب
  const handleOpenDialog = () => {
    setStudentForm({ fullName: "", email: "", phone: "", courseId: "" })
    setEditingStudentId(null)
    setOpenDialog(true)
  }

  // غلق النافذة
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  // إضافة أو تعديل الطالب
  const handleCreateOrEditStudent = () => {
    if (editingStudentId) {
      // تعديل الطالب
      setStudents(students.map(s => s.id === editingStudentId ? { ...s, ...studentForm } : s))
    } else {
      // إضافة جديد
      const newStudent: Student = {
        id: (students.length + 1).toString(),
        fullName: studentForm.fullName,
        email: studentForm.email,
        phone: studentForm.phone,
        courseId: studentForm.courseId,
        enrollmentDate: new Date().toISOString(),
        status: "active",
        totalPaid: 0,
        totalDue: courses.find(c => c.id === studentForm.courseId)?.price || 0,
        discountId: null,
        createdAt: new Date().toISOString(),
      }
      setStudents([newStudent, ...students])
    }
    handleCloseDialog()
  }

  // حذف الطالب
  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id))
  }

  // فتح نافذة تعديل الطالب مع تعبئة البيانات
  const handleEditStudent = (student: Student) => {
    setStudentForm({
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      courseId: student.courseId,
    })
    setEditingStudentId(student.id)
    setOpenDialog(true)
  }

  const columns: GridColDef[] = [
    { field: "fullName", headerName: "اسم الطالب", flex: 1, minWidth: 150 },
    { field: "email", headerName: "البريد الإلكتروني", flex: 1, minWidth: 180 },
    { field: "phone", headerName: "رقم الهاتف", width: 130 },
    {
      field: "courseId",
      headerName: "الدورة",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const course = courses.find(c => c.id === params.value)
        return <Chip label={course?.nameAr || "غير مسجل"} size="small" color="primary" />
      },
    },
    {
      field: "status",
      headerName: "الحالة",
      width: 100,
      renderCell: (params) => {
        const statusMap: Record<string, { label: string; color: "success" | "warning" | "default" }> = {
          active: { label: "نشط", color: "success" },
          inactive: { label: "غير نشط", color: "default" },
          graduated: { label: "متخرج", color: "warning" },
        }
        const status = statusMap[params.value] || statusMap.active
        return <Chip label={status.label} size="small" color={status.color} />
      },
    },
    { field: "totalPaid", headerName: "المدفوع", width: 120, renderCell: (params) => `${params.value.toLocaleString()} د.ع` },
    {
      field: "totalDue",
      headerName: "المتبقي",
      width: 120,
      renderCell: (params) => <Typography color={params.value > 0 ? "error" : "success.main"}>{params.value.toLocaleString()} د.ع</Typography>,
    },
    {
      field: "actions",
      headerName: "الإجراءات",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" color="primary" onClick={() => handleEditStudent(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDeleteStudent(params.row.id)}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ]

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery),
  )

  const activeStudents = students.filter((s) => s.status === "active").length
  const totalRevenue = students.reduce((sum, s) => sum + s.totalPaid, 0)
  const totalDue = students.reduce((sum, s) => sum + s.totalDue, 0)

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          إدارة الطلاب
        </Typography>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={handleOpenDialog}>
          إضافة طالب
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[{ label: "الطلاب النشطين", value: activeStudents, icon: <School sx={{ color: "white" }} />, color: "primary.main" },
          { label: "إجمالي الإيرادات", value: totalRevenue, icon: <TrendingUp sx={{ color: "white" }} />, color: "success.main" },
          { label: "المبالغ المستحقة", value: totalDue, icon: <TrendingDown sx={{ color: "white" }} />, color: "error.main" },
          { label: "إجمالي الطلاب", value: students.length, icon: <School sx={{ color: "white" }} />, color: "info.main" }].map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ bgcolor: card.color, p: 1.5, borderRadius: 2 }}>{card.icon}</Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{card.value.toLocaleString()}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper>
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="البحث عن طالب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ mb: 3 }}
          />

          <DataGrid
            rows={filteredStudents}
            columns={columns}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            autoHeight
            sx={{ border: "none", "& .MuiDataGrid-cell": { borderColor: "divider" }, "& .MuiDataGrid-columnHeaders": { bgcolor: "background.default", borderColor: "divider" } }}
          />
        </Box>
      </Paper>

      {/* Dialog Add/Edit Student */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingStudentId ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField fullWidth label="الاسم الكامل" value={studentForm.fullName} onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })} />
            <TextField fullWidth label="البريد الإلكتروني" type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} />
            <TextField fullWidth label="رقم الهاتف" value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>الدورة</InputLabel>
              <Select value={studentForm.courseId} label="الدورة" onChange={(e) => setStudentForm({ ...studentForm, courseId: e.target.value })}>
                {courses.map((course) => <MenuItem key={course.id} value={course.id}>{course.nameAr} - {course.price.toLocaleString()} د.ع</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleCreateOrEditStudent} variant="contained">{editingStudentId ? "تعديل" : "إضافة"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default StudentsPage
