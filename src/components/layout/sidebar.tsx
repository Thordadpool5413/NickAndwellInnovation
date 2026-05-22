"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLens } from "@/lib/lens-context"
import { useSidebar } from "@/lib/sidebar-context"
import { cn } from "@/lib/utils"
import {
  BarChart3, Crosshair, Shield, FileText, BookOpen,
  TrendingUp, Building2, Rocket, Activity, Settings, CheckSquare,
  Target, Sparkles, Menu,
} from "lucide-react"

interface NavSection {
  label: string
  items: {
    href: string
    label: string
    icon: React.ElementType
    lenses: readonly string[]
  }[]
}

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: BarChart3, lenses: ["executive", "sales-leader", "sales-rep", "admin"] as const },
      { href: "/ask-the-hub", label: "Ask the Hub", icon: Sparkles, lenses: ["executive", "sales-leader", "sales-rep", "admin"] as const },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/competitor-intake", label: "Competitor Intake", icon: Crosshair, lenses: ["executive", "sales-leader", "admin"] as const },
      { href: "/evidence-matrix", label: "Evidence Matrix", icon: Shield, lenses: ["executive", "sales-leader", "sales-rep", "admin"] as const },
      { href: "/review-center", label: "Review Center", icon: CheckSquare, lenses: ["executive", "sales-leader", "admin"] as const },
    ],
  },
  {
    label: "Strategy",
    items: [
      { href: "/battlecards", label: "Battlecards", icon: FileText, lenses: ["executive", "sales-leader", "sales-rep", "admin"] as const },
      { href: "/gap-finder", label: "Gap Finder", icon: Target, lenses: ["executive", "sales-leader", "admin"] as const },
      { href: "/growth-command", label: "Growth Command", icon: TrendingUp, lenses: ["executive", "sales-leader", "admin"] as const },
    ],
  },
  {
    label: "Planning",
    items: [
      { href: "/launch-plan", label: "Launch Plan", icon: Rocket, lenses: ["executive", "sales-leader", "admin"] as const },
      { href: "/board-room", label: "Board Room", icon: Building2, lenses: ["executive", "admin"] as const },
      { href: "/reports", label: "Reports", icon: FileText, lenses: ["executive", "sales-leader", "admin"] as const },
      { href: "/catalog", label: "Andwell Catalog", icon: BookOpen, lenses: ["sales-leader", "sales-rep", "admin"] as const },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/system-check", label: "System Check", icon: Activity, lenses: ["admin"] as const },
      { href: "/admin", label: "Settings", icon: Settings, lenses: ["admin"] as const },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { lens } = useLens()
  const { open, setOpen } = useSidebar()

  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.lenses.some((l) => l === lens)),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-surface-900 border-r border-surface-800 flex flex-col h-screen",
          "transition-transform duration-300 ease-in-out",
          "lg:relative lg:translate-x-0 lg:z-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="p-5 border-b border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Andwell</h1>
              <p className="text-xs text-surface-500 font-medium">Command Center</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {filteredSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                        isActive
                          ? "bg-brand-600/15 text-brand-400 border border-brand-600/20"
                          : "text-surface-400 hover:text-surface-200 hover:bg-surface-800 border border-transparent",
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-brand-400" : "text-surface-500 group-hover:text-surface-300",
                      )} />
                      {item.label}
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-surface-800">
          <div className="flex items-center gap-3 px-3 py-2 text-xs text-surface-500">
            <div className="w-6 h-6 rounded-md bg-green-600/20 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-green-400" />
            </div>
            <div>
              <p className="text-surface-400 font-medium">System Online</p>
              <p>v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-30 p-2 rounded-lg bg-surface-900 border border-surface-800 text-surface-400 hover:text-white lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  )
}
