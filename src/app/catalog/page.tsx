"use client"

import { BookOpen } from "lucide-react"
import { useState } from "react"
import { mockCatalogItems } from "@/lib/data"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

export default function CatalogPage() {
  const [search, setSearch] = useState("")
  const filtered = mockCatalogItems.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Andwell Catalog</h1>
        <p className="text-surface-500 text-sm mt-1.5">
          Service catalog with evidence-backed capability descriptions
        </p>
      </div>

      <Input
        search
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search catalog..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} hover>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-brand-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white">{item.name}</h3>
                <Badge className="mt-1.5">{item.category}</Badge>
                <p className="text-sm text-surface-400 mt-2 leading-relaxed">{item.description}</p>
                <div className="mt-3">
                  <span className="text-xs text-surface-600">
                    {item.evidence.length} evidence item{item.evidence.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={<BookOpen className="w-7 h-7" />}
          title="No catalog items found"
          description="Try adjusting your search query."
        />
      )}

      <p className="text-xs text-surface-600">{filtered.length} of {mockCatalogItems.length} catalog items</p>
    </div>
  )
}
