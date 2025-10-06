"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Container, IconButton, Stack } from "@mui/material"
import { LightMode, DarkMode } from "@mui/icons-material"
import { useAuth } from "../context/AuthContext"
import { useThemeMode } from "../context/ThemeContext"

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { mode, toggleTheme } = useThemeMode()

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
        background: mode === 'light'
          ? "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)"
          : "linear-gradient(135deg, #0A0A0A 0%, #1A0A0A 100%)",
        transition: 'background 0.3s ease',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            component="img"
            src="https://mushkilty.com/img/logo.webp"
            alt="Mushkilty Logo"
            sx={{
              height: 160,
              objectFit: 'contain',
              filter: mode === 'dark' ? 'brightness(1.2)' : 'none',
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            color={mode === 'light' ? 'text.primary' : 'white'}
          >
            نظام الإدارة المالية
          </Typography>
          <Typography
            variant="body1"
            color={mode === 'light' ? "text.secondary" : "rgba(255,255,255,0.7)"}
            mb={2}
          >
            قم بتسجيل الدخول للوصول إلى لوحة التحكم
          </Typography>

          <Stack
            onClick={toggleTheme}
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{
                width: 'fit-content', 
                pl: 1, pr: 2, pt:0, pb: 0, 
                mx: 'auto', 
                cursor: 'pointer',
                borderRadius: 2,
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
              }}
          >
            <IconButton
              sx={{
                color: 'text.primary',
              }}
            >
              {mode === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>

            <Typography
              variant="body2"
              color={mode === 'light' ? "text.secondary" : "rgba(255,255,255,0.7)"}
              sx={{ p: 0, m: 0, ml: 5 }}
            >
              {mode === 'light' ? 'الوضع الداكن' : 'الوضع المشرق'}
            </Typography>
          </Stack>
        </Box>

        <Card
          elevation={6}
          style={{ marginBottom: 40 }}
          sx={{
            backgroundColor: mode === 'light' ? 'background.paper' : 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
          }}
        >
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mt: 3 }}
              >
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: mode === 'light' ? 'background.default' : 'rgba(255,255,255,0.05)',
                  borderRadius: 1
                }}
              >
                <Typography
                  variant="caption"
                  color={mode === 'light' ? "text.secondary" : "rgba(255,255,255,0.7)"}
                  display="block"
                >
                  حسابات تجريبية:
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ mt: 1 }}
                  color={mode === 'light' ? "text.secondary" : "rgba(255,255,255,0.7)"}
                >
                  المدير: admin / password
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color={mode === 'light' ? "text.secondary" : "rgba(255,255,255,0.7)"}
                >
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
