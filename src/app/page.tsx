"use client"

import { useState } from "react"
import {
  BarChart3, Crosshair, TrendingUp, Building2, Shield, AlertCircle,
  Clock, Sparkles, MapPin, Users, Target, Bell, ArrowRight, Zap,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { mockCompetitors, mockCounties, mockBattlecardsOld, maineOverview, mockEvidence } from "@/lib/data"
import { useLens } from "@/lib/lens-context"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#a855f7", "#06b6d4"]

function getRecentAlerts() {
  const now = new Date()
  const alerts: { competitor: string; action: string; date: string; priority: "high" | "medium"; evidenceId: string }[] = []

  for (const ev of mockEvidence) {
    const daysAgo = (now.getTime() - new Date(ev.date).getTime()) / 86400000
    if (daysAgo <= 60 && ev.relevance >= 7) {
      const comp = mockCompetitors.find(c => c.id === ev.competitorId)
      const priority = ev.relevance >= 9 ? "high" as const : "medium" as const
      const actionPhrase = ev.confidence === "confirmed"
        ? "moved"
        : "signaled"

      alerts.push({
        competitor: comp?.name || "Unknown",
        action: `${comp?.name || "Competitor"} ${actionPhrase}: ${ev.snippet.slice(0, 70)}...`,
        date: ev.date,
        priority,
        evidenceId: ev.id,
      })
    }
  }

  return alerts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
}

function getRecommendedActions() {
  const countyData = [...mockCounties].sort((a, b) => b.priorityScore - a.priorityScore)
  const highPriority = countyData.filter(c => c.priorityScore >= 85)
  const newEntrants = mockCompetitors.filter(c => c.threatLevel === "high" && c.status === "complete")

  return [
    {
      action: `Target ${highPriority[0]?.county || "Oxford"}, ${highPriority[1]?.county || "Somerset"}, and ${highPriority[2]?.county || "Franklin"} counties`,
      reason: `Highest priority scores with low competition — ${highPriority.length} counties scoring 85+`,
      link: "/growth-command",
      icon: Target,
      color: "text-green-400",
    },
    {
      action: `Monitor ${newEntrants[0]?.name || "Amedisys"} expansion closely`,
      reason: `${newEntrants.length} competitor(s) rated high threat — proactive battlecard updates recommended`,
      link: "/battlecards",
      icon: Shield,
      color: "text-amber-400",
    },
    {
      action: "Ask the Hub for county-level strategy",
      reason: "AI can analyze 16 counties against 6 competitors for optimal sequencing",
      link: "/ask-the-hub",
      icon: Sparkles,
      color: "text-brand-400",
    },
  ]
}

export default function DashboardPage() {
  const { lens } = useLens()
  const [alerts] = useState(getRecentAlerts)
  const [recommendedActions] = useState(getRecommendedActions)

  const pendingReviews = mockEvidence.filter((e) => !e.confidence || e.confidence === "possible").length
  const approvedCount = mockEvidence.filter((e) => e.confidence === "confirmed").length
  const criticalCompetitors = mockCompetitors.filter((c) => c.threatLevel === "high" || c.threatLevel === "critical").length
  const avgWinRate = Math.round(mockBattlecardsOld.reduce((s, b) => s + b.winRate, 0) / mockBattlecardsOld.length)
  const unservedRural = (maineOverview.unservedRuralPatients / 1000).toFixed(1)
  const recentHighAlerts = alerts.filter(a => a.priority === "high").length

  const shareData = mockBattlecardsOld.map((b) => ({
    name: b.competitorName,
    share: b.maineMarketShare,
    winRate: b.winRate,
  }))
  const countyData = [...mockCounties].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 8)
  const lensLabel = { executive: "Executive", "sales-leader": "Sales Leader", "sales-rep": "Sales Rep", admin: "Admin" }[lens]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Command Center</h1>
            <Badge variant="brand">{lensLabel} Lens</Badge>
            {recentHighAlerts > 0 && (
              <Badge variant="red" dot>{recentHighAlerts} high-priority alert{recentHighAlerts !== 1 ? 's' : ''}</Badge>
            )}
          </div>
          <p className="text-surface-500 text-sm mt-1.5">
            Maine-focused competitive intelligence and growth planning
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-surface-900 border border-surface-800 rounded-xl px-4 py-2.5 text-sm flex items-center gap-3">
            <div className="flex items-center gap-2 text-surface-400">
              <Users className="w-4 h-4" />
              <span>Maine Market</span>
            </div>
            <span className="text-white font-semibold">{maineOverview.population.toLocaleString()}</span>
          </div>
          {pendingReviews > 0 && (
            <Link href="/review-center">
              <Button variant="secondary" size="sm" icon={<AlertCircle className="w-3.5 h-3.5" />}>
                <span className="text-amber-400">{pendingReviews} pending</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Competitive Alerts */}
      {alerts.length > 0 && (
        <Card className="border-l-amber-500 border-l-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-white text-sm">Recent Competitive Activity</h3>
            </div>
            <Badge variant="amber">Last 60 days</Badge>
          </CardHeader>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.evidenceId} className="flex items-start gap-3 p-3 bg-surface-950 rounded-lg border border-surface-800 hover:border-surface-700 transition-colors">
                <Zap className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${alert.priority === "high" ? "text-red-400" : "text-amber-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-300 leading-relaxed">{alert.action}</p>
                  <p className="text-xs text-surface-600 mt-1">{alert.date}</p>
                </div>
                <Badge variant={alert.priority === "high" ? "red" : "amber"} className="shrink-0">
                  {alert.priority}
                </Badge>
              </div>
            ))}
            <Link href="/evidence-matrix" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 mt-2">
              View all evidence <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Maine Competitors Tracked"
          value={`${mockCompetitors.length}`}
          change={`${criticalCompetitors} high/critical threat`}
          icon={<Crosshair className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          label="Average Win Rate"
          value={`${avgWinRate}%`}
          change="Across all Maine competitors"
          icon={<BarChart3 className="w-5 h-5" />}
          color="green"
          trend="up"
        />
        <StatCard
          label="Unserved Rural Patients"
          value={`${unservedRural}K+`}
          change="6 priority counties"
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Maine Counties Covered"
          value="16/16"
          change="Full state coverage"
          icon={<Building2 className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          label="Evidence Items"
          value={`${mockEvidence.length}`}
          change={`${approvedCount} confirmed`}
          icon={<Shield className="w-5 h-5" />}
          color="cyan"
        />
        <StatCard
          label="Pending Review"
          value={`${pendingReviews}`}
          change="Awaiting approval"
          icon={<Clock className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Quick Actions + Recommended */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <h3 className="font-semibold text-white text-sm">Recommended Actions</h3>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {recommendedActions.map((rec, i) => {
              const Icon = rec.icon
              return (
                <Link key={i} href={rec.link} className="block">
                  <div className="p-3 bg-surface-950 rounded-lg border border-surface-800 hover:border-surface-700 transition-colors group">
                    <div className="flex items-start gap-3">
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${rec.color}`} />
                      <div className="min-w-0">
                        <p className="text-sm text-surface-300 font-medium group-hover:text-white transition-colors">{rec.action}</p>
                        <p className="text-xs text-surface-500 mt-1">{rec.reason}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-surface-600 group-hover:text-surface-400 transition-colors shrink-0 mt-0.5" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <h3 className="font-semibold text-white text-sm">Quick Actions</h3>
            </div>
          </CardHeader>
          <div className="flex flex-wrap gap-3">
            <Link href="/ask-the-hub">
              <Button variant="primary" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
                Ask the Hub
              </Button>
            </Link>
            <Link href="/competitor-intake">
              <Button variant="secondary" size="sm" icon={<Crosshair className="w-3.5 h-3.5" />}>
                Add Competitor
              </Button>
            </Link>
            <Link href="/gap-finder">
              <Button variant="secondary" size="sm" icon={<Target className="w-3.5 h-3.5" />}>
                Find Gaps
              </Button>
            </Link>
            <Link href="/battlecards">
              <Button variant="secondary" size="sm" icon={<Shield className="w-3.5 h-3.5" />}>
                Battlecards
              </Button>
            </Link>
            <Link href="/growth-command">
              <Button variant="secondary" size="sm" icon={<TrendingUp className="w-3.5 h-3.5" />}>
                Growth
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-white text-sm">Maine Market Share</h3>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={256}>
              <BarChart data={shareData} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#d4d4d8", fontSize: 11 }} width={110} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                    color: "#fafafa",
                    fontSize: "13px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  }}
                />
                <Bar dataKey="share" name="Market Share %" radius={[0, 6, 6, 0]}>
                  {shareData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-white text-sm">Win Rate vs Competitors</h3>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={256}>
              <BarChart data={shareData} margin={{ top: 0, right: 16 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#d4d4d8", fontSize: 10 }}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                    color: "#fafafa",
                    fontSize: "13px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  }}
                />
                <Bar dataKey="winRate" name="Win Rate %" radius={[6, 6, 0, 0]}>
                  {shareData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* County Demand Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-400" />
            <h3 className="font-semibold text-white text-sm">Top Priority Counties by Demand</h3>
          </div>
          <Badge variant="amber">Highest opportunity</Badge>
        </CardHeader>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={256}>
            <BarChart data={countyData} margin={{ top: 8, right: 16 }}>
              <XAxis dataKey="county" tick={{ fill: "#d4d4d8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "12px",
                  color: "#fafafa",
                  fontSize: "13px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
              />
              <Bar dataKey="homeHealthDemand" name="Home Health" fill="#3b82f6" radius={[4, 4, 0, 0]} fillOpacity={0.9} />
              <Bar dataKey="mobileWoundDemand" name="Wound Care" fill="#22c55e" radius={[4, 4, 0, 0]} fillOpacity={0.9} />
              <Bar dataKey="therapyCareDemand" name="Therapy" fill="#eab308" radius={[4, 4, 0, 0]} fillOpacity={0.9} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
