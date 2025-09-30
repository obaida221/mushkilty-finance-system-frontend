// This file is deprecated - theme management has been moved to ThemeContext.tsx
// The theme is now dynamically created based on the selected mode (light/dark)
// and managed through the ThemeContextProvider

import { createTheme } from "@mui/material/styles"

// Legacy theme - now replaced by dynamic theme in ThemeContext
export const theme = createTheme({
  direction: "rtl",
  palette: {
    mode: "dark",
    primary: {
      main: "#DC2626",
      light: "#EF4444",
      dark: "#B91C1C",
    },
    secondary: {
      main: "#64748B",
      light: "#94A3B8",
      dark: "#475569",
    },
    background: {
      default: "#0A0A0A",
      paper: "#141414",
    },
    text: {
      primary: "#F8FAFC",
      secondary: "#94A3B8",
    },
    divider: "#1E293B",
    error: {
      main: "#EF4444",
    },
    warning: {
      main: "#F59E0B",
    },
    success: {
      main: "#10B981",
    },
    info: {
      main: "#3B82F6",
    },
  },
  typography: {
    fontFamily: '"Inter", "Cairo", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#141414",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#334155",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#475569",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #1E293B",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
})
