"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createTheme, Theme } from "@mui/material/styles"

type ThemeMode = "light" | "dark"

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
  theme: Theme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const createAppTheme = (mode: ThemeMode): Theme => {
  return createTheme({
    direction: "rtl",
    palette: {
      mode,
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
        default: mode === "dark" ? "#202028ff" : "#F8FAFC",
        paper: mode === "dark" ? "#141414" : "#FFFFFF",
      },
      text: {
        primary: mode === "dark" ? "#F8FAFC" : "#1E293B",
        secondary: mode === "dark" ? "#94A3B8" : "#64748B",
      },
      divider: mode === "dark" ? "#1E293B" : "#E2E8F0",
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
              background: mode === "dark" ? "#141414" : "#F1F5F9",
            },
            "&::-webkit-scrollbar-thumb": {
              background: mode === "dark" ? "#334155" : "#CBD5E1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: mode === "dark" ? "#475569" : "#94A3B8",
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
            border: `1px solid ${mode === "dark" ? "#1E293B" : "#E2E8F0"}`,
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
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeContextProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>("dark")

  useEffect(() => {
    // Get theme from localStorage on mount
    const savedTheme = localStorage.getItem("themeMode") as ThemeMode
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setMode(savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newMode = mode === "dark" ? "light" : "dark"
    setMode(newMode)
    localStorage.setItem("themeMode", newMode)
  }

  const theme = createAppTheme(mode)

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeContextProvider")
  }
  return context
}