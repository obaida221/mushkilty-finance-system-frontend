"use client"

import React, { useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Plus, Search, Edit, Trash2, CreditCard, DollarSign, Calendar, Receipt } from "lucide-react"
import type { Payment } from "@/types/finance"

// Mock data
const mockPayments: Payment[] = [
  {
    id: "1",
    studentId: "1",
    studentName: "John Smith",
    courseId: "1",
    courseName: "Advanced Mathematics",
    amount: 1200,
    paymentMethod: "card",
    transactionId: "1",
    status: "completed",
    date: "2024-01-15",
    description: "Course fee payment",
    receiptNumber: "RCP-001",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    studentId: "2",
    studentName: "Sarah Wilson",
    courseId: "2",
    courseName: "Physics Fundamentals",
    amount: 400,
    paymentMethod: "bank_transfer",
    transactionId: "3",
    status: "completed",
    date: "2024-01-13",
    description: "Partial payment",
    receiptNumber: "RCP-002",
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
  },
  {
    id: "3",
    studentId: "3",
    studentName: "Mike Johnson",
    courseId: "1",
    courseName: "Advanced Mathematics",
    amount: 600,
    paymentMethod: "cash",
    transactionId: "6",
    status: "pending",
    date: "2024-01-10",
    description: "Installment payment",
    receiptNumber: "RCP-003",
    createdAt: "2024-01-10T14:20:00Z",
    updatedAt: "2024-01-10T14:20:00Z",
  },
]

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesMethod = methodFilter === "all" || payment.paymentMethod === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const completedPayments = payments.filter((p) => p.status === "completed")
  const pendingPayments = payments.filter((p) => p.status === "pending")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-4 w-4" />
      case "cash":
        return <DollarSign className="h-4 w-4" />
      case "bank_transfer":
        return <Receipt className="h-4 w-4" />
      default:
        return <Receipt className="h-4 w-4" />
    }
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payments</h1>
            <p className="text-muted-foreground">Record and track student payments</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPayments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{payments.length} transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedPayments.length}</div>
              <p className="text-xs text-muted-foreground">
                ${completedPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingPayments.length}</div>
              <p className="text-xs text-muted-foreground">
                ${pendingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${payments.length > 0 ? Math.round(totalPayments / payments.length).toLocaleString() : 0}
              </div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Records</CardTitle>
            <CardDescription>Track and manage student payments</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </Select>
              <Select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
              </Select>
            </div>

            {/* Payments Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-medium">{payment.receiptNumber}</div>
                      <div className="text-sm text-muted-foreground">{payment.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{payment.studentName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{payment.courseName || "N/A"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">${payment.amount.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(payment.paymentMethod)}
                        <span className="capitalize">{payment.paymentMethod.replace("_", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(payment.status)}>{payment.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>{new Date(payment.date).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <PaymentDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          payment={selectedPayment}
          onClose={() => {
            setSelectedPayment(null)
            setIsDialogOpen(false)
          }}
        />
      </div>
    </Layout>
  )
}

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment | null
  onClose: () => void
}

function PaymentDialog({ open, onOpenChange, payment, onClose }: PaymentDialogProps) {
  const [formData, setFormData] = useState({
    studentName: "",
    courseName: "",
    amount: "",
    paymentMethod: "cash",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  React.useEffect(() => {
    if (payment) {
      setFormData({
        studentName: payment.studentName,
        courseName: payment.courseName || "",
        amount: payment.amount.toString(),
        paymentMethod: payment.paymentMethod,
        description: payment.description,
        date: payment.date,
      })
    } else {
      setFormData({
        studentName: "",
        courseName: "",
        amount: "",
        paymentMethod: "cash",
        description: "",
        date: new Date().toISOString().split("T")[0],
      })
    }
  }, [payment])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle payment creation/update
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{payment ? "Edit Payment" : "Record New Payment"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="studentName" className="text-sm font-medium">
                Student Name
              </label>
              <Input
                id="studentName"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="courseName" className="text-sm font-medium">
                Course Name (Optional)
              </label>
              <Input
                id="courseName"
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount ($)
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="paymentMethod" className="text-sm font-medium">
                Payment Method
              </label>
              <Select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Payment Date
              </label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Course fee payment, Installment payment"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{payment ? "Update Payment" : "Record Payment"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
