import { describe, it, expect } from 'vitest';
import { categorizeClaims, categorizeAllClaims, filterApprovedClaims, claimStatusTone, generateSafeAlternative, rewriteClaim, rewriteAllClaims } from './claim-governance';
import type { CompetitorAnalysis } from './types';

function makeAnalysis(overrides?: Partial<CompetitorAnalysis>): CompetitorAnalysis {
  return {
    id: 'test',
    name: 'Test Competitor',
    url: 'https://competitor.com',
    market: 'ME',
    analyzedAt: new Date().toISOString(),
    pagesReviewed: [],
    findings: [],
    subserviceFindings: [],
    score: {
      competitorId: 'test', competitorName: 'Test Competitor',
      serviceLineMatchScore: 50, subserviceDepthScore: 30,
      andwellDifferentiationScore: 50, competitorVisibilityScore: 50,
      evidenceStrengthScore: 50, reviewRiskScore: 20,
      threatLevel: 'Moderate overlap', strongestMatches: [],
      strongestAndwellAdvantages: [], needsReview: [], leadWith: [],
      executiveReadout: 'Test readout',
    },
    ...overrides,
  };
}

describe('categorizeClaims', () => {
  it('returns empty array when no AI extraction data', () => {
    const analysis = makeAnalysis();
    const claims = categorizeClaims(analysis);
    expect(claims).toEqual([]);
  });

  it('categorizes high-risk claims', () => {
    const analysis = makeAnalysis({
      aiExtraction: {
        providerName: 'Test',
        aiModel: 'gpt-4', generatedAt: new Date().toISOString(),
        servicesMentioned: [], benefitsMentioned: [],
        claimsMade: ['We are the best hospice provider'],
        programsOffered: [], proofPoints: [],
        referralCallsToAction: [],
        serviceLineDepth: [], subserviceDepth: [],
        competitorAdvantages: [], andwellAdvantages: [],
        safeSalesLanguage: [], doNotSayLanguage: [],
        reviewRisks: [],
        leadershipSummary: '',
        salesBattlecards: [],
        pageEvidence: [],
        rawConfidence: 'High',
      },
    });
    const claims = categorizeClaims(analysis);
    expect(claims.length).toBeGreaterThan(0);
    expect(claims[0].category).toBe('High risk');
  });

  it('categorizes do-not-use claims', () => {
    const analysis = makeAnalysis({
      aiExtraction: {
        providerName: 'Test', aiModel: 'gpt-4', generatedAt: new Date().toISOString(),
        servicesMentioned: [], benefitsMentioned: [],
        claimsMade: ['competitor doesn\'t offer hospice'],
        programsOffered: [], proofPoints: [],
        referralCallsToAction: [],
        serviceLineDepth: [], subserviceDepth: [],
        competitorAdvantages: [], andwellAdvantages: [],
        safeSalesLanguage: [], doNotSayLanguage: [],
        reviewRisks: [],
        leadershipSummary: '',
        salesBattlecards: [],
        pageEvidence: [],
        rawConfidence: 'High',
      },
    });
    const claims = categorizeClaims(analysis);
    expect(claims[0].category).toBe('Do not use');
  });

  it('deduplicates claims', () => {
    const analysis = makeAnalysis({
      aiExtraction: {
        providerName: 'Test', aiModel: 'gpt-4', generatedAt: new Date().toISOString(),
        servicesMentioned: [], benefitsMentioned: ['great outcomes'],
        claimsMade: ['great outcomes'],
        programsOffered: [], proofPoints: [],
        referralCallsToAction: [],
        serviceLineDepth: [], subserviceDepth: [],
        competitorAdvantages: [], andwellAdvantages: [],
        safeSalesLanguage: [], doNotSayLanguage: [],
        reviewRisks: [],
        leadershipSummary: '',
        salesBattlecards: [],
        pageEvidence: [],
        rawConfidence: 'High',
      },
    });
    const claims = categorizeClaims(analysis);
    const greatOutcomes = claims.filter((c) => c.claim === 'great outcomes');
    expect(greatOutcomes).toHaveLength(1);
  });
});

describe('categorizeAllClaims', () => {
  it('aggregates claims across analyses', () => {
    const report = {
      analyses: [
        makeAnalysis({
          aiExtraction: {
            providerName: 'A', aiModel: 'gpt-4', generatedAt: new Date().toISOString(),
            servicesMentioned: [], benefitsMentioned: [],
            claimsMade: ['hospice services'], programsOffered: [], proofPoints: [],
            referralCallsToAction: [],
            serviceLineDepth: [], subserviceDepth: [],
            competitorAdvantages: [], andwellAdvantages: [],
            safeSalesLanguage: [], doNotSayLanguage: [],
            reviewRisks: [],
            leadershipSummary: '',
            salesBattlecards: [],
            pageEvidence: [],
            rawConfidence: 'High',
          },
        }),
      ],
    };
    const all = categorizeAllClaims(report);
    expect(all.length).toBeGreaterThan(0);
  });
});

describe('filterApprovedClaims', () => {
  it('returns only Safe claims', () => {
    const claims = [
      { claim: 'safe one', category: 'Safe' as const, reason: '', competitorName: 'Test', sourceUrl: 'https://example.com', serviceLine: 'Hospice' },
      { claim: 'risky one', category: 'High risk' as const, reason: '', competitorName: 'Test', sourceUrl: 'https://example.com', serviceLine: 'Hospice' },
    ];
    const approved = filterApprovedClaims(claims);
    expect(approved).toHaveLength(1);
    expect(approved[0].claim).toBe('safe one');
  });
});

describe('claimStatusTone', () => {
  it('returns green for Safe', () => expect(claimStatusTone('Safe')).toBe('green'));
  it('returns amber for Needs review', () => expect(claimStatusTone('Needs review')).toBe('amber'));
  it('returns red for Do not use', () => expect(claimStatusTone('Do not use')).toBe('red'));
  it('returns blue for Internal only', () => expect(claimStatusTone('Internal only')).toBe('blue'));
  it('returns red for High risk', () => expect(claimStatusTone('High risk')).toBe('red'));
});

describe('generateSafeAlternative', () => {
  it('rewrites absolute superlatives', () => {
    expect(generateSafeAlternative('We are the best provider')).toContain('well-suited');
  });

  it('rewrites guarantee language', () => {
    expect(generateSafeAlternative('We guarantee 100% satisfaction')).toContain('is designed to');
  });

  it('leaves safe claims unchanged', () => {
    const safe = 'Andwell provides hospice care in Maine';
    expect(generateSafeAlternative(safe)).toBe(safe);
  });

  it('rewrites negative competitor language', () => {
    const result = generateSafeAlternative("competitor doesn't offer hospice");
    expect(result).not.toContain("doesn't");
  });
});

describe('rewriteClaim', () => {
  it('returns original unchanged for safe claims', () => {
    const result = rewriteClaim('safe claim', 'Safe');
    expect(result.changed).toBe(false);
    expect(result.safe).toBe('safe claim');
  });

  it('generates alternative for high risk claims', () => {
    const result = rewriteClaim('We are the best', 'High risk');
    expect(result.changed).toBe(true);
    expect(result.safe).not.toContain('best');
  });
});

describe('rewriteAllClaims', () => {
  it('rewrites high-risk claims to Safe', () => {
    const claims = [
      { claim: 'We guarantee the best outcomes', category: 'High risk' as const, reason: 'risk', competitorName: 'Test', sourceUrl: 'https://example.com', serviceLine: 'Hospice' },
    ];
    const rewritten = rewriteAllClaims(claims);
    expect(rewritten[0].category).toBe('Safe');
    expect(rewritten[0].reason).toContain('Auto-rewritten');
  });
});
