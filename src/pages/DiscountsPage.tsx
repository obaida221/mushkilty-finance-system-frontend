"use client"

import { useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Plus, Search, Edit, Trash2, Percent, Tag, Calendar, TrendingDown } from "lucide-react"
import type { Discount, DiscountUsage } from "@/types/payroll"

// Mock data
const mockDiscounts: Discount[] = [
  {
    id: "1",
    code: "EARLY2024",
    name: "Early Bird Discount",
    description: "20% off for early enrollment",
    type: "percentage",
    value: 20,
    minAmount: 100,
    maxDiscount: 500,
    validFrom: "2024-01-01",
    validTo: "2024-03-31",
    usageLimit: 100,
    usedCount: 45,
    isActive: true,
    applicableTo: "all",
    createdBy: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    code: "STUDENT50",
    name: "Student Discount",
    description: "$50 off any course",
    type: "fixed",
    value: 50,
    minAmount: 200,
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    usageLimit: 200,
    usedCount: 78,
    isActive: true,
    applicableTo: "all",
    createdBy: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-20T14:15:00Z",
  },
  {
    id: "3",
    code: "PREMIUM25",
    name: "Premium Course Discount",
    description: "25% off premium courses only",
    type: "percentage",
    value: 25,
    minAmount: 500,
    maxDiscount: 200,
    validFrom: "2024-02-01",
    validTo: "2024-04-30",
    usageLimit: 50,
    usedCount: 12,
    isActive: true,
    applicableTo: "specific",
    courseIds: ["1", "3"],
    createdBy: "admin",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "4",
    code: "EXPIRED10",
    name: "Expired Discount",
    description: "10% off - expired",
    type: "percentage",
    value: 10,
    validFrom: "2023-12-01",
    validTo: "2023-12-31",
    usageLimit: 100,
    usedCount: 85,
    isActive: false,
    applicableTo: "all",
    createdBy: "admin",
    createdAt: "2023-12-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

const mockDiscountUsage: DiscountUsage[] = [
  {
    id: "1",
    discountId: "1",
    studentId: "1",
    studentName: "John Smith",
    transactionId: "1",
    discountAmount: 200,
    usedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    discountId: "2",
    studentId: "2",
    studentName: "Sarah Johnson",
    transactionId: "3",
    discountAmount: 50,
    usedAt: "2024-01-20T14:15:00Z",
  },
]

export function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>(mockDiscounts)
  const [discountUsage, setDiscountUsage] = useState<DiscountUsage[]>(mockDiscountUsage)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<"discounts" | "usage">("discounts")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null)

  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch =
      discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && discount.isActive) ||
      (statusFilter === "inactive" && !discount.isActive)

    const matchesType = typeFilter === "all" || discount.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const activeDiscounts = discounts.filter((d) => d.isActive)
  const totalSavings = discountUsage.reduce((sum, usage) => sum + usage.discountAmount, 0)
  const totalUsage = discountUsage.length

  const getStatusColor = (discount: Discount) => {
    if (!discount.isActive) return "secondary"
    const now = new Date()
    const validTo = new Date(discount.validTo)
    if (validTo < now) return "secondary"
    return "default"
  }

  const getTypeColor = (type: string) => {
    return type === "percentage" ? "default" : "secondary"
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Discounts</h1>
            <p className="text-muted-foreground">Manage promotional codes and discounts</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Discount
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Discounts</CardTitle>
              <Tag className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDiscounts.length}</div>
              <p className="text-xs text-muted-foreground">Currently available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalSavings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Student savings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage Count</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsage}</div>
              <p className="text-xs text-muted-foreground">Times used</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Discount</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalUsage > 0 ? Math.round(totalSavings / totalUsage) : 0}</div>
              <p className="text-xs text-muted-foreground">Per usage</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === "discounts" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("discounts")}
          >
            Discount Codes
          </Button>
          <Button variant={activeTab === "usage" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("usage")}>
            Usage History
          </Button>
        </div>

        {activeTab === "discounts" && (
          <Card>
            <CardHeader>
              <CardTitle>Discount Codes</CardTitle>
              <CardDescription>Create and manage promotional discount codes</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search discounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </Select>
              </div>

              {/* Discounts Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDiscounts.map((discount) => (
                    <TableRow key={discount.id}>
                      <TableCell>
                        <div className="font-mono font-medium">{discount.code}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{discount.name}</div>
                          <div className="text-sm text-muted-foreground">{discount.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeColor(discount.type)}>{discount.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{discount.usedCount}</div>
                          <div className="text-sm text-muted-foreground">
                            {discount.usageLimit ? `/ ${discount.usageLimit}` : "unlimited"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{new Date(discount.validTo).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(discount)}>{discount.isActive ? "active" : "inactive"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDiscount(discount)
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
        )}

        {activeTab === "usage" && (
          <Card>
            <CardHeader>
              <CardTitle>Usage History</CardTitle>
              <CardDescription>Track discount code usage and savings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Discount Code</TableHead>
                    <TableHead>Savings</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Used At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discountUsage.map((usage) => {
                    const discount = discounts.find((d) => d.id === usage.discountId)
                    return (
                      <TableRow key={usage.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{usage.studentName}</div>
                            <div className="text-sm text-muted-foreground">ID: {usage.studentId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono">{discount?.code}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">${usage.discountAmount}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">{usage.transactionId}</div>
                        </TableCell>
                        <TableCell>
                          <div>{new Date(usage.usedAt).toLocaleDateString()}</div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
