import { Layout } from "@/components/layout/Layout"
import { StatCard } from "@/components/ui/StatCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { DollarSign, TrendingUp, Users, GraduationCap, BookOpen, CreditCard, Wallet } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock data for charts
const revenueData = [
  { month: "Jan", revenue: 45000, expenses: 32000 },
  { month: "Feb", revenue: 52000, expenses: 35000 },
  { month: "Mar", revenue: 48000, expenses: 33000 },
  { month: "Apr", revenue: 61000, expenses: 38000 },
  { month: "May", revenue: 55000, expenses: 36000 },
  { month: "Jun", revenue: 67000, expenses: 41000 },
]

const enrollmentData = [
  { month: "Jan", students: 120 },
  { month: "Feb", students: 135 },
  { month: "Mar", students: 142 },
  { month: "Apr", students: 158 },
  { month: "May", students: 165 },
  { month: "Jun", students: 178 },
]

const courseDistribution = [
  { name: "Mathematics", value: 45, color: "#DC2626" },
  { name: "Science", value: 35, color: "#EF4444" },
  { name: "English", value: 25, color: "#F87171" },
  { name: "History", value: 20, color: "#FCA5A5" },
  { name: "Arts", value: 15, color: "#FECACA" },
]

export function DashboardPage() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your finance management system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value="$328,000"
            change="+12.5% from last month"
            changeType="positive"
            icon={DollarSign}
          />
          <StatCard
            title="Total Students"
            value="178"
            change="+8 new this month"
            changeType="positive"
            icon={GraduationCap}
          />
          <StatCard
            title="Active Courses"
            value="12"
            change="2 starting next month"
            changeType="neutral"
            icon={BookOpen}
          />
          <StatCard
            title="Pending Payments"
            value="$15,240"
            change="23 invoices pending"
            changeType="negative"
            icon={CreditCard}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue vs Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Revenue vs Expenses
              </CardTitle>
              <CardDescription>Monthly comparison of income and expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-muted-foreground" fontSize={12} />
                  <YAxis className="text-muted-foreground" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
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
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Student Enrollment Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Student Enrollment
              </CardTitle>
              <CardDescription>Monthly student enrollment growth</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-muted-foreground" fontSize={12} />
                  <YAxis className="text-muted-foreground" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="#DC2626"
                    strokeWidth={3}
                    dot={{ fill: "#DC2626", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Course Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Course Distribution
              </CardTitle>
              <CardDescription>Students enrolled by course</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={courseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {courseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: "Payment",
                    student: "John Smith",
                    amount: "$1,200",
                    course: "Mathematics",
                    time: "2 hours ago",
                  },
                  { type: "Expense", description: "Office Supplies", amount: "-$340", time: "4 hours ago" },
                  { type: "Refund", student: "Sarah Johnson", amount: "-$800", course: "Science", time: "1 day ago" },
                  { type: "Payment", student: "Mike Wilson", amount: "$1,500", course: "English", time: "2 days ago" },
                ].map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {transaction.type}
                        {transaction.student && ` - ${transaction.student}`}
                        {transaction.description && ` - ${transaction.description}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.course && `${transaction.course} • `}
                        {transaction.time}
                      </p>
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        transaction.amount.startsWith("-") ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
