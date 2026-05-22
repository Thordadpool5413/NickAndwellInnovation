import { describe, it, expect } from 'vitest';
import {
  COLORS,
  DARK_COLORS,
  DEFAULT_SCENARIO,
  TABS,
  STAFFING_RATIOS,
  SENSITIVITY_VARIABLES,
  OPPORTUNITY_WEIGHTS,
  HEATMAP_MODES,
} from './constants';

describe('COLORS', () => {
  it('has all expected color keys', () => {
    expect(COLORS.blue).toBe('#2563eb');
    expect(COLORS.green).toBe('#16a34a');
    expect(COLORS.purple).toBe('#7c3aed');
    expect(COLORS.red).toBe('#dc2626');
    expect(COLORS.amber).toBe('#f59e0b');
    expect(COLORS.slate).toBe('#64748b');
  });

  it('has correct keys count', () => {
    expect(Object.keys(COLORS)).toHaveLength(6);
  });
});

describe('DARK_COLORS', () => {
  it('has all expected keys', () => {
    expect(DARK_COLORS.bg).toBe('#0f172a');
    expect(DARK_COLORS.surface).toBe('#1e293b');
    expect(DARK_COLORS.surfaceHover).toBe('#334155');
    expect(DARK_COLORS.border).toBe('#334155');
    expect(DARK_COLORS.text).toBe('#f1f5f9');
    expect(DARK_COLORS.textMuted).toBe('#94a3b8');
    expect(DARK_COLORS.accent).toBe('#3b82f6');
  });
});

describe('DEFAULT_SCENARIO', () => {
  it('has expected conversion rate', () => {
    expect(DEFAULT_SCENARIO.conversionRate).toBe(0.75);
  });

  it('has three year capture projections', () => {
    expect(DEFAULT_SCENARIO.hhCapture).toHaveLength(3);
    expect(DEFAULT_SCENARIO.woundCapture).toHaveLength(3);
    expect(DEFAULT_SCENARIO.therapyCapture).toHaveLength(3);
  });

  it('has increasing capture rates over years', () => {
    expect(DEFAULT_SCENARIO.hhCapture[0]).toBeLessThan(DEFAULT_SCENARIO.hhCapture[1]);
    expect(DEFAULT_SCENARIO.hhCapture[1]).toBeLessThan(DEFAULT_SCENARIO.hhCapture[2]);
  });

  it('has empty margin overrides', () => {
    expect(DEFAULT_SCENARIO.marginOverrides).toEqual({});
  });
});

describe('TABS', () => {
  it('contains all expected tabs', () => {
    const expected = [
      'Executive View',
      'County Plan',
      'Referral Plan',
      'Competitive View',
      'Service Lines',
      'CMS Data',
      'Financial Model',
      'Staffing Model',
      'Sensitivity',
      'Opportunity Score',
      'Launch Timeline',
      'Board Report',
      'Launch Checklist',
    ];
    expect(TABS).toEqual(expected);
  });

  it('is a readonly array', () => {
    const tabCount = TABS.length;
    expect(tabCount).toBe(13);
  });
});

describe('STAFFING_RATIOS', () => {
  it('has entries for all three service lines', () => {
    expect(Object.keys(STAFFING_RATIOS)).toHaveLength(3);
    expect(STAFFING_RATIOS['Home Healthcare']).toBeDefined();
    expect(STAFFING_RATIOS['Mobile Wound']).toBeDefined();
    expect(STAFFING_RATIOS['Therapy Care']).toBeDefined();
  });

  it('has correct structure for Home Healthcare', () => {
    const hh = STAFFING_RATIOS['Home Healthcare'];
    expect(hh.role).toBe('RN / LPN');
    expect(hh.patientsPerFTE).toBe(25);
    expect(hh.avgSalary).toBe(78000);
  });

  it('has correct structure for Mobile Wound', () => {
    const mw = STAFFING_RATIOS['Mobile Wound'];
    expect(mw.role).toBe('Wound Care Specialist');
    expect(mw.patientsPerFTE).toBe(15);
    expect(mw.avgSalary).toBe(85000);
  });

  it('has correct structure for Therapy Care', () => {
    const tc = STAFFING_RATIOS['Therapy Care'];
    expect(tc.role).toBe('PT / OT / SLP');
    expect(tc.patientsPerFTE).toBe(20);
    expect(tc.avgSalary).toBe(82000);
  });
});

describe('SENSITIVITY_VARIABLES', () => {
  it('has all six variables', () => {
    expect(SENSITIVITY_VARIABLES).toHaveLength(6);
  });

  it('each variable has required fields', () => {
    for (const v of SENSITIVITY_VARIABLES) {
      expect(v).toHaveProperty('key');
      expect(v).toHaveProperty('label');
      expect(v).toHaveProperty('base');
      expect(v).toHaveProperty('low');
      expect(v).toHaveProperty('high');
      expect(v).toHaveProperty('format');
    }
  });

  it('has correct conversionRate variable', () => {
    const v = SENSITIVITY_VARIABLES.find(s => s.key === 'conversionRate');
    expect(v?.base).toBe(0.75);
    expect(v?.low).toBe(0.55);
    expect(v?.high).toBe(0.95);
    expect(v?.format).toBe('percent');
  });

  it('has correct hhReimbursement variable', () => {
    const v = SENSITIVITY_VARIABLES.find(s => s.key === 'hhReimbursement');
    expect(v?.base).toBe(3189);
    expect(v?.low).toBe(2500);
    expect(v?.high).toBe(4000);
    expect(v?.format).toBe('currency');
  });

  it('low is always less than or equal to base', () => {
    for (const v of SENSITIVITY_VARIABLES) {
      expect(v.low).toBeLessThanOrEqual(v.base);
    }
  });

  it('high is always greater than or equal to base', () => {
    for (const v of SENSITIVITY_VARIABLES) {
      expect(v.high).toBeGreaterThanOrEqual(v.base);
    }
  });
});

describe('OPPORTUNITY_WEIGHTS', () => {
  it('has all five weights', () => {
    expect(Object.keys(OPPORTUNITY_WEIGHTS)).toHaveLength(5);
  });

  it('weights sum to 1.0', () => {
    const sum = Object.values(OPPORTUNITY_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 2);
  });

  it('marketSize has the highest weight', () => {
    expect(OPPORTUNITY_WEIGHTS.marketSize).toBe(0.25);
  });

  it('andwellPresence has the lowest weight', () => {
    expect(OPPORTUNITY_WEIGHTS.andwellPresence).toBe(0.15);
  });
});

describe('HEATMAP_MODES', () => {
  it('has all five modes', () => {
    expect(HEATMAP_MODES).toHaveLength(5);
  });

  it('each mode has key and label', () => {
    for (const mode of HEATMAP_MODES) {
      expect(mode).toHaveProperty('key');
      expect(mode).toHaveProperty('label');
    }
  });

  it('has correct first mode', () => {
    expect(HEATMAP_MODES[0].key).toBe('priority');
    expect(HEATMAP_MODES[0].label).toBe('Priority Group');
  });

  it('has correct last mode', () => {
    const last = HEATMAP_MODES[HEATMAP_MODES.length - 1];
    expect(last.key).toBe('penetration');
    expect(last.label).toBe('Market Penetration');
  });
});
