"use client"

import { useState, useMemo } from "react"
import { Target, Download, FileText, Lightbulb, AlertTriangle, TrendingUp, DollarSign } from "lucide-react"
import { mockEvidence, mockCompetitors } from "@/lib/data"
import { subServices } from "@/lib/taxonomy"
import type { GapFinding } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

export default function GapFinderPage() {
  const [priority, setPriority] = useState<string>("all")
  const [search, setSearch] = useState("")

  const gaps = useMemo(() => {
    const result: GapFinding[] = []
    const findings = mockEvidence
    const competitors = mockCompetitors

    for (const ss of subServices) {
      const compFindings = findings.filter((f) => f.subServiceId === ss.id)
      const competitorsWithEvidence = new Set(compFindings.map((f) => f.competitorId))
      const confirmedCount = compFindings.filter((f) => f.confidence === "confirmed").length
      const weightedTotal = compFindings.reduce((sum, f) => {
        const credWeight = f.credibility === "government" ? 1.0 : f.credibility === "official" ? 0.9 : f.credibility === "press" ? 0.7 : 0.4
        return sum + credWeight * (f.confidence === "confirmed" ? 1 : 0.6)
      }, 0)

      const compsLacking = competitors.filter(c => !competitorsWithEvidence.has(c.id))
      const compNames = compsLacking.slice(0, 3).map(c => c.name).join(", ") || "all tracked"

      let opportunity = ""
      let p: GapFinding["priority"] = "low"

      if (weightedTotal < 1.5) {
        opportunity = `Major opportunity: No competitor shows strong ${ss.name.toLowerCase()} capability. ${compNames} have no public evidence. First-mover advantage in rural counties.`
        p = "high"
      } else if (weightedTotal < 3.5) {
        opportunity = `${competitorsWithEvidence.size} competitor(s) show limited ${ss.name.toLowerCase()} presence. Gap exists in ${compsLacking.length} competitor areas. Opportunity to lead before competitors invest heavily.`
        p = "medium"
      } else {
        opportunity = `Market shows ${ss.name.toLowerCase()} activity but ${compsLacking.length} competitors lack evidence. Focus on differentiation and superior outcomes.`
        p = "low"
      }

      if (competitorsWithEvidence.size < 2 || confirmedCount < 3) {
        result.push({
          serviceId: ss.serviceId,
          subServiceId: ss.id,
          serviceName:
            ss.serviceId === "home-health"
              ? "Home Healthcare"
              : ss.serviceId === "mobile-wound"
                ? "Mobile Wound Care"
                : "Therapy Care",
          subServiceName: ss.name,
          opportunity,
          competitorGap: `${competitorsWithEvidence.size} of ${competitors.length} competitors with evidence — ${confirmedCount} confirmed`,
          andwellStrength: ss.description,
          priority: p,
        })
      }
    }
    return result
  }, [])

  const filtered = gaps.filter((g) => {
    const matchSearch =
      g.subServiceName.toLowerCase().includes(search.toLowerCase()) ||
      g.serviceName.toLowerCase().includes(search.toLowerCase())
    const matchPriority = priority === "all" || g.priority === priority
    return matchSearch && matchPriority
  })

  const highGaps = gaps.filter(g => g.priority === "high").length
  const medGaps = gaps.filter(g => g.priority === "medium").length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gap Finder</h1>
          <p className="text-surface-500 text-sm mt-1.5">
            Service-level gaps where Andwell can differentiate — with strategic reasoning
          </p>
        </div>
        <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
          Export
        </Button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="!p-4 border-l-red-500 border-l-2">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-white">{highGaps}</span>
          </div>
          <p className="text-xs text-surface-500">High-priority gaps — act now</p>
        </Card>
        <Card className="!p-4 border-l-amber-500 border-l-2">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-white">{medGaps}</span>
          </div>
          <p className="text-xs text-surface-500">Medium-priority — monitor and explore</p>
        </Card>
        <Card className="!p-4 border-l-green-500 border-l-2">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-white">{gaps.length}</span>
          </div>
          <p className="text-xs text-surface-500">Total gaps identified</p>
        </Card>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            search
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
          />
        </div>
        <Select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          options={[
            { value: "all", label: "All Priorities" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ]}
        />
      </div>

      <div className="space-y-4">
        {filtered.map((g, i) => (
          <Card key={i} className={g.priority === "high" ? "border-l-red-500 border-l-2" : g.priority === "medium" ? "border-l-amber-500 border-l-2" : ""}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  g.priority === "high" ? "bg-red-600/10" : "bg-brand-600/10"
                }`}>
                  <Target className={`w-5 h-5 ${g.priority === "high" ? "text-red-400" : "text-brand-400"}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{g.subServiceName}</h3>
                  <span className="text-xs text-surface-500">{g.serviceName}</span>
                </div>
              </div>
              <Badge variant={g.priority === "high" ? "red" : g.priority === "medium" ? "amber" : "default"} dot>
                {g.priority.toUpperCase()} PRIORITY
              </Badge>
            </div>

            <div className="p-4 bg-green-900/15 border border-green-800/30 rounded-xl mb-4">
              <div className="flex items-center gap-2 text-green-400 text-xs font-semibold mb-2">
                <Lightbulb className="w-3.5 h-3.5" /> Strategic Reasoning
              </div>
              <p className="text-sm text-green-200/90 leading-relaxed">{g.opportunity}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-surface-950 rounded-lg border border-surface-800">
                <div className="text-xs text-surface-600 mb-1.5 font-medium">Competitive Evidence Gap</div>
                <p className="text-sm text-surface-300">{g.competitorGap}</p>
              </div>
              <div className="p-3 bg-surface-950 rounded-lg border border-surface-800">
                <div className="text-xs text-surface-600 mb-1.5 font-medium">Andwell Position</div>
                <p className="text-sm text-surface-300">{g.andwellStrength}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={<FileText className="w-7 h-7" />}
          title="No gaps found"
          description="Try adjusting your search or priority filters."
        />
      )}

      <p className="text-xs text-surface-600">
        {filtered.length} gap(s) identified from {subServices.length} subservices analyzed
      </p>
    </div>
  )
}
