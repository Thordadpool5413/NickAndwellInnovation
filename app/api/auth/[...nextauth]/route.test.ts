import { describe, it, expect, vi, beforeAll } from 'vitest';

const capturedConfig = vi.hoisted(() => ({ current: null as any }));
const mockHandler = vi.hoisted(() => vi.fn());

vi.mock('next-auth', () => ({
  __esModule: true,
  default: vi.fn((config: any) => {
    capturedConfig.current = config;
    return mockHandler;
  }),
}));

describe('GET /api/auth/[...nextauth]', () => {
  beforeAll(() => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
  });

  it('creates NextAuth handler with supabase provider on import', async () => {
    const mod = await import('./route');
    expect(capturedConfig.current).not.toBeNull();
    expect(capturedConfig.current.providers).toHaveLength(1);
    expect(capturedConfig.current.providers[0].id).toBe('supabase');
    expect(mod.GET).toBe(mockHandler);
    expect(mod.POST).toBe(mockHandler);
  });

  it('configures JWT session strategy', () => {
    expect(capturedConfig.current.session.strategy).toBe('jwt');
  });

  it('sets sign in page to /login', () => {
    expect(capturedConfig.current.pages.signIn).toBe('/login');
  });
});
