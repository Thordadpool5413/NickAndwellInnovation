import { describe, it, expect } from 'vitest';
import { buildExpertBrief } from './expert-engine';
import type { CompetitorAnalysis, CompetitorScore, Finding, SubserviceFinding } from './types';

function makeScore(overrides?: Partial<CompetitorScore>): CompetitorScore {
  return {
    competitorId: 'comp_1',
    competitorName: 'Test Competitor',
    serviceLineMatchScore: 75,
    subserviceDepthScore: 50,
    andwellDifferentiationScore: 40,
    competitorVisibilityScore: 60,
    evidenceStrengthScore: 70,
    reviewRiskScore: 10,
    threatLevel: 'High overlap',
    strongestMatches: ['Home Healthcare', 'Hospice Home Care'],
    strongestAndwellAdvantages: ['Wound care', 'Therapy'],
    needsReview: [],
    leadWith: ['Home Healthcare depth'],
    executiveReadout: 'Test competitor has moderate overlap.',
    ...overrides,
  };
}

function makeFinding(overrides?: Partial<Finding>): Finding {
  return {
    id: 'finding_1',
    competitorId: 'comp_1',
    competitorName: 'Test Competitor',
    serviceLine: 'Home Healthcare',
    andwellStatus: 'Clearly offered',
    competitorStatus: 'Mentioned only',
    confidence: 'High',
    sourceUrl: 'https://competitor.com/home-health',
    sourceTitle: 'Home Health Page',
    evidenceExcerpt: 'We provide comprehensive home health services.',
    aiInterpretation: 'Clear match',
    matchLevel: 'high',
    andwellAdvantage: 'More comprehensive',
    competitorAdvantage: 'Established presence',
    safeSalesWording: 'Andwell provides similar services with additional depth.',
    avoidSaying: 'Do not say they lack this service.',
    reviewStatus: 'Approved for sales use',
    subserviceFindings: [],
    clearlyMatchedSubservices: 3,
    totalSubservices: 5,
    subserviceDepthScore: 60,
    ...overrides,
  };
}

function makeSubserviceFinding(overrides?: Partial<SubserviceFinding>): SubserviceFinding {
  return {
    id: 'sub_1',
    competitorId: 'comp_1',
    competitorName: 'Test Competitor',
    serviceLine: 'Home Healthcare',
    subservice: 'Skilled nursing',
    andwellStatus: 'Clearly offered',
    competitorStatus: 'Mentioned only',
    confidence: 'Moderate',
    evidenceExcerpt: 'Nursing services mentioned.',
    matchedTerms: ['nursing'],
    aiInterpretation: 'Mentioned',
    safeSalesWording: 'Mentioned nursing.',
    avoidSaying: 'Do not claim.',
    reviewStatus: 'Sales usable with evidence',
    ...overrides,
  };
}

function makeAnalysis(overrides?: Partial<CompetitorAnalysis>): CompetitorAnalysis {
  return {
    id: 'analysis_1',
    name: 'Test Competitor',
    url: 'https://competitor.com',
    market: 'ME',
    analyzedAt: new Date().toISOString(),
    pagesReviewed: [],
    findings: [makeFinding()],
    subserviceFindings: [makeSubserviceFinding()],
    score: makeScore(),
    ...overrides,
  };
}

describe('buildExpertBrief', () => {
  it('returns a complete ExpertBrief structure', () => {
    const scores = [makeScore()];
    const analyses = [makeAnalysis()];
    const findings = [makeFinding()];
    const subFindings = [makeSubserviceFinding()];

    const brief = buildExpertBrief(analyses, scores, findings, subFindings, 3);

    expect(brief.expertVersion).toBeTruthy();
    expect(brief.generatedAt).toBeTruthy();
    expect(brief.expertScore).toBeGreaterThanOrEqual(0);
    expect(brief.expertScore).toBeLessThanOrEqual(100);
    expect(brief.marketPosture).toContain('Test Competitor');
    expect(brief.expertSummary).toContain('1 competitor analysis');
    expect(brief.leadershipDecision).toContain('Test Competitor');
    expect(brief.salesCoachingPriority).toContain('Test Competitor');
    expect(brief.fastestFieldMove).toContain('Home Healthcare');
    expect(brief.governanceWarning).toBeTruthy();
    expect(brief.strongestThreats).toHaveLength(1);
    expect(brief.bestOpportunities).toHaveLength(1);
    expect(brief.recommendations.length).toBeGreaterThanOrEqual(1);
    expect(brief.fieldPlays.length).toBeGreaterThanOrEqual(1);
    expect(brief.watchlist.length).toBeGreaterThanOrEqual(1);
  });

  it('returns empty state when no analyses or scores provided', () => {
    const brief = buildExpertBrief([], [], [], [], 0);

    expect(brief.marketPosture).toBe('No competitor threat posture available yet.');
    expect(brief.leadershipDecision).toBe('Run a competitor scan before making a leadership decision.');
    expect(brief.salesCoachingPriority).toBe('Coach reps to ask specific patient need questions and avoid unsupported competitor claims.');
    expect(brief.fastestFieldMove).toBe('Use the highest confidence shared service lines as coaching anchors until more competitor gaps are reviewed.');
    expect(brief.strongestThreats).toEqual([]);
    expect(brief.bestOpportunities).toEqual([]);
    expect(brief.recommendations).toEqual([]);
    expect(brief.fieldPlays).toEqual([]);
    expect(brief.watchlist).toEqual([]);
  });

  it('computes expert score correctly', () => {
    const scores = [makeScore({ serviceLineMatchScore: 100, subserviceDepthScore: 100, evidenceStrengthScore: 100, reviewRiskScore: 0 })];
    const analyses = [makeAnalysis()];
    const findings = Array.from({ length: 50 }, (_, i) => makeFinding({ id: `f_${i}`, reviewStatus: i < 10 ? 'Needs human review' : 'Approved for sales use' }));
    const subFindings = [makeSubserviceFinding()];

    const brief = buildExpertBrief(analyses, scores, findings, subFindings, 10);

    expect(brief.expertScore).toBeGreaterThanOrEqual(0);
    expect(brief.expertScore).toBeLessThanOrEqual(100);
  });

  it('flags governance warning when review ratio exceeds threshold', () => {
    const findings = [makeFinding({ reviewStatus: 'Needs human review' })];
    const brief = buildExpertBrief([], [], findings, [], 1);

    expect(brief.governanceWarning).toContain('High review load');
  });

  it('provides manageable governance warning when review ratio is low', () => {
    const findings = Array.from({ length: 20 }, (_, i) => makeFinding({ id: `f_${i}`, reviewStatus: 'Approved for sales use' }));
    const brief = buildExpertBrief([], [], findings, [], 2);

    expect(brief.governanceWarning).toContain('manageable');
  });

  it('generates leadership-threat-review recommendation for top threat', () => {
    const scores = [makeScore({ competitorName: 'ThreatCo', serviceLineMatchScore: 95, subserviceDepthScore: 80 })];
    const brief = buildExpertBrief([], scores, [], [], 0);

    const threatRec = brief.recommendations.find((r) => r.id === 'leadership-threat-review');
    expect(threatRec).toBeDefined();
    if (threatRec) {
      expect(threatRec.title).toContain('ThreatCo');
      expect(threatRec.audience).toBe('CEO');
      expect(threatRec.priority).toBe('Critical');
      expect(threatRec.reviewRequired).toBe(true);
    }
  });

  it('generates sales-differentiation-focus recommendation for top opportunity', () => {
    const scores = [makeScore({ competitorName: 'GapCo', andwellDifferentiationScore: 85, strongestAndwellAdvantages: ['Wound care', 'Therapy', 'Nursing'] })];
    const brief = buildExpertBrief([], scores, [], [], 0);

    const diffRec = brief.recommendations.find((r) => r.id === 'sales-differentiation-focus');
    expect(diffRec).toBeDefined();
    if (diffRec) {
      expect(diffRec.title).toContain('GapCo');
      expect(diffRec.audience).toBe('Sales Leader');
      expect(diffRec.priority).toBe('High');
    }
  });

  it('generates governance-review-queue when humanReviewItems > 0', () => {
    const brief = buildExpertBrief([], [], [], [], 10);

    const govRec = brief.recommendations.find((r) => r.id === 'governance-review-queue');
    expect(govRec).toBeDefined();
    if (govRec) {
      expect(govRec.audience).toBe('Admin');
      expect(govRec.reviewRequired).toBe(true);
    }
  });

  it('marks governance review Critical when items > 40', () => {
    const brief = buildExpertBrief([], [], [], [], 45);

    const govRec = brief.recommendations.find((r) => r.id === 'governance-review-queue');
    expect(govRec).toBeDefined();
    if (govRec) {
      expect(govRec.priority).toBe('Critical');
    }
  });

  it('generates marketing-public-positioning when messaging candidates exist', () => {
    const findings = [
      makeFinding({ competitorStatus: 'Not found publicly', serviceLine: 'Therapy Care' }),
      makeFinding({ competitorStatus: 'Unclear', serviceLine: 'Wound Care' }),
    ];
    const analysis = makeAnalysis({ findings });
    const brief = buildExpertBrief([analysis], [makeScore()], findings, [], 0);

    const marketingRec = brief.recommendations.find((r) => r.id === 'marketing-public-positioning');
    expect(marketingRec).toBeDefined();
    if (marketingRec) {
      expect(marketingRec.reviewRequired).toBe(false);
    }
  });

  it('generates field plays from analysis findings', () => {
    const findings = [
      makeFinding({ competitorStatus: 'Clearly offered', serviceLine: 'Home Healthcare' }),
      makeFinding({ competitorStatus: 'Mentioned only', serviceLine: 'Therapy Care' }),
    ];
    const analysis = makeAnalysis({ findings });
    const brief = buildExpertBrief([analysis], [makeScore()], findings, [], 0);

    expect(brief.fieldPlays.length).toBeGreaterThan(0);
    const first = brief.fieldPlays[0];
    expect(first.competitorName).toBe('Test Competitor');
    expect(first.serviceLine).toBeTruthy();
    expect(first.scenario).toBeTruthy();
    expect(first.leadWith).toBeTruthy();
    expect(first.referralQuestion).toBeTruthy();
    expect(first.objectionResponse).toBeTruthy();
    expect(first.proofNeeded).toBeTruthy();
    expect(first.avoidSaying).toBeTruthy();
  });

  it('generates watchlist from scores and analyses', () => {
    const scores = [
      makeScore({ competitorName: 'WatchCo', serviceLineMatchScore: 90, threatLevel: 'Strategic threat' }),
    ];
    const brief = buildExpertBrief([], scores, [], [], 0);

    expect(brief.watchlist.length).toBeGreaterThan(0);
    const item = brief.watchlist[0];
    expect(item.competitorName).toBe('WatchCo');
    expect(item.priority).toBeTruthy();
    expect(item.signal).toContain('Strategic threat');
  });

  it('adds ai risk watch items when analyses have extraction risks', () => {
    const analysis = makeAnalysis({
      aiExtraction: {
        providerName: 'RiskCo',
        aiModel: 'gpt-4',
        generatedAt: new Date().toISOString(),
        servicesMentioned: [],
        benefitsMentioned: [],
        claimsMade: [],
        programsOffered: [],
        proofPoints: [],
        referralCallsToAction: [],
        serviceLineDepth: [],
        subserviceDepth: [],
        competitorAdvantages: [],
        andwellAdvantages: [],
        safeSalesLanguage: [],
        doNotSayLanguage: [],
        reviewRisks: ['Unsupported pricing claim', 'Outdated service list'],
        leadershipSummary: '',
        salesBattlecards: [],
        pageEvidence: [],
        rawConfidence: 'Medium',
      },
    });
    const brief = buildExpertBrief([analysis], [makeScore()], [], [], 0);

    const riskItem = brief.watchlist.find((w) => w.id === 'analysis_1-ai-risk');
    expect(riskItem).toBeDefined();
    if (riskItem) {
      expect(riskItem.priority).toBe('High');
      expect(riskItem.signal).toContain('Unsupported pricing claim');
    }
  });

  it('limits field plays to FIELD_PLAYS_MAX', () => {
    const analyses = Array.from({ length: 5 }, (_, i) => {
      const findings = Array.from({ length: 10 }, (_, j) => makeFinding({ id: `f_${i}_${j}`, serviceLine: `Service ${j}` }));
      return makeAnalysis({ id: `a_${i}`, findings });
    });
    const scores = analyses.map((a) => a.score);

    const brief = buildExpertBrief(analyses, scores, [], [], 0);
    expect(brief.fieldPlays.length).toBeLessThanOrEqual(12);
  });

  it('limits watchlist to WATCHLIST_MAX', () => {
    const scores = Array.from({ length: 8 }, (_, i) => makeScore({
      competitorId: `c_${i}`,
      competitorName: `Comp ${i}`,
      serviceLineMatchScore: 80 + i,
    }));

    const brief = buildExpertBrief([], scores, [], [], 0);
    expect(brief.watchlist.length).toBeLessThanOrEqual(10);
  });

  it('reports correct number of sales-ready findings', () => {
    const findings = [
      makeFinding({ reviewStatus: 'Approved for sales use' }),
      makeFinding({ id: 'f2', reviewStatus: 'Sales usable with evidence' }),
      makeFinding({ id: 'f3', reviewStatus: 'Needs human review' }),
      makeFinding({ id: 'f4', reviewStatus: 'Rejected' }),
    ];
    const brief = buildExpertBrief([], [], findings, [], 2);

    expect(brief.expertSummary).toContain('2 service findings that are closest to field usable');
  });

  it('handles single-item arrays correctly', () => {
    const score = makeScore({ competitorName: 'SoloCo' });
    const findings = [makeFinding()];
    const subFindings = [makeSubserviceFinding()];
    const analysis = makeAnalysis({ name: 'SoloCo', findings, subserviceFindings: subFindings });

    const brief = buildExpertBrief([analysis], [score], findings, subFindings, 1);

    expect(brief.strongestThreats).toHaveLength(1);
    expect(brief.bestOpportunities).toHaveLength(1);
    expect(brief.recommendations.length).toBeGreaterThanOrEqual(3);
  });
});
