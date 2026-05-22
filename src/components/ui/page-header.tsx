import { cn } from "@/lib/utils"
import { Badge } from "./badge"

interface PageHeaderProps {
  title: string
  description?: string
  badge?: { label: string; variant?: "brand" | "green" | "amber" | "red" | "purple" | "cyan" }
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, badge, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between animate-fade-in", className)}>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          {badge && <Badge variant={badge.variant || "brand"}>{badge.label}</Badge>}
        </div>
        {description && <p className="text-surface-500 text-sm mt-1.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  )
}
