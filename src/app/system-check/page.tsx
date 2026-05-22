"use client"

import { Activity, CheckCircle, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ServiceStatus {
  name: string
  endpoint: string
  status?: "healthy" | "unhealthy" | "checking"
  latency?: string
}

const services: ServiceStatus[] = [
  { name: "Analysis API", endpoint: "/api/analysis" },
  { name: "Competitors API", endpoint: "/api/competitors" },
  { name: "Reports API", endpoint: "/api/reports" },
  { name: "Reviews API", endpoint: "/api/reviews" },
  { name: "Catalog API", endpoint: "/api/catalog" },
  { name: "Health Check", endpoint: "/api/health" },
  { name: "Version Info", endpoint: "/api/version" },
]

export default function SystemCheckPage() {
  const [checks, setChecks] = useState(services)

  useEffect(() => {
    async function checkAll() {
      const results = await Promise.all(
        services.map(async (s) => {
          const start = performance.now()
          try {
            const res = await fetch(s.endpoint)
            const latency = `${(performance.now() - start).toFixed(0)}ms`
            const status: "healthy" | "unhealthy" = res.ok ? "healthy" : "unhealthy"
            return { ...s, status, latency }
          } catch {
            return { ...s, status: "unhealthy" as "healthy" | "unhealthy", latency: "err" }
          }
        }),
      )
      setChecks(results)
    }
    checkAll()
  }, [])

  const healthyCount = checks.filter((c) => c.status === "healthy").length

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Check</h1>
        <p className="text-surface-500 text-sm mt-1.5">Diagnostics and service health monitoring</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <span className="text-sm text-surface-300 font-medium">Service Status</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={healthyCount === checks.length ? "green" : "amber"}>
                  {healthyCount}/{checks.length} operational
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {checks.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between py-3 px-4 rounded-xl bg-surface-950 border border-surface-800 hover:border-surface-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                {!s.status || s.status === "checking" ? (
                  <Activity className="w-4 h-4 text-surface-600 animate-pulse" />
                ) : s.status === "healthy" ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm text-surface-300 font-medium">{s.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-surface-600 font-mono">{s.endpoint}</span>
                {s.latency && (
                  <span className={`text-xs font-mono ${s.status === "healthy" ? "text-green-400" : "text-red-400"}`}>
                    {s.latency}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
