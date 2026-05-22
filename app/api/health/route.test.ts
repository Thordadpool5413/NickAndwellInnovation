import { describe, it, expect } from 'vitest';

describe('GET /api/health', () => {
  it('returns ok true', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  it('returns app name', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.app).toBe('Andwell Innovation Command Center');
  });

  it('returns 200 status', async () => {
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
});
