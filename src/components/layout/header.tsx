"use client"

import { useLens } from "@/lib/lens-context"
import { LensSwitcher } from "./lens-switcher"
import { Bell } from "lucide-react"
import { mockEvidence } from "@/lib/data"
import Link from "next/link"
export function Header() {
  const { lens, setLens } = useLens()
  const pendingReviews = mockEvidence.filter((e) => !e.confidence || e.confidence === "possible").length

  return (
    <header className="h-14 bg-surface-900 border-b border-surface-800 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <LensSwitcher current={lens} onSwitch={setLens} />
      </div>

      <div className="flex items-center gap-3">
        {pendingReviews > 0 && (
          <Link
            href="/review-center"
            className="relative p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-amber-400 transition-all duration-200"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-white flex items-center justify-center">
              {pendingReviews}
            </span>
          </Link>
        )}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
          AW
        </div>
      </div>
    </header>
  )
}
