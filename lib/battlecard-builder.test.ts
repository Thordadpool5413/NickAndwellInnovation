import { describe, it, expect } from 'vitest';
import { buildBattlecard, getBuilderOptions, countyList, audienceOptions, objectionOptions } from './battlecard-builder';
import type { CompetitorAnalysis } from './types';

function makeAnalysis(name: string): CompetitorAnalysis {
  return {
    id: `a-${name}`,
    name,
    url: `https://${name.toLowerCase()}.com`,
    market: 'National',
    analyzedAt: '2025-06-01T00:00:00Z',
    pagesReviewed: [],
    findings: [],
    subserviceFindings: [],
    score: {
      competitorId: `a-${name}`, competitorName: name, serviceLineMatchScore: 0, subserviceDepthScore: 0,
      andwellDifferentiationScore: 0, competitorVisibilityScore: 0, evidenceStrengthScore: 0, reviewRiskScore: 0,
      threatLevel: 'Low overlap', strongestMatches: [], strongestAndwellAdvantages: [], needsReview: [],
      leadWith: [], executiveReadout: ''
    }
  };
}

describe('buildBattlecard', () => {
  it('returns a complete BattlecardTemplate with all required fields', () => {
    const result = buildBattlecard({
      competitor: 'Gentiva',
      county: 'York',
      serviceLine: 'Home Healthcare',
      audience: 'Hospital discharge planner',
      objection: 'We already work with another provider'
    });
    expect(result.competitor).toBe('Gentiva');
    expect(result.county).toBe('York');
    expect(result.serviceLine).toBe('Home Healthcare');
    expect(result.audience).toBe('Hospital discharge planner');
    expect(result.objection).toBe('We already work with another provider');
    expect(result.opening).toContain('Home Healthcare');
    expect(result.discoveryQuestions).toHaveLength(6);
    expect(result.positioning).toContain('Andwell');
    expect(result.objectionResponse).toContain('I understand your concern');
    expect(result.close).toContain('next step');
  });

  it('generates discharge barrier question for discharge planners', () => {
    const result = buildBattlecard({
      competitor: 'Amedisys',
      county: 'Cumberland',
      serviceLine: 'Home Healthcare',
      audience: 'Hospital discharge planner',
      objection: 'We do not have capacity'
    });
    expect(result.discoveryQuestions[5]).toContain('discharge barriers');
  });

  it('generates caregiver support question for family caregivers', () => {
    const result = buildBattlecard({
      competitor: 'Gentiva',
      county: 'York',
      serviceLine: 'Home Healthcare',
      audience: 'Family caregiver',
      objection: 'Your pricing is too high'
    });
    expect(result.discoveryQuestions[5]).toContain('biggest difference for your family');
  });

  it('generates outcome question for general audiences', () => {
    const result = buildBattlecard({
      competitor: 'Gentiva',
      county: 'York',
      serviceLine: 'Home Healthcare',
      audience: 'Facility administrator',
      objection: 'We handle this internally'
    });
    expect(result.discoveryQuestions[5]).toContain('outcomes matter most');
  });

  it('uses safeLanguage from catalog entry when service line matches', () => {
    const result = buildBattlecard({
      competitor: 'Gentiva',
      county: 'York',
      serviceLine: 'Home Healthcare',
      audience: 'Case manager',
      objection: 'Insurance does not cover this'
    });
    expect(result.positioning).toContain('Andwell publicly describes');
    expect((result as any).safeAngle).toBeUndefined();
  });

  it('falls back to generic description for unknown service line', () => {
    const result = buildBattlecard({
      competitor: 'Gentiva',
      county: 'York',
      serviceLine: 'Obscure Service',
      audience: 'Case manager',
      objection: 'We already work with another provider'
    });
    expect(result.positioning).toContain('provides');
    expect(result.opening).toContain('Obscure Service');
  });

  it('includes analysis and report data when provided', () => {
    const analysis = makeAnalysis('Gentiva');
    const result = buildBattlecard({
      competitor: 'Gentiva',
      county: 'York',
      serviceLine: 'Home Healthcare',
      audience: 'Hospital discharge planner',
      objection: 'We already work with another provider',
      analysis,
      report: {
        id: 'r1', generatedAt: '2025-06-01T00:00:00Z', baselineProvider: 'Andwell Health Partners' as const,
        competitorsAnalyzed: 1, pagesReviewed: 5, serviceLinesMapped: 3, subservicesMapped: 6,
        matchedServiceFindings: 4, potentialAndwellAdvantages: 2, humanReviewItems: 0,
        executiveSummary: '', executiveInsights: [], competitorScores: [], analyses: [],
        allFindings: [], allSubserviceFindings: [], crawlErrors: []
      }
    });
    expect(result.competitor).toBe('Gentiva');
  });
});

describe('getBuilderOptions', () => {
  it('returns default option arrays when no report is given', () => {
    const options = getBuilderOptions(null);
    expect(options.counties).toEqual(countyList);
    expect(options.audiences).toEqual(audienceOptions);
    expect(options.objections).toEqual(objectionOptions);
    expect(options.services.length).toBeGreaterThan(0);
    expect(options.competitors).toEqual([]);
  });

  it('returns empty competitors when report has no analyses', () => {
    const report = {
      id: 'r1', generatedAt: '2025-06-01T00:00:00Z', baselineProvider: 'Andwell Health Partners' as const,
      competitorsAnalyzed: 0, pagesReviewed: 0, serviceLinesMapped: 0, subservicesMapped: 0,
      matchedServiceFindings: 0, potentialAndwellAdvantages: 0, humanReviewItems: 0,
      executiveSummary: '', executiveInsights: [], competitorScores: [], analyses: [],
      allFindings: [], allSubserviceFindings: [], crawlErrors: []
    };
    const options = getBuilderOptions(report);
    expect(options.competitors).toEqual([]);
  });

  it('returns competitor names from report analyses', () => {
    const report = {
      id: 'r1', generatedAt: '2025-06-01T00:00:00Z', baselineProvider: 'Andwell Health Partners' as const,
      competitorsAnalyzed: 2, pagesReviewed: 5, serviceLinesMapped: 3, subservicesMapped: 6,
      matchedServiceFindings: 4, potentialAndwellAdvantages: 2, humanReviewItems: 0,
      executiveSummary: '', executiveInsights: [], competitorScores: [],
      analyses: [makeAnalysis('Gentiva'), makeAnalysis('Amedisys')],
      allFindings: [], allSubserviceFindings: [], crawlErrors: []
    };
    const options = getBuilderOptions(report);
    expect(options.competitors).toEqual(['Gentiva', 'Amedisys']);
  });
});

describe('exported constants', () => {
  it('countyList contains Maine counties', () => {
    expect(countyList).toContain('York');
    expect(countyList).toContain('Cumberland');
    expect(countyList).toHaveLength(16);
  });

  it('audienceOptions contains at least one audience', () => {
    expect(audienceOptions).toContain('Hospital discharge planner');
    expect(audienceOptions.length).toBeGreaterThanOrEqual(8);
  });

  it('objectionOptions contains common objections', () => {
    expect(objectionOptions).toContain('We already work with another provider');
    expect(objectionOptions.length).toBeGreaterThanOrEqual(10);
  });
});
