import { describe, it, expect, vi } from 'vitest';

const mockCreateClient = vi.hoisted(() => vi.fn().mockReturnValue({ supabase: 'fake' }));

vi.mock('@supabase/supabase-js', () => ({ createClient: mockCreateClient, SupabaseClient: class {} }));

async function load(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, val] of Object.entries(env)) vi.stubEnv(key, val);
  delete (globalThis as Record<string, unknown>)._cihSupabaseClient;
  return import('./supabase');
}

describe('isSupabaseConfigured', () => {
  it('returns false when URL is not set', async () => {
    const { isSupabaseConfigured } = await load({ SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' });
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('returns false when key is not set', async () => {
    const { isSupabaseConfigured } = await load({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: '' });
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('returns true when both are set', async () => {
    const mod = await load({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-key' });
    expect(mod.isSupabaseConfigured()).toBe(true);
    const client = mod.getSupabaseClient();
    expect(client).toEqual({ supabase: 'fake' });
  });

  it('falls back to SUPABASE_SECRET_KEY', async () => {
    const { isSupabaseConfigured } = await load({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: '', SUPABASE_SECRET_KEY: 'secret-key' });
    expect(isSupabaseConfigured()).toBe(true);
  });

  it('getSupabaseClient throws when not configured', async () => {
    const { getSupabaseClient } = await load({ SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' });
    expect(() => getSupabaseClient()).toThrow('Supabase is not configured');
  });

  it('caches the client on globalThis', async () => {
    const mod = await load({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-key' });
    const first = mod.getSupabaseClient();
    const second = mod.getSupabaseClient();
    expect(first).toBe(second);
  });
});
