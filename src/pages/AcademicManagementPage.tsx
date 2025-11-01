
"use client"

import React, { useState, useEffect } from 'react'
import { Box, Typography, Snackbar, Alert } from '@mui/material'
import { PersonAdd, School, Discount as DiscountIcon, Group as GroupIcon, HowToReg as HowToRegIcon } from '@mui/icons-material'
import InnerNavBar from '../components/InnerNavBar'
import { useStudents } from '../hooks/useStudents'
import { useCourses } from '../hooks/useCourses'
import { useDiscountCodes } from '../hooks/useDiscountCodes'
import { useBatches } from '../hooks/useBatches'
import { useEnrollments } from '../hooks/useEnrollments'
import { usePermissions } from '../hooks/usePermissions.tsx'
import ProtectedRoute from '../components/ProtectedRoute'

// Import existing pages (they'll work as content sections)
import StudentsPage from './StudentsPage'
import CoursesPage from './CoursesPage'
import DiscountsPage from './DiscountsPage'
import BatchesPage from './BatchesPage'
import EnrollmentsPage from './EnrollmentsPage'

const AcademicManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('students')
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'warning' as 'warning' | 'error' | 'info' | 'success'
  });

  // Get real counts from hooks
  const { students } = useStudents()
  const { courses } = useCourses()
  const { discountCodes } = useDiscountCodes()
  const { batches } = useBatches()
  const { enrollments } = useEnrollments()
  const { modulePermissions, getDefaultAcademicTab } = usePermissions()
  const {
    canReadStudents,
    canReadCourses,
    canReadBatches,
    canReadEnrollments,
    canReadDiscounts
  } = modulePermissions

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

  // Initialize with default tab based on permissions (only run once on mount)
  useEffect(() => {
    // Check if there's a saved tab in session storage
    const savedTab = sessionStorage.getItem('academicActiveTab')
    if (savedTab) {
      // Check if user has permission for the saved tab
      const tab = tabs.find(t => t.value === savedTab)
      if (tab) {
        if (
          (savedTab === 'students' && canReadStudents) ||
          (savedTab === 'courses' && canReadCourses) ||
          (savedTab === 'batches' && canReadBatches) ||
          (savedTab === 'enrollments' && canReadEnrollments) ||
          (savedTab === 'discounts' && canReadDiscounts)
        ) {
          setActiveTab(savedTab)
          return
        }
      }
    }

    // If no valid saved tab, use the default based on permissions
    const defaultTab = getDefaultAcademicTab()
    setActiveTab(defaultTab)
  }, [canReadStudents, canReadCourses, canReadBatches, canReadEnrollments, canReadDiscounts])

  // Save active tab to session storage
  useEffect(() => {
    sessionStorage.setItem('academicActiveTab', activeTab)
  }, [activeTab])

  // Load active tab from session storage on mount
  useEffect(() => {
    const savedTab = sessionStorage.getItem('academicActiveTab')
    if (savedTab) {
      // Check if user has permission for the saved tab
      const tab = tabs.find(t => t.value === savedTab)
      if (tab) {
        if (
          (savedTab === 'students' && canReadStudents) ||
          (savedTab === 'courses' && canReadCourses) ||
          (savedTab === 'batches' && canReadBatches) ||
          (savedTab === 'enrollments' && canReadEnrollments) ||
          (savedTab === 'discounts' && canReadDiscounts)
        ) {
          setActiveTab(savedTab)
        }
      }
    }
  }, [canReadStudents, canReadCourses, canReadBatches, canReadEnrollments, canReadDiscounts])

  // Handle tab change with permission check
  const handleTabChange = (newValue: string) => {
    const tab = tabs.find(t => t.value === newValue)
    if (!tab) return

    if (
      (newValue === 'students' && canReadStudents) ||
      (newValue === 'courses' && canReadCourses) ||
      (newValue === 'batches' && canReadBatches) ||
      (newValue === 'enrollments' && canReadEnrollments) ||
      (newValue === 'discounts' && canReadDiscounts)
    ) {
      setActiveTab(newValue)
    } else {
      // Show permission denied message
      setSnackbar({
        open: true,
        message: `ليس لديك صلاحية للوصول إلى ${tab.label}`,
        severity: 'warning'
      })
    }
  }

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

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
      <InnerNavBar
        tabs={tabs}
        value={activeTab}
        onChange={handleTabChange}
      />

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

      {/* Permission Denied Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AcademicManagementPage
