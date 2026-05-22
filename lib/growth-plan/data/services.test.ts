import { describe, it, expect } from 'vitest';
import services, { services as namedServices, SERVICE_COLORS } from './services';
import { COLORS } from './constants';

describe('services', () => {
  it('has entries for all five service lines', () => {
    const keys = Object.keys(namedServices);
    expect(keys).toHaveLength(5);
    expect(keys).toContain('Home Healthcare');
    expect(keys).toContain('Mobile Wound');
    expect(keys).toContain('Therapy Care');
    expect(keys).toContain('GUIDE');
    expect(keys).toContain('Hospice');
  });

  it('each service has all required fields', () => {
    for (const [, info] of Object.entries(namedServices)) {
      expect(info).toHaveProperty('color');
      expect(info).toHaveProperty('role');
      expect(info).toHaveProperty('unit');
      expect(info).toHaveProperty('reimbursement');
      expect(info).toHaveProperty('margin');
      expect(info).toHaveProperty('conversion');
      expect(info).toHaveProperty('demandRate');
      expect(typeof info.color).toBe('string');
      expect(typeof info.role).toBe('string');
      expect(typeof info.unit).toBe('string');
      expect(typeof info.reimbursement).toBe('number');
      expect(typeof info.margin).toBe('number');
      expect(typeof info.conversion).toBe('number');
      expect(typeof info.demandRate).toBe('number');
    }
  });

  it('Home Healthcare uses COLORS.blue', () => {
    const hh = namedServices['Home Healthcare'];
    expect(hh.color).toBe(COLORS.blue);
    expect(hh.role).toBe('Foundation service line');
    expect(hh.unit).toBe('admissions');
    expect(hh.reimbursement).toBe(3189);
    expect(hh.margin).toBe(0.18);
    expect(hh.conversion).toBe(0.75);
    expect(hh.demandRate).toBe(0.08);
  });

  it('Mobile Wound uses COLORS.red', () => {
    const mw = namedServices['Mobile Wound'];
    expect(mw.color).toBe(COLORS.red);
    expect(mw.role).toBe('Specialty growth line');
    expect(mw.unit).toBe('wound service starts');
    expect(mw.reimbursement).toBe(1800);
    expect(mw.margin).toBe(0.24);
    expect(mw.conversion).toBe(0.75);
    expect(mw.demandRate).toBe(0.025);
  });

  it('Therapy Care uses COLORS.green', () => {
    const tc = namedServices['Therapy Care'];
    expect(tc.color).toBe(COLORS.green);
    expect(tc.role).toBe('Referral retention line');
    expect(tc.unit).toBe('therapy service starts');
    expect(tc.reimbursement).toBe(1650);
    expect(tc.margin).toBe(0.2);
    expect(tc.conversion).toBe(0.75);
    expect(tc.demandRate).toBe(0.05);
  });

  it('GUIDE uses COLORS.purple and has zero revenue values', () => {
    const guide = namedServices['GUIDE'];
    expect(guide.color).toBe(COLORS.purple);
    expect(guide.role).toBe('Validation only line');
    expect(guide.unit).toBe('validated dementia care enrollments');
    expect(guide.reimbursement).toBe(0);
    expect(guide.margin).toBe(0);
    expect(guide.demandRate).toBe(0);
  });

  it('Hospice uses #9333ea and has zero revenue values', () => {
    const hospice = namedServices['Hospice'];
    expect(hospice.color).toBe('#9333ea');
    expect(hospice.role).toBe('Future expansion line');
    expect(hospice.unit).toBe('hospice admissions');
    expect(hospice.reimbursement).toBe(0);
    expect(hospice.margin).toBe(0);
    expect(hospice.demandRate).toBe(0);
  });

  it('all services have conversion rate of 0.75', () => {
    for (const info of Object.values(namedServices)) {
      expect(info.conversion).toBe(0.75);
    }
  });

  it('revenue-generating services have positive demand rates', () => {
    expect(namedServices['Home Healthcare'].demandRate).toBeGreaterThan(0);
    expect(namedServices['Mobile Wound'].demandRate).toBeGreaterThan(0);
    expect(namedServices['Therapy Care'].demandRate).toBeGreaterThan(0);
  });

  it('validation services have zero demand rate', () => {
    expect(namedServices['GUIDE'].demandRate).toBe(0);
    expect(namedServices['Hospice'].demandRate).toBe(0);
  });
});

describe('SERVICE_COLORS', () => {
  it('has entries for all five services', () => {
    expect(Object.keys(SERVICE_COLORS)).toHaveLength(5);
  });

  it('matches colors from services object', () => {
    for (const [key, color] of Object.entries(SERVICE_COLORS)) {
      expect(color).toBe(namedServices[key].color);
    }
  });

  it('references COLORS constants correctly', () => {
    expect(SERVICE_COLORS['Home Healthcare']).toBe(COLORS.blue);
    expect(SERVICE_COLORS['Mobile Wound']).toBe(COLORS.red);
    expect(SERVICE_COLORS['Therapy Care']).toBe(COLORS.green);
    expect(SERVICE_COLORS['GUIDE']).toBe(COLORS.purple);
    expect(SERVICE_COLORS['Hospice']).toBe('#9333ea');
  });
});

describe('default export', () => {
  it('equals the named services export', () => {
    expect(services).toBe(namedServices);
  });
});
