import { describe, it, expect } from 'vitest';
import { namedProviderRows, marketShareBuildRows, marketShareFormulaRows } from './providers';

describe('namedProviderRows', () => {
  it('has all 36 provider rows', () => {
    expect(namedProviderRows).toHaveLength(36);
  });

  it('each row has required fields', () => {
    for (const row of namedProviderRows) {
      expect(row).toHaveProperty('service');
      expect(row).toHaveProperty('providerName');
      expect(row).toHaveProperty('locationCounty');
      expect(row).toHaveProperty('beneficiaries');
      expect(row).toHaveProperty('episodes');
      expect(row).toHaveProperty('payment');
      expect(row).toHaveProperty('providerVolumeShare');
      expect(row).toHaveProperty('isAndwellCmsRecord');
    }
  });

  it('contains both Home Healthcare and Hospice services', () => {
    const services = [...new Set(namedProviderRows.map(r => r.service))];
    expect(services).toContain('Home Healthcare');
    expect(services).toContain('Hospice');
  });

  it('has two Andwell CMS records', () => {
    const andwell = namedProviderRows.filter(r => r.isAndwellCmsRecord);
    expect(andwell).toHaveLength(2);
    expect(andwell[0].providerName).toContain('Androscoggin');
    expect(andwell[1].providerName).toContain('Androscoggin');
  });

  it('Andwell Home Healthcare record has correct data', () => {
    const row = namedProviderRows.find(r => r.isAndwellCmsRecord && r.service === 'Home Healthcare');
    expect(row?.beneficiaries).toBe(1566);
    expect(row?.episodes).toBe(3176);
    expect(row?.payment).toBe(5862624);
    expect(row?.providerVolumeShare).toBe(0.1376);
  });

  it('Andwell Hospice record has correct data', () => {
    const row = namedProviderRows.find(r => r.isAndwellCmsRecord && r.service === 'Hospice');
    expect(row?.beneficiaries).toBe(1655);
    expect(row?.episodes).toBe(1667);
    expect(row?.payment).toBe(20023210);
    expect(row?.providerVolumeShare).toBe(0.1726);
  });

  it('Northern Light Home Care & Hospice is the largest HH provider by beneficiaries', () => {
    const hh = namedProviderRows.filter(r => r.service === 'Home Healthcare');
    const max = Math.max(...hh.map(r => r.beneficiaries));
    const top = hh.find(r => r.beneficiaries === max);
    expect(top?.providerName).toBe('Northern Light Home Care & Hospice');
    expect(top?.beneficiaries).toBe(2305);
  });

  it('every provider has a non-empty locationCounty', () => {
    for (const row of namedProviderRows) {
      expect(row.locationCounty).toBeTruthy();
    }
  });

  it('all Home Healthcare rows have correct service name', () => {
    const hh = namedProviderRows.filter(r => r.service === 'Home Healthcare');
    expect(hh).toHaveLength(20);
  });

  it('all Hospice rows have correct service name', () => {
    const hos = namedProviderRows.filter(r => r.service === 'Hospice');
    expect(hos).toHaveLength(16);
  });

  it('providerVolumeShare values are between 0 and 1', () => {
    for (const row of namedProviderRows) {
      expect(row.providerVolumeShare).toBeGreaterThan(0);
      expect(row.providerVolumeShare).toBeLessThan(1);
    }
  });

  it('all payment values are positive', () => {
    for (const row of namedProviderRows) {
      expect(row.payment).toBeGreaterThan(0);
    }
  });

  it('all beneficiaries values are positive', () => {
    for (const row of namedProviderRows) {
      expect(row.beneficiaries).toBeGreaterThan(0);
    }
  });
});

describe('marketShareBuildRows', () => {
  it('has all 6 build layers', () => {
    expect(marketShareBuildRows).toHaveLength(6);
  });

  it('each row has required fields', () => {
    for (const row of marketShareBuildRows) {
      expect(row).toHaveProperty('layer');
      expect(row).toHaveProperty('status');
      expect(row).toHaveProperty('data');
      expect(row).toHaveProperty('limitation');
      expect(row).toHaveProperty('need');
    }
  });

  it('has a layer for County market volume', () => {
    const layer = marketShareBuildRows.find(r => r.layer === 'County market volume');
    expect(layer?.status).toBe('Built in');
    expect(layer?.data).toContain('CMS county');
  });

  it('has a layer for Share calculation', () => {
    const layer = marketShareBuildRows.find(r => r.layer === 'Share calculation');
    expect(layer?.status).toBe('Partially built');
    expect(layer?.data).toContain('Statewide provider');
  });

  it('has layers with Built in and Partially built statuses', () => {
    const statuses = marketShareBuildRows.map(r => r.status);
    expect(statuses).toContain('Built in');
    expect(statuses).toContain('Partially built');
  });

  it('every layer has a non-empty need field', () => {
    for (const row of marketShareBuildRows) {
      expect(row.need.length).toBeGreaterThan(0);
    }
  });
});

describe('marketShareFormulaRows', () => {
  it('has all 6 formula rows', () => {
    expect(marketShareFormulaRows).toHaveLength(6);
  });

  it('each row has required fields', () => {
    for (const row of marketShareFormulaRows) {
      expect(row).toHaveProperty('metric');
      expect(row).toHaveProperty('formula');
      expect(row).toHaveProperty('state');
    }
  });

  it('has formula for Andwell provider file share', () => {
    const row = marketShareFormulaRows.find(r => r.metric === 'Andwell provider file share');
    expect(row?.formula).toContain('Andwell CMS provider beneficiaries');
    expect(row?.state).toBe('Built in');
  });

  it('has formula for Provider density', () => {
    const row = marketShareFormulaRows.find(r => r.metric === 'Provider density');
    expect(row?.formula).toContain('CMS provider count');
    expect(row?.state).toBe('Built in');
  });

  it('has rows with Built in, Needs Andwell data, and Needs county attribution states', () => {
    const states = marketShareFormulaRows.map(r => r.state);
    expect(states).toContain('Built in');
    expect(states).toContain('Needs Andwell data');
    expect(states).toContain('Needs county attribution');
  });

  it('every formula is a non-empty string', () => {
    for (const row of marketShareFormulaRows) {
      expect(row.formula.length).toBeGreaterThan(0);
    }
  });
});
