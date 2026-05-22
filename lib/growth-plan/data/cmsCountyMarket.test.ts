import { describe, it, expect } from 'vitest';
import { cmsCountyMarketData } from './cmsCountyMarket';

describe('cmsCountyMarketData', () => {
  it('contains 12 Maine counties', () => {
    expect(Object.keys(cmsCountyMarketData)).toHaveLength(12);
  });

  it('has York county with expected ffs', () => {
    expect(cmsCountyMarketData.York.ffs).toBe(32287);
  });

  it('has York county home health data', () => {
    const hh = cmsCountyMarketData.York.hh;
    expect(hh.prov).toBe(11);
    expect(hh.users).toBe(2191);
    expect(hh.rate).toBe(0.0679);
    expect(hh.pay).toBe(10448386);
    expect(hh.ppu).toBe(4769);
  });

  it('has York county hospice data', () => {
    const hos = cmsCountyMarketData.York.hos;
    expect(hos.prov).toBe(9);
    expect(hos.users).toBe(851);
    expect(hos.ppu).toBe(14723);
  });

  it('includes all expected counties', () => {
    const expected = ['York', 'Cumberland', 'Penobscot', 'Kennebec', 'Knox', 'Lincoln', 'Sagadahoc', 'Washington', 'Aroostook', 'Oxford', 'Somerset', 'Franklin'];
    for (const county of expected) {
      expect(cmsCountyMarketData).toHaveProperty(county);
    }
  });

  it('each county has ffs, hh, and hos', () => {
    for (const data of Object.values(cmsCountyMarketData)) {
      expect(typeof data.ffs).toBe('number');
      expect(data.ffs).toBeGreaterThan(0);
      expect(data.hh).toHaveProperty('prov');
      expect(data.hh).toHaveProperty('users');
      expect(data.hh).toHaveProperty('ppu');
      expect(data.hos).toHaveProperty('prov');
      expect(data.hos).toHaveProperty('users');
      expect(data.hos).toHaveProperty('ppu');
    }
  });

  it('hh has optional rate and pay fields', () => {
    for (const data of Object.values(cmsCountyMarketData)) {
      if (data.hh.rate !== undefined) {
        expect(data.hh.rate).toBeGreaterThan(0);
      }
      if (data.hh.pay !== undefined) {
        expect(data.hh.pay).toBeGreaterThan(0);
      }
    }
  });

  it('Cumberland has the highest ffs', () => {
    const maxFfs = Math.max(...Object.values(cmsCountyMarketData).map(d => d.ffs));
    expect(cmsCountyMarketData.Cumberland.ffs).toBe(maxFfs);
  });

  it('Franklin has the lowest ffs', () => {
    const minFfs = Math.min(...Object.values(cmsCountyMarketData).map(d => d.ffs));
    expect(cmsCountyMarketData.Franklin.ffs).toBe(minFfs);
  });

  it('every county has at least 1 home health provider', () => {
    for (const data of Object.values(cmsCountyMarketData)) {
      expect(data.hh.prov).toBeGreaterThanOrEqual(1);
    }
  });

  it('every county has at least 1 hospice provider', () => {
    for (const data of Object.values(cmsCountyMarketData)) {
      expect(data.hos.prov).toBeGreaterThanOrEqual(1);
    }
  });
});
