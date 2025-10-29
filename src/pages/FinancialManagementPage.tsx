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

// Import the existing pages (they'll work as content sections)
import PaymentsPage from './PaymentsPage'
import PaymentMethodsPage from './PaymentMethodsPage'
import RefundsPage from './RefundsPage'
import PayrollPage from './PayrollPage'
import ExpensesPage from './ExpensesPage'

const FinancialManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('expenses')

  // Get real counts from hooks
  const { payments } = usePayments()
  const { paymentMethods } = usePaymentMethods()
  const { refunds } = useRefunds()
  const { payrolls } = usePayrolls()
  const { expenses } = useExpenses()

  const tabs = [
    {
      label: 'المصاريف',
      value: 'expenses',
      icon: <ReceiptIcon />,
      count: expenses.length,
    },
    {
      label: 'الواردات',
      value: 'payments',
      icon: <Payment />,
      count: payments.length,
    },
    {
      label: 'المبالغ المستردة',
      value: 'refunds',
      icon: <Undo />,
      count: refunds.length,
    },
    {
      label: 'وسائل الدفع',
      value: 'payment-methods',
      icon: <CreditCard />,
      count: paymentMethods.length,
    },
    {
      label: 'الرواتب',
      value: 'payroll',
      icon: <AccountBalanceWalletIcon />,
      count: payrolls.length,
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
        {activeTab === 'expenses' && <ExpensesPage />}
        {activeTab === 'payments' && <PaymentsPage />}
        {activeTab === 'refunds' && <RefundsPage />}
        {activeTab === 'payment-methods' && <PaymentMethodsPage />}
        {activeTab === 'payroll' && <PayrollPage />}
      </Box>
    </Box>
  )
}

export default FinancialManagementPage
