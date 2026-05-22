"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import {
  ArrowLeft, Shield, TrendingUp, Star, MapPin, FileText, CheckCircle,
  XCircle, Calendar, Clock, Zap,
} from "lucide-react"
import { mockCompetitors, mockEvidence, mockBattlecardsOld } from "@/lib/data"
import { subServices } from "@/lib/taxonomy"
import { SOURCE_CREDIBILITY_LABEL, SourceCredibility } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"

const threatVariants: Record<string, "red" | "orange" | "amber" | "green"> = {
  critical: "red",
  high: "orange",
  medium: "amber",
  low: "green",
}

const credibilityVariants: Record<SourceCredibility, "brand" | "green" | "amber" | "default"> = {
  government: "brand",
  official: "green",
  press: "amber",
  scraped: "default",
  unknown: "default",
}

export default function CompetitorDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [showEvidence, setShowEvidence] = useState<string | null>(null)

  const competitor = useMemo(() => mockCompetitors.find((c) => c.id === id), [id])
  const evidence = useMemo(() => mockEvidence.filter((e) => e.competitorId === id), [id])
  const battlecard = useMemo(() => mockBattlecardsOld.find((b) => b.competitorId === id), [id])
  const [now] = useState(() => Date.now())

  const timeline = useMemo(
    () =>
      [...evidence].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [evidence],
  )

  const serviceMatrix = useMemo(() => {
    return subServices.map((ss) => {
      const ev = evidence.find((e) => e.subServiceId === ss.id)
      const credibility = ev?.credibility || "unknown"
      return {
        subService: ss,
        evidence: ev,
        hasEvidence: !!ev,
        confirmed: ev?.confidence === "confirmed",
        credibility,
      }
    })
  }, [evidence])

  if (!competitor) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <EmptyState
          title="Competitor not found"
          description="This competitor may have been removed or the URL is incorrect."
          action={
            <Button onClick={() => router.push("/competitor-intake")} variant="primary">
              Back to Competitor Intake
            </Button>
          }
        />
      </div>
    )
  }

  const evidenceStrength = Math.round(
    (evidence.filter((e) => e.confidence === "confirmed").length / Math.max(evidence.length, 1)) * 100,
  )

  const confirmedEvidence = evidence.filter(e => e.confidence === "confirmed").length
  const latestEvidence = timeline[0]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/competitor-intake")}
          className="p-2 rounded-lg hover:bg-surface-800 text-surface-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white tracking-tight truncate">{competitor.name}</h1>
            <Badge variant={threatVariants[competitor.threatLevel]}>{competitor.threatLevel}</Badge>
            {latestEvidence && (
              <span className="text-xs text-surface-500">
                Latest: {latestEvidence.date}
              </span>
            )}
          </div>
          <p className="text-sm text-surface-500 mt-1 truncate">{competitor.website}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-2 text-brand-400 mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-semibold">Evidence Strength</span>
          </div>
          <div className="text-2xl font-bold text-white">{evidenceStrength}%</div>
          <div className="text-xs text-surface-600 mt-1">{confirmedEvidence} confirmed of {evidence.length}</div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold">Win Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">{battlecard?.winRate || 50}%</div>
          <div className="text-xs text-surface-600 mt-1">Based on intelligence</div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-semibold">Maine Counties</span>
          </div>
          <div className="text-2xl font-bold text-white">{competitor.maineCounties.length}</div>
          <div className="text-xs text-surface-600 mt-1 truncate">
            {competitor.maineCounties.slice(0, 3).join(", ")}
            {competitor.maineCounties.length > 3 ? "..." : ""}
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Star className="w-4 h-4" />
            <span className="text-xs font-semibold">Market Share</span>
          </div>
          <div className="text-2xl font-bold text-white">{battlecard?.maineMarketShare || 0}%</div>
          <div className="text-xs text-surface-600 mt-1">Maine market</div>
        </Card>
      </div>

      {/* Service Coverage Matrix */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-brand-400" />
          <h3 className="font-semibold text-white text-sm">Service Coverage Matrix</h3>
        </div>
        <Table>
          <TableHead>
            <TableHeaderCell>Subservice</TableHeaderCell>
            <TableHeaderCell>Evidence</TableHeaderCell>
            <TableHeaderCell>Confidence</TableHeaderCell>
            <TableHeaderCell>Source Quality</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableHead>
          <TableBody>
            {serviceMatrix.map((row) => (
              <TableRow key={row.subService.id}>
                <TableCell className="font-medium text-white">{row.subService.name}</TableCell>
                <TableCell>
                  {row.evidence ? (
                    <button
                      onClick={() =>
                        setShowEvidence(
                          row.evidence!.id === showEvidence ? null : row.evidence!.id,
                        )
                      }
                      className="text-brand-400 hover:text-brand-300 text-xs flex items-center gap-1 font-medium"
                    >
                      <FileText className="w-3 h-3" /> View
                    </button>
                  ) : (
                    <span className="text-surface-600 text-xs">Not found publicly</span>
                  )}
                </TableCell>
                <TableCell>
                  {row.evidence && (
                    <Badge
                      variant={
                        row.confirmed ? "green" : row.evidence.confidence === "likely" ? "brand" : "default"
                      }
                    >
                      {row.evidence.confidence}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {row.evidence && (
                    <Badge variant={credibilityVariants[row.credibility as SourceCredibility]}>
                      {SOURCE_CREDIBILITY_LABEL[row.credibility as SourceCredibility]}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {row.hasEvidence ? (
                    <span className="text-xs flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-3 h-3" /> Found
                    </span>
                  ) : (
                    <span className="text-xs flex items-center gap-1 text-surface-600">
                      <XCircle className="w-3 h-3" /> Unknown
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {showEvidence && (
          <div className="mt-4 p-4 bg-surface-950 border border-surface-800 rounded-xl animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-surface-500 font-semibold">Evidence Detail</p>
              <button
                onClick={() => setShowEvidence(null)}
                className="text-surface-600 hover:text-white text-xs transition-colors"
              >
                Close
              </button>
            </div>
            {(() => {
              const ev = evidence.find((e) => e.id === showEvidence)
              if (!ev) return <p className="text-sm text-surface-600">Evidence not found</p>
              return (
                <>
                  <p className="text-sm text-surface-200 leading-relaxed mb-3">{ev.snippet}</p>
                  <div className="flex items-center gap-3 text-xs text-surface-600 flex-wrap">
                    <span>Source: {ev.source}</span>
                    <span>&bull;</span>
                    <span>Date: {ev.date}</span>
                    <span>&bull;</span>
                    <span>Relevance: {ev.relevance}/10</span>
                    {ev.credibility && (
                      <>
                        <span>&bull;</span>
                        <Badge variant={credibilityVariants[ev.credibility as SourceCredibility]}>
                          {SOURCE_CREDIBILITY_LABEL[ev.credibility as SourceCredibility]}
                        </Badge>
                      </>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </Card>

      {battlecard && (
        <Card>
          <h3 className="font-semibold text-white mb-4">Battlecard Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-surface-950 rounded-xl border border-surface-800">
              <p className="text-xs text-red-400 font-semibold mb-3">Competitor Strengths</p>
              <ul className="space-y-2">
                {battlecard.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                    <span className="text-red-400/70 mt-1 shrink-0">&bull;</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-surface-950 rounded-xl border border-surface-800">
              <p className="text-xs text-green-400 font-semibold mb-3">Andwell Advantage</p>
              <ul className="space-y-2">
                {battlecard.andwellAdvantage.map((a, i) => (
                  <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                    <span className="text-green-400/70 mt-1 shrink-0">&bull;</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Competitive Timeline */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-brand-400" />
          <h3 className="font-semibold text-white text-sm">Competitive Activity Timeline</h3>
          <Badge>{timeline.length} events</Badge>
        </div>
        <div className="space-y-0">
          {timeline.map((ev) => {
            const isRecent =
              (now - new Date(ev.date).getTime()) / 86400000 <= 60
            const credibility = ev.credibility || "unknown"
            return (
              <div
                key={ev.id}
                className={`flex items-start gap-4 pb-4 border-l-2 ml-2 pl-6 last:pb-0 relative ${
                  ev.confidence === "confirmed" ? "border-green-500/50" : "border-surface-800"
                }`}
              >
                <div
                  className={`absolute left-[-9px] bg-surface-900 p-0.5 ${
                    isRecent ? "text-amber-400" : "text-surface-600"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-surface-300 leading-relaxed">{ev.snippet}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isRecent && <Badge variant="amber" dot>Recent</Badge>}
                      <Badge variant={credibilityVariants[credibility as SourceCredibility]}>
                        {SOURCE_CREDIBILITY_LABEL[credibility as SourceCredibility]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-surface-600 flex-wrap">
                    <span>{ev.source}</span>
                    <span>&bull;</span>
                    <span>{ev.date}</span>
                    <span>&bull;</span>
                    <span className={ev.confidence === "confirmed" ? "text-green-400" : "text-base-brand-400"}>
                      {ev.confidence}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
          {timeline.length === 0 && (
            <p className="text-sm text-surface-600 text-center py-8">
              No competitive activity recorded yet.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
