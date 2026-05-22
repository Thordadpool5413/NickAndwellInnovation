import { describe, it, expect } from 'vitest';
import { buildScore, buildReport, analyzeCompetitor } from './analysis';
import type { CrawledPage, CompetitorInput, CompetitorAnalysis } from './types';

function makePage(text: string, overrides?: Partial<CrawledPage>): CrawledPage {
  return { url: 'https://example.com', title: 'Test', text, excerpt: text.slice(0, 900), ...overrides };
}

function makeInput(overrides?: Partial<CompetitorInput>): CompetitorInput {
  return { url: 'https://example.com', name: 'Test Competitor', ...overrides };
}

describe('analyzeCompetitor', () => {
  it('returns a CompetitorAnalysis with id, name, and score', () => {
    const pages = [makePage('we offer hospice and palliative care services')];
    const result = analyzeCompetitor(makeInput({ name: 'Acme Health' }), pages, 0);
    expect(result.id).toContain('competitor_');
    expect(result.name).toBe('Acme Health');
    expect(result.score).toBeDefined();
    expect(result.score.competitorName).toBe('Acme Health');
    expect(result.findings.length).toBeGreaterThan(0);
  });

  it('defaults to nameFromUrl when name is missing', () => {
    const pages = [makePage('some random content')];
    const result = analyzeCompetitor(makeInput({ name: undefined, url: 'https://unknown.com' }), pages, 0);
    expect(result.name).toBe('Unknown');
  });

  it('produces subservice findings', () => {
    const pages = [makePage('home health skilled nursing therapy')];
    const result = analyzeCompetitor(makeInput({ name: 'HomeCo' }), pages, 0);
    expect(result.subserviceFindings.length).toBeGreaterThan(0);
  });

  it('classifies clear service presence when text matches heavily', () => {
    const text = Array(20).fill('hospice home hospice comfort care end of life pain management symptom control bereavement chaplain grief support').join(' ');
    const pages = [makePage(text, { pageType: 'Service page' })];
    const result = analyzeCompetitor(makeInput({ name: 'HospiceCo' }), pages, 0);
    const hospice = result.findings.find((f) => f.serviceLine === 'Hospice Home Care');
    expect(hospice).toBeDefined();
    if (hospice) {
      expect(['Clearly offered', 'Mentioned only']).toContain(hospice.competitorStatus);
    }
  });

  it('classifies not found when text has no service terms', () => {
    const pages = [makePage('this is a generic page about nothing in particular')];
    const result = analyzeCompetitor(makeInput({ name: 'EmptyCo' }), pages, 0);
    const hospice = result.findings.find((f) => f.serviceLine === 'Hospice Home Care');
    expect(hospice).toBeDefined();
    if (hospice) {
      expect(hospice.competitorStatus).toBe('Not found publicly');
    }
  });
});

describe('buildScore', () => {
  it('returns 0 for serviceLineMatchScore when no findings match', () => {
    const analysis: Omit<CompetitorAnalysis, 'score'> = {
      id: 'test',
      name: 'Test',
      url: 'https://example.com',
      market: 'ME',
      analyzedAt: new Date().toISOString(),
      pagesReviewed: [makePage('no match content')],
      findings: [],
      subserviceFindings: [],
    };
    const score = buildScore(analysis);
    expect(score.serviceLineMatchScore).toBe(0);
    expect(score.andwellDifferentiationScore).toBe(0);
    expect(score.threatLevel).toBe('Low overlap');
  });

  it('computes visibility score based on pages reviewed', () => {
    const pages = Array.from({ length: 12 }, (_, i) => makePage(`page ${i} content`));
    const analysis: Omit<CompetitorAnalysis, 'score'> = {
      id: 'test', name: 'Test', url: 'https://example.com', market: 'ME',
      analyzedAt: new Date().toISOString(), pagesReviewed: pages, findings: [], subserviceFindings: [],
    };
    const score = buildScore(analysis);
    expect(score.competitorVisibilityScore).toBe(50);
  });
});

describe('buildReport', () => {
  it('produces a report with correct structure', () => {
    const pages = [makePage('hospice and palliative care services')];
    const analysis = analyzeCompetitor(makeInput({ name: 'TestCo' }), pages, 0);
    const report = buildReport([analysis], []);
    expect(report.id).toContain('report_');
    expect(report.competitorsAnalyzed).toBe(1);
    expect(report.competitorScores.length).toBe(1);
    expect(report.executiveInsights.length).toBeGreaterThan(0);
    expect(report.executiveSummary).toContain('TestCo');
  });

  it('includes crawl errors in report', () => {
    const analysis = analyzeCompetitor(makeInput({ name: 'TestCo' }), [makePage('content')], 0);
    const report = buildReport([analysis], [{ url: 'https://error.com', error: 'HTTP 500' }]);
    expect(report.crawlErrors).toHaveLength(1);
    expect(report.crawlErrors[0].error).toBe('HTTP 500');
  });
});
