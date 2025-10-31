"use client"

import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { PersonAdd, School, Discount as DiscountIcon, Group as GroupIcon, HowToReg as HowToRegIcon } from '@mui/icons-material'
import InnerNavBar from '../components/InnerNavBar'
import { useStudents } from '../hooks/useStudents'
import { useCourses } from '../hooks/useCourses'
import { useDiscountCodes } from '../hooks/useDiscountCodes'
import { useBatches } from '../hooks/useBatches'
import { useEnrollments } from '../hooks/useEnrollments'
import ProtectedRoute from '../components/ProtectedRoute'

// Import the existing pages (they'll work as content sections)
import StudentsPage from './StudentsPage'
import CoursesPage from './CoursesPage'
import DiscountsPage from './DiscountsPage'
import BatchesPage from './BatchesPage'
import EnrollmentsPage from './EnrollmentsPage'

const AcademicManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('students')

  // Get real counts from hooks
  const { students } = useStudents()
  const { courses } = useCourses()
  
  // Get real counts from hooks
  const { discountCodes } = useDiscountCodes()
  const { batches } = useBatches()
  const { enrollments } = useEnrollments()

  const tabs = [
    {
      label: 'الطلاب',
      value: 'students',
      icon: <PersonAdd />,
      count: students.length,
      permission: 'students:read',
    },
    {
      label: 'الدورات',
      value: 'courses',
      icon: <School />,
      count: courses.length,
      permission: 'courses:read',
    },
    {
      label: 'الخصومات',
      value: 'discounts',
      icon: <DiscountIcon />,
      count: discountCodes.length,
      permission: 'discounts:read',
    },
    {
      label: 'الدُفعات',
      value: 'batches',
      icon: <GroupIcon />,
      count: batches.length,
      permission: 'batches:read',
    },
    {
      label: 'التسجيلات',
      value: 'enrollments',
      icon: <HowToRegIcon />,
      count: enrollments.length,
      permission: 'enrollments:read',
    },
  ]

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            إدارة الشؤون الأكاديمية
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إدارة شاملة للطلاب والدورات والخصومات والدُفعات والتسجيلات
          </Typography>
        </Box>
      </Box>

      {/* Inner Navigation Bar */}
      <InnerNavBar tabs={tabs} value={activeTab} onChange={setActiveTab} />

      {/* Content based on active tab */}
      <Box sx={{ mt: 3 }}>
        {activeTab === 'students' && (
          <ProtectedRoute requiredPermission="students:read">
            <StudentsPage />
          </ProtectedRoute>
        )}
        {activeTab === 'courses' && (
          <ProtectedRoute requiredPermission="courses:read">
            <CoursesPage />
          </ProtectedRoute>
        )}
        {activeTab === 'batches' && (
          <ProtectedRoute requiredPermission="batches:read">
            <BatchesPage />
          </ProtectedRoute>
        )}
        {activeTab === 'enrollments' && (
          <ProtectedRoute requiredPermission="enrollments:read">
            <EnrollmentsPage />
          </ProtectedRoute>
        )}
        {activeTab === 'discounts' && (
          <ProtectedRoute requiredPermission="discounts:read">
            <DiscountsPage />
          </ProtectedRoute>
        )}
      </Box>
    </Box>
  )
}

export default AcademicManagementPage
