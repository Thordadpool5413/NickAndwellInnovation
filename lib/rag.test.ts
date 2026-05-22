import { describe, it, expect, beforeEach } from 'vitest';
import { buildIndex, isIndexReady, queryIndex, ragQuery, clearIndex } from './rag';
import type { IntelligenceReport } from './types';

function makeReport(overrides?: Partial<IntelligenceReport>): IntelligenceReport {
  return {
    id: 'test-report',
    generatedAt: new Date().toISOString(),
    baselineProvider: 'Andwell Health Partners' as const,
    competitorsAnalyzed: 1,
    serviceLinesMapped: 2,
    subservicesMapped: 3,
    pagesReviewed: 5,
    matchedServiceFindings: 0,
    humanReviewItems: 0,
    potentialAndwellAdvantages: 3,
    executiveSummary: 'Test summary',
    executiveInsights: [{ title: 'Insight 1', priority: 'Medium' as const, audience: 'CEO' as const, summary: 'Test insight', action: 'Review' }],
    competitorScores: [],
    analyses: [
      {
        id: 'analysis-1',
        name: 'Test Competitor',
        url: 'https://example.com',
        market: 'ME',
        analyzedAt: new Date().toISOString(),
        pagesReviewed: [{ url: 'https://example.com', title: 'Home', text: 'Home health nursing services', excerpt: 'Home health...', pageType: 'General page' as const }],
        findings: [
          {
            id: 'finding-1',
            competitorId: 'comp-1',
            competitorName: 'Test Competitor',
            serviceLine: 'Home Healthcare',
            andwellStatus: 'Not found publicly' as const,
            competitorStatus: 'Clearly offered' as const,
            confidence: 'High' as const,
            evidenceExcerpt: 'Offers home health nursing',
            aiInterpretation: 'Offers home health nursing services',
            matchLevel: 'Strong',
            andwellAdvantage: 'Andwell has broader coverage',
            competitorAdvantage: '',
            safeSalesWording: 'Focus on Andwell depth',
            avoidSaying: '',
            reviewStatus: 'Approved for sales use' as const,
            subserviceFindings: [],
            clearlyMatchedSubservices: 0,
            totalSubservices: 0,
            subserviceDepthScore: 0,
          },
        ],
        subserviceFindings: [],
        score: {
          competitorId: 'comp-1',
          competitorName: 'Test Competitor',
          serviceLineMatchScore: 75,
          subserviceDepthScore: 50,
          andwellDifferentiationScore: 60,
          competitorVisibilityScore: 40,
          evidenceStrengthScore: 70,
          reviewRiskScore: 30,
          threatLevel: 'Moderate overlap' as const,
          strongestMatches: ['Home Healthcare'],
          strongestAndwellAdvantages: ['Broader coverage'],
          needsReview: [],
          leadWith: ['Home Healthcare'],
          executiveReadout: 'Test competitor with moderate overlap',
        },
      },
    ],
    allFindings: [],
    allSubserviceFindings: [],
    crawlErrors: [],
    ...overrides,
  };
}

describe('RAG pipeline', () => {
  beforeEach(() => {
    clearIndex();
  });

  it('isIndexReady returns false before build', () => {
    expect(isIndexReady()).toBe(false);
  });

  it('buildIndex creates an index from a report', async () => {
    await buildIndex(makeReport());
    expect(isIndexReady()).toBe(true);
  });

  it('queryIndex returns results sorted by score', async () => {
    await buildIndex(makeReport());
    const results = await queryIndex('home health nursing');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThanOrEqual(0);
    expect(results[0].id).toBeDefined();
    expect(results[0].excerpt).toBeDefined();
  });

  it('queryIndex returns empty array when no index', async () => {
    const results = await queryIndex('test');
    expect(results).toEqual([]);
  });

  it('ragQuery returns answer with sources', async () => {
    const report = makeReport();
    await buildIndex(report);
    const result = await ragQuery('home health', report);
    expect(result.answer).toBeTruthy();
    expect(result.sources.length).toBeGreaterThan(0);
  });

  it('ragQuery builds index automatically if needed', async () => {
    clearIndex();
    const report = makeReport();
    const result = await ragQuery('home health', report);
    expect(result.answer).toBeTruthy();
    expect(isIndexReady()).toBe(true);
  });

  it('ragQuery returns fallback message when no sources found', async () => {
    clearIndex();
    const result = await ragQuery('something random', null);
    expect(result.answer).toContain('No relevant findings');
    expect(result.sources).toEqual([]);
  });

  it('clearIndex resets the index', async () => {
    await buildIndex(makeReport());
    expect(isIndexReady()).toBe(true);
    clearIndex();
    expect(isIndexReady()).toBe(false);
  });
});
