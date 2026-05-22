import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../lib/store', () => ({
  readStore: vi.fn(),
  saveReview: vi.fn(),
}));

import { readStore, saveReview } from '../../../lib/store';
import { NextRequest } from 'next/server';

describe('GET /api/reviews', () => {
  beforeEach(() => {
    vi.mocked(readStore).mockResolvedValue({
      version: 3,
      updatedAt: new Date().toISOString(),
      competitors: [],
      reports: [],
      reviews: [
        { id: 'rev_1', findingId: 'finding_1', status: 'Approved for sales use', reviewer: 'Admin', updatedAt: new Date().toISOString() },
      ],
      catalogOverrides: [],
    });
  });

  it('returns reviews from store', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.reviews).toHaveLength(1);
    expect(body.reviews[0].id).toBe('rev_1');
  });

  it('returns empty array when no reviews', async () => {
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
    expect(body.reviews).toEqual([]);
  });
});

describe('POST /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(saveReview).mockResolvedValue({
      id: 'rev_new',
      findingId: 'finding_1',
      status: 'Approved for sales use',
      note: 'Looks good',
      reviewer: 'Admin',
      updatedAt: new Date().toISOString(),
    });
  });

  it('returns 400 when findingId is missing', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ status: 'Approved for sales use' }),
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('findingId and status are required.');
  });

  it('returns 400 when status is missing', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ findingId: 'finding_1' }),
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('saves review when findingId and status are provided', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ findingId: 'finding_1', status: 'Approved for sales use', note: 'Looks good', reviewer: 'Admin' }),
    });
    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.review.findingId).toBe('finding_1');
    expect(body.review.status).toBe('Approved for sales use');
  });

  it('defaults reviewer to User', async () => {
    vi.mocked(saveReview).mockResolvedValue({
      id: 'rev_new',
      findingId: 'finding_1',
      status: 'Needs edits',
      reviewer: 'User',
      updatedAt: new Date().toISOString(),
    });
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ findingId: 'finding_1', status: 'Needs edits' }),
    });
    const response = await POST(req);
    const body = await response.json();
    expect(body.review.reviewer).toBe('User');
  });
});
