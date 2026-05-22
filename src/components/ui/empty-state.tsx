import { cn } from "@/lib/utils"
import { Inbox } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in", className)}>
      <div className="w-14 h-14 rounded-2xl bg-surface-800 flex items-center justify-center mb-4 text-surface-500">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <p className="text-surface-300 font-medium mb-1">{title}</p>
      {description && <p className="text-surface-500 text-sm max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
