import { describe, it, expect } from 'vitest';
import { hasPdfExtension, extractTextFromPdf } from './pdf-extractor';

describe('hasPdfExtension', () => {
  it('returns true for .pdf URLs', () => {
    expect(hasPdfExtension('https://example.com/doc.pdf')).toBe(true);
    expect(hasPdfExtension('https://example.com/REPORT.PDF')).toBe(true);
  });

  it('returns false for non-PDF URLs', () => {
    expect(hasPdfExtension('https://example.com/doc.html')).toBe(false);
    expect(hasPdfExtension('https://example.com')).toBe(false);
  });

  it('returns false for URLs with .pdf in path but not extension', () => {
    expect(hasPdfExtension('https://example.com/pdf-viewer')).toBe(false);
  });
});

describe('extractTextFromPdf', () => {
  it('returns empty string for invalid buffer', async () => {
    const result = await extractTextFromPdf(Buffer.from('not a pdf'), 'https://example.com/test.pdf');
    expect(result).toBe('');
  });
});
