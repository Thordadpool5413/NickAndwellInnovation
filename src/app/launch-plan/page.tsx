"use client"

import { CheckCircle, Clock, Circle, Calendar } from "lucide-react"
import { mockLaunchPlanSteps, mockScenarios } from "@/lib/data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LaunchPlanPage() {
  const totalStaff = mockScenarios.reduce((s, c) => s + c.staffingRequired, 0)
  const completedSteps = mockLaunchPlanSteps.filter((s) => s.status === "complete").length

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Launch Plan</h1>
        <p className="text-surface-500 text-sm mt-1.5">
          Staffing model, 90-day execution timeline, and priority account plays
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-3xl font-bold text-white tracking-tight">{totalStaff}</div>
          <p className="text-sm text-surface-500 mt-1">Total Staff Required</p>
        </Card>
        <Card>
          <div className="text-3xl font-bold text-white tracking-tight">{mockScenarios.length}</div>
          <p className="text-sm text-surface-500 mt-1">Active Launch Scenarios</p>
        </Card>
        <Card>
          <div className="text-3xl font-bold text-white tracking-tight">
            {completedSteps}/{mockLaunchPlanSteps.length}
          </div>
          <p className="text-sm text-surface-500 mt-1">Steps Completed</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-brand-400" />
          <h3 className="font-semibold text-white text-sm">90-Day Execution Timeline</h3>
        </div>
        <div className="space-y-0">
          {mockLaunchPlanSteps.map((step, i) => {
            const Icon =
              step.status === "complete" ? CheckCircle : step.status === "in-progress" ? Clock : Circle
            const color =
              step.status === "complete"
                ? "text-green-400"
                : step.status === "in-progress"
                  ? "text-brand-400"
                  : "text-surface-600"
            const lineColor =
              step.status === "complete" ? "border-green-500/50" : "border-surface-800"

            return (
              <div
                key={i}
                className={`flex items-start gap-4 pb-4 border-l-2 ml-2 pl-6 last:pb-0 relative ${lineColor}`}
              >
                <div className={`absolute left-[-9px] bg-surface-900 p-0.5 ${color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-surface-300">{step.action}</p>
                    <Badge className="shrink-0">Week {step.week}</Badge>
                  </div>
                  <p className="text-xs text-surface-600 mt-0.5">Owner: {step.owner}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
