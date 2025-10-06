"use client"

import type React from "react"
import { Box, Typography, Paper, Grid, Card, CardContent } from "@mui/material"
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
import { TrendingUp, TrendingDown, School, AccountBalance } from "@mui/icons-material"

// Mock data
const monthlyRevenueData = [
  { month: "يناير", income: 2500000, expenses: 1800000, profit: 700000 },
  { month: "فبراير", income: 2800000, expenses: 1900000, profit: 900000 },
  { month: "مارس", income: 3200000, expenses: 2100000, profit: 1100000 },
  { month: "أبريل", income: 3000000, expenses: 2000000, profit: 1000000 },
  { month: "مايو", income: 3500000, expenses: 2200000, profit: 1300000 },
  { month: "يونيو", income: 3800000, expenses: 2400000, profit: 1400000 },
]

const courseRevenueData = [
  { name: "البرمجة", revenue: 17500000, color: "#DC2626" },
  { name: "التصميم", revenue: 10000000, color: "#F59E0B" },
  { name: "التسويق", revenue: 7000000, color: "#10B981" },
  { name: "الإدارة", revenue: 5500000, color: "#3B82F6" },
]

const expenseCategoryData = [
  { category: "الرواتب", amount: 8500000 },
  { category: "الإيجار", amount: 3000000 },
  { category: "المرافق", amount: 900000 },
  { category: "المستلزمات", amount: 450000 },
  { category: "التسويق", amount: 600000 },
  { category: "أخرى", amount: 350000 },
]

const AnalyticsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }} dir="rtl">
        التحليلات والتقارير
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "success.main", p: 1.5, borderRadius: 2 }}>
                  <TrendingUp sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي الإيرادات
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    40,000,000 د.ع
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
                <Box sx={{ bgcolor: "error.main", p: 1.5, borderRadius: 2 }}>
                  <TrendingDown sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المصروفات
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    13,800,000 د.ع
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
                <Box sx={{ bgcolor: "primary.main", p: 1.5, borderRadius: 2 }}>
                  <AccountBalance sx={{ color: "white" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    صافي الربح
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    26,200,000 د.ع
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
                    معدل الربح
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    65.5%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} dir="ltr">
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }} dir="rtl">
              تحليل الإيرادات والمصروفات الشهرية
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8"  tick={{ fontSize: 15, angle: 0 ,textAnchor: 'start'}}/>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#F1F1F1",
                    color: "#94A3B8",
                    // border: "1px solid #334155",
                    borderRadius: "8px",
                    direction: "rtl",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#1E293B" strokeWidth={2} name="الدخل" />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="المصروفات" />
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="الربح" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }} dir="rtl">
              إيرادات الدورات
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={courseRevenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {courseRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#94A3B8bb",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    direction: "rtl",
                  }}
                  formatter={(value: number) => `${value.toLocaleString()} د.ع`}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }} dir="rtl">
              توزيع المصروفات
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseCategoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B"  />
                <XAxis type="number" stroke="#94A3B8" />
                <YAxis dataKey="category" type="category" stroke="#94A3B8" width={80} tick={{ fontSize: 15, angle: 0 ,textAnchor: 'start' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    color: "#94A3B8",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    direction: "rtl",
                  }}
                  formatter={(value: number) => `${value.toLocaleString()} د.ع`}
                />
                <Bar dataKey="amount" fill="#EF4444" name="المبلغ" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AnalyticsPage
