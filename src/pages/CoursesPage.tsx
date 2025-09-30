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
import { Search, Edit, Delete, Add, Class, Person, School } from "@mui/icons-material"
import type { Course, Teacher } from "../types"

// Mock data
const mockTeachers: Teacher[] = [
  {
    id: "1",
    fullName: "د. محمد أحمد",
    email: "mohamed@example.com",
    phone: "07701111111",
    specialization: "البرمجة",
    salary: 1000000,
    status: "active",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    fullName: "د. فاطمة علي",
    email: "fatima@example.com",
    phone: "07702222222",
    specialization: "التصميم",
    salary: 900000,
    status: "active",
    createdAt: "2024-01-01",
  },
]

const mockCourses: Course[] = [
  {
    id: "1",
    name: "Programming",
    nameAr: "البرمجة",
    description: "دورة برمجة متقدمة تشمل JavaScript, React, Node.js",
    price: 500000,
    duration: 6,
    teacherId: "1",
    enrolledCount: 35,
    status: "active",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Design",
    nameAr: "التصميم",
    description: "دورة تصميم جرافيك وUI/UX",
    price: 400000,
    duration: 4,
    teacherId: "2",
    enrolledCount: 25,
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    name: "Marketing",
    nameAr: "التسويق",
    description: "دورة التسويق الرقمي ووسائل التواصل الاجتماعي",
    price: 350000,
    duration: 3,
    teacherId: null,
    enrolledCount: 20,
    status: "active",
    createdAt: "2024-02-01",
  },
]

const CoursesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [courses] = useState<Course[]>(mockCourses)
  const [teachers] = useState<Teacher[]>(mockTeachers)

  const [courseForm, setCourseForm] = useState({
    nameAr: "",
    name: "",
    description: "",
    price: "",
    duration: "",
    teacherId: "",
  })

  const handleOpenDialog = () => {
    setCourseForm({ nameAr: "", name: "", description: "", price: "", duration: "", teacherId: "" })
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleCreateCourse = () => {
    console.log("Creating course:", courseForm)
    handleCloseDialog()
  }

  const columns: GridColDef[] = [
    {
      field: "nameAr",
      headerName: "اسم الدورة",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "description",
      headerName: "الوصف",
      flex: 2,
      minWidth: 200,
    },
    {
      field: "price",
      headerName: "السعر",
      width: 130,
      renderCell: (params) => `${params.value.toLocaleString()} د.ع`,
    },
    {
      field: "duration",
      headerName: "المدة",
      width: 100,
      renderCell: (params) => `${params.value} أشهر`,
    },
    {
      field: "teacherId",
      headerName: "المدرس",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const teacher = teachers.find((t) => t.id === params.value)
        return teacher ? (
          <Chip label={teacher.fullName} size="small" color="secondary" />
        ) : (
          <Chip label="غير محدد" size="small" />
        )
      },
    },
    {
      field: "enrolledCount",
      headerName: "عدد الطلاب",
      width: 110,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "status",
      headerName: "الحالة",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value === "active" ? "نشط" : "غير نشط"}
          size="small"
          color={params.value === "active" ? "success" : "default"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "الإجراءات",
      width: 120,
      sortable: false,
      renderCell: () => (
        <Box>
          <IconButton size="small" color="primary">
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error">
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ]

  const filteredCourses = courses.filter(
    (course) =>
      course.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalCourses = courses.length
  const activeCourses = courses.filter((c) => c.status === "active").length
  const totalStudents = courses.reduce((sum, c) => sum + c.enrolledCount, 0)
  const totalRevenue = courses.reduce((sum, c) => sum + c.price * c.enrolledCount, 0)

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          إدارة الدورات
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          إضافة دورة
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "primary.main", p: 1.5, borderRadius: 2 }}>
                  <Class sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي الدورات
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {totalCourses}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "success.main", p: 1.5, borderRadius: 2 }}>
                  <Class sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    الدورات النشطة
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {activeCourses}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "info.main", p: 1.5, borderRadius: 2 }}>
                  <School sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي الطلاب
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {totalStudents}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "warning.main", p: 1.5, borderRadius: 2 }}>
                  <Person sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    الإيرادات المتوقعة
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {totalRevenue.toLocaleString()} د.ع
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="البحث عن دورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <DataGrid
            rows={filteredCourses}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": {
                borderColor: "divider",
              },
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "background.default",
                borderColor: "divider",
              },
            }}
          />
        </Box>
      </Paper>

      {/* Create Course Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>إضافة دورة جديدة</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="اسم الدورة بالعربية"
                  value={courseForm.nameAr}
                  onChange={(e) => setCourseForm({ ...courseForm, nameAr: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="اسم الدورة بالإنجليزية"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="الوصف"
              multiline
              rows={3}
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="السعر (دينار عراقي)"
                  type="number"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="المدة (بالأشهر)"
                  type="number"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>المدرس</InputLabel>
                  <Select
                    value={courseForm.teacherId}
                    label="المدرس"
                    onChange={(e) => setCourseForm({ ...courseForm, teacherId: e.target.value })}
                  >
                    <MenuItem value="">غير محدد</MenuItem>
                    {teachers.map((teacher) => (
                      <MenuItem key={teacher.id} value={teacher.id}>
                        {teacher.fullName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleCreateCourse} variant="contained">
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CoursesPage
