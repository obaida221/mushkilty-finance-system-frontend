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
import { Plus, Search, Edit, Trash2, GraduationCap, DollarSign, Calendar, Phone, Mail } from "lucide-react"
import type { Student, Course } from "@/types/student"

// Mock data
const mockCourses: Course[] = [
  {
    id: "1",
    name: "Advanced Mathematics",
    description: "Comprehensive math course covering algebra, calculus, and statistics",
    duration: "6 months",
    fees: 1200,
    teacher: {
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
    startDate: "2024-02-01",
    endDate: "2024-08-01",
    maxStudents: 30,
    enrolledStudents: 25,
    status: "active",
  },
  {
    id: "2",
    name: "Physics Fundamentals",
    description: "Introduction to physics concepts and practical applications",
    duration: "4 months",
    fees: 800,
    teacher: {
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
    startDate: "2024-01-15",
    endDate: "2024-05-15",
    maxStudents: 25,
    enrolledStudents: 18,
    status: "active",
  },
]

const mockStudents: Student[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1234567890",
    dateOfBirth: "2000-05-15",
    enrollmentDate: "2024-01-15",
    course: mockCourses[0],
    paymentStatus: "paid",
    totalFees: 1200,
    paidAmount: 1200,
    remainingAmount: 0,
    discounts: [],
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Wilson",
    email: "sarah.wilson@email.com",
    phone: "+1234567891",
    dateOfBirth: "1999-08-22",
    enrollmentDate: "2024-01-20",
    course: mockCourses[1],
    paymentStatus: "pending",
    totalFees: 800,
    paidAmount: 400,
    remainingAmount: 400,
    discounts: [],
    status: "active",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@email.com",
    phone: "+1234567892",
    dateOfBirth: "2001-03-10",
    enrollmentDate: "2024-02-01",
    course: null,
    paymentStatus: "overdue",
    totalFees: 0,
    paidAmount: 0,
    remainingAmount: 0,
    discounts: [],
    status: "inactive",
  },
]

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [courses] = useState<Course[]>(mockCourses)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || student.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const handleEnrollStudent = (studentId: string, courseId: string) => {
    const course = courses.find((c) => c.id === courseId)
    if (!course) return

    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              course,
              totalFees: course.fees,
              remainingAmount: course.fees,
              paymentStatus: "pending" as const,
              status: "active" as const,
            }
          : student,
      ),
    )
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground">Manage student enrollments and track payments</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">
                {students.filter((s) => s.status === "active").length} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${students.reduce((sum, s) => sum + s.paidAmount, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                ${students.reduce((sum, s) => sum + s.remainingAmount, 0).toLocaleString()} pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.filter((s) => s.course).length}</div>
              <p className="text-xs text-muted-foreground">{students.filter((s) => !s.course).length} not enrolled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Issues</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.filter((s) => s.paymentStatus === "overdue").length}</div>
              <p className="text-xs text-muted-foreground">Students with overdue payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Student Management</CardTitle>
            <CardDescription>View and manage student enrollments and payments</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </Select>
            </div>

            {/* Students Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {student.email}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {student.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.course ? (
                        <div>
                          <div className="font-medium">{student.course.name}</div>
                          <div className="text-sm text-muted-foreground">{student.course.teacher?.name}</div>
                        </div>
                      ) : (
                        <Badge variant="outline">Not Enrolled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusColor(student.paymentStatus)}>{student.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">${student.totalFees.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Paid: ${student.paidAmount.toLocaleString()}
                        </div>
                        {student.remainingAmount > 0 && (
                          <div className="text-sm text-red-600">Due: ${student.remainingAmount.toLocaleString()}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.status === "active" ? "default" : "secondary"}>{student.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(student.enrollmentDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student)
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

        {/* Student Dialog */}
        <StudentDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          student={selectedStudent}
          courses={courses}
          onEnroll={handleEnrollStudent}
          onClose={() => {
            setSelectedStudent(null)
            setIsDialogOpen(false)
          }}
        />
      </div>
    </Layout>
  )
}

interface StudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Student | null
  courses: Course[]
  onEnroll: (studentId: string, courseId: string) => void
  onClose: () => void
}

function StudentDialog({ open, onOpenChange, student, courses, onEnroll, onClose }: StudentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    courseId: "",
  })

  React.useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        phone: student.phone,
        dateOfBirth: student.dateOfBirth,
        courseId: student.course?.id || "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        courseId: "",
      })
    }
  }, [student])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (student && formData.courseId && formData.courseId !== student.course?.id) {
      onEnroll(student.id, formData.courseId)
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{student ? "Edit Student" : "Add New Student"}</DialogTitle>
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
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <label htmlFor="dateOfBirth" className="text-sm font-medium">
                Date of Birth
              </label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="course" className="text-sm font-medium">
              Course Enrollment
            </label>
            <Select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}>
              <option value="">Select a course (optional)</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} - ${course.fees} ({course.enrolledStudents}/{course.maxStudents} enrolled)
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{student ? "Update Student" : "Add Student"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
