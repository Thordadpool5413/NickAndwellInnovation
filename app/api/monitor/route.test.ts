import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../lib/monitor', () => ({
  checkStaleCompetitors: vi.fn(),
  reCrawlCompetitor: vi.fn(),
  runScheduledCheck: vi.fn(),
  getMonitorEntry: vi.fn(),
}));

import { checkStaleCompetitors, reCrawlCompetitor, runScheduledCheck, getMonitorEntry } from '../../../lib/monitor';
import { NextRequest } from 'next/server';

describe('GET /api/monitor', () => {
  beforeEach(() => {
    vi.mocked(checkStaleCompetitors).mockResolvedValue([
      { url: 'https://comp-a.com', stale: false, changed: false },
      { url: 'https://comp-b.com', stale: true, changed: true },
    ]);
  });

  it('returns stale check results', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.competitors).toHaveLength(2);
    expect(body.competitors[1].stale).toBe(true);
  });

  it('includes checkedAt timestamp', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.checkedAt).toBeDefined();
  });
});

describe('POST /api/monitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles recheck action with url', async () => {
    vi.mocked(reCrawlCompetitor).mockResolvedValue({ changed: true, pagesCount: 5 });
    vi.mocked(getMonitorEntry).mockResolvedValue({
      url: 'https://comp-a.com',
      lastCrawledAt: new Date().toISOString(),
      contentHash: 'abc123',
      staleAfterMs: 604800000,
      changedAt: null,
      changeDetected: false,
    });
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/monitor', {
      method: 'POST',
      body: JSON.stringify({ action: 'recheck', url: 'https://comp-a.com' }),
    });
    const response = await POST(req);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.action).toBe('recheck');
    expect(body.changed).toBe(true);
  });

  it('handles run-scheduled action', async () => {
    vi.mocked(runScheduledCheck).mockResolvedValue({ checked: 3, recrawled: 2, changed: 1 });
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/monitor', {
      method: 'POST',
      body: JSON.stringify({ action: 'run-scheduled' }),
    });
    const response = await POST(req);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.action).toBe('scheduled');
    expect(body.checked).toBe(3);
  });

  it('returns 400 for unknown action', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/monitor', {
      method: 'POST',
      body: JSON.stringify({ action: 'unknown' }),
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Specify action');
  });

  it('returns 400 when recheck missing url', async () => {
    const { POST } = await import('./route');
    const req = new NextRequest('http://localhost/api/monitor', {
      method: 'POST',
      body: JSON.stringify({ action: 'recheck' }),
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
