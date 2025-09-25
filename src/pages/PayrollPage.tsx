"use client"

import { useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Plus, Search, Edit, DollarSign, Calendar, Users, TrendingUp } from "lucide-react"
import type { PayrollRecord } from "@/types/payroll"

// Mock data
const mockPayrollRecords: PayrollRecord[] = [
  {
    id: "1",
    teacherId: "1",
    teacherName: "Dr. Smith",
    baseSalary: 5000,
    bonuses: 500,
    deductions: 200,
    totalAmount: 5300,
    payPeriod: "2024-01",
    payDate: "2024-01-31",
    status: "paid",
    transactionId: "11",
    createdBy: "admin",
    createdAt: "2024-01-25T10:00:00Z",
    updatedAt: "2024-01-31T15:30:00Z",
  },
  {
    id: "2",
    teacherId: "2",
    teacherName: "Prof. Johnson",
    baseSalary: 4500,
    bonuses: 300,
    deductions: 150,
    totalAmount: 4650,
    payPeriod: "2024-01",
    payDate: "2024-01-31",
    status: "paid",
    transactionId: "12",
    createdBy: "admin",
    createdAt: "2024-01-25T10:00:00Z",
    updatedAt: "2024-01-31T15:30:00Z",
  },
  {
    id: "3",
    teacherId: "3",
    teacherName: "Ms. Davis",
    baseSalary: 4000,
    bonuses: 200,
    deductions: 100,
    totalAmount: 4100,
    payPeriod: "2024-02",
    payDate: "2024-02-29",
    status: "processed",
    transactionId: "13",
    createdBy: "admin",
    createdAt: "2024-02-25T10:00:00Z",
    updatedAt: "2024-02-28T14:20:00Z",
  },
  {
    id: "4",
    teacherId: "4",
    teacherName: "Mr. Brown",
    baseSalary: 3800,
    bonuses: 0,
    deductions: 80,
    totalAmount: 3720,
    payPeriod: "2024-02",
    payDate: "2024-02-29",
    status: "pending",
    createdBy: "admin",
    createdAt: "2024-02-25T10:00:00Z",
    updatedAt: "2024-02-25T10:00:00Z",
  },
]

export function PayrollPage() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(mockPayrollRecords)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [periodFilter, setPeriodFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null)

  const filteredRecords = payrollRecords.filter((record) => {
    const matchesSearch =
      record.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.teacherId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    const matchesPeriod = periodFilter === "all" || record.payPeriod === periodFilter

    return matchesSearch && matchesStatus && matchesPeriod
  })

  const totalPayroll = payrollRecords.reduce((sum, record) => sum + record.totalAmount, 0)
  const paidRecords = payrollRecords.filter((r) => r.status === "paid")
  const pendingRecords = payrollRecords.filter((r) => r.status === "pending")
  const processedRecords = payrollRecords.filter((r) => r.status === "processed")

  const uniquePeriods = [...new Set(payrollRecords.map((r) => r.payPeriod))].sort().reverse()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "processed":
        return "secondary"
      case "pending":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payroll</h1>
            <p className="text-muted-foreground">Manage teacher salaries and payments</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Process Payroll
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalPayroll.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{payrollRecords.length} records</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paidRecords.length}</div>
              <p className="text-xs text-muted-foreground">
                ${paidRecords.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingRecords.length}</div>
              <p className="text-xs text-muted-foreground">
                ${pendingRecords.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(payrollRecords.map((r) => r.teacherId)).size}</div>
              <p className="text-xs text-muted-foreground">Active payroll</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Records</CardTitle>
            <CardDescription>Track teacher salary payments and processing</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
                <option value="paid">Paid</option>
              </Select>
              <Select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
                <option value="all">All Periods</option>
                {uniquePeriods.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </Select>
            </div>

            {/* Payroll Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Bonuses</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.teacherName}</div>
                        <div className="text-sm text-muted-foreground">ID: {record.teacherId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${record.baseSalary.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">+${record.bonuses.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-red-600">-${record.deductions.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold">${record.totalAmount.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.payPeriod}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(record.status)}>{record.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {record.status === "pending" && (
                          <Button variant="ghost" size="sm">
                            Process
                          </Button>
                        )}
                        {record.status === "processed" && (
                          <Button variant="ghost" size="sm">
                            Pay
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
