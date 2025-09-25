"use client"

import { useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Search, Download, Receipt, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import type { Transaction } from "@/types/finance"

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "payment",
    amount: 1200,
    description: "Course fee payment - Advanced Mathematics",
    date: "2024-01-15",
    status: "completed",
    reference: "PAY-001",
    relatedId: "payment-1",
    category: "Course Fees",
    createdBy: "system",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    type: "expense",
    amount: -340,
    description: "Office supplies purchase",
    date: "2024-01-14",
    status: "completed",
    reference: "EXP-001",
    relatedId: "expense-1",
    category: "Office Supplies",
    createdBy: "admin",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T14:20:00Z",
  },
  {
    id: "3",
    type: "payment",
    amount: 800,
    description: "Course fee payment - Physics Fundamentals",
    date: "2024-01-13",
    status: "completed",
    reference: "PAY-002",
    relatedId: "payment-2",
    category: "Course Fees",
    createdBy: "system",
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
  },
  {
    id: "4",
    type: "refund",
    amount: -400,
    description: "Partial refund - Course withdrawal",
    date: "2024-01-12",
    status: "completed",
    reference: "REF-001",
    relatedId: "refund-1",
    category: "Refunds",
    createdBy: "admin",
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
  },
  {
    id: "5",
    type: "payroll",
    amount: -5000,
    description: "Monthly salary - Dr. Sarah Johnson",
    date: "2024-01-01",
    status: "completed",
    reference: "PAY-003",
    relatedId: "payroll-1",
    category: "Salaries",
    createdBy: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

export function TransactionsPage() {
  const [transactions] = useState<Transaction[]>(mockTransactions)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("all")

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || transaction.type === typeFilter
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const totalIncome = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = Math.abs(transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))

  const netIncome = totalIncome - totalExpenses

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "payment":
        return "default"
      case "expense":
        return "destructive"
      case "refund":
        return "secondary"
      case "payroll":
        return "outline"
      default:
        return "secondary"
    }
  }

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

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground">Unified ledger of all financial activities</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter((t) => t.amount > 0).length} transactions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter((t) => t.amount < 0).length} transactions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${netIncome.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Complete record of all financial transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="payment">Payments</option>
                <option value="expense">Expenses</option>
                <option value="refund">Refunds</option>
                <option value="payroll">Payroll</option>
              </Select>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </Select>
              <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </Select>
            </div>

            {/* Transactions Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="font-medium">{transaction.reference}</div>
                      <div className="text-sm text-muted-foreground">ID: {transaction.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTransactionTypeColor(transaction.type)}>{transaction.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium truncate">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">By: {transaction.createdBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {transaction.amount >= 0 ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>{new Date(transaction.date).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleTimeString()}
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
