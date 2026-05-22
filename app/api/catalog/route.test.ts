import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../lib/andwell', () => ({
  andwellCatalog: [
    {
      category: 'At Home Care',
      serviceLine: 'Home Healthcare',
      description: 'Skilled medical care',
      subservices: ['Skilled nursing', 'Therapy'],
      safeLanguage: 'Safe language',
      avoid: 'Avoid saying',
      evidence: 'https://andwell.org/evidence',
    },
  ],
}));

vi.mock('../../../lib/store', () => ({
  readStore: vi.fn(),
  saveCatalogOverride: vi.fn(),
}));

import { readStore, saveCatalogOverride } from '../../../lib/store';
import { NextRequest } from 'next/server';

describe('GET /api/catalog', () => {
  beforeEach(() => {
    vi.mocked(readStore).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [],
      reports: [],
      reviews: [],
      catalogOverrides: [],
    });
  });

  it('returns catalog with overrides', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.catalog).toBeDefined();
    expect(body.catalog[0].serviceLine).toBe('Home Healthcare');
    expect(body.overrides).toEqual([]);
  });

  it('includes override data when present', async () => {
    vi.mocked(readStore).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [],
      reports: [],
      reviews: [],
      catalogOverrides: [
        { serviceLine: 'Home Healthcare', description: 'Custom desc', safeLanguage: 'Custom safe', updatedAt: new Date().toISOString() },
      ],
    });
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.catalog[0].override).toBeDefined();
    expect(body.catalog[0].override.description).toBe('Custom desc');
  });
});

describe('POST /api/catalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(saveCatalogOverride).mockResolvedValue({
      serviceLine: 'Home Healthcare',
      description: 'Updated desc',
      safeLanguage: 'Updated safe',
      approvalStatus: 'Needs review',
      updatedAt: new Date().toISOString(),
    });
  });

  it('returns 400 when serviceLine is missing', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/catalog', {
      method: 'POST',
      body: JSON.stringify({ description: 'test' }),
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('serviceLine is required.');
  });

  it('saves override and returns it', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/catalog', {
      method: 'POST',
      body: JSON.stringify({ serviceLine: 'Home Healthcare', description: 'Updated desc' }),
    });
    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.override.serviceLine).toBe('Home Healthcare');
    expect(body.override.description).toBe('Updated desc');
  });

  it('defaults approvalStatus to Needs review', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/catalog', {
      method: 'POST',
      body: JSON.stringify({ serviceLine: 'Hospice' }),
    });
    const response = await POST(req);
    const body = await response.json();
    expect(body.override.approvalStatus).toBe('Needs review');
  });
});
