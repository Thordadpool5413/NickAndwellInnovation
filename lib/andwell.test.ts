import { describe, it, expect } from 'vitest';
import { andwellCatalog, referralAudiences } from './andwell';

describe('andwellCatalog', () => {
  it('has 14 service line entries', () => {
    expect(andwellCatalog).toHaveLength(14);
  });

  it('each entry has all required fields', () => {
    for (const entry of andwellCatalog) {
      expect(entry).toHaveProperty('category');
      expect(entry).toHaveProperty('serviceLine');
      expect(entry).toHaveProperty('description');
      expect(entry).toHaveProperty('subservices');
      expect(entry).toHaveProperty('safeLanguage');
      expect(entry).toHaveProperty('avoid');
      expect(entry).toHaveProperty('evidence');
    }
  });

  it('has four distinct categories', () => {
    const categories = [...new Set(andwellCatalog.map(e => e.category))];
    expect(categories).toHaveLength(4);
    expect(categories).toContain('At Home Care');
    expect(categories).toContain('Hospice and Palliative Care');
    expect(categories).toContain('Community and Behavioral Health');
    expect(categories).toContain('Therapy Care and Specialty Services');
  });

  it('At Home Care has 4 service lines', () => {
    const atHome = andwellCatalog.filter(e => e.category === 'At Home Care');
    expect(atHome).toHaveLength(4);
    const names = atHome.map(e => e.serviceLine);
    expect(names).toContain('Home Healthcare');
    expect(names).toContain('In Home Care Giving');
    expect(names).toContain('Mobile Wound Care');
    expect(names).toContain('Dementia Care Management through GUIDE');
  });

  it('Community and Behavioral Health has 1 service line', () => {
    const cb = andwellCatalog.filter(e => e.category === 'Community and Behavioral Health');
    expect(cb).toHaveLength(1);
    expect(cb[0].serviceLine).toBe('Community and Behavioral Health');
  });

  it('Hospice and Palliative Care has 5 service lines', () => {
    const hospice = andwellCatalog.filter(e => e.category === 'Hospice and Palliative Care');
    expect(hospice).toHaveLength(5);
    const names = hospice.map(e => e.serviceLine);
    expect(names).toContain('Hospice Home Care');
    expect(names).toContain('Hospice House Care');
    expect(names).toContain('Palliative Medicine');
    expect(names).toContain('Caring Comfort Program');
    expect(names).toContain('Bereavement Support');
  });

  it('Therapy Care and Specialty Services has 4 service lines', () => {
    const therapy = andwellCatalog.filter(e => e.category === 'Therapy Care and Specialty Services');
    expect(therapy).toHaveLength(4);
    const names = therapy.map(e => e.serviceLine);
    expect(names).toContain('Pediatric Therapy');
    expect(names).toContain('Adult Therapy');
    expect(names).toContain('Audiology');
    expect(names).toContain('Maternal and Child Health');
  });

  it('missing Therapy Care category', () => {
    const categories = [...new Set(andwellCatalog.map(e => e.category))];
    expect(categories).not.toContain('Therapy Care');
  });

  it('every entry has a non-empty description', () => {
    for (const entry of andwellCatalog) {
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });

  it('every entry has at least one subservice', () => {
    for (const entry of andwellCatalog) {
      expect(entry.subservices.length).toBeGreaterThan(0);
    }
  });

  it('Home Healthcare has the first position in catalog', () => {
    expect(andwellCatalog[0].serviceLine).toBe('Home Healthcare');
  });

  it('every entry has a valid evidence URL', () => {
    for (const entry of andwellCatalog) {
      expect(entry.evidence).toMatch(/^https:\/\/andwell\.org\//);
    }
  });

  it('safeLanguage and avoid fields are non-empty for every entry', () => {
    for (const entry of andwellCatalog) {
      expect(entry.safeLanguage.length).toBeGreaterThan(0);
      expect(entry.avoid.length).toBeGreaterThan(0);
    }
  });

  it('Home Healthcare subservices include common offerings', () => {
    const hh = andwellCatalog.find(e => e.serviceLine === 'Home Healthcare');
    expect(hh?.subservices).toContain('Skilled nursing');
    expect(hh?.subservices).toContain('Wound care');
    expect(hh?.subservices).toContain('Infusion therapy');
  });

  it('Hospice Home Care subservices include end of life support', () => {
    const hospice = andwellCatalog.find(e => e.serviceLine === 'Hospice Home Care');
    expect(hospice?.subservices).toContain('End of life support');
    expect(hospice?.subservices).toContain('Pain management');
    expect(hospice?.subservices).toContain('Family support');
  });

  it('Dementia Care Management includes Medicare GUIDE', () => {
    const guide = andwellCatalog.find(e => e.serviceLine.includes('GUIDE'));
    expect(guide?.subservices).toContain('Medicare GUIDE');
    expect(guide?.subservices).toContain('Caregiver education');
  });
});

describe('referralAudiences', () => {
  it('has 11 referral audience entries', () => {
    expect(referralAudiences).toHaveLength(11);
  });

  it('includes all expected audience types', () => {
    const expected = [
      'Hospital discharge planner',
      'Case manager',
      'Primary care provider',
      'Specialist',
      'Facility administrator',
      'Assisted living leader',
      'Skilled nursing facility team',
      'Family caregiver',
      'Community partner',
      'Behavioral health provider',
      'Therapy provider',
    ];
    expect(referralAudiences).toEqual(expected);
  });

  it('includes clinical and non-clinical audiences', () => {
    expect(referralAudiences).toContain('Hospital discharge planner');
    expect(referralAudiences).toContain('Family caregiver');
    expect(referralAudiences).toContain('Community partner');
  });

  it('does not contain duplicates', () => {
    expect([...new Set(referralAudiences)]).toHaveLength(referralAudiences.length);
  });
});
