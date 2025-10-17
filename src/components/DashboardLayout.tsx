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
  Equalizer,
  Paid,
  CurrencyExchange,
  AttachMoney,
  PersonAdd,
} from "@mui/icons-material"
import { useAuth } from "../context/AuthContext"
import { usePermission } from "../context/AuthContext"
import { useThemeMode } from "../context/ThemeContext"

const drawerWidth = 280

interface DashboardMenuItem {
  text: string
  icon: React.ReactElement
  path: string
  permission?: string
}

const menuItems: DashboardMenuItem[] = [
  { text: "لوحة التحكم", icon: <Dashboard />, path: "/", permission: "dashboard:read" },
  { text: "المستخدمون والصلاحيات", icon: <People />, path: "/users", permission: "users:read" },
  { text: "الطلاب", icon: <School />, path: "/students", permission: "students:read" },
  { text: "الدورات", icon: <Class />, path: "/courses", permission: "courses:read" },
  { text: "دُفعات الدورات", icon: <AccountBalance />, path: "/batches", permission: "batches:read" },
  { text: "التسجيلات", icon: <PersonAdd />, path: "/enrollments", permission: "enrollments:read" },
  { text: "المعاملات", icon: <Receipt />, path: "/transactions", permission: "transactions:read" },
  { text: "المدفوعات", icon: <Payment />, path: "/payments", permission: "payments:read" },
  { text: "وسائل الدفع", icon: <CurrencyExchange />, path: "/payment-methods", permission: "payment-methods:read" },
  { text: "المصروفات", icon: <MoneyOff />, path: "/expenses", permission: "expenses:read" },
  { text: "المبالغ المستردة", icon: <Undo />, path: "/refunds", permission: "refunds:read" },
  { text: "الخصومات", icon: <Discount />, path: "/discounts", permission: "discount-codes:read" },
  { text: "كشوف الرواتب", icon: <Paid />, path: "/payroll", permission: "payroll:read" },
  { text: "التحليلات", icon: <Equalizer />, path: "/analytics", permission: "analytics:read" },
]

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { user, logout } = useAuth()
  const { hasPermission } = usePermission()
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

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems.filter((item) => {
    // If item has no permission requirement, show it
    if (!item.permission) return true
    // Otherwise, check if user has the required permission
    return hasPermission(item.permission)
  })

  const drawer = (
    <Box>
      <Toolbar sx={{ justifyContent: "center", py: 3 }}>
        <Box sx={{ textAlign: "center" }}>
          {/* <AccountBalance sx={{ fontSize: 40, color: "primary.main", mb: 1 }} /> */}
          <Box
            component="img"
            src="https://mushkilty.com/img/logo.webp"
            alt="Mushkilty Logo"
            sx={{
              height: 60,
              objectFit: 'contain'
            }}
          />
          <Typography variant="h6" noWrap component="div">
            نظام الإدارة المالية
          </Typography>
          
        </Box>
      </Toolbar>
      <Divider />
      <Box sx={{ px: 2, py: 1, flexDirection: "row", alignItems: "center", gap: 0.5, display: { xs: "flex", md: "none" } }}>
        <Avatar sx={{ bgcolor: "primary.main" }}>
          <AccountCircle />
        </Avatar>
        <Box sx={{ px: 2, py: 1, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <Typography variant="subtitle2">{user?.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {`(${user?.role?.name})`}
          </Typography>
        </Box>
      </Box>
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
                  color: "white",
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
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          تسجيل الخروج
        </MenuItem>
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
          <Tooltip title={mode === "dark" ? "الوضع المشرق" : "الوضع الداكن"}>
            <IconButton 
              onClick={toggleTheme} 
              color="inherit"
              sx={{ mr: 1, color: "text.primary" }}
            >
              {mode === "dark" ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ display: { md: "none" }, color: "text.primary" }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: "primary.main", display: { xs: "none", md: "flex" } }}>
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
            style={{ marginTop: 5 }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2">{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role?.name}
              </Typography>
            </Box>
            <Divider />
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
