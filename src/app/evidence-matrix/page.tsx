"use client"

import { useState, useMemo } from "react"
import { Star, MapPin, ExternalLink, ShieldCheck, Newspaper, Globe, Building2 } from "lucide-react"
import { mockEvidence, mockCompetitors } from "@/lib/data"
import { SOURCE_CREDIBILITY_LABEL, SourceCredibility } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

const credibilityIcons: Record<SourceCredibility, React.ReactNode> = {
  government: <Building2 className="w-3 h-3" />,
  official: <ShieldCheck className="w-3 h-3" />,
  press: <Newspaper className="w-3 h-3" />,
  scraped: <Globe className="w-3 h-3" />,
  unknown: <Globe className="w-3 h-3" />,
}

const credibilityVariants: Record<SourceCredibility, "brand" | "green" | "amber" | "default"> = {
  government: "brand",
  official: "green",
  press: "amber",
  scraped: "default",
  unknown: "default",
}

export default function EvidenceMatrixPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [maineOnly, setMaineOnly] = useState(false)
  const [groupByService, setGroupByService] = useState(false)

  const allEvidence = mockEvidence

  const filtered = allEvidence.filter((e) => {
    const matchSearch =
      e.snippet.toLowerCase().includes(search.toLowerCase()) ||
      e.source.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "all" || e.competitorId === filter
    const matchMaine = !maineOnly || e.maineRelevance
    return matchSearch && matchFilter && matchMaine
  })

  const competitorOptions = [
    { value: "all", label: "All Competitors" },
    ...mockCompetitors.map((c) => ({ value: c.id, label: c.name })),
  ]

  const serviceGroups = useMemo(() => {
    if (!groupByService) return null
    const groups: Record<string, typeof filtered> = {}
    for (const ev of filtered) {
      const serviceName =
        ev.serviceId === "home-health"
          ? "Home Healthcare"
          : ev.serviceId === "mobile-wound"
            ? "Mobile Wound Care"
            : ev.serviceId === "therapy-care"
              ? "Therapy Care"
              : "Other"
      if (!groups[serviceName]) groups[serviceName] = []
      groups[serviceName].push(ev)
    }
    return groups
  }, [filtered, groupByService])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Evidence Matrix</h1>
        <p className="text-surface-500 text-sm mt-1.5">
          Structured Maine market intelligence from competitor monitoring
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            search
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search evidence..."
          />
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} options={competitorOptions} />
        <button
          onClick={() => setMaineOnly(!maineOnly)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all duration-200 ${
            maineOnly
              ? "bg-brand-900/30 border-brand-700 text-brand-300"
              : "bg-surface-900 border-surface-700 text-surface-400 hover:text-surface-200"
          }`}
        >
          <MapPin className="w-3 h-3" />
          Maine only
        </button>
        <button
          onClick={() => setGroupByService(!groupByService)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all duration-200 ${
            groupByService
              ? "bg-purple-900/30 border-purple-700 text-purple-300"
              : "bg-surface-900 border-surface-700 text-surface-400 hover:text-surface-200"
          }`}
        >
          Group by service
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <EmptyState
            title="No evidence found"
            description="Try adjusting your search or filters to find intelligence items."
          />
        )}

        {!groupByService &&
          filtered.map((ev) => {
            const comp = mockCompetitors.find((c) => c.id === ev.competitorId)
            const credibility = ev.credibility || "unknown"
            return (
              <Card key={ev.id} className={ev.maineRelevance ? "border-l-brand-500 border-l-2" : ""}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{comp?.name || "Unknown"}</span>
                    <Badge>{ev.source}</Badge>
                    {ev.maineRelevance && <Badge variant="brand">Maine</Badge>}
                    <Badge variant={credibilityVariants[credibility as SourceCredibility]}>
                      {credibilityIcons[credibility as SourceCredibility]}
                      <span className="ml-1">{SOURCE_CREDIBILITY_LABEL[credibility as SourceCredibility]}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 shrink-0 ml-3">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-medium">{ev.relevance}/10</span>
                  </div>
                </div>
                <p className="text-sm text-surface-300 leading-relaxed">{ev.snippet}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-surface-600">
                  <span>{ev.date}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </Card>
            )
          })}

        {groupByService &&
          serviceGroups &&
          Object.entries(serviceGroups).map(([serviceName, items]) => (
            <div key={serviceName}>
              <div className="flex items-center gap-2 mb-2 mt-4">
                <h3 className="text-sm font-semibold text-surface-300">{serviceName}</h3>
                <Badge>{items.length} items</Badge>
              </div>
              <div className="space-y-3">
                {items.map((ev) => {
                  const comp = mockCompetitors.find((c) => c.id === ev.competitorId)
                  const credibility = ev.credibility || "unknown"
                  return (
                    <Card key={ev.id} className={ev.maineRelevance ? "border-l-brand-500 border-l-2" : ""}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-white">{comp?.name || "Unknown"}</span>
                          <Badge>{ev.source}</Badge>
                          {ev.maineRelevance && <Badge variant="brand">Maine</Badge>}
                          <Badge variant={credibilityVariants[credibility as SourceCredibility]}>
                            {credibilityIcons[credibility as SourceCredibility]}
                            <span className="ml-1">{SOURCE_CREDIBILITY_LABEL[credibility as SourceCredibility]}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 shrink-0 ml-3">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-medium">{ev.relevance}/10</span>
                        </div>
                      </div>
                      <p className="text-sm text-surface-300 leading-relaxed">{ev.snippet}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-surface-600">
                        <span>{ev.date}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
      </div>

      <p className="text-xs text-surface-600">
        {filtered.length} of {allEvidence.length} evidence items
      </p>
    </div>
  )
}
