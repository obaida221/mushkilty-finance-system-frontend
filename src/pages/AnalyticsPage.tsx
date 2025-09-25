"use client"

import { useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Users, BookOpen, Calendar, Download } from "lucide-react"

// Mock analytics data
const revenueData = [
  { month: "Jan", revenue: 45000, expenses: 12000, profit: 33000 },
  { month: "Feb", revenue: 52000, expenses: 15000, profit: 37000 },
  { month: "Mar", revenue: 48000, expenses: 13000, profit: 35000 },
  { month: "Apr", revenue: 61000, expenses: 18000, profit: 43000 },
  { month: "May", revenue: 55000, expenses: 16000, profit: 39000 },
  { month: "Jun", revenue: 67000, expenses: 20000, profit: 47000 },
]

const enrollmentData = [
  { month: "Jan", students: 120, courses: 8 },
  { month: "Feb", students: 145, courses: 10 },
  { month: "Mar", students: 132, courses: 9 },
  { month: "Apr", students: 168, courses: 12 },
  { month: "May", students: 155, courses: 11 },
  { month: "Jun", students: 189, courses: 14 },
]

const courseDistribution = [
  { name: "Programming", value: 35, color: "#DC2626" },
  { name: "Design", value: 25, color: "#EA580C" },
  { name: "Business", value: 20, color: "#D97706" },
  { name: "Marketing", value: 12, color: "#CA8A04" },
  { name: "Other", value: 8, color: "#65A30D" },
]

const paymentMethods = [
  { name: "Credit Card", value: 45, color: "#DC2626" },
  { name: "Bank Transfer", value: 30, color: "#EA580C" },
  { name: "PayPal", value: 15, color: "#D97706" },
  { name: "Cash", value: 10, color: "#CA8A04" },
]

const teacherPerformance = [
  { name: "Dr. Smith", students: 45, revenue: 22500, rating: 4.8 },
  { name: "Prof. Johnson", students: 38, revenue: 19000, rating: 4.6 },
  { name: "Ms. Davis", students: 42, revenue: 21000, rating: 4.7 },
  { name: "Mr. Brown", students: 35, revenue: 17500, rating: 4.5 },
  { name: "Dr. Wilson", students: 29, revenue: 14500, rating: 4.4 },
]

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6months")
  const [reportType, setReportType] = useState("overview")

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalExpenses = revenueData.reduce((sum, item) => sum + item.expenses, 0)
  const totalProfit = totalRevenue - totalExpenses
  const totalStudents = enrollmentData[enrollmentData.length - 1].students
  const totalCourses = enrollmentData[enrollmentData.length - 1].courses

  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1)
  const avgRevenuePerStudent = Math.round(totalRevenue / totalStudents)

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
            <p className="text-muted-foreground">Comprehensive business insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12.5% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +8.2% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Margin: {profitMargin}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +15.8% growth
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCourses}</div>
              <p className="text-xs text-muted-foreground">Avg. 13.5 students/course</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Revenue/Student</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgRevenuePerStudent}</div>
              <p className="text-xs text-muted-foreground">Per student value</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Expenses Trend</CardTitle>
              <CardDescription>Monthly financial performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#DC2626"
                    fill="#DC2626"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2"
                    stroke="#EA580C"
                    fill="#EA580C"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Enrollment Growth</CardTitle>
              <CardDescription>Monthly student and course enrollment trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="students" stroke="#DC2626" strokeWidth={3} />
                  <Line type="monotone" dataKey="courses" stroke="#EA580C" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Course Distribution</CardTitle>
              <CardDescription>Enrollment by course category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={courseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {courseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {courseDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Revenue breakdown by payment type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {paymentMethods.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Teacher Performance</CardTitle>
              <CardDescription>Top performing teachers by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacherPerformance.map((teacher, index) => (
                  <div key={teacher.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-red-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{teacher.name}</div>
                        <div className="text-sm text-muted-foreground">{teacher.students} students</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${teacher.revenue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">★ {teacher.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Profit Analysis</CardTitle>
            <CardDescription>Detailed breakdown of monthly profit margins</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                <Bar dataKey="revenue" fill="#DC2626" name="Revenue" />
                <Bar dataKey="expenses" fill="#EA580C" name="Expenses" />
                <Bar dataKey="profit" fill="#16A34A" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
