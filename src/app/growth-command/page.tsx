"use client"

import { DollarSign, Users, Calendar, MapPin, TrendingUp } from "lucide-react"
import { mockScenarios, maineCounties } from "@/lib/data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@/components/ui/table"

export default function GrowthCommandPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Growth Command</h1>
        <p className="text-surface-500 text-sm mt-1.5">
          Maine county demand modeling, service-line opportunity, and launch sequencing
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-brand-400" />
          <h3 className="font-semibold text-white text-sm">Maine County Profile</h3>
        </div>
        <Table>
          <TableHead>
            <TableHeaderCell>County</TableHeaderCell>
            <TableHeaderCell>Population</TableHeaderCell>
            <TableHeaderCell>% 65+</TableHeaderCell>
            <TableHeaderCell>% Rural</TableHeaderCell>
            <TableHeaderCell>Rural Bar</TableHeaderCell>
            <TableHeaderCell>Priority</TableHeaderCell>
          </TableHead>
          <TableBody>
            {maineCounties.map((c) => (
              <TableRow key={c.name}>
                <TableCell className="font-medium text-white">{c.name}</TableCell>
                <TableCell>{c.population.toLocaleString()}</TableCell>
                <TableCell>{c.over65Percent}%</TableCell>
                <TableCell>{c.ruralPercent}%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-surface-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          c.ruralPercent >= 75
                            ? "bg-red-500"
                            : c.ruralPercent >= 50
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${c.ruralPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-surface-500">{c.ruralPercent}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={c.over65Percent >= 25 ? "amber" : "brand"}>
                    {c.over65Percent >= 25 ? "High need" : "Growing"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockScenarios.map((s) => (
          <Card key={s.id} hover accent="green">
            <h3 className="font-semibold text-white mb-4">{s.name}</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-surface-400">
                  <DollarSign className="w-3.5 h-3.5 text-green-400" />
                  <span>Projected Revenue</span>
                </div>
                <span className="text-white font-semibold">${(s.projectedRevenue / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-surface-400">
                  <Users className="w-3.5 h-3.5 text-brand-400" />
                  <span>Staffing Required</span>
                </div>
                <span className="text-white font-semibold">{s.staffingRequired}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-surface-400">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Timeline</span>
                </div>
                <span className="text-white font-semibold">{s.timelineMonths} months</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-surface-400">Confidence</span>
                <span className={s.confidence >= 75 ? "text-green-400 font-semibold" : "text-amber-400 font-semibold"}>
                  {s.confidence}%
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-surface-800">
              <div className="flex items-start gap-2 text-xs text-surface-600">
                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{s.counties.join(", ")}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
