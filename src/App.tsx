"use client"

import type React from "react"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import rtlPlugin from "stylis-plugin-rtl"
import { CacheProvider } from "@emotion/react"
import createCache from "@emotion/cache"
import { prefixer } from "stylis"
import { ThemeContextProvider, useThemeMode } from "./context/ThemeContext"
import { AuthProvider, useAuth } from "./context/AuthContext"
import LoginPage from "./pages/LoginPage"
import DashboardLayout from "./components/DashboardLayout"
import DashboardPage from "./pages/DashboardPage"
import UsersPage from "./pages/UsersPage"
import StudentsPage from "./pages/StudentsPage"
import CoursesPage from "./pages/CoursesPage"
import BatchesPage from "./pages/BatchesPage"
import EnrollmentsPage from "./pages/EnrollmentsPage"
import TeachersPage from "./pages/TeachersPage"
import TransactionsPage from "./pages/TransactionsPage"
import PaymentsPage from "./pages/PaymentsPage"
import PaymentMethodsPage from "./pages/PaymentMethodsPage"
import ExpensesPage from "./pages/ExpensesPage"
import RefundsPage from "./pages/RefundsPage"
import DiscountsPage from "./pages/DiscountsPage"
import PayrollPage from "./pages/PayrollPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import DebugPermissionsPage from "./pages/DebugPermissionsPage"
import UserManagementPage from "./pages/UserManagementPage"
import RoleManagementPage from "./pages/RoleManagementPage"
import PermissionManagementPage from "./pages/PermissionManagementPage"

// Create RTL cache
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
})

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>جاري التحميل...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const AppContent: React.FC = () => {
  const { theme } = useThemeMode()
  
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/debug-permissions" element={<DebugPermissionsPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/users/manage" element={<UserManagementPage />} />
                        <Route path="/roles/manage" element={<RoleManagementPage />} />
                        <Route path="/permissions/manage" element={<PermissionManagementPage />} />
                        <Route path="/students" element={<StudentsPage />} />
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/batches" element={<BatchesPage />} />
                        <Route path="/enrollments" element={<EnrollmentsPage />} />
                        <Route path="/teachers" element={<TeachersPage />} />
                        <Route path="/transactions" element={<TransactionsPage />} />
                        <Route path="/payment-methods" element={<PaymentMethodsPage />} />
                        <Route path="/payments" element={<PaymentsPage />} />
                        <Route path="/expenses" element={<ExpensesPage />} />
                        <Route path="/refunds" element={<RefundsPage />} />
                        <Route path="/discounts" element={<DiscountsPage />} />
                        <Route path="/payroll" element={<PayrollPage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  )
}

function App() {
  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  )
}

export default App
