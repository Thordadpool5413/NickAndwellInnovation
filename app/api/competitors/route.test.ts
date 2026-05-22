import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../lib/store', () => ({
  readStore: vi.fn(),
  saveCompetitors: vi.fn(),
}));

vi.mock('../../../lib/provider-identity', () => ({
  normalizeCompetitorInput: vi.fn((input) => input),
}));

import { readStore, saveCompetitors } from '../../../lib/store';
import { NextRequest } from 'next/server';

describe('GET /api/competitors', () => {
  beforeEach(() => {
    vi.mocked(readStore).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [
        { name: 'Comp A', url: 'https://comp-a.com', market: 'Test' },
        { name: 'Comp B', url: 'https://comp-b.com', market: 'Test' },
      ],
      reports: [],
      reviews: [],
      catalogOverrides: [],
    });
  });

  it('returns competitors from store', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.competitors).toHaveLength(2);
    expect(body.competitors[0].name).toBe('Comp A');
  });

  it('returns empty array when no competitors', async () => {
    vi.mocked(readStore).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [],
      reports: [],
      reviews: [],
      catalogOverrides: [],
    });
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.competitors).toEqual([]);
  });
});

describe('POST /api/competitors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(saveCompetitors).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [
        { name: 'Comp A', url: 'https://comp-a.com', market: 'Needs review' },
      ],
      reports: [],
      reviews: [],
      catalogOverrides: [],
    });
  });

  it('saves competitors and returns them', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/competitors', {
      method: 'POST',
      body: JSON.stringify({
        competitors: [{ url: 'https://comp-a.com', name: 'Comp A' }],
      }),
    });
    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.competitors).toHaveLength(1);
  });

  it('filters out empty urls', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/competitors', {
      method: 'POST',
      body: JSON.stringify({
        competitors: [{ url: '', name: 'Empty' }, { url: 'https://valid.com', name: 'Valid' }],
      }),
    });
    await POST(req);
    expect(saveCompetitors).toHaveBeenCalled();
  });

  it('returns empty array when no valid competitors', async () => {
    vi.mocked(saveCompetitors).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [],
      reports: [],
      reviews: [],
      catalogOverrides: [],
    });
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/competitors', {
      method: 'POST',
      body: JSON.stringify({ competitors: [{ url: '' }] }),
    });
    const response = await POST(req);
    const body = await response.json();
    expect(body.competitors).toEqual([]);
  });
});
