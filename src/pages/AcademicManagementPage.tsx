"use client"

import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { PersonAdd, School, Discount as DiscountIcon } from '@mui/icons-material'
import InnerNavBar from '../components/InnerNavBar'
import { useStudents } from '../hooks/useStudents'
import { useCourses } from '../hooks/useCourses'

// Import the existing pages (they'll work as content sections)
import StudentsPage from './StudentsPage'
import CoursesPage from './CoursesPage'
import DiscountsPage from './DiscountsPage'

const AcademicManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('students')

  // Get real counts from hooks
  const { students } = useStudents()
  const { courses } = useCourses()
  
  // For discounts, we'll need to fetch from API or use a hook
  // For now using placeholder
  const discountsCount = 8

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
      count: discountsCount,
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
            إدارة شاملة للطلاب والدورات والخصومات
          </Typography>
        </Box>
      </Box>

      {/* Inner Navigation Bar */}
      <InnerNavBar tabs={tabs} value={activeTab} onChange={setActiveTab} />

      {/* Content based on active tab */}
      <Box sx={{ mt: 3 }}>
        {activeTab === 'students' && <StudentsPage />}
        {activeTab === 'courses' && <CoursesPage />}
        {activeTab === 'discounts' && <DiscountsPage />}
      </Box>
    </Box>
  )
}

export default AcademicManagementPage
