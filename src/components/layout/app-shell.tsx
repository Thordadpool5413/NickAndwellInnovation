"use client"

import { LensProvider } from "@/lib/lens-context"
import { SidebarProvider } from "@/lib/sidebar-context"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LensProvider>
      <SidebarProvider>
        <div className="flex h-screen bg-surface-950 text-surface-100 overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </LensProvider>
  )
}
