"use client"

import React, { useState } from 'react'
import { Box, Typography, Snackbar, Alert } from '@mui/material'
import { Payment, CreditCard, Undo, AccountBalanceWallet as AccountBalanceWalletIcon, Receipt as ReceiptIcon } from '@mui/icons-material'
import InnerNavBar from '../components/InnerNavBar'
import { usePayments } from '../hooks/usePayments'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { useRefunds } from '../hooks/useRefunds'
import { usePayrolls } from '../hooks/usePayrolls'
import { useExpenses } from '../hooks/useExpenses'
import { usePermissions } from '../hooks/usePermissions.tsx'
import ProtectedRoute from '../components/ProtectedRoute'

// Import existing pages (they'll work as content sections)
import PaymentsPage from './PaymentsPage'
import PaymentMethodsPage from './PaymentMethodsPage'
import RefundsPage from './RefundsPage'
import PayrollPage from './PayrollPage'
import ExpensesPage from './ExpensesPage'

const FinancialManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('expenses')
  const [refundCount, setRefundCount] = useState(0)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'warning' as 'warning' | 'error' | 'info' | 'success'
  });

  // Get real counts from hooks
  const { payments } = usePayments()
  const { paymentMethods } = usePaymentMethods()
  const { refunds } = useRefunds()
  const { payrolls } = usePayrolls()
  const { expenses } = useExpenses()
  const {
    hasPermission,
    modulePermissions,
    getDefaultFinancialTab
  } = usePermissions()

  const {
    canViewExpenses,
    canViewPayments,
    canViewRefunds,
    canViewPaymentMethods,
    canViewPayroll,
  } = modulePermissions

  // Update refund count when refunds data changes
  React.useEffect(() => {
    setRefundCount(refunds.length)
  }, [refunds])

  // Listen for refund creation and deletion events
  React.useEffect(() => {
    const handleRefundCreated = () => {
      setRefundCount(prev => prev + 1)
    }

    const handleRefundDeleted = () => {
      setRefundCount(prev => Math.max(0, prev - 1))
    }

    window.addEventListener('refundCreated', handleRefundCreated)
    window.addEventListener('refundDeleted', handleRefundDeleted)
    return () => {
      window.removeEventListener('refundCreated', handleRefundCreated)
      window.removeEventListener('refundDeleted', handleRefundDeleted)
    }
  }, [])

  const tabs = [
    {
      label: 'المصاريف',
      value: 'expenses',
      icon: <ReceiptIcon />,
      count: expenses.length,
      permission: 'expenses:read',
    },
    {
      label: 'الواردات',
      value: 'payments',
      icon: <Payment />,
      count: payments.length,
      permission: 'payments:read',
    },
    {
      label: 'المبالغ المستردة',
      value: 'refunds',
      icon: <Undo />,
      count: refundCount,
      permission: 'refunds:read',
    },
    {
      label: 'وسائل الدفع',
      value: 'payment-methods',
      icon: <CreditCard />,
      count: paymentMethods.length,
      permission: 'payment-methods:read',
    },
    {
      label: 'الرواتب',
      value: 'payroll',
      icon: <AccountBalanceWalletIcon />,
      count: payrolls.length,
      permission: 'payrolls:read',
    },
  ]

  // Handle tab change with permission check
  const handleTabChange = (newValue: string) => {
    const tab = tabs.find(t => t.value === newValue)
    if (!tab) return

    if (
      (newValue === 'expenses' && canViewExpenses) ||
      (newValue === 'payments' && canViewPayments) ||
      (newValue === 'refunds' && canViewRefunds) ||
      (newValue === 'payment-methods' && canViewPaymentMethods) ||
      (newValue === 'payroll' && canViewPayroll)
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

  // Initialize with default tab based on permissions (only run once on mount)
  React.useEffect(() => {
    // Check if there's a saved tab in session storage
    const savedTab = sessionStorage.getItem('financialActiveTab')
    if (savedTab) {
      // Check if user has permission for the saved tab
      if (
        (savedTab === 'expenses' && canViewExpenses) ||
        (savedTab === 'payments' && canViewPayments) ||
        (savedTab === 'refunds' && canViewRefunds) ||
        (savedTab === 'payment-methods' && canViewPaymentMethods) ||
        (savedTab === 'payroll' && canViewPayroll)
      ) {
        setActiveTab(savedTab)
        return
      }
    }

    // If no valid saved tab, use the default based on permissions
    const defaultTab = getDefaultFinancialTab()
    setActiveTab(defaultTab)
  }, [canViewExpenses, canViewPayments, canViewRefunds, canViewPaymentMethods, canViewPayroll])

  // Save active tab to session storage
  React.useEffect(() => {
    sessionStorage.setItem('financialActiveTab', activeTab)
  }, [activeTab])

  // Check if current tab is accessible
  const isCurrentTabAccessible = () => {
    if (activeTab === 'expenses' && canViewExpenses) return true
    if (activeTab === 'payments' && canViewPayments) return true
    if (activeTab === 'refunds' && canViewRefunds) return true
    if (activeTab === 'payment-methods' && canViewPaymentMethods) return true
    if (activeTab === 'payroll' && canViewPayroll) return true
    return false
  }

  // Redirect to first accessible tab if current tab is not accessible
  React.useEffect(() => {
    if (!isCurrentTabAccessible()) {
      const defaultTab = getDefaultFinancialTab()
      if (defaultTab) {
        setActiveTab(defaultTab)
      } else {
        // If no tab is accessible, redirect to dashboard
        window.location.href = '/'
      }
    }
  }, [activeTab, canViewExpenses, canViewPayments, canViewRefunds, canViewPaymentMethods, canViewPayroll])

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
            إدارة المالية
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إدارة شاملة للمدفوعات ووسائل الدفع والمبالغ المستردة والرواتب والمصاريف
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
        {activeTab === 'expenses' && (
          <ProtectedRoute requiredPermission="expenses:read">
            <ExpensesPage />
          </ProtectedRoute>
        )}
        {activeTab === 'payments' && (
          <ProtectedRoute requiredPermission="payments:read">
            <PaymentsPage />
          </ProtectedRoute>
        )}
        {activeTab === 'refunds' && (
          <ProtectedRoute requiredPermission="refunds:read">
            <RefundsPage />
          </ProtectedRoute>
        )}
        {activeTab === 'payment-methods' && (
          <ProtectedRoute requiredPermission="payment-methods:read">
            <PaymentMethodsPage />
          </ProtectedRoute>
        )}
        {activeTab === 'payroll' && (
          <ProtectedRoute requiredPermission="payrolls:read">
            <PayrollPage />
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

export default FinancialManagementPage