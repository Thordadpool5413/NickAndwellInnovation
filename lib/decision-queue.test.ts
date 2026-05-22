import { describe, it, expect } from 'vitest';
import { generateDecisions, applyDecisionAction, urgencyOrder, riskTone } from './decision-queue';
import type { CompetitorScore, CompetitorAnalysis, ExecutiveInsight, IntelligenceReport } from './types';
import type { GrowthRow } from './growth-plan';

function makeReport(overrides?: Partial<IntelligenceReport>) {
  return {
    id: 'rep-1',
    generatedAt: '2025-06-01T00:00:00Z',
    baselineProvider: 'Andwell Health Partners' as const,
    competitorsAnalyzed: 2,
    pagesReviewed: 10,
    serviceLinesMapped: 8,
    subservicesMapped: 15,
    matchedServiceFindings: 12,
    potentialAndwellAdvantages: 5,
    humanReviewItems: 0,
    executiveSummary: 'Summary text',
    executiveInsights: [],
    competitorScores: [],
    analyses: [],
    allFindings: [],
    allSubserviceFindings: [],
    crawlErrors: [],
    ...overrides
  };
}

function makeGrowthRow(overrides?: Partial<GrowthRow>) {
  return {
    county: 'York',
    service: 'Home Healthcare' as const,
    launchGroup: 'Priority 1' as const,
    age65: 45000,
    current: 'Hospice, Palliative Medicine',
    missing: 'Home Healthcare, Therapy Care',
    reason: 'Large opportunity',
    action: 'Confirm staffing',
    accounts: ['Hospital A', 'Clinic B'],
    meta: { color: '#2563eb', role: 'Foundation', unit: 'admissions', reimbursement: 3189, margin: 0.18, demandRate: 0.08 },
    basis: 'CMS direct HH market',
    demandPool: 2191,
    reimbursement: 4769,
    starts: [165, 248, 330] as [number, number, number],
    referrals: [220, 331, 440] as [number, number, number],
    revenue: [786885, 1180312, 1573770] as [number, number, number],
    contribution: [141639, 212456, 283279] as [number, number, number],
    totalStarts: 743,
    totalReferrals: 991,
    totalRevenue: 3540967,
    totalContribution: 637374,
    opportunityScore: 75,
    ...overrides
  };
}

describe('generateDecisions', () => {
  it('returns at least one decision (dashboard referral) when report and growthRows are null/undefined', () => {
    const result = generateDecisions(null, undefined);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[result.length - 1].title).toBe('Review referral source coverage gaps');
  });

  it('returns only the dashboard referral when report and growthRows are empty', () => {
    const report = makeReport();
    const result = generateDecisions(report, []);
    expect(result.length).toBe(1);
    expect(result[0].type).toBe('Referral');
  });

  it('generates Leadership decisions from executive insights', () => {
    const insights: ExecutiveInsight[] = [
      { title: 'Expand wound presence', priority: 'High', audience: 'CEO', summary: 'Wound care demand growing', action: 'Launch wound program' },
      { title: 'Monitor competitor A', priority: 'Medium', audience: 'Sales Leader', summary: 'Competitor expanding', action: 'Track market share' }
    ];
    const report = makeReport({ executiveInsights: insights });
    const result = generateDecisions(report);
    const leadershipDecisions = result.filter((d) => d.type === 'Leadership');
    expect(leadershipDecisions).toHaveLength(2);
    expect(leadershipDecisions[0].risk).toBe('High');
    expect(leadershipDecisions[0].urgency).toBe('Today');
    expect(leadershipDecisions[1].risk).toBe('Medium');
    expect(leadershipDecisions[1].urgency).toBe('This week');
  });

  it('generates Competitive decisions for strategic threats', () => {
    const scores: CompetitorScore[] = [
      { competitorId: 'c1', competitorName: 'Gentiva', serviceLineMatchScore: 85, subserviceDepthScore: 70, andwellDifferentiationScore: 30, competitorVisibilityScore: 90, evidenceStrengthScore: 80, reviewRiskScore: 20, threatLevel: 'Strategic threat', strongestMatches: ['Home Health'], strongestAndwellAdvantages: ['Wound care'], needsReview: [], leadWith: ['Coordination'], executiveReadout: 'Gentiva is a strong competitor' }
    ];
    const report = makeReport({ competitorScores: scores });
    const result = generateDecisions(report);
    const threatDecisions = result.filter((d) => d.type === 'Competitive');
    expect(threatDecisions).toHaveLength(1);
    expect(threatDecisions[0].urgency).toBe('Immediate');
    expect(threatDecisions[0].owner).toBe('CEO');
  });

  it('generates Governance decisions when competitor needs review', () => {
    const scores: CompetitorScore[] = [
      { competitorId: 'c1', competitorName: 'Amedisys', serviceLineMatchScore: 60, subserviceDepthScore: 40, andwellDifferentiationScore: 50, competitorVisibilityScore: 70, evidenceStrengthScore: 60, reviewRiskScore: 30, threatLevel: 'Low overlap', strongestMatches: [], strongestAndwellAdvantages: [], needsReview: ['Claim A', 'Claim B', 'Claim C'], leadWith: [], executiveReadout: 'Some claims need review' }
    ];
    const report = makeReport({ competitorScores: scores });
    const result = generateDecisions(report);
    const reviewDecisions = result.filter((d) => d.relatedCompetitor === 'Amedisys' && d.type === 'Governance');
    expect(reviewDecisions).toHaveLength(1);
    expect(reviewDecisions[0].title).toContain('3 items needing review');
  });

  it('generates Field enablement decisions from doNotSay language', () => {
    const analysis: CompetitorAnalysis = {
      id: 'a1', name: 'Gentiva', url: 'https://gentiva.com', market: 'National', analyzedAt: '2025-06-01', pagesReviewed: [], findings: [], subserviceFindings: [],
      score: { competitorId: 'a1', competitorName: 'Gentiva', serviceLineMatchScore: 0, subserviceDepthScore: 0, andwellDifferentiationScore: 0, competitorVisibilityScore: 0, evidenceStrengthScore: 0, reviewRiskScore: 0, threatLevel: 'Low overlap', strongestMatches: [], strongestAndwellAdvantages: [], needsReview: [], leadWith: [], executiveReadout: '' },
      aiExtraction: { providerName: 'Gentiva', aiModel: 'gpt-4', generatedAt: '2025-06-01', servicesMentioned: [], benefitsMentioned: [], claimsMade: [], programsOffered: [], proofPoints: [], referralCallsToAction: [], serviceLineDepth: [], subserviceDepth: [], competitorAdvantages: [], andwellAdvantages: [], safeSalesLanguage: [], doNotSayLanguage: ['We are the only provider in Maine', 'Our quality is unmatched'], reviewRisks: [], leadershipSummary: '', salesBattlecards: [], pageEvidence: [], rawConfidence: 'High' }
    };
    const report = makeReport({ analyses: [analysis] });
    const result = generateDecisions(report);
    const fieldDecisions = result.filter((d) => d.type === 'Field enablement');
    expect(fieldDecisions.length).toBeGreaterThanOrEqual(1);
    expect(fieldDecisions[0].title).toContain('Field language warning');
  });

  it('generates Compliance decision from governance warning', () => {
    const report = makeReport({ expertBrief: { expertVersion: '2.0', generatedAt: '2025-06-01', expertScore: 85, marketPosture: 'Strong', expertSummary: '', leadershipDecision: '', salesCoachingPriority: '', fastestFieldMove: '', governanceWarning: 'Claims about pricing need verification', strongestThreats: [], bestOpportunities: [], recommendations: [], fieldPlays: [], watchlist: [] } });
    const result = generateDecisions(report);
    const complianceDecisions = result.filter((d) => d.type === 'Compliance');
    expect(complianceDecisions).toHaveLength(1);
    expect(complianceDecisions[0].owner).toBe('Clinical Leader');
  });

  it('generates Growth decisions from Priority 1 growth rows', () => {
    const rows = [makeGrowthRow({ county: 'York', service: 'Home Healthcare', launchGroup: 'Priority 1' })];
    const result = generateDecisions(undefined, rows);
    const growthDecisions = result.filter((d) => d.type === 'Growth');
    expect(growthDecisions.length).toBeGreaterThanOrEqual(1);
    expect(growthDecisions[0].title).toContain('Launch');
  });

  it('generates scale decision when 3+ rows have opportunityScore >= 70', () => {
    const rows = [
      makeGrowthRow({ county: 'York', service: 'Home Healthcare', opportunityScore: 80 }),
      makeGrowthRow({ county: 'Cumberland', service: 'Therapy Care', opportunityScore: 75 }),
      makeGrowthRow({ county: 'Penobscot', service: 'Mobile Wound', opportunityScore: 90 })
    ];
    const result = generateDecisions(undefined, rows);
    const scaleDecisions = result.filter((d) => d.title.includes('high-opportunity markets'));
    expect(scaleDecisions).toHaveLength(1);
    expect(scaleDecisions[0].type).toBe('Growth');
    expect(scaleDecisions[0].owner).toBe('CEO');
  });

  it('generates human review decision when humanReviewItems > 0', () => {
    const report = makeReport({ humanReviewItems: 3 });
    const result = generateDecisions(report);
    const humanDecisions = result.filter((d) => d.title.includes('human review'));
    expect(humanDecisions).toHaveLength(1);
  });
});

describe('applyDecisionAction', () => {
  it('updates the status of a matching item', () => {
    const items = [
      { id: 'a', type: 'Leadership' as const, owner: 'CEO', urgency: 'Today' as const, risk: 'High' as const, title: 'T', evidence: 'E', recommendedAction: 'A', status: 'Pending' as const, createdAt: '2025-06-01' },
      { id: 'b', type: 'Growth' as const, owner: 'COO', urgency: 'This month' as const, risk: 'Medium' as const, title: 'T2', evidence: 'E2', recommendedAction: 'A2', status: 'Pending' as const, createdAt: '2025-06-01' }
    ];
    const result = applyDecisionAction(items, 'a', 'Approved');
    expect(result.find((i) => i.id === 'a')?.status).toBe('Approved');
    expect(result.find((i) => i.id === 'b')?.status).toBe('Pending');
  });

  it('returns unchanged items when id does not match', () => {
    const items = [
      { id: 'x', type: 'Leadership' as const, owner: 'CEO', urgency: 'Today' as const, risk: 'High' as const, title: 'T', evidence: 'E', recommendedAction: 'A', status: 'Pending' as const, createdAt: '2025-06-01' }
    ];
    const result = applyDecisionAction(items, 'nonexistent', 'Approved');
    expect(result).toEqual(items);
  });

  it('does not mutate the original array', () => {
    const items = [
      { id: 'z', type: 'Leadership' as const, owner: 'CEO', urgency: 'Today' as const, risk: 'High' as const, title: 'T', evidence: 'E', recommendedAction: 'A', status: 'Pending' as const, createdAt: '2025-06-01' }
    ];
    const result = applyDecisionAction(items, 'z', 'Deferred');
    expect(items[0].status).toBe('Pending');
    expect(result[0].status).toBe('Deferred');
  });
});

describe('urgencyOrder', () => {
  it('returns 0 for Immediate', () => expect(urgencyOrder('Immediate')).toBe(0));
  it('returns 1 for Today', () => expect(urgencyOrder('Today')).toBe(1));
  it('returns 2 for This week', () => expect(urgencyOrder('This week')).toBe(2));
  it('returns 3 for This month', () => expect(urgencyOrder('This month')).toBe(3));
  it('returns 4 for This quarter', () => expect(urgencyOrder('This quarter')).toBe(4));
});

describe('riskTone', () => {
  it('returns red for High', () => expect(riskTone('High')).toBe('red'));
  it('returns amber for Medium', () => expect(riskTone('Medium')).toBe('amber'));
  it('returns green for Low', () => expect(riskTone('Low')).toBe('green'));
});
