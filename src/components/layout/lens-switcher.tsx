"use client"

import { Crown, Users, User, ShieldCheck } from "lucide-react"
import type { Lens } from "@/lib/types"
import { cn } from "@/lib/utils"

const lenses: { id: Lens; label: string; icon: React.ElementType; description: string }[] = [
  { id: "executive", label: "Executive", icon: Crown, description: "High-level metrics and strategy" },
  { id: "sales-leader", label: "Sales Leader", icon: Users, description: "Team performance and pipeline" },
  { id: "sales-rep", label: "Sales Rep", icon: User, description: "Battlecards and talk tracks" },
  { id: "admin", label: "Admin", icon: ShieldCheck, description: "System configuration" },
]

export function LensSwitcher({ current, onSwitch }: { current: Lens; onSwitch: (l: Lens) => void }) {
  return (
    <div className="flex items-center gap-0.5 bg-surface-800 rounded-lg p-1">
      {lenses.map((l) => (
        <button
          key={l.id}
          onClick={() => onSwitch(l.id)}
          title={l.description}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 group",
            current === l.id
              ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30"
              : "text-surface-400 hover:text-surface-200 hover:bg-surface-700",
          )}
        >
          <l.icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{l.label}</span>
        </button>
      ))}
    </div>
  )
}
