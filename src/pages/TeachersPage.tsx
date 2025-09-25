"use client"

import React, { useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Plus, Search, Edit, Trash2, Users, DollarSign, Calendar, Mail, Phone } from "lucide-react"
import type { Teacher } from "@/types/student"

// Mock data
const mockTeachers: Teacher[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    email: "sarah@school.com",
    phone: "+1234567890",
    specialization: "Mathematics",
    salary: 5000,
    courses: [],
    hireDate: "2023-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "Prof. Michael Chen",
    email: "michael@school.com",
    phone: "+1234567891",
    specialization: "Physics",
    salary: 4500,
    courses: [],
    hireDate: "2023-03-10",
    status: "active",
  },
  {
    id: "3",
    name: "Ms. Emily Davis",
    email: "emily@school.com",
    phone: "+1234567892",
    specialization: "English Literature",
    salary: 4000,
    courses: [],
    hireDate: "2023-06-01",
    status: "active",
  },
]

export function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalSalaries = teachers.reduce((sum, teacher) => sum + teacher.salary, 0)

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teachers</h1>
            <p className="text-muted-foreground">Manage teaching staff and salary information</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
              <p className="text-xs text-muted-foreground">
                {teachers.filter((t) => t.status === "active").length} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Salaries</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSalaries.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Monthly payroll</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${teachers.length > 0 ? Math.round(totalSalaries / teachers.length).toLocaleString() : 0}
              </div>
              <p className="text-xs text-muted-foreground">Per teacher</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Hires</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teachers.filter((t) => new Date(t.hireDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length}
              </div>
              <p className="text-xs text-muted-foreground">Last 3 months</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Teacher Management</CardTitle>
            <CardDescription>Manage teaching staff, salaries, and course assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Teachers Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{teacher.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {teacher.email}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {teacher.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{teacher.specialization}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${teacher.salary.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{teacher.courses.length} courses</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={teacher.status === "active" ? "default" : "secondary"}>{teacher.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(teacher.hireDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTeacher(teacher)
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

        {/* Teacher Dialog */}
        <TeacherDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          teacher={selectedTeacher}
          onClose={() => {
            setSelectedTeacher(null)
            setIsDialogOpen(false)
          }}
        />
      </div>
    </Layout>
  )
}

interface TeacherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: Teacher | null
  onClose: () => void
}

function TeacherDialog({ open, onOpenChange, teacher, onClose }: TeacherDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    salary: "",
    hireDate: "",
  })

  React.useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        specialization: teacher.specialization,
        salary: teacher.salary.toString(),
        hireDate: teacher.hireDate,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        salary: "",
        hireDate: "",
      })
    }
  }, [teacher])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle teacher creation/update
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{teacher ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="specialization" className="text-sm font-medium">
                Specialization
              </label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
              </label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="salary" className="text-sm font-medium">
                Monthly Salary ($)
              </label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="hireDate" className="text-sm font-medium">
                Hire Date
              </label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{teacher ? "Update Teacher" : "Add Teacher"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
