import { describe, it, expect } from 'vitest';

describe('GET /api/diagnostics', () => {
  it('returns ok with route info', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.route).toBe('/api/diagnostics');
    expect(body.message).toBe('Next.js API routes are active.');
  });

  it('returns 200 status code', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it('includes checkedAt timestamp', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.checkedAt).toBeDefined();
    expect(typeof body.checkedAt).toBe('string');
  });

  it('has correct Content-Type header', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    expect(response.headers.get('content-type')).toContain('application/json');
  });
});
