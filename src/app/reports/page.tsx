"use client"

import { useState } from "react"
import { FileText, Download, Eye, Plus, X } from "lucide-react"
import { mockReports } from "@/lib/data"
import type { Report } from "@/lib/types"

const typeColors: Record<string, string> = {
  competitive: "bg-blue-900 text-blue-300",
  growth: "bg-green-900 text-green-300",
  board: "bg-purple-900 text-purple-300",
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
      summary: "AI-generated report based on current intelligence data. Review generated content for accuracy before distribution.",
    }
    setReports([report, ...reports])
    setNewTitle("")
    setShowNew(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports</h2>
          <p className="text-zinc-500 text-sm mt-1">Saved competitive, growth, and board-ready reports for Maine market</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Generate Report
        </button>
      </div>

      {showNew && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">New Report</h3>
            <button onClick={() => setShowNew(false)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Report title"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as Report["type"])}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="competitive">Competitive Analysis</option>
              <option value="growth">Growth Opportunity</option>
              <option value="board">Board Presentation</option>
            </select>
            <button onClick={generateReport} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Generate
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-zinc-600 mt-1" />
              <div>
                <h3 className="font-semibold text-white">{r.title}</h3>
                <p className="text-sm text-zinc-400 mt-1">{r.summary}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[r.type] || "bg-zinc-800 text-zinc-400"}`}>
                    {r.type}
                  </span>
                  <span className="text-xs text-zinc-600">{r.createdAt}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="View">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Download">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
