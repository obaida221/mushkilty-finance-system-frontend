"use client"

import React from "react"
import { Box, Typography, Grid, Card, CardContent, Paper, Alert, CircularProgress, IconButton, Tooltip } from "@mui/material"
import { TrendingUp, TrendingDown, School, AccountBalance, Refresh } from "@mui/icons-material"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useDashboard } from '../hooks/useDashboard'
import ProtectedRoute from '../components/ProtectedRoute'
import DashboardErrorBoundary from '../components/DashboardErrorBoundary'

interface StatCardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: React.ReactElement
  color: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon, color }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: `${color}20`,
              p: 1.5,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 28, color } })}
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {isPositive ? (
            <TrendingUp sx={{ fontSize: 18, color: "success.main" }} />
          ) : (
            <TrendingDown sx={{ fontSize: 18, color: "error.main" }} />
          )}
          <Typography variant="body2" color={isPositive ? "success.main" : "error.main"}>
            {change}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            من الشهر الماضي
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

// Dashboard Content Component
const DashboardContent: React.FC = () => {
  const { data, loading, error, lastUpdated, refresh } = useDashboard({
    months: 6,
    activityLimit: 10,
    autoRefresh: true,
    refreshInterval: 300000 // 5 minutes
  });

  if (loading && !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          جاري تحميل لوحة التحكم...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        <Typography variant="h6">خطأ في تحميل البيانات</Typography>
        <Typography variant="body2">{error}</Typography>
        <Box sx={{ mt: 2 }}>
          <IconButton onClick={refresh} color="primary">
            <Refresh />
          </IconButton>
        </Box>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="warning" sx={{ m: 3 }}>
        <Typography>لا توجد بيانات متاحة</Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          لوحة التحكم
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          {lastUpdated && (
            <Typography variant="body2" color="text.secondary">
              آخر تحديث: {lastUpdated.toLocaleTimeString('ar-IQ')}
            </Typography>
          )}
          <Tooltip title="تحديث البيانات">
            <IconButton onClick={refresh} color="primary" disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="إجمالي الدخل"
            value={`${data.stats.totalIncome.toLocaleString()} د.ع`}
            change={data.stats.incomeChange}
            isPositive={data.stats.incomeChange.includes('+')}
            icon={<TrendingUp />}
            color="#10B981"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="إجمالي المصروفات"
            value={`${data.stats.totalExpenses.toLocaleString()} د.ع`}
            change={data.stats.expensesChange}
            isPositive={!data.stats.expensesChange.includes('+')}
            icon={<TrendingDown />}
            color="#EF4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="الطلاب النشطين"
            value={data.stats.activeStudents.toString()}
            change={data.stats.studentsChange}
            isPositive={data.stats.studentsChange.includes('+')}
            icon={<School />}
            color="#3B82F6"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="صافي الربح"
            value={`${data.stats.netProfit.toLocaleString()} د.ع`}
            change={data.stats.profitChange}
            isPositive={data.stats.profitChange.includes('+')}
            icon={<AccountBalance />}
            color="#DC2626"
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6} dir="ltr">
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }} dir="rtl">
              الدخل والمصروفات
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.charts.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 15 }}/>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    color: "#94A3B8",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    direction: "rtl",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="الدخل" />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="المصروفات" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6} dir="ltr">
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }} dir="rtl">
              توزيع الدورات
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.charts.courseDistribution as any}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.charts.courseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#c0c8d3bb",
                    border: "1px solid #556377",
                    borderRadius: "8px",
                    direction: "rtl",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} dir="ltr">
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }} dir="rtl">
              تسجيل الطلاب الشهري
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.charts.enrollment}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 15 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    color: "#94A3B8",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    direction: "rtl",
                  }}
                />
                <Bar dataKey="students" fill="#DC2626" name="الطلاب" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }} dir="rtl">
              طرق الدفع
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.charts.paymentMethods} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" stroke="#94A3B8" />
                <YAxis dataKey="method" type="category" stroke="#94A3B8" tick={{ fontSize: 15 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    color: "#94A3B8",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    direction: "rtl",
                  }}
                />
                <Bar dataKey="amount" fill="#3B82F6" name="المبلغ" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            الأنشطة الحديثة
          </Typography>
          {data.recentActivities.length > 0 ? (
            <Box>
              {data.recentActivities.slice(0, 5).map((activity, index) => (
                <Box 
                  key={activity.id} 
                  sx={{ 
                    p: 2, 
                    borderBottom: index < 4 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {activity.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(activity.date).toLocaleDateString('ar-IQ')}
                    </Typography>
                  </Box>
                  {activity.amount && (
                    <Typography variant="body1" fontWeight={600} color="primary.main">
                      {activity.amount.toLocaleString()} د.ع
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              لا توجد أنشطة حديثة
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  )
}

// Main Dashboard Page with Protection
const DashboardPage: React.FC = () => {
  return (
    <DashboardErrorBoundary>
      <ProtectedRoute 
        requiredPermission="dashboard:read"
        showAccessDenied={true}
      >
        <DashboardContent />
      </ProtectedRoute>
    </DashboardErrorBoundary>
  )
}

export default DashboardPage
