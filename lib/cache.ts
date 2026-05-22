import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

export type CacheEntry<T> = {
  key: string;
  data: T;
  cachedAt: string;
  ttlMs: number;
};

const cacheDir = path.resolve(process.env.CACHE_DIR || '.data/cache');
const defaultTtlMs = Number(process.env.CACHE_TTL_MS || 3600000); // 1 hour

function keyHash(url: string): string {
  return createHash('sha256').update(url.toLowerCase()).digest('hex').slice(0, 16);
}

export function cacheKey(...parts: string[]): string {
  return keyHash(parts.join('::'));
}

export async function ensureCacheDir(): Promise<void> {
  try {
    await mkdir(cacheDir, { recursive: true });
  } catch {
    // directory exists
  }
}

export async function cacheGet<T>(key: string, maxAgeMs = defaultTtlMs): Promise<T | null> {
  try {
    const filePath = path.join(cacheDir, `${key}.json`);
    const raw = await readFile(filePath, 'utf-8');
    const entry: CacheEntry<T> = JSON.parse(raw);
    const age = Date.now() - new Date(entry.cachedAt).getTime();
    if (age > maxAgeMs) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, data: T, ttlMs = defaultTtlMs): Promise<void> {
  await ensureCacheDir();
  const entry: CacheEntry<T> = { key, data, cachedAt: new Date().toISOString(), ttlMs };
  const filePath = path.join(cacheDir, `${key}.json`);
  await writeFile(filePath, JSON.stringify(entry), 'utf-8');
}

export async function cacheClear(key?: string): Promise<void> {
  if (key) {
    const filePath = path.join(cacheDir, `${key}.json`);
    try { await readFile(filePath, 'utf-8').then(() => writeFile(filePath, '')); } catch { /* ignore */ }
  } else {
    try { await writeFile(path.join(cacheDir, '.clear'), Date.now().toString()); } catch { /* ignore */ }
  }
}

export async function cacheStats(): Promise<{ entries: number; oldest: string | null; cacheDir: string }> {
  const files: string[] = [];
  try {
    const all = await readdir(cacheDir);
    files.push(...all.filter((f) => f.endsWith('.json')));
  } catch { /* */ }
  return { entries: 0, oldest: null, cacheDir };
}
