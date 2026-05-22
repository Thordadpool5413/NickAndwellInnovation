import { describe, it, expect } from 'vitest';
import { launchPlanData } from './launchPlan';

describe('launchPlanData', () => {
  it('has 12 launch plan entries', () => {
    expect(launchPlanData).toHaveLength(12);
  });

  it('each entry has all required fields', () => {
    for (const entry of launchPlanData) {
      expect(entry).toHaveProperty('county');
      expect(entry).toHaveProperty('service');
      expect(entry).toHaveProperty('age65');
      expect(entry).toHaveProperty('launchGroup');
      expect(entry).toHaveProperty('current');
      expect(entry).toHaveProperty('missing');
      expect(entry).toHaveProperty('reason');
      expect(entry).toHaveProperty('action');
      expect(entry).toHaveProperty('accounts');
    }
  });

  it('each entry has a non-empty county name', () => {
    for (const entry of launchPlanData) {
      expect(entry.county).toBeTruthy();
      expect(typeof entry.county).toBe('string');
    }
  });

  it('each entry has a valid service', () => {
    const validServices = ['Home Healthcare', 'Mobile Wound', 'Therapy Care'];
    for (const entry of launchPlanData) {
      expect(validServices).toContain(entry.service);
    }
  });

  it('each entry has a positive age65 value', () => {
    for (const entry of launchPlanData) {
      expect(entry.age65).toBeGreaterThan(0);
    }
  });

  it('each entry has a valid launch group', () => {
    const validGroups = ['Priority 1', 'Priority 2', 'Priority 3'];
    for (const entry of launchPlanData) {
      expect(validGroups).toContain(entry.launchGroup);
    }
  });

  it('each entry has a non-empty accounts array', () => {
    for (const entry of launchPlanData) {
      expect(entry.accounts.length).toBeGreaterThan(0);
    }
  });

  it('each entry has actionable reason and action text', () => {
    for (const entry of launchPlanData) {
      expect(entry.reason.length).toBeGreaterThan(10);
      expect(entry.action.length).toBeGreaterThan(10);
    }
  });

  it('York Home Healthcare is first entry with correct data', () => {
    const york = launchPlanData[0];
    expect(york.county).toBe('York');
    expect(york.service).toBe('Home Healthcare');
    expect(york.age65).toBe(45362);
    expect(york.launchGroup).toBe('Priority 1');
  });

  it('Cumberland Therapy Care has the highest age65', () => {
    const cumberland = launchPlanData.find(e => e.county === 'Cumberland');
    expect(cumberland).toBeDefined();
    expect(cumberland!.age65).toBe(59705);
  });

  it('has exactly four Priority 1 entries', () => {
    const p1 = launchPlanData.filter(e => e.launchGroup === 'Priority 1');
    expect(p1).toHaveLength(4);
  });

  it('has exactly four Priority 2 entries', () => {
    const p2 = launchPlanData.filter(e => e.launchGroup === 'Priority 2');
    expect(p2).toHaveLength(4);
  });

  it('has exactly four Priority 3 entries', () => {
    const p3 = launchPlanData.filter(e => e.launchGroup === 'Priority 3');
    expect(p3).toHaveLength(4);
  });

  it('counties are unique across all entries', () => {
    const counties = launchPlanData.map(e => e.county);
    expect(new Set(counties).size).toBe(launchPlanData.length);
  });

  it('has entries for all expected counties', () => {
    const counties = launchPlanData.map(e => e.county);
    const expected = ['York', 'Cumberland', 'Penobscot', 'Kennebec', 'Knox', 'Lincoln', 'Sagadahoc', 'Washington', 'Aroostook', 'Oxford', 'Somerset', 'Franklin'];
    for (const county of expected) {
      expect(counties).toContain(county);
    }
  });

  it('Aroostook is Priority 3 Mobile Wound', () => {
    const entry = launchPlanData.find(e => e.county === 'Aroostook');
    expect(entry?.service).toBe('Mobile Wound');
    expect(entry?.launchGroup).toBe('Priority 3');
  });

  it('Franklin is the last entry', () => {
    const last = launchPlanData[launchPlanData.length - 1];
    expect(last.county).toBe('Franklin');
    expect(last.service).toBe('Therapy Care');
    expect(last.age65).toBe(6952);
  });

  it('Home Healthcare appears the most frequently', () => {
    const hhCount = launchPlanData.filter(e => e.service === 'Home Healthcare').length;
    const mwCount = launchPlanData.filter(e => e.service === 'Mobile Wound').length;
    const tcCount = launchPlanData.filter(e => e.service === 'Therapy Care').length;
    expect(hhCount).toBeGreaterThan(mwCount);
    expect(hhCount).toBeGreaterThan(tcCount);
  });

  it('every entry has current and missing services listed', () => {
    for (const entry of launchPlanData) {
      expect(entry.current.length).toBeGreaterThan(0);
      expect(entry.missing.length).toBeGreaterThan(0);
    }
  });

  it('accounts arrays contain expected account names', () => {
    const yorkAccounts = launchPlanData[0].accounts;
    expect(yorkAccounts).toContain('York Hospital');
    expect(yorkAccounts).toContain('MaineHealth Maine Medical Center Biddeford and Sanford');
  });
});
