import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchReports, fetchCompetitors } from './api-data';

const mockJson = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({ ok: true, json: mockJson })
  ));
});

describe('fetchReports', () => {
  it('calls /api/reports with correct headers', async () => {
    mockJson.mockResolvedValue({ reports: [] });
    await fetchReports();
    expect(fetch).toHaveBeenCalledWith('/api/reports', {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
  });

  it('returns reports array from response', async () => {
    const reports = [{ id: '1', generatedAt: '2025-01-01', competitorsAnalyzed: 5, pagesReviewed: 10, potentialAndwellAdvantages: 3, humanReviewItems: 2, competitors: ['A'], executiveSummary: 'Summary' }];
    mockJson.mockResolvedValue({ reports });
    const result = await fetchReports();
    expect(result).toEqual(reports);
  });

  it('returns empty array when res.ok is false', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ ok: false })
    ));
    const result = await fetchReports();
    expect(result).toEqual([]);
  });

  it('returns empty array when reports field is missing', async () => {
    mockJson.mockResolvedValue({});
    const result = await fetchReports();
    expect(result).toEqual([]);
  });

  it('returns empty array when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));
    const result = await fetchReports();
    expect(result).toEqual([]);
  });
});

describe('fetchCompetitors', () => {
  it('calls /api/competitors with correct headers', async () => {
    mockJson.mockResolvedValue({ competitors: [] });
    await fetchCompetitors();
    expect(fetch).toHaveBeenCalledWith('/api/competitors', {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
  });

  it('returns competitors array from response', async () => {
    const competitors = [{ name: 'Comp A', url: 'https://comp-a.com', market: 'ME' }];
    mockJson.mockResolvedValue({ competitors });
    const result = await fetchCompetitors();
    expect(result).toEqual(competitors);
  });

  it('returns empty array when res.ok is false', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ ok: false })
    ));
    const result = await fetchCompetitors();
    expect(result).toEqual([]);
  });

  it('returns empty array when competitors field is missing', async () => {
    mockJson.mockResolvedValue({});
    const result = await fetchCompetitors();
    expect(result).toEqual([]);
  });

  it('returns empty array when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));
    const result = await fetchCompetitors();
    expect(result).toEqual([]);
  });
});
