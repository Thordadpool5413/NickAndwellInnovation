import { describe, it, expect } from 'vitest';
import { normalizeCompetitorUrl, cleanProviderName, nameFromUrl, parseCompetitorEntries, normalizeCompetitorInput, providerNameFromPages } from './provider-identity';
import type { CrawledPage } from './types';

describe('normalizeCompetitorUrl', () => {
  it('normalizes a full URL with protocol', () => {
    const result = normalizeCompetitorUrl('https://www.gentiva.com');
    expect(result).toBe('https://www.gentiva.com/');
  });

  it('adds https protocol when missing', () => {
    const result = normalizeCompetitorUrl('www.amedisys.com');
    expect(result).toBe('https://www.amedisys.com/');
  });

  it('strips trailing punctuation', () => {
    const result = normalizeCompetitorUrl('https://www.gentiva.com).');
    expect(result).toBe('https://www.gentiva.com/');
  });

  it('returns null for invalid hostname', () => {
    const result = normalizeCompetitorUrl('');
    expect(result).toBeNull();
  });

  it('extracts hostname even with non-HTTP protocol prefix', () => {
    const result = normalizeCompetitorUrl('ftp://files.example.com');
    expect(result).toBe('https://files.example.com/');
  });

  it('cleans hash and credentials from URL', () => {
    const result = normalizeCompetitorUrl('https://user:pass@gentiva.com/page#section');
    expect(result).toBe('https://gentiva.com/page');
  });

  it('returns null for hostname with spaces', () => {
    const result = normalizeCompetitorUrl('https://exam ple.com');
    expect(result).toBeNull();
  });
});

describe('cleanProviderName', () => {
  it('returns empty string for null', () => {
    expect(cleanProviderName(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(cleanProviderName(undefined)).toBe('');
  });

  it('returns empty string for empty input', () => {
    expect(cleanProviderName('')).toBe('');
  });

  it('strips URLs from provider name', () => {
    const result = cleanProviderName('Visit https://www.gentiva.com for info');
    expect(result).not.toContain('gentiva');
  });

  it('returns empty for generic page names', () => {
    expect(cleanProviderName('about')).toBe('');
    expect(cleanProviderName('contact')).toBe('');
    expect(cleanProviderName('services')).toBe('');
  });

  it('title cases a normal name', () => {
    const result = cleanProviderName('gentiva health');
    expect(result).toBe('Gentiva Health');
  });

  it('preserves known acronyms and brands', () => {
    expect(cleanProviderName('amedisys health')).toBe('Amedisys Health');
    expect(cleanProviderName('gentiva home care')).toBe('Gentiva Home Care');
    expect(cleanProviderName('llc company')).toBe('LLC Company');
  });

  it('handles encoded values', () => {
    const result = cleanProviderName('Gentiva%20Health%20LLC');
    expect(result).toBe('Gentiva Health LLC');
  });

  it('strips orphaned protocol words', () => {
    const result = cleanProviderName('https provider name');
    expect(result).toBe('Provider Name');
  });
});

describe('nameFromUrl', () => {
  it('extracts name from standard domain', () => {
    const result = nameFromUrl('https://www.gentiva.com');
    expect(result).toBe('Gentiva');
  });

  it('returns "Competitor" for invalid URL', () => {
    const result = nameFromUrl('');
    expect(result).toBe('Competitor');
  });

  it('handles multi-part domains', () => {
    const result = nameFromUrl('https://www.ama-medical-group.org');
    expect(result).toBe('Ama Medical Group');
  });

  it('title cases the first part of the hostname', () => {
    const result = nameFromUrl('https://www.the-company.com');
    expect(result).toBe('The Company');
  });
});

describe('parseCompetitorEntries', () => {
  it('parses a single line with one URL', () => {
    const result = parseCompetitorEntries('Gentiva https://www.gentiva.com');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Gentiva');
    expect(result[0].url).toBe('https://www.gentiva.com/');
    expect(result[0].market).toBe('Needs review');
  });

  it('parses multiple lines', () => {
    const input = 'Amedisys https://www.amedisys.com\nGentiva https://www.gentiva.com';
    const result = parseCompetitorEntries(input);
    expect(result).toHaveLength(2);
  });

  it('skips lines without URLs', () => {
    const result = parseCompetitorEntries('Just some text without a URL');
    expect(result).toHaveLength(0);
  });

  it('handles multiple URLs on one line', () => {
    const input = 'https://www.amedisys.com https://www.gentiva.com';
    const result = parseCompetitorEntries(input);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('uses nameFromUrl fallback when no name is supplied', () => {
    const result = parseCompetitorEntries('https://www.gentiva.com');
    expect(result[0].name).toBe('Gentiva');
  });
});

describe('normalizeCompetitorInput', () => {
  it('uses supplied name and normalizes URL', () => {
    const result = normalizeCompetitorInput({ name: 'Gentiva', url: 'https://www.gentiva.com' });
    expect(result.name).toBe('Gentiva');
    expect(result.url).toBe('https://www.gentiva.com/');
    expect(result.market).toBe('Needs review');
  });

  it('preserves existing market value', () => {
    const result = normalizeCompetitorInput({ name: 'Gentiva', url: 'https://www.gentiva.com', market: 'National' });
    expect(result.market).toBe('National');
  });

  it('falls back to website name when supplied name is empty', () => {
    const pages: CrawledPage[] = [
      { url: 'https://www.amedisys.com', title: 'Amedisys Home Care | Trusted Provider', text: '', excerpt: '', siteName: 'Amedisys' }
    ];
    const result = normalizeCompetitorInput({ name: '', url: 'https://www.amedisys.com' }, pages);
    expect(result.name).toBe('Amedisys');
  });

  it('falls back to nameFromUrl when no name or pages', () => {
    const result = normalizeCompetitorInput({ name: '', url: 'https://www.gentiva.com' });
    expect(result.name).toBe('Gentiva');
  });

  it('returns fallback "Competitor" when no name or URL', () => {
    const result = normalizeCompetitorInput({ name: '', url: '' });
    expect(result.name).toBe('Competitor');
  });
});

describe('providerNameFromPages', () => {
  it('extracts name from siteName', () => {
    const pages: CrawledPage[] = [
      { url: 'https://www.example.com', title: 'Welcome', text: '', excerpt: '', siteName: 'Gentiva Health' }
    ];
    const result = providerNameFromPages(pages);
    expect(result).toBe('Gentiva Health');
  });

  it('extracts name from organizationName', () => {
    const pages: CrawledPage[] = [
      { url: 'https://www.example.com', title: 'Welcome', text: '', excerpt: '', organizationName: 'Amedisys' }
    ];
    const result = providerNameFromPages(pages);
    expect(result).toBe('Amedisys');
  });

  it('extracts name from title with separator', () => {
    const pages: CrawledPage[] = [
      { url: 'https://www.example.com', title: 'Home | Gentiva', text: '', excerpt: '' }
    ];
    const result = providerNameFromPages(pages);
    expect(result).toBe('Gentiva');
  });

  it('returns empty string when no pages have identifying info', () => {
    const pages: CrawledPage[] = [
      { url: 'https://www.example.com', title: '', text: '', excerpt: '' }
    ];
    const result = providerNameFromPages(pages);
    expect(result).toBe('');
  });

  it('tries multiple candidates and returns the first valid name', () => {
    const pages: CrawledPage[] = [
      { url: 'https://www.example.com', title: 'about | Contact', text: '', excerpt: '', siteName: 'Gentiva' },
      { url: 'https://www.example.com/page2', title: 'Services | Amedisys', text: '', excerpt: '' }
    ];
    const result = providerNameFromPages(pages);
    expect(result).toBeTruthy();
  });
});
