import { describe, it, expect } from 'vitest';
import {
  growthDefaultScenario,
  growthServices,
  cmsCountyMarket,
  launchPlan,
  staffingRatios,
  buildGrowthRows,
  summarizeGrowth,
  rollupGrowthByService,
  buildStaffingPlan,
  launchTimeline
} from './growth-plan';
import type { GrowthScenario } from './growth-plan';

describe('growthDefaultScenario', () => {
  it('has conversionRate of 0.75', () => {
    expect(growthDefaultScenario.conversionRate).toBe(0.75);
  });

  it('hhCapture increases each year', () => {
    expect(growthDefaultScenario.hhCapture[0]).toBeLessThan(growthDefaultScenario.hhCapture[1]);
    expect(growthDefaultScenario.hhCapture[1]).toBeLessThan(growthDefaultScenario.hhCapture[2]);
  });

  it('woundCapture increases each year', () => {
    expect(growthDefaultScenario.woundCapture[0]).toBeLessThan(growthDefaultScenario.woundCapture[1]);
    expect(growthDefaultScenario.woundCapture[1]).toBeLessThan(growthDefaultScenario.woundCapture[2]);
  });

  it('therapyCapture increases each year', () => {
    expect(growthDefaultScenario.therapyCapture[0]).toBeLessThan(growthDefaultScenario.therapyCapture[1]);
    expect(growthDefaultScenario.therapyCapture[1]).toBeLessThan(growthDefaultScenario.therapyCapture[2]);
  });
});

describe('growthServices', () => {
  it('has 3 service lines', () => {
    expect(Object.keys(growthServices)).toHaveLength(3);
  });

  it('Home Healthcare has correct properties', () => {
    const hh = growthServices['Home Healthcare'];
    expect(hh.color).toBe('#2563eb');
    expect(hh.role).toBe('Foundation service line');
    expect(hh.unit).toBe('admissions');
    expect(hh.reimbursement).toBe(3189);
    expect(hh.margin).toBe(0.18);
    expect(hh.demandRate).toBe(0.08);
  });

  it('Mobile Wound has correct margin', () => {
    expect(growthServices['Mobile Wound'].margin).toBe(0.24);
  });

  it('Therapy Care has correct demand rate', () => {
    expect(growthServices['Therapy Care'].demandRate).toBe(0.05);
  });
});

describe('cmsCountyMarket', () => {
  it('has 12 counties', () => {
    expect(Object.keys(cmsCountyMarket)).toHaveLength(12);
  });

  it('York has expected CMS data', () => {
    const york = cmsCountyMarket.York;
    expect(york.ffs).toBe(32287);
    expect(york.hh.prov).toBe(11);
    expect(york.hos.ppu).toBe(14723);
  });

  it('each county has ffs, hh, and hos', () => {
    for (const county of Object.values(cmsCountyMarket)) {
      expect(county).toHaveProperty('ffs');
      expect(county).toHaveProperty('hh');
      expect(county).toHaveProperty('hos');
      expect(county.hh).toHaveProperty('prov');
      expect(county.hh).toHaveProperty('users');
      expect(county.hh).toHaveProperty('rate');
      expect(county.hh).toHaveProperty('pay');
      expect(county.hh).toHaveProperty('ppu');
      expect(county.hos).toHaveProperty('prov');
      expect(county.hos).toHaveProperty('users');
      expect(county.hos).toHaveProperty('ppu');
    }
  });
});

describe('launchPlan', () => {
  it('has 12 items', () => {
    expect(launchPlan).toHaveLength(12);
  });

  it('each item has required fields', () => {
    for (const item of launchPlan) {
      expect(item).toHaveProperty('county');
      expect(item).toHaveProperty('service');
      expect(item).toHaveProperty('age65');
      expect(item).toHaveProperty('launchGroup');
      expect(item).toHaveProperty('current');
      expect(item).toHaveProperty('missing');
      expect(item).toHaveProperty('reason');
      expect(item).toHaveProperty('action');
      expect(item).toHaveProperty('accounts');
    }
  });

  it('has 4 Priority 1 items', () => {
    const p1 = launchPlan.filter((item) => item.launchGroup === 'Priority 1');
    expect(p1).toHaveLength(4);
  });

  it('has 4 Priority 2 items', () => {
    const p2 = launchPlan.filter((item) => item.launchGroup === 'Priority 2');
    expect(p2).toHaveLength(4);
  });

  it('has 4 Priority 3 items', () => {
    const p3 = launchPlan.filter((item) => item.launchGroup === 'Priority 3');
    expect(p3).toHaveLength(4);
  });

  it('each account list is non-empty', () => {
    for (const item of launchPlan) {
      expect(item.accounts.length).toBeGreaterThan(0);
    }
  });
});

describe('staffingRatios', () => {
  it('has 3 entries', () => {
    expect(Object.keys(staffingRatios)).toHaveLength(3);
  });

  it('Home Healthcare has 25 patients per FTE', () => {
    expect(staffingRatios['Home Healthcare'].patientsPerFTE).toBe(25);
  });

  it('Mobile Wound has 15 patients per FTE', () => {
    expect(staffingRatios['Mobile Wound'].patientsPerFTE).toBe(15);
  });

  it('Therapy Care has 20 patients per FTE', () => {
    expect(staffingRatios['Therapy Care'].patientsPerFTE).toBe(20);
  });
});

describe('buildGrowthRows', () => {
  it('returns 12 rows by default', () => {
    const rows = buildGrowthRows();
    expect(rows).toHaveLength(12);
  });

  it('each row has opportunityScore', () => {
    const rows = buildGrowthRows();
    for (const row of rows) {
      expect(row).toHaveProperty('opportunityScore');
      expect(typeof row.opportunityScore).toBe('number');
    }
  });

  it('each row has computed start values', () => {
    const rows = buildGrowthRows();
    for (const row of rows) {
      expect(row.starts).toHaveLength(3);
      expect(row.totalStarts).toBeGreaterThan(0);
    }
  });

  it('each row has computed revenue values', () => {
    const rows = buildGrowthRows();
    for (const row of rows) {
      expect(row.revenue).toHaveLength(3);
      expect(row.totalRevenue).toBeGreaterThan(0);
    }
  });

  it('each row has computed contribution values', () => {
    const rows = buildGrowthRows();
    for (const row of rows) {
      expect(row.contribution).toHaveLength(3);
      expect(row.totalContribution).toBeGreaterThan(0);
    }
  });

  it('each row has basis string', () => {
    const rows = buildGrowthRows();
    for (const row of rows) {
      expect(typeof row.basis).toBe('string');
      expect(row.basis.length).toBeGreaterThan(0);
    }
  });

  it('uses custom scenario when provided', () => {
    const customScenario: GrowthScenario = {
      conversionRate: 0.5,
      hhCapture: [0.2, 0.3, 0.4],
      woundCapture: [0.3, 0.4, 0.5],
      therapyCapture: [0.25, 0.35, 0.45]
    };
    const rows = buildGrowthRows(customScenario);
    for (const row of rows) {
      expect(row.starts[2]).toBeGreaterThanOrEqual(row.starts[0]);
    }
  });

  it('higher conversion rate reduces referrals', () => {
    const highConv: GrowthScenario = { ...growthDefaultScenario, conversionRate: 1.0 };
    const lowConv: GrowthScenario = { ...growthDefaultScenario, conversionRate: 0.5 };
    const highRows = buildGrowthRows(highConv);
    const lowRows = buildGrowthRows(lowConv);
    for (let i = 0; i < highRows.length; i++) {
      expect(highRows[i].referrals[0]).toBeLessThanOrEqual(lowRows[i].referrals[0]);
    }
  });

  it('York Home Healthcare uses CMS direct HH market basis', () => {
    const rows = buildGrowthRows();
    const yorkHH = rows.find((r) => r.county === 'York' && r.service === 'Home Healthcare');
    expect(yorkHH?.basis).toBe('CMS direct HH market');
  });
});

describe('summarizeGrowth', () => {
  it('returns growth totals for given rows', () => {
    const rows = buildGrowthRows();
    const totals = summarizeGrowth(rows);
    expect(totals).toHaveProperty('starts');
    expect(totals).toHaveProperty('referrals');
    expect(totals).toHaveProperty('revenue');
    expect(totals).toHaveProperty('contribution');
    expect(totals).toHaveProperty('totalRevenue');
    expect(totals).toHaveProperty('totalContribution');
    expect(totals).toHaveProperty('totalReferrals');
  });

  it('starts has 3 yearly values', () => {
    const rows = buildGrowthRows();
    const totals = summarizeGrowth(rows);
    expect(totals.starts).toHaveLength(3);
  });

  it('returns zeroes for empty rows', () => {
    const totals = summarizeGrowth([]);
    expect(totals.totalRevenue).toBe(0);
    expect(totals.totalContribution).toBe(0);
    expect(totals.totalReferrals).toBe(0);
    expect(totals.starts).toEqual([0, 0, 0]);
  });

  it('totalRevenue equals sum of all yearly revenue', () => {
    const rows = buildGrowthRows();
    const totals = summarizeGrowth(rows);
    const sum = totals.revenue.reduce((a, b) => a + b, 0);
    expect(totals.totalRevenue).toBe(sum);
  });
});

describe('rollupGrowthByService', () => {
  it('returns 3 service groups', () => {
    const rows = buildGrowthRows();
    const result = rollupGrowthByService(rows);
    expect(result).toHaveLength(3);
  });

  it('each entry has service name and role', () => {
    const rows = buildGrowthRows();
    const result = rollupGrowthByService(rows);
    for (const item of result) {
      expect(item).toHaveProperty('service');
      expect(item).toHaveProperty('role');
      expect(item).toHaveProperty('color');
      expect(item).toHaveProperty('counties');
    }
  });

  it('returns empty array for empty input', () => {
    const result = rollupGrowthByService([]);
    expect(result).toHaveLength(0);
  });

  it('Home Healthcare has the most county entries', () => {
    const rows = buildGrowthRows();
    const result = rollupGrowthByService(rows);
    const hh = result.find((r) => r.service === 'Home Healthcare');
    expect(hh?.counties).toBeGreaterThan(0);
  });

  it('y1Starts and y3Starts are numbers', () => {
    const rows = buildGrowthRows();
    const result = rollupGrowthByService(rows);
    for (const item of result) {
      expect(typeof item.y1Starts).toBe('number');
      expect(typeof item.y3Starts).toBe('number');
    }
  });
});

describe('buildStaffingPlan', () => {
  it('returns 3 staffing items', () => {
    const rows = buildGrowthRows();
    const plan = buildStaffingPlan(rows);
    expect(plan).toHaveLength(3);
  });

  it('each item has service, role, FTE, cost', () => {
    const rows = buildGrowthRows();
    const plan = buildStaffingPlan(rows);
    for (const item of plan) {
      expect(item).toHaveProperty('service');
      expect(item).toHaveProperty('role');
      expect(item).toHaveProperty('fte');
      expect(item).toHaveProperty('cost');
      expect(item).toHaveProperty('starts');
    }
  });

  it('each FTE is at least 1', () => {
    const rows = buildGrowthRows();
    const plan = buildStaffingPlan(rows);
    for (const item of plan) {
      expect(item.fte[0]).toBeGreaterThanOrEqual(1);
      expect(item.fte[1]).toBeGreaterThanOrEqual(1);
      expect(item.fte[2]).toBeGreaterThanOrEqual(1);
    }
  });

  it('each cost equals FTE times avgSalary', () => {
    const rows = buildGrowthRows();
    const plan = buildStaffingPlan(rows);
    for (const item of plan) {
      expect(item.cost[0]).toBe(item.fte[0] * item.avgSalary);
      expect(item.cost[1]).toBe(item.fte[1] * item.avgSalary);
      expect(item.cost[2]).toBe(item.fte[2] * item.avgSalary);
    }
  });
});

describe('launchTimeline', () => {
  it('has 4 timeline entries', () => {
    expect(launchTimeline).toHaveLength(4);
  });

  it('each entry has window, title, and focus', () => {
    for (const entry of launchTimeline) {
      expect(entry).toHaveProperty('window');
      expect(entry).toHaveProperty('title');
      expect(entry).toHaveProperty('focus');
    }
  });

  it('first window is Days 0-30', () => {
    expect(launchTimeline[0].window).toBe('Days 0-30');
  });

  it('last window is Quarter 2', () => {
    expect(launchTimeline[3].window).toBe('Quarter 2');
  });
});
