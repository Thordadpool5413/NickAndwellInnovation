import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  label: string
  value: string
  change?: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  color?: "brand" | "green" | "amber" | "red" | "purple" | "cyan"
  className?: string
}

const colorMap = {
  brand: "text-brand-400",
  green: "text-green-400",
  amber: "text-amber-400",
  red: "text-red-400",
  purple: "text-purple-400",
  cyan: "text-cyan-400",
}

export function StatCard({ label, value, change, icon, trend, color = "brand", className }: StatCardProps) {
  return (
    <div className={cn("bg-surface-900 border border-surface-800 rounded-xl p-5 hover:border-surface-700 transition-all duration-200 group", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn("transition-colors duration-200 group-hover:scale-110", colorMap[color])}>
          {icon}
        </div>
        <div className="flex items-center gap-1">
          {trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-green-400" />}
          {trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
          {change && (
            <span className={cn(
              "text-xs font-medium",
              trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-surface-500",
            )}>
              {change}
            </span>
          )}
        </div>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      <div className="text-sm text-surface-500 mt-1">{label}</div>
    </div>
  )
}
