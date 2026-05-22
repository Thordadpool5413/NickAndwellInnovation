import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  icon?: React.ReactNode
}

const variantStyles = {
  primary: "bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-600/20",
  secondary: "bg-surface-800 hover:bg-surface-700 text-surface-300",
  ghost: "bg-transparent hover:bg-surface-800 text-surface-400 hover:text-surface-200",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  success: "bg-green-600 hover:bg-green-700 text-white",
}

const sizeStyles = {
  sm: "px-2.5 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-sm rounded-xl",
}

export function Button({ variant = "primary", size = "md", loading, icon, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  )
}
