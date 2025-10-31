"use client"

import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { Payment, CreditCard, Undo, AccountBalanceWallet as AccountBalanceWalletIcon, Receipt as ReceiptIcon } from '@mui/icons-material'
import InnerNavBar from '../components/InnerNavBar'
import { usePayments } from '../hooks/usePayments'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { useRefunds } from '../hooks/useRefunds'
import { usePayrolls } from '../hooks/usePayrolls'
import { useExpenses } from '../hooks/useExpenses'
import ProtectedRoute from '../components/ProtectedRoute'

// Import the existing pages (they'll work as content sections)
import PaymentsPage from './PaymentsPage'
import PaymentMethodsPage from './PaymentMethodsPage'
import RefundsPage from './RefundsPage'
import PayrollPage from './PayrollPage'
import ExpensesPage from './ExpensesPage'

const FinancialManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('expenses')
  const [refundCount, setRefundCount] = useState(0)


  // Get real counts from hooks
  const { payments } = usePayments()
  const { paymentMethods } = usePaymentMethods()
  const { refunds } = useRefunds()
  const { payrolls } = usePayrolls()
  const { expenses } = useExpenses()

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
      permission: 'payroll:read',
    },
  ]

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
      <InnerNavBar tabs={tabs} value={activeTab} onChange={setActiveTab} />

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
          <ProtectedRoute requiredPermission="payroll:read">
            <PayrollPage />
          </ProtectedRoute>
        )}
      </Box>
    </Box>
  )
}

export default FinancialManagementPage
