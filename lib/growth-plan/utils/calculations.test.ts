import { describe, it, expect } from 'vitest';
import { getCountyMath, buildRows } from './calculations';
import { launchPlanData } from '../data/launchPlan';
import { DEFAULT_SCENARIO, type Scenario } from '../data/constants';
import type { LaunchPlanEntry } from '../data/launchPlan';

describe('getCountyMath', () => {
  it('returns a CountyMathRow with correct structure', () => {
    const row = launchPlanData[0];
    const result = getCountyMath(row);
    expect(result.county).toBeTruthy();
    expect(result.service).toBeTruthy();
    expect(result.starts).toHaveLength(3);
    expect(result.referrals).toHaveLength(3);
    expect(result.revenue).toHaveLength(3);
    expect(result.totalStarts).toBeGreaterThan(0);
    expect(result.totalReferrals).toBeGreaterThan(0);
    expect(result.totalRevenue).toBeGreaterThan(0);
    expect(result.totalContribution).toBeGreaterThan(0);
    expect(result.basis).toBeTruthy();
  });

  it('uses CMS market data for Home Healthcare when available', () => {
    const row = launchPlanData.find((r: LaunchPlanEntry) => r.county === 'York' && r.service === 'Home Healthcare');
    if (row) {
      const result = getCountyMath(row);
      expect(result.basis).toBe('CMS direct HH market');
      expect(result.reimbursement).toBeGreaterThan(0);
    }
  });

  it('uses planning proxy when no CMS market data', () => {
    // Use a row with a service that doesn't match CMS data conditions
    const row = launchPlanData.find((r: LaunchPlanEntry) => r.service === 'Mobile Wound' && r.county === 'York');
    if (row) {
      const result = getCountyMath(row);
      expect(result.basis).toBe('CMS HH wound proxy');
    }
  });

  it('applies marginOverride from scenario', () => {
    const row = launchPlanData[0];
    const scenario: Scenario = { ...DEFAULT_SCENARIO, marginOverrides: { 'Home Healthcare': 0.3 } };
    const result = getCountyMath(row, scenario);
    // The override margin should be used (0.3 instead of default meta.margin)
    expect(result.meta.margin).toBe(0.3);
  });

  it('starts are computed from capture rates', () => {
    const row = launchPlanData.find((r: LaunchPlanEntry) => r.service === 'Home Healthcare' && r.county === 'York');
    if (row) {
      const high: Scenario = { ...DEFAULT_SCENARIO, hhCapture: [0.5, 0.6, 0.7] };
      const low: Scenario = { ...DEFAULT_SCENARIO, hhCapture: [0.01, 0.02, 0.03] };
      const highResult = getCountyMath(row, high);
      const lowResult = getCountyMath(row, low);
      expect(highResult.starts[0]).toBeGreaterThan(lowResult.starts[0]);
    }
  });

  it('conversion rate affects referral counts', () => {
    const row = launchPlanData.find((r: LaunchPlanEntry) => r.service === 'Home Healthcare' && r.county === 'York');
    if (row) {
      const highConversion: Scenario = { ...DEFAULT_SCENARIO, conversionRate: 0.95 };
      const lowConversion: Scenario = { ...DEFAULT_SCENARIO, conversionRate: 0.5 };
      const highResult = getCountyMath(row, highConversion);
      const lowResult = getCountyMath(row, lowConversion);
      expect(lowResult.referrals[0]).toBeGreaterThan(highResult.referrals[0]);
    }
  });
});

describe('buildRows', () => {
  it('returns CountyMathRow array for default scenario', () => {
    const rows = buildRows();
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toHaveProperty('county');
    expect(rows[0]).toHaveProperty('service');
    expect(rows[0]).toHaveProperty('totalRevenue');
  });

  it('returns different results for different scenarios', () => {
    const defaultRows = buildRows();
    const aggressive: Scenario = { ...DEFAULT_SCENARIO, conversionRate: 0.95, hhCapture: [0.3, 0.4, 0.5], woundCapture: [0.4, 0.5, 0.6], therapyCapture: [0.3, 0.4, 0.5] };
    const aggressiveRows = buildRows(aggressive);
    // Aggressive should have more starts
    const defaultTotal = defaultRows.reduce((s, r) => s + r.totalStarts, 0);
    const aggressiveTotal = aggressiveRows.reduce((s, r) => s + r.totalStarts, 0);
    expect(aggressiveTotal).toBeGreaterThan(defaultTotal);
  });

  it('all rows have valid launch groups', () => {
    const rows = buildRows();
    const validGroups = ['Priority 1', 'Priority 2', 'Priority 3'];
    for (const row of rows) {
      expect(validGroups).toContain(row.launchGroup);
    }
  });
});
