"use client"

import { useState } from "react"
import { Key, Database, Shield, Save } from "lucide-react"
import { useLens } from "@/lib/lens-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function AdminPage() {
  const { lens } = useLens()
  const [apiKey, setApiKey] = useState("")
  const [saved, setSaved] = useState(false)
  const [backend, setBackend] = useState("json")

  if (lens !== "admin") {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-surface-500" />
          </div>
          <p className="text-surface-400 font-medium">Admin access required</p>
          <p className="text-surface-600 text-sm mt-1">Switch to Admin lens to view settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-surface-500 text-sm mt-1.5">Admin configuration for the Andwell Command Center</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-600/10 flex items-center justify-center">
            <Key className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">OpenAI API Key</h3>
            <p className="text-xs text-surface-500 mt-0.5">
              Required for AI-powered analysis. Set via{" "}
              <code className="font-mono text-brand-400 bg-surface-800 px-1.5 py-0.5 rounded text-xs">
                OPENAI_API_KEY
              </code>{" "}
              env variable or enter below.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setSaved(false)
              }}
              placeholder="sk-..."
            />
          </div>
          <Button onClick={() => setSaved(true)} icon={<Save className="w-4 h-4" />}>
            Save
          </Button>
        </div>
        {saved && (
          <p className="text-xs text-green-400 mt-2">
            Key saved for this session (set OPENAI_API_KEY env var for persistence)
          </p>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Data Persistence</h3>
            <p className="text-xs text-surface-500 mt-0.5">Choose where to store application data</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { id: "json", title: "Local Storage", desc: "Data saved as JSON files on disk (default)" },
            { id: "supabase", title: "Supabase", desc: "PostgreSQL via Supabase" },
            { id: "mongodb", title: "MongoDB", desc: "MongoDB Atlas or local instance" },
          ].map((opt) => (
            <label
              key={opt.id}
              onClick={() => setBackend(opt.id)}
              className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                backend === opt.id
                  ? "bg-brand-600/10 border-brand-700"
                  : "bg-surface-950 border-surface-800 hover:border-surface-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  backend === opt.id ? "border-brand-500 bg-brand-500" : "border-surface-600"
                }`}
              >
                {backend === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <p className="text-sm text-white font-medium">{opt.title}</p>
                <p className="text-xs text-surface-500">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-600/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Lens Permissions</h3>
            <p className="text-xs text-surface-500 mt-0.5">Role-based access to application features</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            {
              lens: "Executive",
              access:
                "Dashboard, Battlecards, Board Room, Growth Command, Reports, Competitor Intake, Ask the Hub",
            },
            {
              lens: "Sales Leader",
              access:
                "Dashboard, Battlecards, Evidence Matrix, Catalog, Growth Command, Launch Plan, Competitor Intake, Reports, Ask the Hub",
            },
            { lens: "Sales Rep", access: "Dashboard, Battlecards, Evidence Matrix, Catalog, Ask the Hub" },
            { lens: "Admin", access: "Full access including Settings" },
          ].map((p) => (
            <div key={p.lens} className="flex items-start gap-3 p-3 rounded-xl bg-surface-950 border border-surface-800">
              <span className="text-brand-400 font-medium w-24 shrink-0 text-sm">{p.lens}</span>
              <span className="text-surface-500 text-sm leading-relaxed">{p.access}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
