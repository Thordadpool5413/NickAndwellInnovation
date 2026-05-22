import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  accent?: "brand" | "green" | "amber" | "red" | "purple" | "cyan" | null
}

const accentBorders = {
  brand: "border-l-brand-500",
  green: "border-l-accent-green",
  amber: "border-l-yellow-500",
  red: "border-l-accent-red",
  purple: "border-l-accent-purple",
  cyan: "border-l-accent-cyan",
}

export function Card({ children, className, hover, accent }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-900 border border-surface-800 rounded-xl p-5 animate-fade-in",
        hover && "hover:border-surface-700 hover:bg-surface-900/80 transition-all duration-200",
        accent && accentBorders[accent],
        accent && "border-l-2",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-between mb-4", className)}>{children}</div>
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(className)}>{children}</div>
}
