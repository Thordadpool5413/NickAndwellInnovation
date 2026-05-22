import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../lib/store', () => ({
  getReport: vi.fn(),
  readStore: vi.fn(),
}));

import { getReport, readStore } from '../../../lib/store';
import { NextRequest } from 'next/server';

const mockReport: any = {
  id: 'report_1',
  generatedAt: new Date().toISOString(),
  baselineProvider: 'Andwell Health Partners',
  competitorsAnalyzed: 2,
  pagesReviewed: 10,
  serviceLinesMapped: 14,
  subservicesMapped: 50,
  matchedServiceFindings: 5,
  potentialAndwellAdvantages: 9,
  humanReviewItems: 3,
  executiveSummary: 'Test summary',
  executiveInsights: [],
  competitorScores: [],
  analyses: [
    { name: 'Comp A', url: 'https://comp-a.com', market: 'Test' },
    { name: 'Comp B', url: 'https://comp-b.com', market: 'Test' },
  ],
  allFindings: [],
  allSubserviceFindings: [],
  crawlErrors: [],
};

describe('GET /api/reports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns single report when id is provided', async () => {
    vi.mocked(getReport).mockResolvedValue(mockReport);
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost/api/reports?id=report_1');
    const response = await GET(req);
    const body = await response.json();
    expect(body.report).toBeDefined();
    expect(body.report.id).toBe('report_1');
  });

  it('returns 404 when report id not found', async () => {
    vi.mocked(getReport).mockResolvedValue(null);
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost/api/reports?id=nonexistent');
    const response = await GET(req);
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Report not found.');
  });

  it('returns report list when no id provided', async () => {
    vi.mocked(readStore).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [],
      reports: [mockReport],
      reviews: [],
      catalogOverrides: [],
    });
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost/api/reports');
    const response = await GET(req);
    const body = await response.json();
    expect(body.reports).toHaveLength(1);
    expect(body.reports[0].id).toBe('report_1');
    expect(body.reports[0].competitors).toEqual(['Comp A', 'Comp B']);
  });

  it('returns empty reports list when no reports exist', async () => {
    vi.mocked(readStore).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [],
      reports: [],
      reviews: [],
      catalogOverrides: [],
    });
    const { GET } = await import('./route');
    const req = new NextRequest('http://localhost/api/reports');
    const response = await GET(req);
    const body = await response.json();
    expect(body.reports).toEqual([]);
  });
});
