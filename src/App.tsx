import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { UsersPage } from "@/pages/UsersPage"
import { CoursesPage } from "@/pages/CoursesPage"
import { TeachersPage } from "@/pages/TeachersPage"
import { StudentsPage } from "@/pages/StudentsPage"
import { TransactionsPage } from "@/pages/TransactionsPage"
import { PaymentsPage } from "@/pages/PaymentsPage"
import { ExpensesPage } from "@/pages/ExpensesPage"
import { RefundsPage } from "@/pages/RefundsPage"
import { PayrollPage } from "@/pages/PayrollPage"
import { DiscountsPage } from "@/pages/DiscountsPage"
import { AnalyticsPage } from "@/pages/AnalyticsPage"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredPermission={{ resource: "users", action: "manage" }}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute requiredPermission={{ resource: "students", action: "manage" }}>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute requiredPermission={{ resource: "courses", action: "manage" }}>
                  <CoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <ProtectedRoute requiredPermission={{ resource: "courses", action: "manage" }}>
                  <TeachersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute requiredPermission={{ resource: "finance", action: "view" }}>
                  <TransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute requiredPermission={{ resource: "finance", action: "manage" }}>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute requiredPermission={{ resource: "finance", action: "manage" }}>
                  <ExpensesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/refunds"
              element={
                <ProtectedRoute requiredPermission={{ resource: "finance", action: "manage" }}>
                  <RefundsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll"
              element={
                <ProtectedRoute requiredPermission={{ resource: "finance", action: "manage" }}>
                  <PayrollPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discounts"
              element={
                <ProtectedRoute requiredPermission={{ resource: "finance", action: "manage" }}>
                  <DiscountsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute requiredPermission={{ resource: "analytics", action: "view" }}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
