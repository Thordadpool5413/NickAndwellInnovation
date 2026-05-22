import { describe, it, expect } from 'vitest';
import { getReferralProfile, getReferralProfilesForReport, getReferralSourceTypes } from './referral-sources';
import type { ReferralSourceType } from './types';

describe('getReferralSourceTypes', () => {
  it('returns all 9 source types', () => {
    const types = getReferralSourceTypes();
    expect(types).toHaveLength(9);
  });

  it('includes Hospital and Family Caregiver', () => {
    const types = getReferralSourceTypes();
    expect(types).toContain('Hospital');
    expect(types).toContain('Family Caregiver');
  });

  it('returns array of ReferralSourceType', () => {
    const types = getReferralSourceTypes();
    for (const t of types) {
      expect(t).toEqual(expect.any(String));
    }
  });
});

describe('getReferralProfile', () => {
  it('returns a complete ReferralSourceProfile for Hospital', () => {
    const profile = getReferralProfile('Hospital');
    expect(profile.sourceType).toBe('Hospital');
    expect(profile.leadService).toBe('Home Healthcare');
    expect(profile.painPoints.length).toBeGreaterThan(0);
    expect(profile.discoveryQuestions.length).toBeGreaterThan(0);
    expect(profile.positioningLanguage.length).toBeGreaterThan(0);
    expect(profile.referralCta.length).toBeGreaterThan(0);
  });

  it('returns a complete ReferralSourceProfile for Family Caregiver', () => {
    const profile = getReferralProfile('Family Caregiver');
    expect(profile.sourceType).toBe('Family Caregiver');
    expect(profile.leadService).toBe('In Home Care Giving');
    expect(profile.painPoints).toContain('Caregiver burnout and stress');
    expect(profile.discoveryQuestions).toContain('What is the hardest part of caregiving for you right now?');
  });

  it('returns a complete ReferralSourceProfile for Primary Care', () => {
    const profile = getReferralProfile('Primary Care');
    expect(profile.sourceType).toBe('Primary Care');
    expect(profile.leadService).toBe('In Home Care Giving');
    expect(profile.painPoints).toContain('Chronic disease management support');
  });

  it('returns service lines with relevance and reason for each', () => {
    const profile = getReferralProfile('Hospital');
    for (const sl of profile.serviceLines) {
      expect(sl.name).toBeTruthy();
      expect(['High', 'Medium', 'Low']).toContain(sl.relevance);
      expect(sl.reason).toBeTruthy();
    }
  });

  it('marks known catalog service lines as High relevance', () => {
    const profile = getReferralProfile('Hospital');
    const homeHealth = profile.serviceLines.find((sl) => sl.name === 'Home Healthcare');
    expect(homeHealth?.relevance).toBe('High');
  });

  it('returns pain points as a new array (not a reference)', () => {
    const profile = getReferralProfile('Hospital');
    const originalLength = profile.painPoints.length;
    profile.painPoints.push('extra');
    const profile2 = getReferralProfile('Hospital');
    expect(profile2.painPoints).toHaveLength(originalLength);
  });

  it('returns discovery questions for SNF', () => {
    const profile = getReferralProfile('SNF');
    expect(profile.discoveryQuestions.length).toBeGreaterThanOrEqual(3);
    expect(profile.positioningLanguage).toContain('skilled home health');
    expect(profile.referralCta).toContain('SNF');
  });

  it('handles all 9 source types without throwing', () => {
    const types: ReferralSourceType[] = ['Hospital', 'SNF', 'Primary Care', 'Specialist', 'Assisted Living', 'Home Health Referral', 'Behavioral Health', 'Community Partner', 'Family Caregiver'];
    for (const t of types) {
      expect(() => getReferralProfile(t)).not.toThrow();
    }
  });
});

describe('getReferralProfilesForReport', () => {
  it('returns profiles for all 9 types when report is null', () => {
    const profiles = getReferralProfilesForReport(null);
    expect(profiles).toHaveLength(9);
  });

  it('returns profiles for all 9 types when report is undefined', () => {
    const profiles = getReferralProfilesForReport(undefined);
    expect(profiles).toHaveLength(9);
  });

  it('every profile has the correct structure', () => {
    const profiles = getReferralProfilesForReport();
    for (const p of profiles) {
      expect(p.sourceType).toBeTruthy();
      expect(Array.isArray(p.painPoints)).toBe(true);
      expect(Array.isArray(p.discoveryQuestions)).toBe(true);
      expect(typeof p.positioningLanguage).toBe('string');
      expect(typeof p.referralCta).toBe('string');
      expect(Array.isArray(p.serviceLines)).toBe(true);
    }
  });

  it('each profile has at least 3 service lines', () => {
    const profiles = getReferralProfilesForReport();
    for (const p of profiles) {
      expect(p.serviceLines.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('profiles are independent arrays (not shared references)', () => {
    const profiles = getReferralProfilesForReport();
    const firstPainPoints = profiles[0].painPoints;
    firstPainPoints.push('mutate');
    expect(profiles[1].painPoints.length).not.toContain('mutate');
  });
});
