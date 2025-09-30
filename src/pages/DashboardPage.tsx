"use client"

import React from "react"

import type { ReactElement } from "react"
import { Box, Typography, Grid, Card, CardContent, Paper } from "@mui/material"
import { TrendingUp, TrendingDown, School, AccountBalance } from "@mui/icons-material"
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
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Mock data for charts
const revenueData = [
  { month: "يناير", income: 45000, expenses: 28000 },
  { month: "فبراير", income: 52000, expenses: 31000 },
  { month: "مارس", income: 48000, expenses: 29000 },
  { month: "أبريل", income: 61000, expenses: 34000 },
  { month: "مايو", income: 55000, expenses: 32000 },
  { month: "يونيو", income: 67000, expenses: 38000 },
]

const studentEnrollmentData = [
  { month: "يناير", students: 45 },
  { month: "فبراير", students: 52 },
  { month: "مارس", students: 48 },
  { month: "أبريل", students: 61 },
  { month: "مايو", students: 58 },
  { month: "يونيو", students: 67 },
]

const courseDistributionData = [
  { name: "البرمجة", value: 35, color: "#DC2626" },
  { name: "التصميم", value: 25, color: "#F59E0B" },
  { name: "التسويق", value: 20, color: "#10B981" },
  { name: "الإدارة", value: 20, color: "#3B82F6" },
]

const paymentMethodData = [
  { method: "نقدي", amount: 45000 },
  { method: "بطاقة", amount: 32000 },
  { method: "تحويل", amount: 28000 },
  { method: "أونلاين", amount: 15000 },
]

interface StatCardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: ReactElement
  color: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon, color }) => {
  return (
    <Card>
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

const DashboardPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        لوحة التحكم
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="إجمالي الدخل"
            value="67,000 د.ع"
            change="+12.5%"
            isPositive={true}
            icon={<TrendingUp />}
            color="#10B981"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="إجمالي المصروفات"
            value="38,000 د.ع"
            change="+8.2%"
            isPositive={false}
            icon={<TrendingDown />}
            color="#EF4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="الطلاب النشطين"
            value="67"
            change="+15.8%"
            isPositive={true}
            icon={<School />}
            color="#3B82F6"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="صافي الربح"
            value="29,000 د.ع"
            change="+18.3%"
            isPositive={true}
            icon={<AccountBalance />}
            color="#DC2626"
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              الدخل والمصروفات
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="الدخل" />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="المصروفات" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              توزيع الدورات
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={courseDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {courseDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              تسجيل الطلاب الشهري
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentEnrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="students" fill="#DC2626" name="الطلاب" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              طرق الدفع
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethodData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" stroke="#94A3B8" />
                <YAxis dataKey="method" type="category" stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="amount" fill="#3B82F6" name="المبلغ" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage
