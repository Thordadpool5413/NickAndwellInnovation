import { cn } from "@/lib/utils"

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-surface-800", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-surface-800 bg-surface-900/50">{children}</tr>
    </thead>
  )
}

export function TableHeaderCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider", className)}>
      {children}
    </th>
  )
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-surface-800">{children}</tbody>
}

export function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("hover:bg-surface-800/50 transition-colors", className)}>{children}</tr>
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-surface-300", className)}>{children}</td>
}
