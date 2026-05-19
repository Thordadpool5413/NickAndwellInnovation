"use client"

import { useLens } from "@/lib/lens-context"
import { LensSwitcher } from "./lens-switcher"

export function Header() {
  const { lens, setLens } = useLens()

  return (
    <header className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <LensSwitcher current={lens} onSwitch={setLens} />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500">v1.0.0</span>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
          AI
        </div>
      </div>
    </header>
  )
}
