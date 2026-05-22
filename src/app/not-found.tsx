import Link from "next/link"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-surface-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Page not found</h2>
        <p className="text-surface-500 text-sm mb-6 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
        >
          <Home className="w-4 h-4" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
