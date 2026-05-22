"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Edit3, Clock, AlertCircle, FileText } from "lucide-react"
import { mockEvidence } from "@/lib/data"
import type { Finding, ReviewStatus } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

const reviewTabColors: Record<string, "brand" | "green" | "amber" | "red" | "default"> = {
  approved: "green",
  rejected: "red",
  edited: "brand",
  pending: "amber",
}

const reviewTabIcons: Record<string, React.ElementType> = {
  all: Clock,
  pending: AlertCircle,
  approved: CheckCircle,
  edited: Edit3,
  rejected: XCircle,
}

export default function ReviewCenterPage() {
  const [evidence, setEvidence] = useState<Finding[]>(
    mockEvidence.map((e) => ({
      id: e.id,
      competitorId: e.competitorId,
      serviceId: e.serviceId || "home-health",
      subServiceId: e.subServiceId || "hh-skilled-nursing",
      evidence: e.snippet,
      source: e.source,
      date: e.date,
      confidence: (e.confidence as Finding["confidence"]) || "possible",
      reviewStatus: "pending" as ReviewStatus,
    })),
  )
  const [tab, setTab] = useState<ReviewStatus | "all">("pending")
  const [search, setSearch] = useState("")
  const [modalItem, setModalItem] = useState<Finding | null>(null)
  const [modalAction, setModalAction] = useState<"edit" | "reject" | null>(null)
  const [modalNote, setModalNote] = useState("")

  const updateStatus = async (id: string, status: ReviewStatus, note?: string) => {
    setEvidence((prev) =>
      prev.map((e) => (e.id === id ? { ...e, reviewStatus: status, reviewNote: note || e.reviewNote } : e)),
    )

    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findingId: id,
          status,
          comment: note || "",
          reviewer: "admin",
        }),
      })
    } catch {}
  }

  const openModal = (item: Finding, action: "edit" | "reject") => {
    setModalItem(item)
    setModalAction(action)
    setModalNote("")
  }

  const confirmAction = () => {
    if (!modalItem || !modalAction) return
    updateStatus(modalItem.id, modalAction === "edit" ? "edited" : "rejected", modalNote || undefined)
    setModalItem(null)
    setModalAction(null)
  }

  const tabs: { id: ReviewStatus | "all"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "edited", label: "Edited" },
    { id: "rejected", label: "Rejected" },
  ]

  const filtered = evidence.filter((e) => {
    const matchTab = tab === "all" || e.reviewStatus === tab
    const matchSearch =
      e.evidence.toLowerCase().includes(search.toLowerCase()) ||
      e.source.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const counts: Record<string, number> = {
    all: evidence.length,
    pending: evidence.filter((e) => e.reviewStatus === "pending").length,
    approved: evidence.filter((e) => e.reviewStatus === "approved").length,
    edited: evidence.filter((e) => e.reviewStatus === "edited").length,
    rejected: evidence.filter((e) => e.reviewStatus === "rejected").length,
  }

  const confidenceBadge = (c: string) => {
    switch (c) {
      case "confirmed": return "green" as const
      case "likely": return "brand" as const
      default: return "default" as const
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Review Center</h1>
        <p className="text-surface-500 text-sm mt-1.5">
          Approve, edit, or reject intelligence findings before they appear in battlecards
        </p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-surface-900 rounded-lg p-1 flex-wrap">
          {tabs.map((t) => {
            const Icon = reviewTabIcons[t.id]
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive ? "bg-surface-800 text-white" : "text-surface-500 hover:text-surface-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                <span className="text-xs text-surface-600 ml-0.5">({counts[t.id]})</span>
              </button>
            )
          })}
        </div>
        <div className="w-64">
          <Input
            search
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search evidence..."
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((ev) => (
          <Card key={ev.id}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-surface-200 leading-relaxed">{ev.evidence}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-surface-600 flex-wrap">
                  <span>{ev.source}</span>
                  <span>&bull;</span>
                  <span>{ev.date}</span>
                  <span>&bull;</span>
                  <Badge variant={confidenceBadge(ev.confidence)}>{ev.confidence}</Badge>
                </div>
              </div>
              <Badge variant={reviewTabColors[ev.reviewStatus] || "default"} className="shrink-0 ml-4">
                {ev.reviewStatus}
              </Badge>
            </div>

            {ev.reviewStatus === "pending" && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-surface-800">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => updateStatus(ev.id, "approved")}
                  icon={<CheckCircle className="w-3.5 h-3.5" />}
                >
                  Approve
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openModal(ev, "edit")}
                  icon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => openModal(ev, "reject")}
                  icon={<XCircle className="w-3.5 h-3.5" />}
                >
                  Reject
                </Button>
              </div>
            )}

            {ev.reviewNote && (
              <div className="mt-3 p-2.5 bg-surface-950 rounded-lg text-xs text-surface-400 italic">
                Note: {ev.reviewNote}
              </div>
            )}
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={<FileText className="w-7 h-7" />}
          title="No findings in this category"
          description="Evidence items will appear here once intelligence is gathered."
        />
      )}

      <p className="text-xs text-surface-600">
        {filtered.length} of {evidence.length} evidence items
      </p>

      {/* Review Action Modal */}
      {modalItem && modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-black/60 absolute inset-0 animate-fade-in" onClick={() => setModalItem(null)} />
          <div className="relative bg-surface-900 border border-surface-800 rounded-2xl p-6 w-full max-w-md animate-scale-in shadow-2xl">
            <h3 className="font-bold text-white text-lg mb-2">
              {modalAction === "edit" ? "Edit Finding" : "Reject Finding"}
            </h3>
            <p className="text-sm text-surface-400 mb-4">
              {modalAction === "edit"
                ? "Add an edit note explaining what needs to change."
                : "Add a reason for rejecting this finding."}
            </p>
            <p className="text-sm text-surface-300 mb-4 p-3 bg-surface-950 rounded-lg border border-surface-800">
              {modalItem.evidence}
            </p>
            <textarea
              value={modalNote}
              onChange={(e) => setModalNote(e.target.value)}
              placeholder={modalAction === "edit" ? "Edit notes (optional)..." : "Rejection reason (optional)..."}
              className="w-full bg-surface-950 border border-surface-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-surface-600 focus:outline-none focus:border-brand-500 resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="secondary" onClick={() => setModalItem(null)}>
                Cancel
              </Button>
              <Button
                variant={modalAction === "edit" ? "primary" : "danger"}
                onClick={confirmAction}
                icon={modalAction === "edit" ? <Edit3 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              >
                {modalAction === "edit" ? "Save Edit" : "Reject"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
