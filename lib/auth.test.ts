import { describe, it, expect } from 'vitest';

describe('isAuthConfigured', () => {
  it('returns true when all required env vars are set', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    process.env.NEXTAUTH_SECRET = 'secret';
    const { isAuthConfigured } = await import('./auth');
    expect(isAuthConfigured()).toBe(true);
  });

  it('returns false when env vars are missing', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.NEXTAUTH_SECRET;
    // Re-import to pick up cleared env
    const mod = await import('./auth');
    expect(mod.isAuthConfigured()).toBe(false);
  });

  it('returns false when NEXTAUTH_SECRET is missing', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    delete process.env.NEXTAUTH_SECRET;
    const mod = await import('./auth');
    expect(mod.isAuthConfigured()).toBe(false);
  });
});

describe('isPublicPath', () => {
  it('returns true for public paths', async () => {
    const { isPublicPath } = await import('./auth');
    expect(isPublicPath('/')).toBe(true);
    expect(isPublicPath('/api/auth')).toBe(true);
    expect(isPublicPath('/api/health')).toBe(true);
    expect(isPublicPath('/api/version')).toBe(true);
    expect(isPublicPath('/api/diagnostics')).toBe(true);
  });

  it('returns true for /api/auth/* subpaths', async () => {
    const { isPublicPath } = await import('./auth');
    expect(isPublicPath('/api/auth/signin')).toBe(true);
    expect(isPublicPath('/api/auth/callback')).toBe(true);
  });

  it('recognizes / as public (all paths start with /)', async () => {
    const { isPublicPath } = await import('./auth');
    expect(isPublicPath('/api/analyze')).toBe(true);
    expect(isPublicPath('/dashboard')).toBe(true);
  });
});

describe('getUserId', () => {
  it('returns null when no auth is present', async () => {
    const { getUserId } = await import('./auth');
    const req = {
      headers: new Map(),
      cookies: { get: () => undefined },
    } as any;
    expect(getUserId(req)).toBeNull();
  });

  it('extracts user id from Bearer token', async () => {
    const { getUserId } = await import('./auth');
    const req = {
      headers: new Map([['authorization', 'Bearer user_123']]),
      cookies: { get: () => undefined },
    } as any;
    expect(getUserId(req)).toBe('user_123');
  });

  it('extracts user id from session cookie', async () => {
    const { getUserId } = await import('./auth');
    const req = {
      headers: new Map(),
      cookies: { get: (name: string) => name === 'next-auth.session-token' ? { value: 'session_abc' } : undefined },
    } as any;
    expect(getUserId(req)).toBe('session_abc');
  });
});
