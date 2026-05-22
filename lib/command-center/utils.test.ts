import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseJsonSafely, api, toneForStatus, money, whole, percent } from './utils';

describe('parseJsonSafely', () => {
  it('parses valid JSON successfully', () => {
    const result = parseJsonSafely<{ name: string }>('{"name":"test"}', 'https://example.com');
    expect(result).toEqual({ name: 'test' });
  });

  it('throws on HTML response with DOCTYPE', () => {
    expect(() => parseJsonSafely('<!DOCTYPE html><html></html>', 'https://api.test.com')).toThrow(
      'Hostinger returned HTML for https://api.test.com'
    );
  });

  it('throws on HTML starting with html tag', () => {
    expect(() => parseJsonSafely('<html><body></body></html>', 'https://api.test.com')).toThrow(
      'Hostinger returned HTML for https://api.test.com'
    );
  });

  it('throws on any content starting with <', () => {
    expect(() => parseJsonSafely('<anything>', 'https://api.test.com')).toThrow(
      'Hostinger returned HTML for https://api.test.com'
    );
  });

  it('throws on invalid JSON', () => {
    expect(() => parseJsonSafely('not json at all', 'https://api.test.com')).toThrow(
      'The response from https://api.test.com was not valid JSON'
    );
  });

  it('includes first characters in invalid JSON error', () => {
    const long = 'x'.repeat(200);
    expect(() => parseJsonSafely(long, 'https://api.test.com')).toThrow(/x+x/);
  });

  it('trims whitespace before checking for HTML', () => {
    const result = parseJsonSafely<number[]>('  [1,2,3]  ', 'https://api.test.com');
    expect(result).toEqual([1, 2, 3]);
  });

  it('handles whitespace before HTML tag', () => {
    expect(() => parseJsonSafely('  <html>', 'https://api.test.com')).toThrow(
      'Hostinger returned HTML for https://api.test.com'
    );
  });
});

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('fetches and returns parsed JSON on success', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{"data":"ok"}'),
    } as Response);
    const result = await api<{ data: string }>('/api/test');
    expect(result).toEqual({ data: 'ok' });
  });

  it('includes accept header and no-store cache', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{}'),
    } as Response);
    await api('/api/test');
    expect(fetch).toHaveBeenCalledWith('/api/test', {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
  });

  it('merges custom headers with accept header', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{}'),
    } as Response);
    await api('/api/test', { headers: { 'x-custom': 'val' } });
    expect(fetch).toHaveBeenCalledWith('/api/test', {
      headers: { accept: 'application/json', 'x-custom': 'val' },
      cache: 'no-store',
    });
  });

  it('throws on non-ok response with error message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('{"error":"Server error"}'),
    } as Response);
    await expect(api('/api/test')).rejects.toThrow('Server error');
  });

  it('throws with status when no error field in response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve('{}'),
    } as Response);
    await expect(api('/api/test')).rejects.toThrow('Request failed with status 404.');
  });

  it('throws when response is HTML', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('<!DOCTYPE html>'),
    } as Response);
    await expect(api('/api/test')).rejects.toThrow('Hostinger returned HTML');
  });
});

describe('toneForStatus', () => {
  it('returns neutral for undefined or empty', () => {
    expect(toneForStatus(undefined)).toBe('neutral');
    expect(toneForStatus('')).toBe('neutral');
  });

  it('returns red for critical, strategic, high, needs human, problem', () => {
    expect(toneForStatus('Critical threat')).toBe('red');
    expect(toneForStatus('Strategic importance')).toBe('red');
    expect(toneForStatus('High priority')).toBe('red');
    expect(toneForStatus('Needs human review')).toBe('red');
    expect(toneForStatus('Problem detected')).toBe('red');
  });

  it('returns amber for medium, moderate, mentioned, manager, unclear', () => {
    expect(toneForStatus('Medium overlap')).toBe('amber');
    expect(toneForStatus('Moderate confidence')).toBe('amber');
    expect(toneForStatus('Mentioned only')).toBe('amber');
    expect(toneForStatus('Manager review')).toBe('amber');
    expect(toneForStatus('Unclear status')).toBe('amber');
  });

  it('returns green for clearly, approved, evidence, OK', () => {
    expect(toneForStatus('Clearly offered')).toBe('green');
    expect(toneForStatus('Approved for sales use')).toBe('green');
    expect(toneForStatus('Evidence found')).toBe('green');
    expect(toneForStatus('OK')).toBe('green');
  });

  it('returns blue for low and not found', () => {
    expect(toneForStatus('Low overlap')).toBe('blue');
    expect(toneForStatus('Not found publicly')).toBe('blue');
  });

  it('returns neutral for unknown status strings', () => {
    expect(toneForStatus('Some random string')).toBe('neutral');
  });
});

describe('money', () => {
  it('formats as USD with no decimals', () => {
    expect(money(1500000)).toBe('$1,500,000');
  });

  it('formats zero', () => {
    expect(money(0)).toBe('$0');
  });

  it('formats small values', () => {
    expect(money(499)).toBe('$499');
  });
});

describe('whole', () => {
  it('formats numbers with commas', () => {
    expect(whole(1234567)).toBe('1,234,567');
  });

  it('formats zero', () => {
    expect(whole(0)).toBe('0');
  });

  it('formats small numbers without commas', () => {
    expect(whole(42)).toBe('42');
  });
});

describe('percent', () => {
  it('formats 0-1 as percentage', () => {
    expect(percent(0.75)).toBe('75%');
  });

  it('formats 1 as 100%', () => {
    expect(percent(1)).toBe('100%');
  });

  it('formats 0 as 0%', () => {
    expect(percent(0)).toBe('0%');
  });

  it('rounds to nearest whole percent', () => {
    expect(percent(0.3333)).toBe('33%');
  });
});
