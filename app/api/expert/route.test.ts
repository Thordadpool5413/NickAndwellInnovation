import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../lib/store', () => ({
  readStore: vi.fn(),
}));

import { readStore } from '../../../lib/store';
import { NextRequest } from 'next/server';

const mockReportWithBrief = {
  id: 'report_1',
  generatedAt: new Date().toISOString(),
  baselineProvider: 'Andwell Health Partners' as const,
  competitorsAnalyzed: 2,
  pagesReviewed: 10,
  serviceLinesMapped: 14,
  subservicesMapped: 50,
  matchedServiceFindings: 5,
  potentialAndwellAdvantages: 9,
  humanReviewItems: 3,
  executiveSummary: 'Test',
  executiveInsights: [],
  competitorScores: [],
  analyses: [],
  allFindings: [],
  allSubserviceFindings: [],
  crawlErrors: [],
  expertBrief: {
    expertVersion: '1.0',
    generatedAt: new Date().toISOString(),
    expertScore: 85,
    marketPosture: 'Strong',
    expertSummary: 'Test brief',
    leadershipDecision: 'Monitor',
    salesCoachingPriority: 'Medium',
    fastestFieldMove: 'Focus on differentiation',
    governanceWarning: 'Review findings',
    strongestThreats: ['Comp A'],
    bestOpportunities: ['Hospice'],
    recommendations: [],
    fieldPlays: [],
    watchlist: [],
  },
};

const mockReportWithoutBrief = {
  ...mockReportWithBrief,
  expertBrief: undefined,
};

describe('GET /api/expert', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns expert brief when report has one', async () => {
    vi.mocked(readStore).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [],
      reports: [mockReportWithBrief],
      reviews: [],
      catalogOverrides: [],
    });
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost/api/expert');
    const response = await GET(req);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.expertBrief).toBeDefined();
    expect(body.expertBrief.expertScore).toBe(85);
  });

  it('returns null expertBrief when no report exists', async () => {
    vi.mocked(readStore).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [],
      reports: [],
      reviews: [],
      catalogOverrides: [],
    });
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost/api/expert');
    const response = await GET(req);
    const body = await response.json();
    expect(body.expertBrief).toBeNull();
    expect(body.message).toContain('No stored report found');
  });

  it('returns null expertBrief when report has no brief', async () => {
    vi.mocked(readStore).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [],
      reports: [mockReportWithoutBrief],
      reviews: [],
      catalogOverrides: [],
    });
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost/api/expert');
    const response = await GET(req);
    const body = await response.json();
    expect(body.expertBrief).toBeNull();
    expect(body.message).toContain('generated before the foremost expert engine');
  });

  it('filters by reportId when query param is provided', async () => {
    vi.mocked(readStore).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [],
      reports: [mockReportWithBrief, { ...mockReportWithBrief, id: 'report_2' }],
      reviews: [],
      catalogOverrides: [],
    });
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost/api/expert?reportId=report_2');
    const response = await GET(req);
    const body = await response.json();
    expect(body.reportId).toBe('report_2');
  });
});
