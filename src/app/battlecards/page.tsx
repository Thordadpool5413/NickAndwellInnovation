"use client"

import { Shield, TrendingUp, TrendingDown, MessageSquare } from "lucide-react"
import { useState } from "react"
import { mockBattlecardsOld, mockEvidence } from "@/lib/data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer } from "@/components/ui/drawer"

export default function BattlecardsPage() {
  const [selected, setSelected] = useState<string | null>(null)

  const bc = mockBattlecardsOld
  const evidence = mockEvidence

  const selectedCard = selected ? bc.find((b) => b.id === selected) ?? null : null
  const selectedEvidence = selectedCard
    ? evidence.filter((e) => e.competitorId === selectedCard.competitorId)
    : []

  const winRateColor = (rate: number) => (rate >= 60 ? "text-green-400" : "text-amber-400")

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Battlecards</h1>
        <p className="text-surface-500 text-sm mt-1.5">
          Competitive positioning cards with talk tracks for each Maine competitor
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bc.map((b) => (
          <Card key={b.id} hover>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <h3 className="text-lg font-bold text-white truncate">{b.competitorName}</h3>
                <Badge>{b.maineMarketShare}% share</Badge>
              </div>
              <div className="flex items-center gap-1.5 text-sm shrink-0 ml-2">
                <Shield className="w-4 h-4 text-brand-400" />
                <span className={`font-semibold ${winRateColor(b.winRate)}`}>
                  {b.winRate}% win rate
                </span>
              </div>
            </div>

            <div className="mb-4 p-4 bg-brand-900/15 border border-brand-800/30 rounded-xl">
              <p className="text-xs text-brand-400 font-semibold mb-1">Lead With</p>
              <p className="text-sm text-brand-200">{b.andwellAdvantage[0]}</p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-red-400 text-xs font-semibold mb-2">
                  <TrendingUp className="w-3 h-3" /> Competitor Strengths
                </div>
                <ul className="space-y-1.5">
                  {b.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                      <span className="text-red-400/70 mt-0.5 shrink-0">&bull;</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 text-green-400 text-xs font-semibold mb-2">
                  <TrendingDown className="w-3 h-3" /> Exploitable Gaps
                </div>
                <ul className="space-y-1.5">
                  {b.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                      <span className="text-green-400/70 mt-0.5 shrink-0">&bull;</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold mb-2">
                  <Shield className="w-3 h-3" /> Andwell Advantage
                </div>
                <ul className="space-y-1.5">
                  {b.andwellAdvantage.map((a, i) => (
                    <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                      <span className="text-brand-400/70 mt-0.5 shrink-0">&bull;</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
              {b.questions && b.questions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-2">
                    <MessageSquare className="w-3 h-3" /> Discovery Questions
                  </div>
                  <ul className="space-y-1.5">
                    {b.questions.slice(0, 3).map((q, i) => (
                      <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                        <span className="text-purple-400/70 mt-0.5 shrink-0">&bull;</span> {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {b.safeWording && b.safeWording.length > 0 && (
                <div className="p-3 bg-green-900/10 border border-green-800/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 text-xs font-semibold mb-1.5">
                    Safe Wording
                  </div>
                  <p className="text-xs text-green-200/80 leading-relaxed">{b.safeWording[0]}</p>
                </div>
              )}
              {b.whatNotToSay && b.whatNotToSay.length > 0 && (
                <div className="p-3 bg-red-900/10 border border-red-800/20 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400 text-xs font-semibold mb-1.5">
                    Do Not Say
                  </div>
                  <p className="text-xs text-red-200/80 leading-relaxed">{b.whatNotToSay[0]}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-surface-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-surface-600">
                <MessageSquare className="w-3 h-3" />
                <span>Updated {b.lastUpdated}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(b.id || null)}
              >
                View Evidence
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`${selectedCard?.competitorName || ""} Evidence`}
      >
        <div className="space-y-3">
          {selectedEvidence.map((ev) => (
            <div key={ev.id} className="bg-surface-950 border border-surface-800 rounded-xl p-4">
              <p className="text-sm text-surface-300 leading-relaxed">{ev.snippet}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-surface-600 flex-wrap">
                <span>{ev.source}</span>
                <span>&bull;</span>
                <span>{ev.date}</span>
                <span>&bull;</span>
                <span>Relevance: {ev.relevance}/10</span>
              </div>
            </div>
          ))}
          {selectedEvidence.length === 0 && (
            <p className="text-sm text-surface-600 text-center py-8">
              No evidence items found for this competitor.
            </p>
          )}
        </div>
      </Drawer>
    </div>
  )
}
