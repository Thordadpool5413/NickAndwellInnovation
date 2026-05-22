import { describe, it, expect } from 'vitest';
import { scenarioPresets, getScenarioById, applyScenario, buildComparison } from './scenario-presets';

describe('scenarioPresets', () => {
  it('contains 6 presets', () => {
    expect(scenarioPresets.length).toBe(6);
  });

  it('each preset has required fields', () => {
    for (const preset of scenarioPresets) {
      expect(preset.id).toBeTruthy();
      expect(preset.name).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.scenario.conversionRate).toBeGreaterThan(0);
      expect(preset.scenario.hhCapture.length).toBe(3);
      expect(preset.scenario.woundCapture.length).toBe(3);
      expect(preset.scenario.therapyCapture.length).toBe(3);
    }
  });

  it('conservative has lowest conversion rate', () => {
    const conservative = scenarioPresets.find((p) => p.id === 'conservative');
    expect(conservative?.scenario.conversionRate).toBe(0.5);
    const max = scenarioPresets.find((p) => p.id === 'referral-max');
    expect(max?.scenario.conversionRate).toBe(0.95);
  });
});

describe('getScenarioById', () => {
  it('returns the correct preset for each id', () => {
    expect(getScenarioById('conservative')?.name).toBe('Conservative');
    expect(getScenarioById('base-case')?.name).toBe('Base Case');
    expect(getScenarioById('aggressive')?.name).toBe('Aggressive');
  });

  it('returns undefined for unknown id', () => {
    expect(getScenarioById('non-existent')).toBeUndefined();
  });
});

describe('applyScenario', () => {
  it('returns GrowthRow array for a given scenario', () => {
    const preset = getScenarioById('aggressive');
    if (preset) {
      const rows = applyScenario([], preset.scenario);
      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0]).toHaveProperty('county');
      expect(rows[0]).toHaveProperty('starts');
      expect(rows[0]).toHaveProperty('revenue');
    }
  });
});

describe('buildComparison', () => {
  it('returns comparison with correct shape', () => {
    const comparison = buildComparison(['conservative', 'aggressive']);
    expect(comparison.presets.length).toBe(2);
    expect(comparison.rows.conservative).toBeDefined();
    expect(comparison.rows.aggressive).toBeDefined();
    expect(comparison.totals.conservative).toBeDefined();
    expect(comparison.totals.aggressive).toBeDefined();
  });

  it('aggressive shows higher revenue than conservative', () => {
    const comparison = buildComparison(['conservative', 'aggressive']);
    const consRev = comparison.totals.conservative.totalRevenue;
    const aggRev = comparison.totals.aggressive.totalRevenue;
    expect(aggRev).toBeGreaterThan(consRev);
  });
});
