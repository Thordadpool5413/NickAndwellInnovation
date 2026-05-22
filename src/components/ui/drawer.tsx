import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  width?: string
}

export function Drawer({ open, onClose, title, children, className, width = "w-96" }: DrawerProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="bg-black/60 absolute inset-0 animate-fade-in" onClick={onClose} />
      <div className={cn("relative bg-surface-900 border-l border-surface-800 h-full overflow-y-auto p-6 animate-slide-in-right shadow-2xl", width, className)}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
