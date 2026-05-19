"use client"

import { LensProvider } from "@/lib/lens-context"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LensProvider>
      <div className="flex h-screen bg-zinc-950 text-zinc-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </LensProvider>
  )
}
