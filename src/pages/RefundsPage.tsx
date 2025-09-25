"use client"

import { useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Plus, Search, Edit, RefreshCw, DollarSign, Calendar, AlertCircle } from "lucide-react"
import type { Refund } from "@/types/finance"

// Mock data
const mockRefunds: Refund[] = [
  {
    id: "1",
    studentId: "1",
    studentName: "John Smith",
    originalTransactionId: "1",
    amount: 500,
    reason: "Course cancellation",
    status: "completed",
    requestDate: "2024-01-12",
    processedDate: "2024-01-14",
    processedBy: "admin",
    refundMethod: "bank_transfer",
    transactionId: "10",
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-01-14T15:30:00Z",
  },
  {
    id: "2",
    studentId: "2",
    studentName: "Sarah Johnson",
    originalTransactionId: "3",
    amount: 300,
    reason: "Duplicate payment",
    status: "pending",
    requestDate: "2024-01-10",
    refundMethod: "card",
    createdAt: "2024-01-10T14:20:00Z",
    updatedAt: "2024-01-10T14:20:00Z",
  },
  {
    id: "3",
    studentId: "3",
    studentName: "Mike Wilson",
    originalTransactionId: "5",
    amount: 150,
    reason: "Partial course refund",
    status: "approved",
    requestDate: "2024-01-08",
    refundMethod: "bank_transfer",
    createdAt: "2024-01-08T09:15:00Z",
    updatedAt: "2024-01-08T16:45:00Z",
  },
]

const refundReasons = [
  "Course cancellation",
  "Duplicate payment",
  "Partial course refund",
  "Technical issues",
  "Student withdrawal",
  "Other",
]

export function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>(mockRefunds)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null)

  const filteredRefunds = refunds.filter((refund) => {
    const matchesSearch =
      refund.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || refund.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalRefunds = refunds.reduce((sum, refund) => sum + refund.amount, 0)
  const completedRefunds = refunds.filter((r) => r.status === "completed")
  const pendingRefunds = refunds.filter((r) => r.status === "pending")
  const approvedRefunds = refunds.filter((r) => r.status === "approved")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "approved":
        return "secondary"
      case "pending":
        return "secondary"
      case "rejected":
        return "destructive"
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
            <h1 className="text-3xl font-bold text-foreground">Refunds</h1>
            <p className="text-muted-foreground">Process and track student refunds</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Process Refund
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <RefreshCw className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalRefunds.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{refunds.length} requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedRefunds.length}</div>
              <p className="text-xs text-muted-foreground">
                ${completedRefunds.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingRefunds.length}</div>
              <p className="text-xs text-muted-foreground">
                ${pendingRefunds.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{approvedRefunds.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Refund Requests</CardTitle>
            <CardDescription>Manage student refund requests and processing</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search refunds..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>

            {/* Refunds Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefunds.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{refund.studentName}</div>
                        <div className="text-sm text-muted-foreground">ID: {refund.studentId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-red-600">${refund.amount.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{refund.reason}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(refund.status)}>{refund.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>{new Date(refund.requestDate).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{refund.refundMethod.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRefund(refund)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {refund.status === "pending" && (
                          <Button variant="ghost" size="sm">
                            Approve
                          </Button>
                        )}
                        {refund.status === "approved" && (
                          <Button variant="ghost" size="sm">
                            Process
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
