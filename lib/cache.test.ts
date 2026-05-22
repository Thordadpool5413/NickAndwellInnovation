import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const testCacheDir = path.join(os.tmpdir(), `cache-test-${Date.now()}`);

describe('cache module', () => {
  beforeEach(() => {
    process.env.CACHE_DIR = testCacheDir;
    // Clear module cache to pick up the new CACHE_DIR
    for (const key of Object.keys(require.cache || {})) {
      if (key.includes('cache')) delete require.cache[key];
    }
  });

  afterEach(() => {
    fs.rmSync(testCacheDir, { recursive: true, force: true });
  });

  it('cacheKey produces consistent hash for same parts', async () => {
    const { cacheKey } = await import('./cache');
    const a = cacheKey('url', 'https://example.com');
    const b = cacheKey('url', 'https://example.com');
    expect(a).toBe(b);
  });

  it('cacheKey produces different hash for different parts', async () => {
    const { cacheKey } = await import('./cache');
    const a = cacheKey('url', 'https://example.com');
    const b = cacheKey('url', 'https://other.com');
    expect(a).not.toBe(b);
  });

  it('cacheSet writes data and cacheGet retrieves it', async () => {
    const { cacheSet, cacheGet } = await import('./cache');
    const key = 'test-key-1';
    const data = { name: 'test', value: 42 };
    await cacheSet(key, data);
    const result = await cacheGet<typeof data>(key);
    expect(result).toEqual(data);
  });

  it('cacheGet returns null for missing key', async () => {
    const { cacheGet } = await import('./cache');
    const result = await cacheGet('non-existent-key');
    expect(result).toBeNull();
  });

  it('cacheGet returns null for expired entry', async () => {
    const { cacheSet, cacheGet } = await import('./cache');
    await cacheSet('expiring', { x: 1 });
    // Wait slightly so age > 0, then call cacheGet with very short maxAgeMs
    const result = await cacheGet('expiring', -1);
    expect(result).toBeNull();
  });

  it('cacheClear removes specific key', async () => {
    const { cacheSet, cacheGet, cacheClear } = await import('./cache');
    await cacheSet('clear-me', { x: 1 });
    await cacheClear('clear-me');
    const result = await cacheGet('clear-me');
    expect(result).toBeNull();
  });

  it('ensureCacheDir creates the directory', async () => {
    const { ensureCacheDir } = await import('./cache');
    fs.rmSync(testCacheDir, { recursive: true, force: true });
    expect(fs.existsSync(testCacheDir)).toBe(false);
    await ensureCacheDir();
    expect(fs.existsSync(testCacheDir)).toBe(true);
  });

  it('cacheStats returns the cacheDir', async () => {
    const { cacheStats } = await import('./cache');
    const stats = await cacheStats();
    expect(stats.cacheDir).toBe(testCacheDir);
    expect(typeof stats.entries).toBe('number');
  });

  it('cacheSet with custom TTL stores correct ttl', async () => {
    const { cacheSet, cacheGet } = await import('./cache');
    await cacheSet('custom-ttl', { x: 1 }, 5000);
    const result = await cacheGet<{ x: number }>('custom-ttl', 5000);
    expect(result).toEqual({ x: 1 });
  });
});
