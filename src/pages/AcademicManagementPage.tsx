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
    },
    {
      label: 'الدورات',
      value: 'courses',
      icon: <School />,
      count: courses.length,
    },
    {
      label: 'الخصومات',
      value: 'discounts',
      icon: <DiscountIcon />,
      count: discountCodes.length,
    },
    {
      label: 'الدُفعات',
      value: 'batches',
      icon: <GroupIcon />,
      count: batches.length,
    },
    {
      label: 'التسجيلات',
      value: 'enrollments',
      icon: <HowToRegIcon />,
      count: enrollments.length,
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
        {activeTab === 'students' && <StudentsPage />}
        {activeTab === 'courses' && <CoursesPage />}
        {activeTab === 'batches' && <BatchesPage />}
        {activeTab === 'enrollments' && <EnrollmentsPage />}
        {activeTab === 'discounts' && <DiscountsPage />}
      </Box>
    </Box>
  )
}

export default AcademicManagementPage
