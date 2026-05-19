"use client"

import { useState } from "react"
import { Key, Database, Shield, Save } from "lucide-react"
import { useLens } from "@/lib/lens-context"

export default function AdminPage() {
  const { lens } = useLens()
  const [apiKey, setApiKey] = useState("")
  const [saved, setSaved] = useState(false)

  if (lens !== "admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500">Admin access required. Switch to Admin lens to view settings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-zinc-500 text-sm mt-1">Admin configuration for the Andwell Command Center</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">OpenAI API Key</h3>
        </div>
        <p className="text-sm text-zinc-500 mb-3">Required for AI-powered analysis in Ask the Hub and competitor research. Set via <code className="text-blue-400 bg-zinc-800 px-1 rounded">OPENAI_API_KEY</code> environment variable or enter below.</p>
        <div className="flex gap-3">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setSaved(false) }}
            placeholder="sk-..."
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-mono"
          />
          <button onClick={() => setSaved(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
        {saved && <p className="text-xs text-green-400 mt-2">Key saved for this session (set OPENAI_API_KEY env var for persistence)</p>}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Data Persistence</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 cursor-pointer">
            <div>
              <p className="text-sm text-white font-medium">Local Storage</p>
              <p className="text-xs text-zinc-500">Data saved in browser (default)</p>
            </div>
            <input type="radio" name="persistence" defaultChecked className="text-blue-500" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 cursor-pointer">
            <div>
              <p className="text-sm text-white font-medium">Supabase</p>
              <p className="text-xs text-zinc-500">PostgreSQL via Supabase</p>
            </div>
            <input type="radio" name="persistence" className="text-blue-500" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 cursor-pointer">
            <div>
              <p className="text-sm text-white font-medium">MongoDB</p>
              <p className="text-xs text-zinc-500">MongoDB Atlas or local instance</p>
            </div>
            <input type="radio" name="persistence" className="text-blue-500" />
          </label>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white">Lens Permissions</h3>
        </div>
        <div className="space-y-2 text-sm">
          {[
            { lens: "Executive", access: "Dashboard, Battlecards, Board Room, Growth Command, Reports, Competitor Intake, Ask the Hub" },
            { lens: "Sales Leader", access: "Dashboard, Battlecards, Evidence Matrix, Catalog, Growth Command, Launch Plan, Competitor Intake, Reports, Ask the Hub" },
            { lens: "Sales Rep", access: "Dashboard, Battlecards, Evidence Matrix, Catalog, Ask the Hub" },
            { lens: "Admin", access: "Full access including Settings" },
          ].map((p) => (
            <div key={p.lens} className="flex items-start gap-3 p-2 rounded">
              <span className="text-blue-400 font-medium w-28 shrink-0">{p.lens}</span>
              <span className="text-zinc-500">{p.access}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
