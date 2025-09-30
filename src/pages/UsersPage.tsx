"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
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
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Edit, Delete, PersonAdd, AdminPanelSettings } from "@mui/icons-material"
import type { User, Role } from "../types"

// Mock data
const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    fullName: "أحمد محمد",
    roleId: "1",
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    username: "accountant",
    email: "accountant@example.com",
    fullName: "فاطمة علي",
    roleId: "2",
    isActive: true,
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    username: "teacher1",
    email: "teacher1@example.com",
    fullName: "محمود حسن",
    roleId: "3",
    isActive: true,
    createdAt: "2024-03-10",
  },
]

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Admin",
    nameAr: "مدير النظام",
    description: "صلاحيات كاملة للنظام",
    permissions: [],
  },
  {
    id: "2",
    name: "Accountant",
    nameAr: "محاسب",
    description: "إدارة المالية والطلاب",
    permissions: [],
  },
  {
    id: "3",
    name: "Teacher",
    nameAr: "مدرس",
    description: "عرض الدورات والطلاب",
    permissions: [],
  },
]

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const UsersPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [openUserDialog, setOpenUserDialog] = useState(false)
  const [openRoleDialog, setOpenRoleDialog] = useState(false)
  const [users] = useState<User[]>(mockUsers)
  const [roles] = useState<Role[]>(mockRoles)

  // User form state
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    roleId: "",
  })

  // Role form state
  const [roleForm, setRoleForm] = useState({
    name: "",
    nameAr: "",
    description: "",
  })

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleOpenUserDialog = () => {
    setUserForm({ username: "", email: "", fullName: "", password: "", roleId: "" })
    setOpenUserDialog(true)
  }

  const handleOpenRoleDialog = () => {
    setRoleForm({ name: "", nameAr: "", description: "" })
    setOpenRoleDialog(true)
  }

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false)
  }

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false)
  }

  const handleCreateUser = () => {
    // In production, this would call an API
    console.log("Creating user:", userForm)
    handleCloseUserDialog()
  }

  const handleCreateRole = () => {
    // In production, this would call an API
    console.log("Creating role:", roleForm)
    handleCloseRoleDialog()
  }

  const userColumns: GridColDef[] = [
    {
      field: "fullName",
      headerName: "الاسم الكامل",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "username",
      headerName: "اسم المستخدم",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "email",
      headerName: "البريد الإلكتروني",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "roleId",
      headerName: "الدور",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const role = roles.find((r) => r.id === params.value)
        return <Chip label={role?.nameAr || "غير محدد"} size="small" color="primary" />
      },
    },
    {
      field: "isActive",
      headerName: "الحالة",
      width: 100,
      renderCell: (params) => (
        <Chip label={params.value ? "نشط" : "غير نشط"} size="small" color={params.value ? "success" : "default"} />
      ),
    },
    {
      field: "createdAt",
      headerName: "تاريخ الإنشاء",
      width: 120,
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

  const roleColumns: GridColDef[] = [
    {
      field: "nameAr",
      headerName: "اسم الدور",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "name",
      headerName: "الاسم بالإنجليزية",
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

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredRoles = roles.filter(
    (role) =>
      role.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          إدارة المستخدمين والأدوار
        </Typography>
        <Button
          variant="contained"
          startIcon={tabValue === 0 ? <PersonAdd /> : <AdminPanelSettings />}
          onClick={tabValue === 0 ? handleOpenUserDialog : handleOpenRoleDialog}
        >
          {tabValue === 0 ? "إضافة مستخدم" : "إضافة دور"}
        </Button>
      </Box>

      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tab label="المستخدمين" />
          <Tab label="الأدوار" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder={tabValue === 0 ? "البحث عن مستخدم..." : "البحث عن دور..."}
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

          <TabPanel value={tabValue} index={0}>
            <DataGrid
              rows={filteredUsers}
              columns={userColumns}
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
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <DataGrid
              rows={filteredRoles}
              columns={roleColumns}
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
          </TabPanel>
        </Box>
      </Paper>

      {/* Create User Dialog */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة مستخدم جديد</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="الاسم الكامل"
              value={userForm.fullName}
              onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
            />
            <TextField
              fullWidth
              label="اسم المستخدم"
              value={userForm.username}
              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
            />
            <TextField
              fullWidth
              label="البريد الإلكتروني"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="كلمة المرور"
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>الدور</InputLabel>
              <Select
                value={userForm.roleId}
                label="الدور"
                onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.nameAr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>إلغاء</Button>
          <Button onClick={handleCreateUser} variant="contained">
            إضافة
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة دور جديد</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="اسم الدور بالعربية"
              value={roleForm.nameAr}
              onChange={(e) => setRoleForm({ ...roleForm, nameAr: e.target.value })}
            />
            <TextField
              fullWidth
              label="اسم الدور بالإنجليزية"
              value={roleForm.name}
              onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="الوصف"
              multiline
              rows={3}
              value={roleForm.description}
              onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>إلغاء</Button>
          <Button onClick={handleCreateRole} variant="contained">
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UsersPage
