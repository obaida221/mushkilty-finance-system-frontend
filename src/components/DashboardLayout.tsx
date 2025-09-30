"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Tooltip,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  School,
  Class,
  Person,
  Receipt,
  Payment,
  MoneyOff,
  Undo,
  Discount,
  AccountBalance,
  Analytics,
  Logout,
  AccountCircle,
  LightMode,
  DarkMode,
} from "@mui/icons-material"
import { useAuth } from "../context/AuthContext"
import { useThemeMode } from "../context/ThemeContext"

const drawerWidth = 280

interface DashboardMenuItem {
  text: string
  icon: React.ReactElement
  path: string
  permission?: { resource: string; action: string }
}

const menuItems: DashboardMenuItem[] = [
  { text: "لوحة التحكم", icon: <Dashboard />, path: "/" },
  { text: "المستخدمين", icon: <People />, path: "/users", permission: { resource: "users", action: "read" } },
  { text: "الطلاب", icon: <School />, path: "/students" },
  { text: "الدورات", icon: <Class />, path: "/courses" },
  { text: "المدرسين", icon: <Person />, path: "/teachers" },
  { text: "المعاملات", icon: <Receipt />, path: "/transactions" },
  { text: "المدفوعات", icon: <Payment />, path: "/payments" },
  { text: "المصروفات", icon: <MoneyOff />, path: "/expenses" },
  { text: "المرتجعات", icon: <Undo />, path: "/refunds" },
  { text: "الخصومات", icon: <Discount />, path: "/discounts" },
  { text: "الرواتب", icon: <AccountBalance />, path: "/payroll" },
  { text: "التحليلات", icon: <Analytics />, path: "/analytics" },
]

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { user, logout, hasPermission } = useAuth()
  const { mode, toggleTheme } = useThemeMode()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.permission) return true
    return hasPermission(item.permission.resource, item.permission.action)
  })

  const drawer = (
    <Box>
      <Toolbar sx={{ justifyContent: "center", py: 3 }}>
        <Box sx={{ textAlign: "center" }}>
          <AccountBalance sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
          <Typography variant="h6" noWrap component="div">
            نظام إدارة المالية
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 2, py: 2 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path)
                if (isMobile) setMobileOpen(false)
              }}
              sx={{
                borderRadius: 1,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? "white" : "text.secondary" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
        elevation={0}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title={mode === "dark" ? "الوضع النهاري" : "الوضع الليلي"}>
            <IconButton 
              onClick={toggleTheme} 
              color="inherit"
              sx={{ mr: 1 }}
            >
              {mode === "dark" ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2">{user?.fullName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role?.nameAr}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={toggleTheme}>
              <ListItemIcon>
                {mode === "dark" ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
              </ListItemIcon>
              {mode === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              تسجيل الخروج
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: "background.paper",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: "background.paper",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}

export default DashboardLayout
