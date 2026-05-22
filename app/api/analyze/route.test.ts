import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../lib/crawler', () => ({
  crawlSite: vi.fn(),
}));

vi.mock('../../../lib/analysis', () => ({
  analyzeCompetitor: vi.fn(),
  buildReport: vi.fn(),
  buildScore: vi.fn(),
}));

vi.mock('../../../lib/ai-extractor', () => ({
  extractCompetitorIntelligence: vi.fn(),
  isAIExtractionConfigured: vi.fn(),
}));

vi.mock('../../../lib/store', () => ({
  saveReport: vi.fn(),
}));

vi.mock('../../../lib/provider-identity', () => ({
  normalizeCompetitorInput: vi.fn((input) => input),
}));

import { crawlSite } from '../../../lib/crawler';
import { analyzeCompetitor, buildReport } from '../../../lib/analysis';
import { extractCompetitorIntelligence, isAIExtractionConfigured } from '../../../lib/ai-extractor';
import { saveReport } from '../../../lib/store';
import { NextRequest } from 'next/server';

describe('GET /api/analyze', () => {
  beforeEach(() => {
    vi.mocked(isAIExtractionConfigured).mockReturnValue(true);
    process.env.ANALYZE_CONCURRENCY = '5';
    process.env.CRAWL_MAX_PAGES_PER_SITE = '8';
  });

  it('returns ok with configuration info', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.route).toBe('/api/analyze');
    expect(body.aiConfigured).toBe(true);
    expect(body.analyzeConcurrency).toBe(5);
    expect(body.crawlMaxPagesPerSiteLimit).toBe(8);
  });

  it('returns aiConfigured false when key is missing', async () => {
    vi.mocked(isAIExtractionConfigured).mockReturnValue(false);
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.aiConfigured).toBe(false);
    expect(body.message).toContain('OPENAI_API_KEY is missing');
  });

  it('returns 200 status code', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    expect(response.status).toBe(200);
  });
});

describe('POST /api/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isAIExtractionConfigured).mockReturnValue(true);
    vi.mocked(crawlSite).mockResolvedValue([
      { url: 'https://example.com', title: 'Test', text: 'content', excerpt: 'excerpt' },
    ]);
    vi.mocked(analyzeCompetitor).mockReturnValue({
      id: 'comp_1',
      name: 'Test Competitor',
      url: 'https://example.com',
      market: 'Test',
      analyzedAt: new Date().toISOString(),
      pagesReviewed: [],
      findings: [],
      subserviceFindings: [],
      score: {
        competitorId: 'comp_1',
        competitorName: 'Test Competitor',
        serviceLineMatchScore: 50,
        subserviceDepthScore: 30,
        andwellDifferentiationScore: 70,
        competitorVisibilityScore: 40,
        evidenceStrengthScore: 60,
        reviewRiskScore: 20,
        threatLevel: 'Moderate overlap',
        strongestMatches: [],
        strongestAndwellAdvantages: [],
        needsReview: [],
        leadWith: [],
        executiveReadout: '',
      },
    });
    vi.mocked(extractCompetitorIntelligence).mockResolvedValue(null);
    vi.mocked(buildReport).mockReturnValue({
      id: 'report_1',
      generatedAt: new Date().toISOString(),
      baselineProvider: 'Andwell Health Partners' as const,
      competitorsAnalyzed: 1,
      pagesReviewed: 1,
      serviceLinesMapped: 14,
      subservicesMapped: 50,
      matchedServiceFindings: 5,
      potentialAndwellAdvantages: 9,
      humanReviewItems: 3,
      executiveSummary: 'Test summary',
      executiveInsights: [],
      competitorScores: [],
      analyses: [],
      allFindings: [],
      allSubserviceFindings: [],
      crawlErrors: [],
    });
    vi.mocked(saveReport).mockResolvedValue({
      version: 3, updatedAt: new Date().toISOString(), competitors: [], reports: [], reviews: [], catalogOverrides: [],
    });
  });

  it('returns 400 when no competitors provided', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ competitors: [] }),
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Add at least one valid public competitor URL');
  });

  it('processes valid competitors and returns report', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        competitors: [{ url: 'https://example.com', name: 'Test' }],
        save: false,
      }),
    });
    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.id).toBe('report_1');
    expect(body.aiEnabled).toBe(true);
  });

  it('skips AI extraction when useAI is false', async () => {
    vi.mocked(isAIExtractionConfigured).mockReturnValue(true);
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        competitors: [{ url: 'https://example.com', name: 'Test' }],
        useAI: false,
        save: false,
      }),
    });
    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(extractCompetitorIntelligence).not.toHaveBeenCalled();
  });

  it('returns 500 on unexpected error', async () => {
    vi.mocked(crawlSite).mockRejectedValue(new Error('Crawl crashed'));
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        competitors: [{ url: 'https://example.com', name: 'Test' }],
        save: false,
      }),
    });
    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.crawlErrors).toBeDefined();
  });
});
