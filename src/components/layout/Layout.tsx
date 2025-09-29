import type React from "react"
import { Sidebar } from "./Sidebar"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 overflow-auto">{children}</main>
      <Sidebar />
    </div>
  )
}
