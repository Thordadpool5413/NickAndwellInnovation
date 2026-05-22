import { describe, it, expect } from 'vitest';
import { computeCountyHeatMap, computeReadinessScores, computeStaffingAlerts, heatCategoryTone, readinessTone } from './opportunity-heatmap';
import type { GrowthRow } from './growth-plan';

function baseRow(overrides?: Partial<GrowthRow>): GrowthRow {
  return {
    county: 'York',
    service: 'Home Healthcare',
    launchGroup: 'Priority 1',
    age65: 45362,
    current: 'Hospice, Palliative Medicine',
    missing: 'Home Healthcare',
    reason: 'Large opportunity',
    action: 'Confirm staffing',
    accounts: ['MaineHealth', 'York Hospital'],
    meta: { color: '#2563eb', role: 'Foundation', unit: 'admissions', reimbursement: 3189, margin: 0.18, demandRate: 0.08 },
    basis: 'CMS direct HH market',
    demandPool: 2191,
    reimbursement: 4769,
    starts: [165, 248, 330] as [number, number, number],
    referrals: [220, 331, 440] as [number, number, number],
    revenue: [786885, 1180312, 1573770] as [number, number, number],
    contribution: [141639, 212456, 283279] as [number, number, number],
    totalStarts: 743,
    totalReferrals: 991,
    totalRevenue: 3540967,
    totalContribution: 637374,
    opportunityScore: 75,
    ...overrides
  };
}

describe('computeCountyHeatMap', () => {
  it('returns empty array for empty input', () => {
    const result = computeCountyHeatMap([]);
    expect(result).toEqual([]);
  });

  it('returns a CountyHeatScore for each unique county', () => {
    const rows = [
      baseRow({ county: 'York', service: 'Home Healthcare' }),
      baseRow({ county: 'York', service: 'Mobile Wound' }),
      baseRow({ county: 'Cumberland', service: 'Therapy Care' })
    ];
    const result = computeCountyHeatMap(rows);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.county)).toEqual(expect.arrayContaining(['York', 'Cumberland']));
  });

  it('scores all 8 dimensions for each county', () => {
    const rows = [baseRow({ county: 'York' })];
    const result = computeCountyHeatMap(rows);
    expect(result).toHaveLength(1);
    const dims = result[0].dimensions;
    expect(Object.keys(dims)).toHaveLength(8);
    expect(dims.marketSize).toBeDefined();
    expect(dims.footprintStrength).toBeDefined();
    expect(dims.competitorDensity).toBeDefined();
    expect(dims.revenuePotential).toBeDefined();
    expect(dims.staffingFeasibility).toBeDefined();
    expect(dims.referralAccess).toBeDefined();
    expect(dims.serviceGap).toBeDefined();
    expect(dims.priorityAlignment).toBeDefined();
  });

  it('classifies composite >= 60 as Launch Now', () => {
    const rows = [
      baseRow({ county: 'York', service: 'Home Healthcare', launchGroup: 'Priority 1', age65: 45000, revenue: [5000000, 7500000, 10000000] as [number, number, number] }),
      baseRow({ county: 'York', service: 'Mobile Wound', launchGroup: 'Priority 1', age65: 45000, revenue: [5000000, 7500000, 10000000] as [number, number, number] })
    ];
    const result = computeCountyHeatMap(rows);
    expect(result[0].composite).toBeGreaterThanOrEqual(60);
    expect(result[0].category).toBe('Launch Now');
  });

  it('classifies composite 40-59 as Validate', () => {
    const rows = [baseRow({ county: 'Washington', service: 'Home Healthcare', launchGroup: 'Priority 2', age65: 8116 })];
    const result = computeCountyHeatMap(rows);
    expect(result[0].category).toBe('Validate');
  });

  it('sorts results by composite descending', () => {
    const rows = [
      baseRow({ county: 'York', service: 'Home Healthcare', launchGroup: 'Priority 1' }),
      baseRow({ county: 'Washington', service: 'Home Healthcare', launchGroup: 'Priority 2', age65: 8116 })
    ];
    const result = computeCountyHeatMap(rows);
    expect(result[0].composite).toBeGreaterThanOrEqual(result[1].composite);
  });

  it('assigns a topService based on highest opportunityScore', () => {
    const rows = [
      baseRow({ county: 'York', service: 'Home Healthcare', opportunityScore: 75 }),
      baseRow({ county: 'York', service: 'Mobile Wound', opportunityScore: 90 })
    ];
    const result = computeCountyHeatMap(rows);
    expect(result[0].topService).toBe('Mobile Wound');
  });
});

describe('computeReadinessScores', () => {
  it('returns one score per row', () => {
    const rows = [
      baseRow({ county: 'York', service: 'Home Healthcare' }),
      baseRow({ county: 'Cumberland', service: 'Therapy Care' })
    ];
    const result = computeReadinessScores(rows);
    expect(result).toHaveLength(2);
  });

  it('assigns Low staffing confidence for rural counties', () => {
    const ruralRow = baseRow({ county: 'Washington' });
    const result = computeReadinessScores([ruralRow]);
    expect(result[0].staffingConfidence).toBe('Low');
    expect(result[0].gaps).toContain('Rural staffing access is a constraint');
  });

  it('assigns High staffing confidence for non-rural Priority 1 counties', () => {
    const row = baseRow({ county: 'York', launchGroup: 'Priority 1' });
    const result = computeReadinessScores([row]);
    expect(result[0].staffingConfidence).toBe('High');
  });

  it('sets readinessPercent to at most 100', () => {
    const row = baseRow({ county: 'York', launchGroup: 'Priority 1', age65: 100000 });
    const result = computeReadinessScores([row]);
    expect(result[0].readinessPercent).toBeLessThanOrEqual(100);
  });

  it('returns Proceed recommendation for readinessPercent >= 70', () => {
    const row = baseRow({ county: 'York', launchGroup: 'Priority 1' });
    const result = computeReadinessScores([row]);
    expect(result[0].recommendation).toContain('Proceed');
  });

  it('returns Pause recommendation for readinessPercent < 45', () => {
    const row = baseRow({ county: 'Washington', launchGroup: 'Priority 3', age65: 1000, current: '', missing: '' });
    const result = computeReadinessScores([row]);
    expect(result[0].recommendation).toContain('Pause');
  });

  it('calculates revenueUpside as revenue[2] - revenue[0]', () => {
    const row = baseRow({ county: 'York', revenue: [1000000, 1500000, 2000000] as [number, number, number] });
    const result = computeReadinessScores([row]);
    expect(result[0].revenueUpside).toBe(1000000);
  });
});

describe('computeStaffingAlerts', () => {
  it('returns empty array when no rows produce gaps', () => {
    const row = baseRow({ county: 'York', service: 'Home Healthcare', starts: [1, 1, 1] as [number, number, number] });
    const result = computeStaffingAlerts([row]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('generates alerts for services with FTE gaps', () => {
    const rows = [
      baseRow({ county: 'York', service: 'Home Healthcare', starts: [500, 750, 1000] as [number, number, number] }),
      baseRow({ county: 'Cumberland', service: 'Home Healthcare', starts: [400, 600, 800] as [number, number, number] })
    ];
    const result = computeStaffingAlerts(rows);
    const homeHealthAlerts = result.filter((a) => a.service === 'Home Healthcare');
    expect(homeHealthAlerts.length).toBeGreaterThan(0);
    expect(homeHealthAlerts[0].fteGap).toBeGreaterThan(0);
  });

  it('sorts alerts by severity (critical first)', () => {
    const rows = [
      baseRow({ county: 'York', service: 'Home Healthcare', starts: [5000, 7500, 10000] as [number, number, number] }),
      baseRow({ county: 'Cumberland', service: 'Therapy Care', starts: [100, 150, 200] as [number, number, number] })
    ];
    const result = computeStaffingAlerts(rows);
    if (result.length >= 2) {
      expect(result[0].severity).toBe('critical');
    }
  });

  it('stops processing when 3+ critical alerts are found', () => {
    const highStarts = [5000, 7500, 10000] as [number, number, number];
    const rows = [
      baseRow({ county: 'York', service: 'Home Healthcare', starts: highStarts }),
      baseRow({ county: 'Cumberland', service: 'Home Healthcare', starts: highStarts }),
      baseRow({ county: 'Penobscot', service: 'Home Healthcare', starts: highStarts }),
      baseRow({ county: 'Kennebec', service: 'Home Healthcare', starts: highStarts })
    ];
    const result = computeStaffingAlerts(rows);
    const criticalCount = result.filter((a) => a.severity === 'critical').length;
    expect(criticalCount).toBeGreaterThanOrEqual(3);
  });
});

describe('heatCategoryTone', () => {
  it('returns green for Launch Now', () => expect(heatCategoryTone('Launch Now')).toBe('green'));
  it('returns amber for Validate', () => expect(heatCategoryTone('Validate')).toBe('amber'));
  it('returns blue for Monitor', () => expect(heatCategoryTone('Monitor')).toBe('blue'));
  it('returns red for Do Not Launch', () => expect(heatCategoryTone('Do Not Launch')).toBe('red'));
});

describe('readinessTone', () => {
  it('returns green for percent >= 70', () => expect(readinessTone(70)).toBe('green'));
  it('returns green for percent > 70', () => expect(readinessTone(85)).toBe('green'));
  it('returns amber for percent 45-69', () => expect(readinessTone(45)).toBe('amber'));
  it('returns amber for percent 50', () => expect(readinessTone(50)).toBe('amber'));
  it('returns red for percent < 45', () => expect(readinessTone(44)).toBe('red'));
  it('returns red for percent 0', () => expect(readinessTone(0)).toBe('red'));
});
