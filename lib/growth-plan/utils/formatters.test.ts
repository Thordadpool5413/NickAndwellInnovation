import { describe, it, expect } from 'vitest';
import { currency, number, percent, badgeTone } from './formatters';

describe('currency', () => {
  it('formats positive values', () => {
    expect(currency(1000)).toBe('$1,000');
    expect(currency(50000)).toBe('$50,000');
    expect(currency(1234567)).toBe('$1,234,567');
  });

  it('formats zero as $0', () => {
    expect(currency(0)).toBe('$0');
  });

  it('handles nullish values by defaulting to 0', () => {
    expect(currency(null as unknown as number)).toBe('$0');
    expect(currency(undefined as unknown as number)).toBe('$0');
  });

  it('formats very large numbers', () => {
    expect(currency(100000000)).toBe('$100,000,000');
  });

  it('rounds to integer (no decimals)', () => {
    expect(currency(1000.5)).toBe('$1,001');
    expect(currency(999.49)).toBe('$999');
  });

  it('formats negative values', () => {
    expect(currency(-500)).toBe('-$500');
  });
});

describe('number', () => {
  it('formats positive values', () => {
    expect(number(1000)).toBe('1,000');
    expect(number(50000)).toBe('50,000');
    expect(number(1234567)).toBe('1,234,567');
  });

  it('formats zero as 0', () => {
    expect(number(0)).toBe('0');
  });

  it('handles nullish values by defaulting to 0', () => {
    expect(number(null as unknown as number)).toBe('0');
    expect(number(undefined as unknown as number)).toBe('0');
  });

  it('rounds to integer', () => {
    expect(number(1000.7)).toBe('1,001');
    expect(number(1000.3)).toBe('1,000');
  });

  it('formats very large numbers', () => {
    expect(number(9876543210)).toBe('9,876,543,210');
  });

  it('formats negative values', () => {
    expect(number(-2500)).toBe('-2,500');
  });
});

describe('percent', () => {
  it('formats whole values as percentages', () => {
    expect(percent(1)).toBe('100.0%');
    expect(percent(0.5)).toBe('50.0%');
    expect(percent(0.25)).toBe('25.0%');
  });

  it('formats zero as 0.0%', () => {
    expect(percent(0)).toBe('0.0%');
  });

  it('handles nullish values by defaulting to 0', () => {
    expect(percent(null as unknown as number)).toBe('0.0%');
    expect(percent(undefined as unknown as number)).toBe('0.0%');
  });

  it('formats very small percentages', () => {
    expect(percent(0.001)).toBe('0.1%');
    expect(percent(0.0001)).toBe('0.0%');
  });

  it('formats values greater than 100%', () => {
    expect(percent(1.5)).toBe('150.0%');
    expect(percent(2)).toBe('200.0%');
  });

  it('formats with one decimal place', () => {
    expect(percent(0.333)).toBe('33.3%');
    expect(percent(0.666)).toBe('66.6%');
  });

  it('formats negative percentages', () => {
    expect(percent(-0.5)).toBe('-50.0%');
  });
});

describe('badgeTone', () => {
  it('returns green for strings containing "Built in"', () => {
    expect(badgeTone('Built in')).toBe('green');
    expect(badgeTone('Built in service')).toBe('green');
    expect(badgeTone('Already Built in platform')).toBe('green');
  });

  it('returns blue for strings containing "Partially"', () => {
    expect(badgeTone('Partially')).toBe('blue');
    expect(badgeTone('Partially built')).toBe('blue');
    expect(badgeTone('Partially complete')).toBe('blue');
  });

  it('returns amber for strings not matching Built in or Partially', () => {
    expect(badgeTone('Not started')).toBe('amber');
    expect(badgeTone('Planned')).toBe('amber');
    expect(badgeTone('')).toBe('amber');
    expect(badgeTone('Complete')).toBe('amber');
  });

  it('is case-sensitive', () => {
    expect(badgeTone('built in')).toBe('amber');
    expect(badgeTone('partially')).toBe('amber');
  });

  it('returns amber for empty string', () => {
    expect(badgeTone('')).toBe('amber');
  });
});
