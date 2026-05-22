import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';

const testDir = path.join(process.cwd(), '.data-test-integration');

beforeEach(async () => {
  vi.stubEnv('CIH_DATA_DIR', testDir);
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
});

afterEach(() => {
  vi.unstubAllEnvs();
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
});

describe('store integration: JSON file persistence (no mocks)', () => {
  it('readStore creates initial file on first call', async () => {
    const { readStore } = await import('./store');
    const store = await readStore();
    expect(store.version).toBe(3);
    expect(store.competitors).toEqual([]);
    expect(store.reports).toEqual([]);
    expect(fs.existsSync(testDir)).toBe(true);
  });

  it('saveCompetitors persists and can be read back', async () => {
    const { readStore, saveCompetitors } = await import('./store');
    await saveCompetitors([
      { url: 'https://competitor-a.com', name: 'Competitor A', market: 'Maine' },
      { url: 'https://competitor-b.com', name: 'Competitor B' },
    ]);
    const store = await readStore();
    expect(store.competitors).toHaveLength(2);
    expect(store.competitors[0].url).toBe('https://competitor-a.com');
    expect(store.competitors[0].name).toBe('Competitor A');
  });

  it('saveCompetitors deduplicates by URL', async () => {
    const { readStore, saveCompetitors } = await import('./store');
    await saveCompetitors([
      { url: 'https://competitor-a.com', name: 'Competitor A' },
      { url: 'https://competitor-a.com', name: 'Competitor A Updated' },
    ]);
    const store = await readStore();
    expect(store.competitors).toHaveLength(1);
    expect(store.competitors[0].name).toBe('Competitor A Updated');
  });

  it('saveCompetitors caps at 500', async () => {
    const { readStore, saveCompetitors } = await import('./store');
    const many = Array.from({ length: 600 }, (_, i) => ({ url: `https://competitor-${i}.com`, name: `Competitor ${i}` }));
    await saveCompetitors(many);
    const store = await readStore();
    expect(store.competitors).toHaveLength(500);
  });

  it('saveReport persists report and associated competitors', async () => {
    const { readStore, saveReport } = await import('./store');
    const report = {
      id: 'report-1',
      generatedAt: new Date().toISOString(),
      baselineProvider: 'Andwell Health Partners' as const,
      competitorsAnalyzed: 1,
      pagesReviewed: 5,
      serviceLinesMapped: 1,
      subservicesMapped: 2,
      matchedServiceFindings: 3,
      potentialAndwellAdvantages: 2,
      humanReviewItems: 1,
      executiveSummary: 'Test',
      executiveInsights: [],
      competitorScores: [],
      analyses: [
        {
          id: 'analysis-1', name: 'Competitor X', url: 'https://competitor-x.com', market: 'Maine',
          analyzedAt: new Date().toISOString(), pagesReviewed: [], findings: [], subserviceFindings: [],
          score: {
            competitorId: 'analysis-1', competitorName: 'Competitor X', serviceLineMatchScore: 0,
            subserviceDepthScore: 0, andwellDifferentiationScore: 0, competitorVisibilityScore: 0,
            evidenceStrengthScore: 0, reviewRiskScore: 0, threatLevel: 'Low overlap' as const,
            strongestMatches: [], strongestAndwellAdvantages: [], needsReview: [], leadWith: [],
            executiveReadout: '',
          },
        },
      ],
      allFindings: [], allSubserviceFindings: [], crawlErrors: [],
    };
    await saveReport(report);
    const store = await readStore();
    expect(store.reports).toHaveLength(1);
    expect(store.reports[0].id).toBe('report-1');
    expect(store.competitors).toHaveLength(1);
    expect(store.competitors[0].url).toBe('https://competitor-x.com');
  });

  it('getReport returns null for missing report', async () => {
    const { getReport } = await import('./store');
    const result = await getReport('nonexistent');
    expect(result).toBeNull();
  });

  it('getReport returns saved report', async () => {
    const { saveReport, getReport } = await import('./store');
    const report = {
      id: 'report-find-me',
      generatedAt: new Date().toISOString(),
      baselineProvider: 'Andwell Health Partners' as const,
      competitorsAnalyzed: 0, pagesReviewed: 0, serviceLinesMapped: 0, subservicesMapped: 0,
      matchedServiceFindings: 0, potentialAndwellAdvantages: 0, humanReviewItems: 0,
      executiveSummary: 'Find me', executiveInsights: [], competitorScores: [], analyses: [],
      allFindings: [], allSubserviceFindings: [], crawlErrors: [],
    };
    await saveReport(report);
    const found = await getReport('report-find-me');
    expect(found).not.toBeNull();
    expect(found!.id).toBe('report-find-me');
    expect(found!.executiveSummary).toBe('Find me');
  });

  it('saveReview persists and updates existing findingId', async () => {
    const { readStore, saveReview } = await import('./store');
    const review = { findingId: 'finding-1', status: 'Approved for sales use', note: 'Looks good' } as const;
    await saveReview(review);
    const updated = { findingId: 'finding-1', status: 'Rejected', note: 'Needs more evidence' } as const;
    await saveReview(updated);
    const store = await readStore();
    expect(store.reviews).toHaveLength(1);
    expect(store.reviews[0].findingId).toBe('finding-1');
    expect(store.reviews[0].status).toBe('Rejected');
  });

  it('saveCatalogOverride persists overrides', async () => {
    const { readStore, saveCatalogOverride } = await import('./store');
    await saveCatalogOverride({ serviceLine: 'Home Health', description: 'Test service', approvalStatus: 'Draft' });
    const store = await readStore();
    expect(store.catalogOverrides).toHaveLength(1);
    expect(store.catalogOverrides[0].serviceLine).toBe('Home Health');
  });
});
