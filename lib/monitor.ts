import { cacheKey, cacheGet, cacheSet } from './cache';
import { crawlSite } from './crawler';
import { readStore } from './store';
import type { CrawledPage } from './types';

export type MonitorEntry = {
  url: string;
  lastCrawledAt: string | null;
  contentHash: string | null;
  staleAfterMs: number;
  changedAt: string | null;
  changeDetected: boolean;
};

const defaultStaleAfterMs = Number(process.env.MONITOR_STALE_AFTER_MS || 7 * 24 * 60 * 60 * 1000); // 7 days

export function contentHash(pages: CrawledPage[]): string {
  const joined = pages.map((p) => `${p.url}:${p.text.slice(0, 2000)}`).sort().join('||');
  let hash = 0;
  for (let i = 0; i < joined.length; i++) {
    const char = joined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export async function getMonitorEntry(url: string): Promise<MonitorEntry> {
  const key = cacheKey('monitor', url);
  const cached = await cacheGet<MonitorEntry>(key, defaultStaleAfterMs * 2);
  return cached || { url, lastCrawledAt: null, contentHash: null, staleAfterMs: defaultStaleAfterMs, changedAt: null, changeDetected: false };
}

export async function setMonitorEntry(url: string, hash: string): Promise<void> {
  const key = cacheKey('monitor', url);
  const existing = await getMonitorEntry(url);
  const changedAt = existing.contentHash && existing.contentHash !== hash ? new Date().toISOString() : existing.changedAt;
  const entry: MonitorEntry = {
    url,
    lastCrawledAt: new Date().toISOString(),
    contentHash: hash,
    staleAfterMs: defaultStaleAfterMs,
    changedAt,
    changeDetected: Boolean(changedAt && changedAt !== existing.changedAt),
  };
  await cacheSet(key, entry, defaultStaleAfterMs * 2);
}

export function isStale(entry: MonitorEntry): boolean {
  if (!entry.lastCrawledAt) return false;
  const age = Date.now() - new Date(entry.lastCrawledAt).getTime();
  return age > entry.staleAfterMs;
}

export function isChanged(entry: MonitorEntry): boolean {
  return entry.changeDetected && entry.changedAt !== null;
}

export async function checkStaleCompetitors(): Promise<{ url: string; stale: boolean; changed: boolean }[]> {
  const store = await readStore();
  const results: { url: string; stale: boolean; changed: boolean }[] = [];
  for (const competitor of store.competitors) {
    const entry = await getMonitorEntry(competitor.url);
    results.push({ url: competitor.url, stale: isStale(entry), changed: isChanged(entry) });
  }
  return results;
}

export async function reCrawlCompetitor(url: string): Promise<{ changed: boolean; pagesCount: number }> {
  const pages = await crawlSite(url, 8);
  const hash = contentHash(pages);
  const existing = await getMonitorEntry(url);
  const changed = existing.contentHash !== null && existing.contentHash !== hash;
  await setMonitorEntry(url, hash);
  return { changed, pagesCount: pages.length };
}

export async function runScheduledCheck(): Promise<{ checked: number; recrawled: number; changed: number }> {
  const store = await readStore();
  let recrawled = 0;
  let changed = 0;
  for (const competitor of store.competitors) {
    const entry = await getMonitorEntry(competitor.url);
    if (isStale(entry) || !entry.lastCrawledAt) {
      const result = await reCrawlCompetitor(competitor.url);
      recrawled++;
      if (result.changed) changed++;
    }
  }
  return { checked: store.competitors.length, recrawled, changed };
}
