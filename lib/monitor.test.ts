import { describe, it, expect } from 'vitest';
import { contentHash, isStale, isChanged } from './monitor';
import type { CrawledPage } from './types';

function makePage(text: string, url = 'https://example.com'): CrawledPage {
  return { url, title: 'Test', text, excerpt: text.slice(0, 900), pageType: 'General page' as const };
}

describe('contentHash', () => {
  it('produces the same hash for identical pages', () => {
    const pages = [makePage('home health nursing'), makePage('hospice care')];
    const hash1 = contentHash(pages);
    const hash2 = contentHash(pages);
    expect(hash1).toBe(hash2);
  });

  it('produces different hash for different pages', () => {
    const pages1 = [makePage('home health nursing')];
    const pages2 = [makePage('automotive repair')];
    expect(contentHash(pages1)).not.toBe(contentHash(pages2));
  });

  it('produces different hash when page content changes', () => {
    const a = makePage('home health nursing');
    const b = makePage('automotive repair');
    expect(contentHash([a])).not.toBe(contentHash([b]));
  });

  it('returns a string hash', () => {
    const hash = contentHash([makePage('test')]);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });
});

describe('isStale', () => {
  it('returns false when entry has no lastCrawledAt', () => {
    const entry = { url: 'https://example.com', lastCrawledAt: null, contentHash: null, staleAfterMs: 1000, changedAt: null, changeDetected: false };
    expect(isStale(entry)).toBe(false);
  });

  it('returns false when entry is recent', () => {
    const entry = { url: 'https://example.com', lastCrawledAt: new Date().toISOString(), contentHash: 'abc', staleAfterMs: 86400000, changedAt: null, changeDetected: false };
    expect(isStale(entry)).toBe(false);
  });

  it('returns true when entry exceeds staleAfterMs', () => {
    const old = new Date(Date.now() - 5000).toISOString();
    const entry = { url: 'https://example.com', lastCrawledAt: old, contentHash: 'abc', staleAfterMs: 1000, changedAt: null, changeDetected: false };
    expect(isStale(entry)).toBe(true);
  });
});

describe('isChanged', () => {
  it('returns true when changeDetected is true and changedAt is set', () => {
    const entry = { url: 'https://example.com', lastCrawledAt: new Date().toISOString(), contentHash: 'abc', staleAfterMs: 1000, changedAt: new Date().toISOString(), changeDetected: true };
    expect(isChanged(entry)).toBe(true);
  });

  it('returns false when changeDetected is false', () => {
    const entry = { url: 'https://example.com', lastCrawledAt: new Date().toISOString(), contentHash: 'abc', staleAfterMs: 1000, changedAt: null, changeDetected: false };
    expect(isChanged(entry)).toBe(false);
  });
});
