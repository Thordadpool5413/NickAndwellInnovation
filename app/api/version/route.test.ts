import { describe, it, expect } from 'vitest';

describe('GET /api/version', () => {
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

  it('returns version string', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.version).toContain('andwell-innovation-standalone-bootstrap');
  });

  it('includes checkedAt timestamp', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body.checkedAt).toBeDefined();
  });
});
