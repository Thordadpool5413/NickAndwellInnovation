import { describe, it, expect } from 'vitest';
import { globalSearch } from './command-search';
import type { IntelligenceReport } from './types';

const sampleReport: IntelligenceReport = {
  id: 'report_1',
  generatedAt: new Date().toISOString(),
  baselineProvider: 'Andwell Health Partners',
  competitorsAnalyzed: 1,
  pagesReviewed: 3,
  serviceLinesMapped: 2,
  subservicesMapped: 1,
  matchedServiceFindings: 2,
  potentialAndwellAdvantages: 1,
  humanReviewItems: 1,
  executiveSummary: 'Test report',
  executiveInsights: [],
  competitorScores: [
    {
      competitorId: 'c1',
      competitorName: 'HomeCare Plus',
      serviceLineMatchScore: 80,
      subserviceDepthScore: 60,
      andwellDifferentiationScore: 40,
      competitorVisibilityScore: 70,
      evidenceStrengthScore: 65,
      reviewRiskScore: 5,
      threatLevel: 'High overlap',
      strongestMatches: ['Home Healthcare'],
      strongestAndwellAdvantages: ['Wound care'],
      needsReview: [],
      leadWith: ['Home Healthcare depth', 'Skilled nursing expertise'],
      executiveReadout: 'HomeCare Plus has strong overlap in home health.',
    },
  ],
  analyses: [
    {
      id: 'a1',
      name: 'HomeCare Plus',
      url: 'https://homecareplus.com',
      market: 'ME',
      analyzedAt: new Date().toISOString(),
      pagesReviewed: [],
      findings: [
        {
          id: 'f1',
          competitorId: 'c1',
          competitorName: 'HomeCare Plus',
          serviceLine: 'Home Healthcare',
          andwellStatus: 'Clearly offered',
          competitorStatus: 'Clearly offered',
          confidence: 'High',
          sourceUrl: 'https://homecareplus.com/services',
          evidenceExcerpt: 'We provide skilled nursing and therapy.',
          aiInterpretation: 'Clear match',
          matchLevel: 'high',
          andwellAdvantage: 'Broader coverage',
          competitorAdvantage: 'Deep experience',
          safeSalesWording: 'Both Andwell and HomeCare Plus offer skilled home health services with comparable depth.',
          avoidSaying: 'Do not say they lack capability.',
          reviewStatus: 'Approved for sales use',
          subserviceFindings: [],
          clearlyMatchedSubservices: 2,
          totalSubservices: 3,
          subserviceDepthScore: 67,
        },
      ],
      subserviceFindings: [],
      score: {
        competitorId: 'c1',
        competitorName: 'HomeCare Plus',
        serviceLineMatchScore: 80,
        subserviceDepthScore: 60,
        andwellDifferentiationScore: 40,
        competitorVisibilityScore: 70,
        evidenceStrengthScore: 65,
        reviewRiskScore: 5,
        threatLevel: 'High overlap',
        strongestMatches: ['Home Healthcare'],
        strongestAndwellAdvantages: ['Wound care'],
        needsReview: [],
        leadWith: ['Home Healthcare depth'],
        executiveReadout: 'HomeCare Plus has strong overlap.',
      },
      aiExtraction: {
        providerName: 'HomeCare Plus',
        aiModel: 'gpt-4',
        generatedAt: new Date().toISOString(),
        servicesMentioned: ['Home Healthcare', 'Skilled Nursing'],
        benefitsMentioned: ['24/7 care', 'Experienced staff'],
        claimsMade: ['We are the leading home health provider in Maine'],
        programsOffered: ['Chronic care program'],
        proofPoints: ['Serving 5000 patients annually'],
        referralCallsToAction: ['Call us today'],
        serviceLineDepth: [],
        subserviceDepth: [],
        competitorAdvantages: ['Experience'],
        andwellAdvantages: ['Technology'],
        safeSalesLanguage: [],
        doNotSayLanguage: [],
        reviewRisks: [],
        leadershipSummary: '',
        salesBattlecards: [],
        pageEvidence: [],
        rawConfidence: 'High',
      },
    },
  ],
  allFindings: [
    {
      id: 'f1',
      competitorId: 'c1',
      competitorName: 'HomeCare Plus',
      serviceLine: 'Home Healthcare',
      andwellStatus: 'Clearly offered',
      competitorStatus: 'Clearly offered',
      confidence: 'High',
      sourceUrl: 'https://homecareplus.com/services',
      evidenceExcerpt: 'We provide skilled nursing and therapy.',
      aiInterpretation: 'Clear match',
      matchLevel: 'high',
      andwellAdvantage: 'Broader coverage',
      competitorAdvantage: 'Deep experience',
      safeSalesWording: 'Both Andwell and HomeCare Plus offer skilled home health services with comparable depth.',
      avoidSaying: 'Do not say they lack capability.',
      reviewStatus: 'Approved for sales use',
      subserviceFindings: [],
      clearlyMatchedSubservices: 2,
      totalSubservices: 3,
      subserviceDepthScore: 67,
    },
  ],
  allSubserviceFindings: [],
  crawlErrors: [],
};

describe('globalSearch', () => {
  it('returns empty array for empty query', () => {
    expect(globalSearch('')).toEqual([]);
  });

  it('returns empty array for whitespace-only query', () => {
    expect(globalSearch('   ')).toEqual([]);
  });

  it('returns empty array for query shorter than 2 characters', () => {
    expect(globalSearch('a')).toEqual([]);
  });

  it('finds services by serviceLine name', () => {
    const results = globalSearch('Home Healthcare');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.type === 'service')).toBe(true);
    expect(results.some((r) => r.label === 'Home Healthcare')).toBe(true);
  });

  it('finds services by category name', () => {
    const results = globalSearch('At Home');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.type === 'service')).toBe(true);
  });

  it('finds services by subservice name', () => {
    const results = globalSearch('nursing');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.label.includes('Skilled nursing'))).toBe(true);
  });

  it('finds counties by name', () => {
    const results = globalSearch('York');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.type === 'county')).toBe(true);
  });

  it('finds counties by service name', () => {
    const results = globalSearch('Wound');
    expect(results.some((r) => r.type === 'county')).toBe(true);
  });

  it('finds county service gaps by current/missing fields', () => {
    const results = globalSearch('Home Healthcare');
    const gapResults = results.filter((r) => r.description.includes('Missing'));
    expect(gapResults.length).toBeGreaterThan(0);
  });

  it('finds competitors by name when report is provided', () => {
    const results = globalSearch('HomeCare Plus', sampleReport);
    expect(results.some((r) => r.type === 'competitor' && r.label === 'HomeCare Plus')).toBe(true);
  });

  it('finds competitors by url when report is provided', () => {
    const results = globalSearch('homecareplus.com', sampleReport);
    expect(results.some((r) => r.type === 'competitor')).toBe(true);
  });

  it('finds findings by content when report is provided', () => {
    const results = globalSearch('skilled', sampleReport);
    expect(results.some((r) => r.type === 'finding')).toBe(true);
  });

  it('finds claim matches from aiExtraction when report is provided', () => {
    const results = globalSearch('leading home health', sampleReport);
    expect(results.some((r) => r.type === 'claim')).toBe(true);
  });

  it('finds leadWith matches from competitorScores when report is provided', () => {
    const results = globalSearch('nursing expertise', sampleReport);
    expect(results.some((r) => r.type === 'competitor' && r.detail === 'High overlap')).toBe(true);
  });

  it('deduplicates results by type:label key', () => {
    const reportWithRepeats: IntelligenceReport = {
      ...sampleReport,
      competitorScores: [
        ...(sampleReport.competitorScores || []),
        {
          ...sampleReport.competitorScores![0],
          leadWith: ['Home Healthcare depth'],
        },
      ],
    };
    const results = globalSearch('Home Healthcare', reportWithRepeats);
    const serviceResults = results.filter((r) => r.type === 'service');
    const labels = serviceResults.map((r) => r.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('limits results to 25 items', () => {
    const results = globalSearch('care', sampleReport);
    expect(results.length).toBeLessThanOrEqual(25);
  });

  it('is case insensitive', () => {
    const lower = globalSearch('home healthcare');
    const upper = globalSearch('HOME HEALTHCARE');
    const mixed = globalSearch('Home Healthcare');
    expect(lower.length).toBe(mixed.length);
    expect(upper.length).toBe(mixed.length);
  });

  it('returns empty array when no matches found', () => {
    const results = globalSearch('xyznonexistent123');
    expect(results).toEqual([]);
  });

  it('returns catalog results even without a report provided', () => {
    const results = globalSearch('Home Healthcare', null);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.type === 'service')).toBe(true);
    const noReport = globalSearch('Home Healthcare', undefined);
    expect(noReport.length).toBeGreaterThan(0);
  });

  it('returns competitor results from report even when leadWith matches', () => {
    const results = globalSearch('depth', sampleReport);
    expect(results.some((r) => r.type === 'competitor' && r.label.includes('HomeCare Plus'))).toBe(true);
  });
});
