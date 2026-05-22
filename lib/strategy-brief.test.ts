import { describe, it, expect } from 'vitest';
import { generateStrategyBrief, generateExecutiveNarrative, generateBoardPacket, generateCoachingPlan } from './strategy-brief';
import type { GrowthRow, GrowthTotals, StaffingPlanItem } from './growth-plan';
import type { IntelligenceReport } from './types';

const mockRows: GrowthRow[] = [
  {
    county: 'York',
    service: 'Home Healthcare',
    age65: 45362,
    launchGroup: 'Priority 1',
    current: '',
    missing: '',
    reason: 'Test',
    action: '',
    accounts: [],
    meta: { color: '#2563eb', role: 'Foundation', unit: 'admissions', reimbursement: 3189, margin: 0.18, demandRate: 0.08 },
    market: undefined,
    basis: 'Planning proxy',
    demandPool: 1000,
    reimbursement: 3189,
    starts: [50, 75, 100] as [number, number, number],
    referrals: [67, 100, 134] as [number, number, number],
    revenue: [159450, 239175, 318900] as [number, number, number],
    contribution: [28701, 43052, 57402] as [number, number, number],
    totalStarts: 225,
    totalReferrals: 301,
    totalRevenue: 717525,
    totalContribution: 129155,
    opportunityScore: 85,
  },
];

const mockTotals: GrowthTotals = {
  starts: [50, 75, 100] as [number, number, number],
  referrals: [67, 100, 134] as [number, number, number],
  revenue: [159450, 239175, 318900] as [number, number, number],
  contribution: [28701, 43052, 57402] as [number, number, number],
  totalRevenue: 717525,
  totalContribution: 129155,
  totalReferrals: 301,
};

describe('generateStrategyBrief', () => {
  it('returns a StrategyBrief with correct structure', () => {
    const brief = generateStrategyBrief('Executive', null, mockRows, mockTotals);
    expect(brief.audience).toBe('Executive');
    expect(brief.title).toBe('Executive Strategy Brief');
    expect(brief.sections.length).toBeGreaterThan(0);
    expect(brief.keyMetrics.length).toBeGreaterThan(0);
    expect(brief.generatedAt).toBeTruthy();
  });

  it('handles null report gracefully', () => {
    const brief = generateStrategyBrief('Board', null);
    expect(brief.summary).toContain('available growth model data');
  });

  it('mentions competitor count when report is provided', () => {
    const report: IntelligenceReport = {
      id: 'r1',
      generatedAt: new Date().toISOString(),
      baselineProvider: 'Andwell Health Partners',
      competitorsAnalyzed: 3,
      serviceLinesMapped: 5,
      subservicesMapped: 4,
      pagesReviewed: 10,
      matchedServiceFindings: 0,
      humanReviewItems: 2,
      potentialAndwellAdvantages: 4,
      executiveSummary: 'Test',
      executiveInsights: [],
      competitorScores: [],
      analyses: [],
      allFindings: [],
      allSubserviceFindings: [],
      crawlErrors: [],
    };
    const brief = generateStrategyBrief('Executive', report);
    expect(brief.sections[0].content).toContain('3 competitors');
  });
});

describe('generateExecutiveNarrative', () => {
  it('returns an ExecutiveNarrative with all fields', () => {
    const narrative = generateExecutiveNarrative(null, mockRows, mockTotals);
    expect(narrative.executiveReadout).toBeTruthy();
    expect(narrative.boardNarrative).toBeTruthy();
    expect(narrative.riskSummary).toBeTruthy();
    expect(narrative.launchRecommendation).toBeTruthy();
    expect(narrative.strategicPriorities.length).toBeGreaterThan(0);
    expect(narrative.generatedAt).toBeTruthy();
  });

  it('handles null report gracefully', () => {
    const narrative = generateExecutiveNarrative(null);
    expect(narrative.executiveReadout).toContain('No report loaded');
  });
});

describe('generateBoardPacket', () => {
  it('returns a BoardPacket with correct structure', () => {
    const packet = generateBoardPacket(null, mockRows, mockTotals);
    expect(packet.title).toContain('Board Packet');
    expect(packet.financialModel.length).toBeGreaterThan(0);
    expect(packet.priorityCounties.length).toBeGreaterThan(0);
    expect(packet.risks.length).toBeGreaterThan(0);
    expect(packet.appendix.length).toBeGreaterThan(0);
  });

  it('returns empty financialModel when totals are missing', () => {
    const packet = generateBoardPacket(null, mockRows);
    expect(packet.financialModel).toEqual([]);
  });

  it('returns empty staffingSummary when staffing is missing', () => {
    const packet = generateBoardPacket(null, mockRows, mockTotals);
    expect(packet.staffingSummary).toEqual([]);
  });

  it('includes staffing data when provided', () => {
    const staffing: StaffingPlanItem[] = [
      { service: 'Home Healthcare', role: 'RN / LPN', patientsPerFTE: 25, avgSalary: 78000, starts: [50, 75, 100] as [number, number, number], fte: [2, 3, 4] as [number, number, number], cost: [156000, 234000, 312000] as [number, number, number] },
    ];
    const packet = generateBoardPacket(null, mockRows, mockTotals, staffing);
    expect(packet.staffingSummary.length).toBe(1);
    expect(packet.staffingSummary[0].role).toBe('Home Healthcare');
  });
});

describe('generateCoachingPlan', () => {
  it('returns a CoachingPlan with discovery questions', () => {
    const plan = generateCoachingPlan('Test Competitor');
    expect(plan.competitor).toBe('Test Competitor');
    expect(plan.discoveryQuestions.length).toBe(5);
    expect(plan.competitor).toBeTruthy();
    expect(plan.doNotSay.length).toBeGreaterThan(0);
  });
});
