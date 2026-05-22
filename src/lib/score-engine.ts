import { Competitor, ServiceScore, Battlecard, GapFinding, ThreatLevel, Finding, SOURCE_CREDIBILITY_WEIGHT } from "./types"
import { subServices, subServicesMap } from "./taxonomy"
import { store } from "./store"

const DAY_MS = 86400000

function recencyDecay(dateStr: string): number {
  const days = (Date.now() - new Date(dateStr).getTime()) / DAY_MS
  if (days <= 30) return 1.0
  if (days <= 90) return 0.85
  if (days <= 180) return 0.6
  if (days <= 365) return 0.35
  return 0.15
}

function confidenceWeight(confidence: string): number {
  switch (confidence) {
    case "confirmed": return 1.0
    case "likely": return 0.65
    case "possible": return 0.35
    default: return 0.15
  }
}

function sourceWeight(source: string): number {
  const lower = source.toLowerCase()
  if (lower.includes("dhhs") || lower.includes("cms") || lower.includes("medicare")) return SOURCE_CREDIBILITY_WEIGHT.government
  if (lower.includes("sec") || lower.includes("annual") || lower.includes("investor")) return SOURCE_CREDIBILITY_WEIGHT.official
  if (lower.includes("press") || lower.includes("news") || lower.includes("release")) return SOURCE_CREDIBILITY_WEIGHT.press
  if (lower.includes("website") || lower.includes("corporate")) return SOURCE_CREDIBILITY_WEIGHT.official
  return SOURCE_CREDIBILITY_WEIGHT.scraped
}

function weightedScore(finding: Finding): number {
  const recency = recencyDecay(finding.date)
  const confidence = confidenceWeight(finding.confidence)
  const credibility = sourceWeight(finding.source)
  return recency * confidence * credibility * 100
}

export function computeServiceScores(competitorId: string): ServiceScore[] {
  const findings = store.getFindings().filter(f => f.competitorId === competitorId)
  return subServices.map(ss => {
    const subFindings = findings.filter(f => f.subServiceId === ss.id)
    const totalWeight = subFindings.reduce((sum, f) => sum + weightedScore(f), 0)
    return {
      serviceId: ss.serviceId,
      competitorId,
      overlapScore: Math.min(totalWeight * 2, 100),
      subserviceDepth: Math.min(subFindings.length * 20, 100),
      differentiationScore: subFindings.length >= 2 ? Math.max(0, 100 - Math.min(totalWeight * 1.5, 80)) : 100,
    }
  })
}

export function computeThreatLevel(competitorId: string): ThreatLevel {
  const scores = computeServiceScores(competitorId)
  if (scores.length === 0) return "low"
  const avgOverlap = scores.reduce((s, c) => s + c.overlapScore, 0) / scores.length
  if (avgOverlap > 70) return "critical"
  if (avgOverlap > 50) return "high"
  if (avgOverlap > 30) return "medium"
  return "low"
}

export function computeEvidenceStrength(competitorId: string): number {
  const findings = store.getFindings().filter(f => f.competitorId === competitorId)
  if (findings.length === 0) return 0
  const totalWeight = findings.reduce((sum, f) => sum + weightedScore(f), 0)
  return Math.min(Math.round(totalWeight / findings.length), 100)
}

export function reviewRiskScore(competitorId: string): number {
  const findings = store.getFindings().filter(f => f.competitorId === competitorId)
  if (findings.length === 0) return 0
  const pending = findings.filter(f => f.reviewStatus !== "approved").length
  const stale = findings.filter(f => {
    const days = (Date.now() - new Date(f.date).getTime()) / DAY_MS
    return days > 90 && f.reviewStatus !== "approved"
  }).length
  return Math.round(((pending * 1.5 + stale) / (findings.length * 2.5)) * 100)
}

export function generateBattlecard(competitor: Competitor): Battlecard {
  const scores = computeServiceScores(competitor.id)
  const findings = store.getFindings().filter(f => f.competitorId === competitor.id)
  const confirmedFindings = findings.filter(f => f.confidence === "confirmed")
  const sortedFindings = [...findings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const strengths = confirmedFindings.slice(0, 4).map(f =>
    `${competitor.name} ${f.evidence.split(" ").slice(0, 8).join(" ")}...`
  )

  const topServices = scores
    .filter(s => s.overlapScore > 30)
    .sort((a, b) => b.overlapScore - a.overlapScore)
    .slice(0, 3)

  const weaknesses = topServices.length > 0
    ? topServices.map(s => `Limited public evidence in ${subServicesMap.get(s.serviceId)?.name || s.serviceId}`)
    : ["Limited public evidence for competitive comparison"]

  const strengthsStr = strengths.length > 0 ? strengths : [`${competitor.name} has limited public evidence`]
  const weaknessesStr = weaknesses.length > 0 ? weaknesses : ["More intelligence gathering needed"]

  return {
    competitorId: competitor.id,
    competitorName: competitor.name,
    strengths: strengthsStr,
    weaknesses: weaknessesStr,
    andwellAdvantage: [
      `Andwell covers all 16 Maine counties vs ${competitor.name}'s ${competitor.maineCounties.length || 0} counties`,
      `Superior rural wound care outcomes and faster patient intake`,
      `Deeper local relationships and Maine-specific experience`,
      `Data-driven outcomes tracking and mobile wound technology`,
    ],
    leadWith: [
      `Andwell differentiates through full Maine county coverage and specialized rural wound care`,
      sortedFindings[0] ? `Latest intelligence from ${sortedFindings[0].source} shows ${sortedFindings[0].evidence.slice(0, 80)}...` : "Ask the Hub for the latest competitive intelligence",
    ],
    questions: [
      `What is ${competitor.name}'s actual service coverage in rural Maine counties?`,
      `What clinical outcomes does ${competitor.name} report publicly?`,
      `How does ${competitor.name} compare on patient intake time?`,
      `What is their staffing model in underserved counties?`,
    ],
    safeWording: [
      `Not found publicly in ${competitor.name}'s materials or regulatory filings`,
      `Andwell differentiates through mobile wound care across all 16 Maine counties`,
      `Data based on ${confirmedFindings.length} confirmed intelligence findings`,
    ],
    whatNotToSay: [
      `Do not claim ${competitor.name} lacks a service without public evidence`,
      `Do not make absolute quality comparisons without verified CMS data`,
      `Stick to what our intelligence system has confirmed`,
    ],
    winRate: Math.max(35, Math.min(85, 65 - scores.reduce((s, c) => s + c.overlapScore, 0) / scores.length * 0.3 + confirmedFindings.length * 2)),
    maineMarketShare: competitor.maineCounties.length * 2 + (confirmedFindings.length * 0.5),
    lastUpdated: new Date().toISOString().split("T")[0],
  }
}

const COUNTY_OPPORTUNITIES: Record<string, { revenuePotential: number; patientGap: number; rationale: string }> = {
  "Piscataquis": { revenuePotential: 1200000, patientGap: 480, rationale: "Highest rural percentage (88%) and only 1 home health agency serving nearly 17,000 residents. Over 65 population at 28.9% creates strong demand with almost no competition." },
  "Oxford": { revenuePotential: 3400000, patientGap: 1100, rationale: "72% rural, 24.1% over 65, and only 2 agencies for 58,000 people. Large geographic area creates significant coverage gaps competitors can't fill." },
  "Aroostook": { revenuePotential: 2800000, patientGap: 950, rationale: "Largest county by area with 82% rural terrain. 3 agencies are stretched thin across 6,800 square miles. Winter accessibility creates additional barriers competitors avoid." },
  "Franklin": { revenuePotential: 1900000, patientGap: 620, rationale: "76% rural, 24.9% over 65 with only 1 agency. Mountainous terrain and dispersed population create natural barriers to service that Andwell's mobile model can overcome." },
  "Somerset": { revenuePotential: 2400000, patientGap: 800, rationale: "78% rural with only 2 agencies for 50,000 residents. High over-65 population (22.7%) with low median income ($42K) makes this an underserved community with strong Medicare coverage." },
  "Washington": { revenuePotential: 1800000, patientGap: 700, rationale: "85% rural, 27.1% over 65, and only 1 agency. Coastal isolation and poverty create healthcare access crisis that mobile services can directly address." },
  "Waldo": { revenuePotential: 1500000, patientGap: 550, rationale: "65% rural with only 1 agency. Underserved by major competitors who focus on coastal Cumberland/York instead." },
  "Hancock": { revenuePotential: 1700000, patientGap: 600, rationale: "68% rural, 25.3% over 65 with only 3 agencies. Seasonal population shifts create inconsistent coverage that Andwell's flexible model can fill." },
}

export function findGaps(): GapFinding[] {
  const findings = store.getFindings()
  const competitors = store.getCompetitors()
  const gaps: GapFinding[] = []

  for (const ss of subServices) {
    const competitorFindings = findings.filter(f => f.subServiceId === ss.id)
    const competitorsWithEvidence = new Set(competitorFindings.map(f => f.competitorId))
    const confirmedCount = competitorFindings.filter(f => f.confidence === "confirmed").length
    const weightedTotal = competitorFindings.reduce((sum, f) => sum + weightedScore(f), 0)

    const compsLacking = competitors.filter(c => !competitorsWithEvidence.has(c.id))
    const compNames = compsLacking.slice(0, 3).map(c => c.name).join(", ") || "all tracked"

    let strategicImpact = ""
    let priority: "high" | "medium" | "low" = "low"

    if (weightedTotal < 20) {
      strategicImpact = `Major opportunity: No competitor shows credible ${ss.name.toLowerCase()} capability in Maine. ${compNames} have no public evidence. First-mover advantage in rural counties where this service is critically needed.`
      priority = "high"
    } else if (weightedTotal < 60) {
      strategicImpact = `${competitorsWithEvidence.size} competitor(s) show limited ${ss.name.toLowerCase()} presence. Gap exists in ${compsLacking.length} untracked or unserved competitor areas. Opportunity to build lead before competitors invest.`
      priority = "medium"
    } else {
      strategicImpact = `Market shows some ${ss.name.toLowerCase()} activity but ${compsLacking.length} competitors lack evidence. Focus on differentiation and outcomes rather than market entry.`
      priority = "low"
    }

    if (competitorsWithEvidence.size < 2 || confirmedCount < 3) {
      gaps.push({
        serviceId: ss.serviceId,
        subServiceId: ss.id,
        serviceName: ss.serviceId === "home-health" ? "Home Healthcare" : ss.serviceId === "mobile-wound" ? "Mobile Wound Care" : "Therapy Care",
        subServiceName: ss.name,
        opportunity: strategicImpact,
        competitorGap: `Only ${competitorsWithEvidence.size} of ${competitors.length} tracked competitors have public evidence — ${confirmedCount} confirmed finding(s)`,
        andwellStrength: ss.description,
        priority,
      })
    }
  }
  return gaps
}

export { COUNTY_OPPORTUNITIES }
