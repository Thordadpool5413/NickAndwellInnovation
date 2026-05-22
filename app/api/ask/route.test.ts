import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../lib/store', () => ({
  readStore: vi.fn(),
}));

vi.mock('../../../lib/smart-ranking', () => ({
  questionTerms: vi.fn(),
  rankEvidenceForQuestion: vi.fn(),
  fieldActionFromEvidence: vi.fn(),
}));

import { readStore } from '../../../lib/store';
import { questionTerms, rankEvidenceForQuestion, fieldActionFromEvidence } from '../../../lib/smart-ranking';
import { NextRequest } from 'next/server';

const mockReport: any = {
  id: 'report_1',
  generatedAt: new Date().toISOString(),
  baselineProvider: 'Andwell Health Partners',
  competitorsAnalyzed: 1,
  pagesReviewed: 5,
  serviceLinesMapped: 14,
  subservicesMapped: 50,
  matchedServiceFindings: 3,
  potentialAndwellAdvantages: 5,
  humanReviewItems: 2,
  executiveSummary: 'Test summary',
  executiveInsights: [],
  competitorScores: [],
  analyses: [],
  allFindings: [
    {
      competitorName: 'Comp A',
      serviceLine: 'Home Healthcare',
      competitorStatus: 'Clearly offered',
      confidence: 'High',
      reviewStatus: 'Sales usable with evidence',
      evidenceExcerpt: 'Provides home health services',
      safeSalesWording: 'Safe wording',
      sourceUrl: 'https://example.com',
      sourceTitle: 'Home Page',
    },
  ],
  allSubserviceFindings: [],
  crawlErrors: [],
};

describe('GET /api/ask', () => {
  it('returns ok with route info', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.route).toBe('/api/ask');
  });
});

describe('POST /api/ask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readStore).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [],
      reports: [mockReport],
      reviews: [],
      catalogOverrides: [],
    });
    vi.mocked(questionTerms).mockReturnValue(['hospice', 'palliative']);
    vi.mocked(rankEvidenceForQuestion).mockReturnValue([]);
    vi.mocked(fieldActionFromEvidence).mockReturnValue('Review evidence for Comp A');
  });

  it('returns 400 when question is missing', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/ask', {
      method: 'POST',
      body: JSON.stringify({ question: '' }),
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('question is required.');
  });

  it('returns answer with evidence when question is provided', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/ask', {
      method: 'POST',
      body: JSON.stringify({ question: 'Do they offer hospice?' }),
    });
    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.answer).toBeDefined();
    expect(body.reportId).toBe('report_1');
    expect(body.confidence).toBe('Evidence backed');
  });

  it('returns fallback when no reports exist', async () => {
    vi.mocked(readStore).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [],
      reports: [],
      reviews: [],
      catalogOverrides: [],
    });
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/ask', {
      method: 'POST',
      body: JSON.stringify({ question: 'Do they offer hospice?' }),
    });
    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.answer).toContain('No stored intelligence report was found');
  });

  it('filters by reportId when provided', async () => {
    vi.mocked(readStore).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [],
      reports: [mockReport, { ...mockReport, id: 'report_2' }],
      reviews: [],
      catalogOverrides: [],
    });
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/ask', {
      method: 'POST',
      body: JSON.stringify({ question: 'hospice', reportId: 'report_2' }),
    });
    const response = await POST(req);
    const body = await response.json();
    expect(body.reportId).toBe('report_2');
  });
});
