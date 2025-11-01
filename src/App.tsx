"use client"

import type React from "react"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import rtlPlugin from "stylis-plugin-rtl"
import { CacheProvider } from "@emotion/react"
import createCache from "@emotion/cache"
import { ThemeContextProvider, useThemeMode } from "./context/ThemeContext"
import { AuthProvider } from "./context/AuthContext"
import { ExchangeRateProvider } from "./context/ExchangeRateContext"
import { ProtectedRoute } from "./components/ProtectedRoute"
import LoginPage from "./pages/LoginPage"
import DashboardLayout from "./components/DashboardLayout"
import DashboardPage from "./pages/DashboardPage"
import UsersPage from "./pages/UsersPage"
import StudentsPage from "./pages/StudentsPage"
import CoursesPage from "./pages/CoursesPage"
import BatchesPage from "./pages/BatchesPage"
import EnrollmentsPage from "./pages/EnrollmentsPage"
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
import InnerNavTestPage from "./pages/InnerNavTestPage"
import AcademicManagementPage from "./pages/AcademicManagementPage"
import FinancialManagementPage from "./pages/FinancialManagementPage"

// Create RTL cache
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [rtlPlugin],
})

const AppContent: React.FC = () => {
  const { theme } = useThemeMode()

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ExchangeRateProvider>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/debug-permissions" element={<DebugPermissionsPage />} />
                <Route path="/inner-nav-test" element={<InnerNavTestPage />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Routes>
                          {/* Dashboard */}
                          <Route
                            path="/"
                            element={
                              <ProtectedRoute requiredPermission="dashboard:read">
                                <DashboardPage />
                              </ProtectedRoute>
                            }
                          />

                          {/* User Management */}
                          <Route
                            path="/users"
                            element={
                              <ProtectedRoute requiredPermission="users:read">
                                <UsersPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/users/manage"
                            element={
                              <ProtectedRoute requiredPermission="users:read">
                                <UserManagementPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/roles/manage"
                            element={
                              <ProtectedRoute requiredPermission="roles:read">
                                <RoleManagementPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/permissions/manage"
                            element={
                              <ProtectedRoute requiredPermission="permissions:read">
                                <PermissionManagementPage />
                              </ProtectedRoute>
                            }
                          />

                          {/* Academic Management - Unified Page */}
                          <Route
                            path="/academic"
                            element={
                              <ProtectedRoute requiredPermissions={["students:read", "courses:read", "batches:read", "enrollments:read", "discounts:read"]}>
                                <AcademicManagementPage />
                              </ProtectedRoute>
                            }
                          />

                          {/* Academic Management - Individual Pages (keep for backward compatibility) */}
                          <Route
                            path="/students"
                            element={
                              <ProtectedRoute requiredPermission="students:read">
                                <StudentsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/courses"
                            element={
                              <ProtectedRoute requiredPermission="courses:read">
                                <CoursesPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/batches"
                            element={
                              <ProtectedRoute requiredPermission="batches:read">
                                <BatchesPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/enrollments"
                            element={
                              <ProtectedRoute requiredPermission="enrollments:read">
                                <EnrollmentsPage />
                              </ProtectedRoute>
                            }
                          />

                          {/* Financial Management - Unified Page */}
                          <Route
                            path="/financial"
                            element={
                              <ProtectedRoute requiredPermissions={["payments:read", "expenses:read", "refunds:read", "payment-methods:read", "payroll:read"]}>
                                <FinancialManagementPage />
                              </ProtectedRoute>
                            }
                          />

                          {/* Financial Management - Individual Pages (keep for backward compatibility) */}
                          <Route
                            path="/transactions"
                            element={
                              <ProtectedRoute requiredPermission="transactions:read">
                                <TransactionsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/payment-methods"
                            element={
                              <ProtectedRoute requiredPermission="payment-methods:read">
                                <PaymentMethodsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/payments"
                            element={
                              <ProtectedRoute requiredPermission="payments:read">
                                <PaymentsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/expenses"
                            element={
                              <ProtectedRoute requiredPermission="expenses:read">
                                <ExpensesPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/refunds"
                            element={
                              <ProtectedRoute requiredPermission="refunds:read">
                                <RefundsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/discounts"
                            element={
                              <ProtectedRoute requiredPermission="discounts:read">
                                <DiscountsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/payroll"
                            element={
                              <ProtectedRoute requiredPermission="payroll:read">
                                <PayrollPage />
                              </ProtectedRoute>
                            }
                          />

                          {/* Analytics */}
                          <Route
                            path="/analytics"
                            element={
                              <ProtectedRoute requiredPermission="analytics:read">
                                <AnalyticsPage />
                              </ProtectedRoute>
                            }
                          />
                        </Routes>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </AuthProvider>
        </ExchangeRateProvider>
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
