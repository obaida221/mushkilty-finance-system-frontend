"use client"

import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { Payment, CreditCard, Undo } from '@mui/icons-material'
import InnerNavBar from '../components/InnerNavBar'
import { usePayments } from '../hooks/usePayments'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { useRefunds } from '../hooks/useRefunds'

// Import the existing pages (they'll work as content sections)
import PaymentsPage from './PaymentsPage'
import PaymentMethodsPage from './PaymentMethodsPage'
import RefundsPage from './RefundsPage'

const FinancialManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('payments')

  // Get real counts from hooks
  const { payments } = usePayments()
  const { paymentMethods } = usePaymentMethods()
  const { refunds } = useRefunds()

  const tabs = [
    {
      label: 'الواردات',
      value: 'payments',
      icon: <Payment />,
      count: payments.length,
    },
    {
      label: 'وسائل الدفع',
      value: 'payment-methods',
      icon: <CreditCard />,
      count: paymentMethods.length,
    },
    {
      label: 'المبالغ المستردة',
      value: 'refunds',
      icon: <Undo />,
      count: refunds.length,
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
            إدارة شاملة للمدفوعات ووسائل الدفع والمبالغ المستردة
          </Typography>
        </Box>
      </Box>

      {/* Inner Navigation Bar */}
      <InnerNavBar tabs={tabs} value={activeTab} onChange={setActiveTab} />

      {/* Content based on active tab */}
      <Box sx={{ mt: 3 }}>
        {activeTab === 'payments' && <PaymentsPage />}
        {activeTab === 'payment-methods' && <PaymentMethodsPage />}
        {activeTab === 'refunds' && <RefundsPage />}
      </Box>
    </Box>
  )
}

export default FinancialManagementPage
