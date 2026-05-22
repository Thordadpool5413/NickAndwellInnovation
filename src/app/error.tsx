"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-600/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-surface-500 text-sm mb-6 leading-relaxed">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button onClick={reset} variant="primary" icon={<RefreshCw className="w-4 h-4" />}>
          Try Again
        </Button>
      </div>
    </div>
  )
}
