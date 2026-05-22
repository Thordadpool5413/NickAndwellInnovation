"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface SidebarContextType {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType>({ open: true, setOpen: () => {}, toggle: () => {} })

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggle: () => setOpen((prev) => !prev) }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
