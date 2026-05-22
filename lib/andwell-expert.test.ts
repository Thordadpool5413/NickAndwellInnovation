import { describe, it, expect } from 'vitest';
import { generateAndwellExpertBrief } from './andwell-expert';
import type { IntelligenceReport } from './types';
import type { GrowthRow, GrowthTotals, StaffingPlanItem } from './growth-plan';

function makeReport(overrides?: Partial<IntelligenceReport>): IntelligenceReport {
  return {
    id: 'test-1',
    generatedAt: '2025-01-01T00:00:00.000Z',
    baselineProvider: 'Andwell Health Partners',
    competitorsAnalyzed: 3,
    pagesReviewed: 45,
    serviceLinesMapped: 6,
    subservicesMapped: 18,
    matchedServiceFindings: 24,
    potentialAndwellAdvantages: 8,
    humanReviewItems: 2,
    executiveSummary: 'Test executive summary.',
    executiveInsights: [],
    competitorScores: [
      {
        competitorId: 'c1',
        competitorName: 'Competitor A',
        serviceLineMatchScore: 80,
        subserviceDepthScore: 60,
        andwellDifferentiationScore: 70,
        competitorVisibilityScore: 85,
        evidenceStrengthScore: 75,
        reviewRiskScore: 40,
        threatLevel: 'High overlap',
        strongestMatches: ['Home Healthcare'],
        strongestAndwellAdvantages: ['Wound care depth'],
        needsReview: ['Pricing claim'],
        leadWith: ['Home Healthcare depth'],
        executiveReadout: 'Competitor A has strong overlap in Home Healthcare.'
      }
    ],
    analyses: [],
    allFindings: [],
    allSubserviceFindings: [],
    crawlErrors: [],
    ...overrides
  };
}

function makeGrowthRow(overrides?: Partial<GrowthRow>): GrowthRow {
  return {
    county: 'York',
    service: 'Home Healthcare',
    age65: 45362,
    launchGroup: 'Priority 1',
    current: 'Hospice',
    missing: 'Home Healthcare',
    reason: 'Largest modeled opportunity.',
    action: 'Confirm staffing.',
    accounts: ['MaineHealth'],
    meta: { color: '#2563eb', role: 'Foundation', unit: 'admissions', reimbursement: 3189, margin: 0.18, demandRate: 0.08 },
    market: { ffs: 32287, hh: { prov: 11, users: 2191, rate: 0.0679, pay: 10448386, ppu: 4769 }, hos: { prov: 9, users: 851, ppu: 14723 } },
    basis: 'CMS direct HH market',
    demandPool: 2191,
    reimbursement: 4769,
    starts: [219, 329, 438],
    referrals: [292, 439, 584],
    revenue: [1044831, 1569457, 2092629],
    contribution: [188070, 282502, 376673],
    totalStarts: 986,
    totalReferrals: 1315,
    totalRevenue: 4706917,
    totalContribution: 847245,
    opportunityScore: 85,
    ...overrides
  };
}

function makeTotals(overrides?: Partial<GrowthTotals>): GrowthTotals {
  return {
    starts: [500, 750, 1000],
    referrals: [667, 1000, 1333],
    revenue: [2000000, 3000000, 4000000],
    contribution: [360000, 540000, 720000],
    totalRevenue: 9000000,
    totalContribution: 1620000,
    totalReferrals: 3000,
    ...overrides
  };
}

function makeStaffingPlanItem(overrides?: Partial<StaffingPlanItem>): StaffingPlanItem {
  return {
    service: 'Home Healthcare',
    role: 'RN / LPN',
    patientsPerFTE: 25,
    avgSalary: 78000,
    starts: [10, 15, 20],
    fte: [1, 1, 1],
    cost: [78000, 78000, 78000],
    ...overrides
  };
}

describe('generateAndwellExpertBrief', () => {
  it('returns a brief with all required fields', () => {
    const growthRows = [makeGrowthRow()];
    const totals = makeTotals();
    const staffingPlan = [makeStaffingPlanItem()];

    const brief = generateAndwellExpertBrief({
      report: makeReport(),
      growthRows,
      totals,
      staffingPlan
    });

    expect(brief).toHaveProperty('generatedAt');
    expect(brief).toHaveProperty('posture');
    expect(brief).toHaveProperty('executiveSummary');
    expect(brief).toHaveProperty('topActions');
    expect(brief).toHaveProperty('priorityMarkets');
    expect(brief).toHaveProperty('competitorThreats');
    expect(brief).toHaveProperty('opportunitySignals');
    expect(brief).toHaveProperty('staffingRisks');
    expect(brief).toHaveProperty('governedClaims');
    expect(brief).toHaveProperty('referralStrategy');
    expect(brief).toHaveProperty('boardNarrative');
    expect(brief).toHaveProperty('fieldGuidance');
    expect(brief).toHaveProperty('openQuestions');
    expect(brief).toHaveProperty('metrics');
  });

  it('returns 4 top actions', () => {
    const brief = generateAndwellExpertBrief({
      report: makeReport(),
      growthRows: [makeGrowthRow()],
      totals: makeTotals(),
      staffingPlan: [makeStaffingPlanItem()]
    });

    expect(brief.topActions).toHaveLength(4);
  });

  it('generates metrics correctly', () => {
    const report = makeReport();
    const growthRows = [makeGrowthRow()];
    const totals = makeTotals();

    const brief = generateAndwellExpertBrief({
      report,
      growthRows,
      totals,
      staffingPlan: []
    });

    expect(brief.metrics.competitors).toBe(3);
    expect(brief.metrics.threeYearRevenue).toBe('$9.0M');
    expect(brief.metrics.threeYearContribution).toBe('$1.6M');
    expect(brief.metrics.y3Starts).toBe(1000);
  });

  it('sets posture with competitor name when threats exist', () => {
    const report = makeReport();
    const brief = generateAndwellExpertBrief({
      report,
      growthRows: [makeGrowthRow()],
      totals: makeTotals(),
      staffingPlan: []
    });

    expect(brief.posture).toContain('Competitor A');
  });

  it('handles missing report gracefully', () => {
    const growthRows = [makeGrowthRow()];
    const totals = makeTotals();

    const brief = generateAndwellExpertBrief({
      report: undefined,
      growthRows,
      totals,
      staffingPlan: []
    });

    expect(brief.metrics.competitors).toBe(0);
    expect(brief.staffingRisks).toEqual([]);
    expect(brief.priorityMarkets).toHaveLength(1);
  });

  it('prioritizes markets by opportunity score descending', () => {
    const rows = [
      makeGrowthRow({ county: 'York', opportunityScore: 85 }),
      makeGrowthRow({ county: 'Cumberland', service: 'Therapy Care', opportunityScore: 72 }),
      makeGrowthRow({ county: 'Penobscot', service: 'Mobile Wound', opportunityScore: 90 }),
    ];

    const brief = generateAndwellExpertBrief({
      report: undefined,
      growthRows: rows,
      totals: makeTotals(),
      staffingPlan: []
    });

    expect(brief.priorityMarkets[0].county).toBe('Penobscot');
    expect(brief.priorityMarkets[1].county).toBe('York');
    expect(brief.priorityMarkets[2].county).toBe('Cumberland');
  });

  it('limits priority markets to 6', () => {
    const rows = Array.from({ length: 10 }, (_, i) => makeGrowthRow({
      county: `County${i}`,
      service: 'Home Healthcare',
      opportunityScore: 100 - i
    }));

    const brief = generateAndwellExpertBrief({
      report: undefined,
      growthRows: rows,
      totals: makeTotals(),
      staffingPlan: []
    });

    expect(brief.priorityMarkets).toHaveLength(6);
  });

  it('provides field guidance array with 3 items', () => {
    const brief = generateAndwellExpertBrief({
      report: undefined,
      growthRows: [],
      totals: makeTotals(),
      staffingPlan: []
    });

    expect(brief.fieldGuidance).toHaveLength(3);
  });

  it('provides open questions array with 4 items', () => {
    const brief = generateAndwellExpertBrief({
      report: undefined,
      growthRows: [],
      totals: makeTotals(),
      staffingPlan: []
    });

    expect(brief.openQuestions).toHaveLength(4);
  });

  it('filters staffing risks to items with 3+ FTE', () => {
    const items: StaffingPlanItem[] = [
      makeStaffingPlanItem({ service: 'Home Healthcare', fte: [1, 2, 5] }),
      makeStaffingPlanItem({ service: 'Mobile Wound', fte: [1, 1, 2] }),
    ];

    const brief = generateAndwellExpertBrief({
      report: undefined,
      growthRows: [],
      totals: makeTotals(),
      staffingPlan: items
    });

    expect(brief.staffingRisks).toHaveLength(1);
    expect(brief.staffingRisks[0].service).toBe('Home Healthcare');
  });

  it('sets review items from unsafe claims when no report', () => {
    const brief = generateAndwellExpertBrief({
      report: undefined,
      growthRows: [],
      totals: makeTotals(),
      staffingPlan: []
    });

    expect(brief.metrics.reviewItems).toBe(0);
  });

  it('generates board narrative containing revenue and contribution', () => {
    const totals = makeTotals({ totalRevenue: 5000000, totalContribution: 900000 });
    const brief = generateAndwellExpertBrief({
      report: undefined,
      growthRows: [makeGrowthRow()],
      totals,
      staffingPlan: []
    });

    expect(brief.boardNarrative).toContain('$5.0M');
    expect(brief.boardNarrative).toContain('$900K');
  });

  it('handles empty growth rows', () => {
    const brief = generateAndwellExpertBrief({
      report: undefined,
      growthRows: [],
      totals: makeTotals(),
      staffingPlan: []
    });

    expect(brief.priorityMarkets).toHaveLength(0);
  });

  it('executive summary falls back when no report', () => {
    const totals = makeTotals({ totalRevenue: 3000000 });
    const brief = generateAndwellExpertBrief({
      report: undefined,
      growthRows: [],
      totals,
      staffingPlan: []
    });

    expect(brief.executiveSummary).toContain('$3.0M');
  });

  it('uses report expertBrief summary when available', () => {
    const report = makeReport({
      expertBrief: {
        expertVersion: '2.0',
        generatedAt: '2025-01-01T00:00:00.000Z',
        expertScore: 85,
        marketPosture: 'Growth-ready',
        expertSummary: 'Custom expert summary from report.',
        leadershipDecision: 'Proceed with caution.',
        salesCoachingPriority: 'Field positioning',
        fastestFieldMove: 'Validate York',
        governanceWarning: 'Review pricing claims.',
        strongestThreats: ['Competitor A'],
        bestOpportunities: ['Home Healthcare in York'],
        recommendations: [],
        fieldPlays: [],
        watchlist: []
      }
    });

    const brief = generateAndwellExpertBrief({
      report,
      growthRows: [],
      totals: makeTotals(),
      staffingPlan: []
    });

    expect(brief.executiveSummary).toBe('Custom expert summary from report.');
  });
});
