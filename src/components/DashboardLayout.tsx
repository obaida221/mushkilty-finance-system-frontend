"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  Snackbar,
  Alert,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Logout,
  AccountCircle,
  LightMode,
  DarkMode,
  LocalLibrary,
  AccountBalanceWallet,
} from "@mui/icons-material"
import { useAuth } from "../context/AuthContext"
import { usePermissions } from "../hooks/usePermissions.tsx"
import { getFirstAccessibleRoute } from "../hooks/usePermissions"
import { useThemeMode } from "../context/ThemeContext"

const drawerWidth = 280

interface DashboardMenuItem {
  text: string
  icon: React.ReactElement
  path: string
  permission?: string
  permissions?: string[]
}

const menuItems: DashboardMenuItem[] = [
  { text: "لوحة التحكم", icon: <Dashboard />, path: "/", permission: "dashboard:read" },
  { text: "المستخدمون والصلاحيات", icon: <People />, path: "/users", permissions: ["users:read", "roles:read", "permissions:read"] },
  { text: "الشؤون الأكاديمية", icon: <LocalLibrary />, path: "/academic", permissions: ["students:read", "courses:read", "batches:read", "enrollments:read", "discount-codes:read"] },
  { text: "إدارة المالية", icon: <AccountBalanceWallet />, path: "/financial", permissions: ["payments:read", "payment-methods:read", "expenses:read", "refunds:read", "payrolls:read"] },
]

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'warning' as 'warning' | 'error' | 'info' | 'success'
  });
  const { user, logout } = useAuth()
  const { hasPermission, hasAnyPermission, getFirstAccessibleRoute } = usePermissions()
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

  // Handle menu item click with permission check
  const handleMenuItemClick = (item: DashboardMenuItem) => {
    // Check if user has permission for this menu item
    let hasAccess = false

    if (item.permission) {
      hasAccess = hasPermission(item.permission)
    } else if (item.permissions) {
      hasAccess = hasAnyPermission(item.permissions)
    } else {
      hasAccess = true // No permission required
    }

    if (hasAccess) {
      // For academic and financial pages, we want to preserve the current tab
      if (item.path === '/academic' || item.path === '/financial') {
        // If we're already on the same page, don't navigate
        if (location.pathname === item.path) {
          if (isMobile) setMobileOpen(false)
          return
        }

        // When navigating to academic/financial pages, preserve the current tab in session storage
        // This ensures that when user navigates back to the same page, they see the same tab
        const storageKey = item.path === '/academic' ? 'academicActiveTab' : 'financialActiveTab'
        const currentTab = sessionStorage.getItem(storageKey)

        // If there's no saved tab, use the default based on permissions
        if (!currentTab) {
          const defaultTab = item.path === '/academic' 
            ? getDefaultAcademicTab() 
            : getDefaultFinancialTab()
          sessionStorage.setItem(storageKey, defaultTab)
        }
      }

      navigate(item.path)
      if (isMobile) setMobileOpen(false)
    } else {
      // Show permission denied message
      setSnackbar({
        open: true,
        message: `ليس لديك صلاحية للوصول إلى ${item.text}`,
        severity: 'warning'
      })
    }
  }

  // Check if current page is accessible to user
  const isCurrentPageAccessible = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname)
    if (!currentItem) return true // Assume accessible if not in our menu items

    if (currentItem.permission) {
      return hasPermission(currentItem.permission)
    } else if (currentItem.permissions) {
      return hasAnyPermission(currentItem.permissions)
    }

    return true
  }

  // Redirect to first accessible route if current page is not accessible
  useEffect(() => {
    if (!isCurrentPageAccessible()) {
      const firstAccessibleRoute = getFirstAccessibleRoute()
      navigate(firstAccessibleRoute, { replace: true })
    }
  }, [location.pathname, navigate, isCurrentPageAccessible, getFirstAccessibleRoute])

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const drawer = (
    <Box>
      <Toolbar sx={{ justifyContent: "center", py: 3 }}>
        <Box sx={{ textAlign: "center" }}>
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
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleMenuItemClick(item)}
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
    <>
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
            <Avatar sx={{ bgcolor: "primary.main", display: { xs: "none", md: "flex" } as any }}>
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

      {/* Permission Denied Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
    </>
  )
}

export default DashboardLayout
