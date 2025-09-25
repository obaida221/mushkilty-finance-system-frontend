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
import { Plus, Search, Edit, Trash2, BookOpen, Users, DollarSign } from "lucide-react"
import type { Course, Teacher } from "@/types/student"

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

const mockCourses: Course[] = [
  {
    id: "1",
    name: "Advanced Mathematics",
    description: "Comprehensive math course covering algebra, calculus, and statistics",
    duration: "6 months",
    fees: 1200,
    teacher: mockTeachers[0],
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
    teacher: mockTeachers[1],
    startDate: "2024-01-15",
    endDate: "2024-05-15",
    maxStudents: 25,
    enrolledStudents: 18,
    status: "active",
  },
  {
    id: "3",
    name: "English Literature",
    description: "Study of classic and contemporary literature",
    duration: "5 months",
    fees: 900,
    teacher: mockTeachers[2],
    startDate: "2024-03-01",
    endDate: "2024-08-01",
    maxStudents: 20,
    enrolledStudents: 12,
    status: "active",
  },
]

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [teachers] = useState<Teacher[]>(mockTeachers)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || course.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalRevenue = courses.reduce((sum, course) => sum + course.fees * course.enrolledStudents, 0)
  const totalEnrolled = courses.reduce((sum, course) => sum + course.enrolledStudents, 0)

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Courses</h1>
            <p className="text-muted-foreground">Manage courses, teachers, and enrollments</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
              <p className="text-xs text-muted-foreground">
                {courses.filter((c) => c.status === "active").length} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrolled}</div>
              <p className="text-xs text-muted-foreground">
                {courses.reduce((sum, c) => sum + c.maxStudents, 0) - totalEnrolled} spots available
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From enrolled students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.filter((t) => t.status === "active").length}</div>
              <p className="text-xs text-muted-foreground">Teaching staff</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Course Management</CardTitle>
            <CardDescription>View and manage courses, assignments, and enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </Select>
            </div>

            {/* Courses Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.name}</div>
                        <div className="text-sm text-muted-foreground">{course.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {course.teacher ? (
                        <div>
                          <div className="font-medium">{course.teacher.name}</div>
                          <div className="text-sm text-muted-foreground">{course.teacher.specialization}</div>
                        </div>
                      ) : (
                        <Badge variant="outline">No Teacher</Badge>
                      )}
                    </TableCell>
                    <TableCell>{course.duration}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm">
                          {course.enrolledStudents}/{course.maxStudents}
                        </div>
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(course.enrolledStudents / course.maxStudents) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${course.fees.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.status === "active" ? "default" : "secondary"}>{course.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(course.startDate).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">{new Date(course.endDate).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCourse(course)
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

        {/* Course Dialog */}
        <CourseDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          course={selectedCourse}
          teachers={teachers}
          onClose={() => {
            setSelectedCourse(null)
            setIsDialogOpen(false)
          }}
        />
      </div>
    </Layout>
  )
}

interface CourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course | null
  teachers: Teacher[]
  onClose: () => void
}

function CourseDialog({ open, onOpenChange, course, teachers, onClose }: CourseDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    fees: "",
    teacherId: "",
    startDate: "",
    endDate: "",
    maxStudents: "",
  })

  React.useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        description: course.description,
        duration: course.duration,
        fees: course.fees.toString(),
        teacherId: course.teacher?.id || "",
        startDate: course.startDate,
        endDate: course.endDate,
        maxStudents: course.maxStudents.toString(),
      })
    } else {
      setFormData({
        name: "",
        description: "",
        duration: "",
        fees: "",
        teacherId: "",
        startDate: "",
        endDate: "",
        maxStudents: "",
      })
    }
  }, [course])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle course creation/update
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{course ? "Edit Course" : "Add New Course"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Course Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium">
                Duration
              </label>
              <Input
                id="duration"
                placeholder="e.g., 6 months"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="fees" className="text-sm font-medium">
                Fees ($)
              </label>
              <Input
                id="fees"
                type="number"
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="maxStudents" className="text-sm font-medium">
                Max Students
              </label>
              <Input
                id="maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="teacher" className="text-sm font-medium">
                Assigned Teacher
              </label>
              <Select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              >
                <option value="">Select teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} - {teacher.specialization}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium">
                Start Date
              </label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium">
                End Date
              </label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{course ? "Update Course" : "Add Course"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
