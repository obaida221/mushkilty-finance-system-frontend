import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material'
import {
  People,
  Assignment,
  Security,
  Search,
  Add,
  TrendingUp,
  CheckCircle,
  Pending,
} from '@mui/icons-material'
import InnerNavBar from '../components/InnerNavBar'

const InnerNavTestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data for demonstration
  const stats = {
    users: { total: 3, active: 2, pending: 1 },
    roles: { total: 7, assigned: 5 },
    permissions: { total: 15, active: 12 },
  }

  // Define tabs
  const tabs = [
    {
      label: 'المستخدمين',
      value: 'users',
      icon: <People />,
      count: stats.users.total,
    },
    {
      label: 'الأدوار',
      value: 'roles',
      icon: <Assignment />,
      count: stats.roles.total,
    },
    {
      label: 'الصلاحيات',
      value: 'permissions',
      icon: <Security />,
      count: stats.permissions.total,
    },
  ]

  // Mock data for each tab
  const usersData = [
    { id: 1, name: 'Bootstrap Admin', email: 'admin@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Finance Manager', email: 'accountant@example.com', role: 'accountant', status: 'active' },
    { id: 3, name: 'Course Instructor', email: 'instructor@example.com', role: 'instructor', status: 'pending' },
  ]

  const rolesData = [
    { id: 1, name: 'Admin', users: 1, permissions: 15 },
    { id: 2, name: 'Accountant', users: 1, permissions: 8 },
    { id: 3, name: 'Instructor', users: 1, permissions: 5 },
  ]

  const permissionsData = [
    { id: 1, name: 'users.view', description: 'عرض المستخدمين', category: 'Users' },
    { id: 2, name: 'users.create', description: 'إنشاء مستخدمين', category: 'Users' },
    { id: 3, name: 'students.view', description: 'عرض الطلاب', category: 'Students' },
    { id: 4, name: 'payments.manage', description: 'إدارة المدفوعات', category: 'Payments' },
  ]

  const renderUsersContent = () => (
    <>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.users.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المستخدمين
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <People sx={{ color: 'white', fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.users.active}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    المستخدمين النشطين
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle sx={{ color: 'white', fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.users.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    قيد الانتظار
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Pending sx={{ color: 'white', fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users List */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="البحث في المستخدمين..."
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
        </Box>
        <Grid container spacing={2}>
          {usersData.map((user) => (
            <Grid item xs={12} key={user.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">{user.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip label={user.role} size="small" color="primary" />
                      <Chip
                        label={user.status === 'active' ? 'نشط' : 'قيد الانتظار'}
                        size="small"
                        color={user.status === 'active' ? 'success' : 'warning'}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </>
  )

  const renderRolesContent = () => (
    <>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.roles.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    الأدوار المتاحة
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'info.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Assignment sx={{ color: 'white', fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.roles.assigned}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    الأدوار المعينة
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUp sx={{ color: 'white', fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Roles List */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {rolesData.map((role) => (
            <Grid item xs={12} md={4} key={role.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {role.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      المستخدمين:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {role.users}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      الصلاحيات:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {role.permissions}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </>
  )

  const renderPermissionsContent = () => (
    <>
      {/* Stats Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.permissions.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي الصلاحيات
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'secondary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Security sx={{ color: 'white', fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.permissions.active}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    الصلاحيات النشطة
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle sx={{ color: 'white', fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Permissions List */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {permissionsData.map((permission) => (
            <Grid item xs={12} md={6} key={permission.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                        {permission.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {permission.description}
                      </Typography>
                    </Box>
                    <Chip label={permission.category} size="small" color="primary" variant="outlined" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </>
  )

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            إدارة المستخدمين والصلاحيات
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إدارة شاملة للمستخدمين والأدوار والصلاحيات في النظام
          </Typography>
        </Box>
        <Button variant="contained" color="error" startIcon={<Add />}>
          إضافة مستخدم
        </Button>
      </Box>

      {/* Inner Navigation Bar */}
      <InnerNavBar tabs={tabs} value={activeTab} onChange={setActiveTab} />

      {/* Content based on active tab */}
      {activeTab === 'users' && renderUsersContent()}
      {activeTab === 'roles' && renderRolesContent()}
      {activeTab === 'permissions' && renderPermissionsContent()}
    </Box>
  )
}

export default InnerNavTestPage
