import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  search?: boolean
}

export function Input({ icon, search, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {search && <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />}
      {icon && !search && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">{icon}</div>}
      <input
        className={cn(
          "w-full bg-surface-900 border border-surface-700 rounded-lg px-4 py-2 text-sm text-white",
          "placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30",
          "transition-all duration-200",
          (search || icon) ? "pl-10" : "",
          className,
        )}
        {...props}
      />
    </div>
  )
}
