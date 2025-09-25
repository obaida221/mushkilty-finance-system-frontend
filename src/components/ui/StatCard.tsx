import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./Card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <p
            className={cn(
              "text-xs mt-1",
              changeType === "positive" && "text-green-600",
              changeType === "negative" && "text-red-600",
              changeType === "neutral" && "text-muted-foreground",
            )}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
