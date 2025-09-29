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
  { month: "يناير", revenue: 45000, expenses: 32000 },
  { month: "فبراير", revenue: 52000, expenses: 35000 },
  { month: "مارس", revenue: 48000, expenses: 33000 },
  { month: "أبريل", revenue: 61000, expenses: 38000 },
  { month: "مايو", revenue: 55000, expenses: 36000 },
  { month: "يونيو", revenue: 67000, expenses: 41000 },
]

const enrollmentData = [
  { month: "يناير", students: 120 },
  { month: "فبراير", students: 135 },
  { month: "مارس", students: 142 },
  { month: "أبريل", students: 158 },
  { month: "مايو", students: 165 },
  { month: "يونيو", students: 178 },
]

const courseDistribution = [
  { name: "الرياضيات", value: 45, color: "#DC2626" },
  { name: "العلوم", value: 35, color: "#EF4444" },
  { name: "اللغة الإنجليزية", value: 25, color: "#F87171" },
  { name: "التاريخ", value: 20, color: "#FCA5A5" },
  { name: "الفنون", value: 15, color: "#FECACA" },
]

export function DashboardPage() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground">نظرة عامة على نظام إدارة الشؤون المالية</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="إجمالي الإيرادات"
            value="328,000 ر.س"
            change="+12.5% من الشهر الماضي"
            changeType="positive"
            icon={DollarSign}
          />
          <StatCard
            title="إجمالي الطلاب"
            value="178"
            change="+8 طلاب جدد هذا الشهر"
            changeType="positive"
            icon={GraduationCap}
          />
          <StatCard
            title="الدورات النشطة"
            value="12"
            change="دورتان تبدآن الشهر القادم"
            changeType="neutral"
            icon={BookOpen}
          />
          <StatCard
            title="المدفوعات المعلقة"
            value="15,240 ر.س"
            change="23 فاتورة معلقة"
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
                الإيرادات مقابل المصروفات
              </CardTitle>
              <CardDescription>مقارنة شهرية للدخل والمصروفات</CardDescription>
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
                تسجيل الطلاب
              </CardTitle>
              <CardDescription>نمو تسجيل الطلاب الشهري</CardDescription>
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
                توزيع الدورات
              </CardTitle>
              <CardDescription>الطلاب المسجلون حسب الدورة</CardDescription>
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
                المعاملات الأخيرة
              </CardTitle>
              <CardDescription>آخر الأنشطة المالية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: "دفعة",
                    student: "أحمد محمد",
                    amount: "1,200 ر.س",
                    course: "الرياضيات",
                    time: "منذ ساعتين",
                  },
                  { type: "مصروف", description: "مستلزمات مكتبية", amount: "-340 ر.س", time: "منذ 4 ساعات" },
                  { type: "استرداد", student: "سارة أحمد", amount: "-800 ر.س", course: "العلوم", time: "منذ يوم" },
                  {
                    type: "دفعة",
                    student: "محمد علي",
                    amount: "1,500 ر.س",
                    course: "اللغة الإنجليزية",
                    time: "منذ يومين",
                  },
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
