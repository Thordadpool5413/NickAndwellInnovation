"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import type { Lens } from "@/lib/types"

interface LensContextType {
  lens: Lens
  setLens: (l: Lens) => void
}

const LensContext = createContext<LensContextType>({ lens: "executive", setLens: () => {} })

export function LensProvider({ children }: { children: ReactNode }) {
  const [lens, setLens] = useState<Lens>("executive")
  return <LensContext.Provider value={{ lens, setLens }}>{children}</LensContext.Provider>
}

export const useLens = () => useContext(LensContext)
