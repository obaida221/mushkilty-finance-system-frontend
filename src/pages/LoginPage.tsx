"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Container } from "@mui/material"
import { AccountBalance } from "@mui/icons-material"
import { useAuth } from "../context/AuthContext"

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(username, password)
      navigate("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0A0A0A 0%, #1A0A0A 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <AccountBalance sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom>
            نظام إدارة المالية
          </Typography>
          <Typography variant="body1" color="text.secondary">
            قم بتسجيل الدخول للوصول إلى لوحة التحكم
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                autoFocus
              />
              <TextField
                fullWidth
                label="كلمة المرور"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button type="submit" fullWidth variant="contained" size="large" disabled={isLoading} sx={{ mt: 3 }}>
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>

              <Box sx={{ mt: 3, p: 2, bgcolor: "background.default", borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  حسابات تجريبية:
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  المدير: admin / password
                </Typography>
                <Typography variant="caption" display="block">
                  المحاسب: accountant / password
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default LoginPage
