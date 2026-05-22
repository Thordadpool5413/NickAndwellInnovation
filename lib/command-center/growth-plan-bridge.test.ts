import { describe, it, expect } from 'vitest';
import { growthScenarioToSubsystem, getGrowthPlanData } from './growth-plan-bridge';
import type { GrowthScenario } from '../../lib/growth-plan';

const testScenario: GrowthScenario = {
  conversionRate: 0.75,
  hhCapture: [0.1, 0.15, 0.2] as [number, number, number],
  woundCapture: [0.25, 0.35, 0.45] as [number, number, number],
  therapyCapture: [0.2, 0.3, 0.4] as [number, number, number],
};

describe('growthScenarioToSubsystem', () => {
  it('converts GrowthScenario to Scenario correctly', () => {
    const result = growthScenarioToSubsystem(testScenario);
    expect(result.conversionRate).toBe(0.75);
    expect(result.hhCapture).toEqual([0.1, 0.15, 0.2]);
    expect(result.woundCapture).toEqual([0.25, 0.35, 0.45]);
    expect(result.therapyCapture).toEqual([0.2, 0.3, 0.4]);
    expect(result.marginOverrides).toEqual({});
  });

  it('copies arrays by value, not reference', () => {
    const result = growthScenarioToSubsystem(testScenario);
    result.hhCapture[0] = 999;
    expect(testScenario.hhCapture[0]).toBe(0.1);
  });
});

describe('getGrowthPlanData', () => {
  it('returns rows array and totals with correct shape', () => {
    const result = getGrowthPlanData();
    expect(Array.isArray(result.rows)).toBe(true);
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.totals.y1Referrals).toBeGreaterThan(0);
    expect(result.totals.y1Revenue).toBeGreaterThan(0);
    expect(result.totals.y1Starts).toBeGreaterThan(0);
    expect(result.totals.totalContribution).toBeGreaterThan(0);
  });

  it('uses provided scenario for calculation', () => {
    const conservative: GrowthScenario = {
      conversionRate: 0.5,
      hhCapture: [0.05, 0.08, 0.12] as [number, number, number],
      woundCapture: [0.1, 0.15, 0.2] as [number, number, number],
      therapyCapture: [0.08, 0.12, 0.18] as [number, number, number],
    };
    const subsystem = growthScenarioToSubsystem(conservative);
    const result = getGrowthPlanData(subsystem);
    const defaultResult = getGrowthPlanData();
    // Conservative should yield lower referrals
    expect(result.totals.y1Referrals).toBeLessThan(defaultResult.totals.y1Referrals);
  });
});
