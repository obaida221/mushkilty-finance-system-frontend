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
  Grid,
  Card,
  CardContent,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Edit, Delete, PersonAdd, Person, AccountBalance } from "@mui/icons-material"
import type { Teacher } from "../types"

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
  {
    id: "3",
    fullName: "د. حسن محمود",
    email: "hassan@example.com",
    phone: "07703333333",
    specialization: "التسويق",
    salary: 850000,
    status: "active",
    createdAt: "2024-01-15",
  },
]

const TeachersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [teachers] = useState<Teacher[]>(mockTeachers)

  const [teacherForm, setTeacherForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    salary: "",
  })

  const handleOpenDialog = () => {
    setTeacherForm({ fullName: "", email: "", phone: "", specialization: "", salary: "" })
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleCreateTeacher = () => {
    console.log("Creating teacher:", teacherForm)
    handleCloseDialog()
  }

  const columns: GridColDef[] = [
    {
      field: "fullName",
      headerName: "اسم المدرس",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "email",
      headerName: "البريد الإلكتروني",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "phone",
      headerName: "رقم الهاتف",
      width: 130,
    },
    {
      field: "specialization",
      headerName: "التخصص",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "salary",
      headerName: "الراتب",
      width: 130,
      renderCell: (params) => `${params.value.toLocaleString()} د.ع`,
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

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.specialization.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeTeachers = teachers.filter((t) => t.status === "active").length
  const totalSalaries = teachers.reduce((sum, t) => sum + t.salary, 0)

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          إدارة المدرسين
        </Typography>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={handleOpenDialog}>
          إضافة مدرس
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "primary.main", p: 1.5, borderRadius: 2 }}>
                  <Person sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المدرسين
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {teachers.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "success.main", p: 1.5, borderRadius: 2 }}>
                  <Person sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    المدرسين النشطين
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {activeTeachers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "error.main", p: 1.5, borderRadius: 2 }}>
                  <AccountBalance sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي الرواتب الشهرية
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {totalSalaries.toLocaleString()} د.ع
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
            placeholder="البحث عن مدرس..."
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
            rows={filteredTeachers}
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

      {/* Create Teacher Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة مدرس جديد</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="الاسم الكامل"
              value={teacherForm.fullName}
              onChange={(e) => setTeacherForm({ ...teacherForm, fullName: e.target.value })}
            />
            <TextField
              fullWidth
              label="البريد الإلكتروني"
              type="email"
              value={teacherForm.email}
              onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="رقم الهاتف"
              value={teacherForm.phone}
              onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
            />
            <TextField
              fullWidth
              label="التخصص"
              value={teacherForm.specialization}
              onChange={(e) => setTeacherForm({ ...teacherForm, specialization: e.target.value })}
            />
            <TextField
              fullWidth
              label="الراتب الشهري (دينار عراقي)"
              type="number"
              value={teacherForm.salary}
              onChange={(e) => setTeacherForm({ ...teacherForm, salary: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleCreateTeacher} variant="contained">
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TeachersPage
