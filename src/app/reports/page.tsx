"use client"

import { useState } from "react"
import { FileText, Download, Eye, Plus, X } from "lucide-react"
import { mockReports } from "@/lib/data"
import type { Report } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const typeStyles: Record<string, "brand" | "green" | "purple"> = {
  competitive: "brand",
  growth: "green",
  board: "purple",
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(mockReports)
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newType, setNewType] = useState<Report["type"]>("competitive")

  const generateReport = () => {
    if (!newTitle.trim()) return
    const report: Report = {
      id: `r${Date.now()}`,
      title: newTitle,
      type: newType,
      createdAt: new Date().toISOString().split("T")[0],
      summary:
        "AI-generated report based on current intelligence data. Review generated content for accuracy before distribution.",
    }
    setReports([report, ...reports])
    setNewTitle("")
    setShowNew(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reports</h1>
          <p className="text-surface-500 text-sm mt-1.5">
            Competitive, growth, and board-ready reports for Maine market
          </p>
        </div>
        <Button onClick={() => setShowNew(!showNew)} icon={showNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}>
          {showNew ? "Cancel" : "Generate Report"}
        </Button>
      </div>

      {showNew && (
        <Card>
          <h3 className="font-semibold text-white mb-4">New Report</h3>
          <div className="space-y-3">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Report title"
            />
            <Select
              value={newType}
              onChange={(e) => setNewType(e.target.value as Report["type"])}
              options={[
                { value: "competitive", label: "Competitive Analysis" },
                { value: "growth", label: "Growth Opportunity" },
                { value: "board", label: "Board Presentation" },
              ]}
            />
            <Button onClick={generateReport}>Generate</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {reports.map((r) => (
          <Card key={r.id} hover>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-surface-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white">{r.title}</h3>
                  <p className="text-sm text-surface-400 mt-1 line-clamp-2">{r.summary}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={typeStyles[r.type] || "default"}>{r.type}</Badge>
                    <span className="text-xs text-surface-600">{r.createdAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} title="View" />
                <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />} title="Download" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
