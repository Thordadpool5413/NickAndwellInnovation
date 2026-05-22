import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "brand" | "green" | "amber" | "red" | "purple" | "cyan" | "orange"

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-800 text-surface-400",
  brand: "bg-brand-900/40 text-brand-300 border-brand-800",
  green: "bg-green-900/40 text-green-300 border-green-800",
  amber: "bg-amber-900/40 text-amber-300 border-amber-800",
  red: "bg-red-900/40 text-red-300 border-red-800",
  purple: "bg-purple-900/40 text-purple-300 border-purple-800",
  cyan: "bg-cyan-900/40 text-cyan-300 border-cyan-800",
  orange: "bg-orange-900/40 text-orange-300 border-orange-800",
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  dot?: boolean
}

export function Badge({ children, variant = "default", className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium border border-transparent",
        variantStyles[variant],
        className,
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", variant === "default" ? "bg-surface-500" : "bg-current")} />}
      {children}
    </span>
  )
}
