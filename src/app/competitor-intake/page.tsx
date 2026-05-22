"use client"

import { useState } from "react"
import { Plus, RefreshCw, CheckCircle, Clock, AlertCircle, MapPin, FileText, ExternalLink, Globe } from "lucide-react"
import { mockCompetitors } from "@/lib/data"
import type { Competitor, CrawlResult } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function CompetitorIntakePage() {
  const [competitors, setCompetitors] = useState<Competitor[]>(mockCompetitors)
  const [url, setUrl] = useState("")
  const [scraping, setScraping] = useState<string | null>(null)
  const [urlError, setUrlError] = useState("")
  const [results, setResults] = useState<Record<string, CrawlResult>>({})

  const isValidUrl = (str: string) => {
    try {
      const u = new URL(str)
      return u.protocol === "http:" || u.protocol === "https:"
    } catch { return false }
  }

  const addCompetitor = async () => {
    const trimmed = url.trim()
    if (!trimmed) return
    if (!isValidUrl(trimmed)) {
      setUrlError("Please enter a valid URL (https://...)")
      return
    }
    setUrlError("")

    const name = trimmed.replace(/https?:\/\/(www\.)?/, "").split(".")[0]
    const id = `c${Date.now()}`
    const newComp: Competitor = {
      id,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      website: trimmed,
      addedAt: new Date().toISOString().split("T")[0],
      lastCrawled: null,
      status: "crawling",
      maineCounties: [],
      threatLevel: "low",
    }
    setCompetitors([...competitors, newComp])
    setUrl("")
    setScraping(id)

    try {
      await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed, name: newComp.name }),
      })
    } catch {}

    try {
      const crawlRes = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed, competitorId: id }),
      })
      const crawlData = await crawlRes.json()
      const crawl = crawlData.crawl as CrawlResult

      setResults((prev) => ({ ...prev, [id]: crawl }))
      setCompetitors((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status: "complete", threatLevel: crawl.maineMentions.length > 0 ? "medium" : "low", lastCrawled: new Date().toISOString().split("T")[0] }
            : c
        )
      )
    } catch {
      setCompetitors((prev) => prev.map((c) => (c.id === id ? { ...c, status: "error" } : c)))
    }
    setScraping(null)
  }

  const statusIcon = (s: Competitor["status"]) => {
    switch (s) {
      case "complete": return <CheckCircle className="w-4 h-4 text-green-400" />
      case "crawling": return <RefreshCw className="w-4 h-4 text-brand-400 animate-spin" />
      case "error": return <AlertCircle className="w-4 h-4 text-red-400" />
      default: return <Clock className="w-4 h-4 text-surface-500" />
    }
  }

  const threatVariant = (t: string) => {
    switch (t) {
      case "critical": return "red" as const
      case "high": return "orange" as const
      case "medium": return "amber" as const
      default: return "green" as const
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Competitor Intake</h1>
        <p className="text-surface-500 text-sm mt-1.5">Add competitor URLs to research their Maine market presence</p>
      </div>

      <Card>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              value={url}
              onChange={(e) => { setUrl(e.target.value); setUrlError("") }}
              onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
              placeholder="https://competitor.com"
              icon={<Globe className="w-4 h-4 text-surface-500" />}
            />
            {urlError && <p className="text-xs text-red-400 mt-1.5">{urlError}</p>}
          </div>
          <Button onClick={addCompetitor} loading={scraping !== null} disabled={!url.trim()} icon={!scraping ? <Plus className="w-4 h-4" /> : undefined}>
            {scraping ? "Researching..." : "Add & Research"}
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {competitors.map((c) => {
          const result = results[c.id]
          return (
            <Card key={c.id} className="overflow-hidden !p-0">
              <div className="p-5 flex items-start justify-between">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="mt-1 shrink-0">{statusIcon(c.status)}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/competitors/${c.id}`} className="font-semibold text-white hover:text-brand-400 transition-colors truncate">
                        {c.name}
                      </Link>
                      <Badge variant={threatVariant(c.threatLevel)}>{c.threatLevel}</Badge>
                    </div>
                    <p className="text-sm text-surface-500 truncate mt-0.5">{c.website}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-surface-600">Added: {c.addedAt}</span>
                      {c.lastCrawled && <span className="text-xs text-surface-600">Crawled: {c.lastCrawled}</span>}
                    </div>
                    {c.maineCounties.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-surface-500">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {c.maineCounties.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
                <Link href={`/competitors/${c.id}`} className="shrink-0 ml-4">
                  <Button variant="ghost" size="sm" icon={<ExternalLink className="w-3 h-3" />}>
                    Profile
                  </Button>
                </Link>
              </div>

              {result && (
                <div className="border-t border-surface-800 px-5 py-4 bg-surface-950/50">
                  <div className="flex items-center gap-2 text-xs text-surface-500 mb-3">
                    <FileText className="w-3.5 h-3.5" />
                    Crawl Results
                  </div>
                  <p className="text-sm text-surface-300 mb-3">{result.summary || "No summary available"}</p>
                  {result.servicesFound.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs text-surface-600">Services: </span>
                      <span className="text-xs text-surface-400">{result.servicesFound.join(", ")}</span>
                    </div>
                  )}
                  {result.maineMentions.length > 0 && (
                    <div>
                      <span className="text-xs text-surface-600">Maine mentions: </span>
                      <span className="text-xs text-surface-400">{result.maineMentions.length} found</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <p className="text-xs text-surface-600">{competitors.length} competitor(s) tracked</p>
    </div>
  )
}
