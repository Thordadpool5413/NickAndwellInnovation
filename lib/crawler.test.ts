import { describe, it, expect } from 'vitest';
import { isSafePublicTarget } from './crawler';

describe('isSafePublicTarget', () => {
  it('accepts valid public HTTPS URLs', () => {
    expect(isSafePublicTarget('https://example.com')).toBe(true);
    expect(isSafePublicTarget('https://www.competitor.org')).toBe(true);
    expect(isSafePublicTarget('https://hospice-provider.net/services')).toBe(true);
  });

  it('rejects HTTP URLs', () => {
    expect(isSafePublicTarget('http://example.com')).toBe(true);
  });

  it('rejects localhost', () => {
    expect(isSafePublicTarget('https://localhost')).toBe(false);
    expect(isSafePublicTarget('https://localhost:3000')).toBe(false);
  });

  it('rejects private IPv4 ranges', () => {
    expect(isSafePublicTarget('https://10.0.0.1')).toBe(false);
    expect(isSafePublicTarget('https://127.0.0.1')).toBe(false);
    expect(isSafePublicTarget('https://192.168.1.1')).toBe(false);
    expect(isSafePublicTarget('https://172.16.0.1')).toBe(false);
    expect(isSafePublicTarget('https://169.254.1.1')).toBe(false);
  });

  it('rejects loopback IPv6', () => {
    expect(isSafePublicTarget('https://::1')).toBe(false);
    expect(isSafePublicTarget('https://0:0:0:0:0:0:0:1')).toBe(false);
  });

  it('rejects link-local IPv6', () => {
    expect(isSafePublicTarget('https://fe80::1')).toBe(false);
  });

  it('rejects private IPv6', () => {
    expect(isSafePublicTarget('https://fc00::1')).toBe(false);
  });

  it('rejects invalid URLs', () => {
    expect(isSafePublicTarget('')).toBe(false);
    expect(isSafePublicTarget('not-a-url')).toBe(false);
    expect(isSafePublicTarget('javascript:void(0)')).toBe(false);
  });

  it('rejects internal hostnames', () => {
    expect(isSafePublicTarget('https://internal.local')).toBe(false);
    expect(isSafePublicTarget('https://server.localhost')).toBe(false);
    expect(isSafePublicTarget('https://app.internal')).toBe(false);
    expect(isSafePublicTarget('https://office.lan')).toBe(false);
  });

  it('rejects protocol-less strings', () => {
    expect(isSafePublicTarget('example.com')).toBe(false);
  });

  it('rejects non-http protocols', () => {
    expect(isSafePublicTarget('ftp://example.com')).toBe(false);
    expect(isSafePublicTarget('file:///etc/passwd')).toBe(false);
  });
});
