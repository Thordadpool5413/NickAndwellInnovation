import { describe, it, expect } from 'vitest';
import { InsightsEngine, calculateMetricTrend, getMetricStatus } from './insights';

function makeRows(count = 3) {
  return [
    { county: 'York', service: 'Home Healthcare', revenue: [500000, 600000, 700000], referrals: [45, 60, 75], launchGroup: '1', margin: 0.18, current: 'Hospice', threat: { score: 80 } },
    { county: 'Cumberland', service: 'Therapy Care', revenue: [300000, 400000, 500000], referrals: [30, 40, 50], launchGroup: '1', margin: 0.22, current: 'Home Health', threat: { score: 20 } },
    { county: 'Penobscot', service: 'Mobile Wound', revenue: [100000, 150000, 200000], referrals: [8, 12, 16], launchGroup: '2', margin: 0.14, current: 'Wound', threat: { score: 50 } },
  ];
}

const totals = { y1Revenue: 900000, y2Revenue: 1150000, y3Revenue: 1400000 };

describe('InsightsEngine', () => {
  describe('constructor', () => {
    it('stores rows and totals', () => {
      const engine = new InsightsEngine(makeRows(), totals);
      expect(engine.rows).toHaveLength(3);
      expect(engine.totals.y1Revenue).toBe(900000);
    });

    it('handles empty rows', () => {
      const engine = new InsightsEngine([], { y1Revenue: 0, y2Revenue: 0, y3Revenue: 0 });
      expect(engine.rows).toEqual([]);
    });
  });

  describe('detectAnomalies', () => {
    it('returns anomalies for revenue deviation > 50%', () => {
      const rows = [
        { county: 'Big', service: 'HH', revenue: [1000000, 0, 0], referrals: [50, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
        { county: 'Small', service: 'HH', revenue: [1000, 0, 0], referrals: [50, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
      ];
      const engine = new InsightsEngine(rows, totals);
      const anomalies = engine.detectAnomalies();
      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies.some((a) => a.county === 'Big')).toBe(true);
    });

    it('flags revenue anomaly as high severity when deviation > 100%', () => {
    const rows = [
      { county: 'Huge', service: 'HH', revenue: [3500000, 0, 0], referrals: [50, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
      { county: 'Normal', service: 'HH', revenue: [500000, 0, 0], referrals: [50, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
      { county: 'Normal2', service: 'HH', revenue: [500000, 0, 0], referrals: [50, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
    ];
      const engine = new InsightsEngine(rows, totals);
      const anomalies = engine.detectAnomalies();
      const huge = anomalies.find((a) => a.county === 'Huge');
      expect(huge).toBeDefined();
      if (huge) {
        expect(huge.severity).toBe('high');
      }
    });

    it('flags low referral counties as anomalies', () => {
      const rows = makeRows();
      const engine = new InsightsEngine(rows, totals);
      const anomalies = engine.detectAnomalies();
      const lowRef = anomalies.find((a) => a.metric === 'referrals');
      expect(lowRef).toBeDefined();
      if (lowRef) {
        expect(lowRef.id).toContain('risk-');
        expect(lowRef.severity).toBe('high');
      }
    });

    it('returns empty array when no rows deviate', () => {
      const rows = [
        { county: 'A', service: 'HH', revenue: [500000, 0, 0], referrals: [50, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
        { county: 'B', service: 'HH', revenue: [500000, 0, 0], referrals: [50, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
      ];
      const engine = new InsightsEngine(rows, totals);
      const anomalies = engine.detectAnomalies();
      expect(anomalies.length).toBe(0);
    });

    it('handles single row gracefully', () => {
      const rows = [{ county: 'Solo', service: 'HH', revenue: [100000, 0, 0], referrals: [20, 0, 0], launchGroup: '1', margin: 0.2, current: '' }];
      const engine = new InsightsEngine(rows, totals);
      const anomalies = engine.detectAnomalies();
      expect(anomalies.length).toBe(0);
    });
  });

  describe('generateRecommendations', () => {
    it('returns high priority recommendation for top revenue county', () => {
      const engine = new InsightsEngine(makeRows(), totals);
      const recs = engine.generateRecommendations();
      const topRec = recs.find((r) => r.id === 'rec-1');
      expect(topRec).toBeDefined();
      if (topRec) {
        expect(topRec.priority).toBe('high');
        expect(topRec.title).toContain('high-revenue');
        expect(topRec.actionValue).toBe('York');
      }
    });

    it('generates threat recommendation when top threat score > 70', () => {
      const rows = makeRows();
      const engine = new InsightsEngine(rows, totals);
      const recs = engine.generateRecommendations();
      const threatRec = recs.find((r) => r.id === 'rec-2');
      expect(threatRec).toBeDefined();
      if (threatRec) {
        expect(threatRec.title).toContain('High competition');
        expect(threatRec.actionValue).toBe('York');
      }
    });

    it('skips threat recommendation when no threat exceeds 70', () => {
      const rows = [
        { county: 'Safe', service: 'HH', revenue: [500000, 0, 0], referrals: [50, 0, 0], launchGroup: '1', margin: 0.2, current: '', threat: { score: 30 } },
        { county: 'Safe2', service: 'HH', revenue: [400000, 0, 0], referrals: [40, 0, 0], launchGroup: '1', margin: 0.2, current: '', threat: { score: 40 } },
      ];
      const engine = new InsightsEngine(rows, totals);
      const recs = engine.generateRecommendations();
      expect(recs.find((r) => r.id === 'rec-2')).toBeUndefined();
    });

    it('generates undercompetitive market recommendation', () => {
      const engine = new InsightsEngine(makeRows(), totals);
      const recs = engine.generateRecommendations();
      const expandRec = recs.find((r) => r.id === 'rec-3');
      expect(expandRec).toBeDefined();
      if (expandRec) {
        expect(expandRec.title).toContain('undercompetitive');
        expect(expandRec.actionValue).toBe('Cumberland');
      }
    });

    it('generates diversification recommendation when one service dominates', () => {
      const rows = [
        { county: 'A', service: 'Home Healthcare', revenue: [500000, 0, 0], referrals: [50, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
        { county: 'B', service: 'Home Healthcare', revenue: [400000, 0, 0], referrals: [40, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
        { county: 'C', service: 'Home Healthcare', revenue: [300000, 0, 0], referrals: [30, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
        { county: 'D', service: 'Therapy Care', revenue: [100000, 0, 0], referrals: [10, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
      ];
      const engine = new InsightsEngine(rows, totals);
      const recs = engine.generateRecommendations();
      const divRec = recs.find((r) => r.id === 'rec-4');
      expect(divRec).toBeDefined();
      if (divRec) {
        expect(divRec.priority).toBe('low');
        expect(divRec.title).toContain('Diversify');
      }
    });

    it('skips diversification when no service exceeds 50%', () => {
      const rows = [
        { county: 'A', service: 'HH', revenue: [100000, 0, 0], referrals: [10, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
        { county: 'B', service: 'Therapy', revenue: [100000, 0, 0], referrals: [10, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
        { county: 'C', service: 'Wound', revenue: [100000, 0, 0], referrals: [10, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
      ];
      const engine = new InsightsEngine(rows, totals);
      const recs = engine.generateRecommendations();
      expect(recs.find((r) => r.id === 'rec-4')).toBeUndefined();
    });
  });

  describe('calculateTrends', () => {
    it('calculates y1ToY2Growth correctly', () => {
      const engine = new InsightsEngine(makeRows(), totals);
      const trends = engine.calculateTrends();
      expect(trends.y1ToY2Growth).toBeCloseTo(1150000 / 900000 - 1, 5);
    });

    it('calculates y2ToY3Growth correctly', () => {
      const engine = new InsightsEngine(makeRows(), totals);
      const trends = engine.calculateTrends();
      expect(trends.y2ToY3Growth).toBeCloseTo(1400000 / 1150000 - 1, 5);
    });

    it('calculates avgAnnualGrowth', () => {
      const engine = new InsightsEngine(makeRows(), totals);
      const trends = engine.calculateTrends();
      expect(trends.avgAnnualGrowth).toBeCloseTo((Math.pow(1400000 / 900000, 1 / 2) - 1) * 100, 5);
    });

    it('counts counties launching per year by launchGroup', () => {
      const rows = makeRows();
      const engine = new InsightsEngine(rows, totals);
      const trends = engine.calculateTrends();
      expect(trends.countiesLaunchingPerYear).toEqual([2, 1, 0]);
    });

    it('handles zero totals gracefully', () => {
      const engine = new InsightsEngine([], { y1Revenue: 0, y2Revenue: 0, y3Revenue: 0 });
      const trends = engine.calculateTrends();
      expect(trends.y1ToY2Growth).toBeNaN();
      expect(trends.countiesLaunchingPerYear).toEqual([0, 0, 0]);
    });
  });

  describe('assessRisks', () => {
    it('detects revenue concentration risk when one county > 30%', () => {
      const rows = [
        { county: 'A', service: 'HH', revenue: [500000, 0, 0], referrals: [50, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
        { county: 'B', service: 'HH', revenue: [100000, 0, 0], referrals: [50, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
      ];
      const customTotals = { y1Revenue: 600000, y2Revenue: 0, y3Revenue: 0 };
      const engine = new InsightsEngine(rows, customTotals);
      const risks = engine.assessRisks();
      const concRisk = risks.find((r) => r.id === 'risk-1');
      expect(concRisk).toBeDefined();
      if (concRisk) {
        expect(concRisk.severity).toBe('high');
        expect(concRisk.title).toContain('Revenue concentration');
      }
    });

    it('skips concentration risk when no county exceeds 30%', () => {
      const rows = [
        { county: 'A', service: 'HH', revenue: [100000, 0, 0], referrals: [50, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
        { county: 'B', service: 'HH', revenue: [100000, 0, 0], referrals: [50, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
        { county: 'C', service: 'HH', revenue: [100000, 0, 0], referrals: [50, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
        { county: 'D', service: 'HH', revenue: [100000, 0, 0], referrals: [50, 0, 0], launchGroup: '1', margin: 0.2, current: '' },
      ];
      const customTotals = { y1Revenue: 400000, y2Revenue: 0, y3Revenue: 0 };
      const engine = new InsightsEngine(rows, customTotals);
      const risks = engine.assessRisks();
      expect(risks.find((r) => r.id === 'risk-1')).toBeUndefined();
    });

    it('detects low margin counties', () => {
      const engine = new InsightsEngine(makeRows(), totals);
      const risks = engine.assessRisks();
      const marginRisk = risks.find((r) => r.id === 'risk-2');
      expect(marginRisk).toBeDefined();
      if (marginRisk) {
        expect(marginRisk.severity).toBe('medium');
        expect(marginRisk.message).toContain('margins below 20%');
      }
    });

    it('returns no risks for empty rows', () => {
      const engine = new InsightsEngine([], totals);
      const risks = engine.assessRisks();
      expect(risks).toEqual([]);
    });
  });

  describe('getAllInsights', () => {
    it('returns combined insights from all methods', () => {
      const engine = new InsightsEngine(makeRows(), totals);
      const all = engine.getAllInsights();
      expect(all).toHaveProperty('anomalies');
      expect(all).toHaveProperty('recommendations');
      expect(all).toHaveProperty('trends');
      expect(all).toHaveProperty('risks');
      expect(all.anomalies.length).toBeGreaterThan(0);
      expect(all.recommendations.length).toBeGreaterThan(0);
      expect(all.trends.y1ToY2Growth).toBeDefined();
      expect(all.risks.length).toBeGreaterThan(0);
    });

    it('returns empty arrays when no data', () => {
      const engine = new InsightsEngine([], { y1Revenue: 0, y2Revenue: 0, y3Revenue: 0 });
      const all = engine.getAllInsights();
      expect(all.anomalies).toEqual([]);
      expect(all.recommendations).toEqual([]);
      expect(all.risks).toEqual([]);
    });
  });
});

describe('calculateMetricTrend', () => {
  it('calculates positive growth', () => {
    expect(calculateMetricTrend(100, 150)).toBe(50);
  });

  it('calculates negative growth', () => {
    expect(calculateMetricTrend(200, 100)).toBe(-50);
  });

  it('returns 0 when previous value is 0', () => {
    expect(calculateMetricTrend(0, 100)).toBe(0);
  });

  it('returns negative when current is 0', () => {
    expect(calculateMetricTrend(100, 0)).toBe(-100);
  });

  it('handles equal values', () => {
    expect(calculateMetricTrend(100, 100)).toBe(0);
  });
});

describe('getMetricStatus', () => {
  const benchmarks = { high: 80, medium: 50, low: 20 };

  it('returns excellent when value exceeds high benchmark', () => {
    expect(getMetricStatus(90, benchmarks)).toBe('excellent');
  });

  it('returns good when value exceeds medium but not high', () => {
    expect(getMetricStatus(65, benchmarks)).toBe('good');
  });

  it('returns fair when value exceeds low but not medium', () => {
    expect(getMetricStatus(35, benchmarks)).toBe('fair');
  });

  it('returns poor when value does not exceed low benchmark', () => {
    expect(getMetricStatus(10, benchmarks)).toBe('poor');
  });

  it('uses strict greater than for all thresholds', () => {
    expect(getMetricStatus(80, benchmarks)).toBe('good');
    expect(getMetricStatus(50, benchmarks)).toBe('fair');
    expect(getMetricStatus(20, benchmarks)).toBe('poor');
  });
});
