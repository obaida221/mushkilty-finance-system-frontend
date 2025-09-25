"use client"

import { useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Plus, Search, Edit, Trash2, TrendingDown, DollarSign, Calendar, Receipt } from "lucide-react"
import type { Expense } from "@/types/finance"

// Mock data
const mockExpenses: Expense[] = [
  {
    id: "1",
    category: "Office Supplies",
    description: "Stationery and printing materials",
    amount: 340,
    date: "2024-01-14",
    paymentMethod: "card",
    transactionId: "2",
    status: "completed",
    vendor: "Office Depot",
    createdBy: "admin",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T14:20:00Z",
  },
  {
    id: "2",
    category: "Utilities",
    description: "Monthly electricity bill",
    amount: 450,
    date: "2024-01-10",
    paymentMethod: "bank_transfer",
    transactionId: "7",
    status: "completed",
    vendor: "Electric Company",
    createdBy: "admin",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-10T09:00:00Z",
  },
  {
    id: "3",
    category: "Marketing",
    description: "Social media advertising",
    amount: 200,
    date: "2024-01-08",
    paymentMethod: "card",
    transactionId: "8",
    status: "completed",
    vendor: "Facebook Ads",
    createdBy: "admin",
    createdAt: "2024-01-08T16:30:00Z",
    updatedAt: "2024-01-08T16:30:00Z",
  },
  {
    id: "4",
    category: "Maintenance",
    description: "Classroom equipment repair",
    amount: 150,
    date: "2024-01-05",
    paymentMethod: "cash",
    transactionId: "9",
    status: "pending",
    vendor: "Tech Repair Co",
    createdBy: "admin",
    createdAt: "2024-01-05T11:15:00Z",
    updatedAt: "2024-01-05T11:15:00Z",
  },
]

const expenseCategories = [
  "Office Supplies",
  "Utilities",
  "Marketing",
  "Maintenance",
  "Equipment",
  "Software",
  "Travel",
  "Training",
  "Insurance",
  "Other",
]

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const completedExpenses = expenses.filter((e) => e.status === "completed")
  const pendingExpenses = expenses.filter((e) => e.status === "pending")

  const expensesByCategory = expenseCategories
    .map((category) => ({
      category,
      amount: expenses.filter((e) => e.category === category).reduce((sum, e) => sum + e.amount, 0),
      count: expenses.filter((e) => e.category === category).length,
    }))
    .filter((item) => item.count > 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
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
            <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
            <p className="text-muted-foreground">Track and manage business expenses</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{expenses.length} transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedExpenses.length}</div>
              <p className="text-xs text-muted-foreground">
                ${completedExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingExpenses.length}</div>
              <p className="text-xs text-muted-foreground">
                ${pendingExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expensesByCategory.length}</div>
              <p className="text-xs text-muted-foreground">Active categories</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Expense Records</CardTitle>
              <CardDescription>Track and categorize business expenses</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="all">All Categories</option>
                  {expenseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </Select>
              </div>

              {/* Expenses Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          <div className="text-sm text-muted-foreground">{expense.vendor}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-red-600">${expense.amount.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(expense.status)}>{expense.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>{new Date(expense.date).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedExpense(expense)
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

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expensesByCategory.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.category}</div>
                      <div className="text-sm text-muted-foreground">{item.count} expenses</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${item.amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {((item.amount / totalExpenses) * 100).toFixed(1)}%
                      </div>
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
