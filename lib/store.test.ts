import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { readStore, writeStore, saveCompetitors, saveReport, getReport, saveReview, saveCatalogOverride } from './store';
import type { HubStore } from './store';
import type { CompetitorInput, IntelligenceReport } from './types';

const mockMongoCollection = vi.hoisted(() => () => ({
  find: vi.fn().mockReturnThis(),
  sort: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  toArray: vi.fn().mockResolvedValue([]),
  findOne: vi.fn(),
  deleteMany: vi.fn().mockResolvedValue({}),
  insertMany: vi.fn().mockResolvedValue({}),
  updateOne: vi.fn().mockResolvedValue({}),
}));

vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./mongodb', () => ({
  getMongoDb: vi.fn().mockResolvedValue({ collection: vi.fn().mockReturnValue(mockMongoCollection()) }),
  isMongoConfigured: vi.fn().mockReturnValue(false),
}));

vi.mock('./supabase', () => ({
  getSupabaseClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    delete: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    upsert: vi.fn().mockResolvedValue({ error: null }),
  }),
  isSupabaseConfigured: vi.fn().mockReturnValue(false),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const sampleStore: HubStore = {
  version: 3,
  updatedAt: new Date().toISOString(),
  competitors: [{ name: 'Comp A', url: 'https://comp-a.com', market: 'ME' }],
  reports: [],
  reviews: [],
  catalogOverrides: [],
};

describe('readStore', () => {
  it('reads from JSON file when no database is configured', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(sampleStore));

    const result = await readStore();

    expect(mkdir).toHaveBeenCalled();
    expect(readFile).toHaveBeenCalled();
    expect(result.version).toBe(3);
    expect(result.competitors).toHaveLength(1);
    expect(result.competitors[0].name).toBe('Comp A');
  });

  it('creates initial store file on first read when file does not exist', async () => {
    vi.mocked(readFile).mockRejectedValue({ code: 'ENOENT' });

    const result = await readStore();

    expect(writeFile).toHaveBeenCalled();
    expect(result.version).toBe(3);
    expect(result.competitors).toEqual([]);
    expect(result.reports).toEqual([]);
    expect(result.reviews).toEqual([]);
    expect(result.catalogOverrides).toEqual([]);
  });

  it('falls back to defaults for missing fields in partial JSON', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ version: 3, updatedAt: new Date().toISOString() }));

    const result = await readStore();

    expect(result.competitors).toEqual([]);
    expect(result.reports).toEqual([]);
    expect(result.reviews).toEqual([]);
    expect(result.catalogOverrides).toEqual([]);
  });

  it('parses malformed JSON and falls back to empty store', async () => {
    vi.mocked(readFile).mockResolvedValue('not valid json');

    const result = await readStore();

    expect(writeFile).toHaveBeenCalled();
    expect(result.competitors).toEqual([]);
  });
});

describe('writeStore', () => {
  it('writes store to JSON file', async () => {
    const result = await writeStore(sampleStore);

    expect(mkdir).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalled();
    expect(result.updatedAt).toBeTruthy();
    expect(result.version).toBe(3);
  });

  it('updates updatedAt timestamp on write', async () => {
    const original = sampleStore.updatedAt;
    const result = await writeStore(sampleStore);

    expect(result.updatedAt).not.toBe(original);
  });
});

describe('saveCompetitors', () => {
  it('saves competitors and returns updated store', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(sampleStore));

    const competitors: CompetitorInput[] = [
      { name: 'Comp B', url: 'https://comp-b.com', market: 'NH' },
    ];

    const result = await saveCompetitors(competitors);

    expect(result.competitors.length).toBeGreaterThanOrEqual(1);
  });

  it('stores up to 500 competitors', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ ...sampleStore, competitors: [] }));

    const many = Array.from({ length: 600 }, (_, i) => ({
      name: `Comp ${i}`,
      url: `https://comp-${i}.com`,
    }));

    const result = await saveCompetitors(many);
    expect(result.competitors.length).toBeLessThanOrEqual(500);
  });

  it('filters out competitors without url', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ ...sampleStore, competitors: [] }));

    const result = await saveCompetitors([{ name: 'No URL' } as CompetitorInput]);
    expect(result.competitors).toHaveLength(0);
  });

  it('deduplicates competitors by url', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(sampleStore));

    const result = await saveCompetitors([
      { name: 'New Name', url: 'https://comp-a.com' },
    ]);

    const compAentries = result.competitors.filter((c) => c.url === 'https://comp-a.com');
    expect(compAentries).toHaveLength(1);
    expect(compAentries[0].name).toBe('New Name');
  });
});

describe('saveReport', () => {
  it('saves a report and returns updated store', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(sampleStore));

    const report: IntelligenceReport = {
      id: 'report_1',
      generatedAt: new Date().toISOString(),
      baselineProvider: 'Andwell Health Partners',
      competitorsAnalyzed: 1,
      pagesReviewed: 5,
      serviceLinesMapped: 3,
      subservicesMapped: 2,
      matchedServiceFindings: 4,
      potentialAndwellAdvantages: 2,
      humanReviewItems: 1,
      executiveSummary: 'Test report',
      executiveInsights: [],
      competitorScores: [],
      analyses: [{ name: 'Comp A', url: 'https://comp-a.com', market: 'ME' }] as any,
      allFindings: [],
      allSubserviceFindings: [],
      crawlErrors: [],
    };

    const result = await saveReport(report);

    expect(result.reports[0].id).toBe('report_1');
  });

  it('keeps only the latest 100 reports', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ ...sampleStore, reports: [] }));

    const reports = Array.from({ length: 110 }, (_, i) => ({
      id: `report_${i}_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      baselineProvider: 'Andwell Health Partners' as const,
      competitorsAnalyzed: 0,
      pagesReviewed: 0,
      serviceLinesMapped: 0,
      subservicesMapped: 0,
      matchedServiceFindings: 0,
      potentialAndwellAdvantages: 0,
      humanReviewItems: 0,
      executiveSummary: '',
      executiveInsights: [],
      competitorScores: [],
      analyses: [],
      allFindings: [],
      allSubserviceFindings: [],
      crawlErrors: [],
    }));

    let result: HubStore = { ...sampleStore, reports: [] as IntelligenceReport[] };
    for (const r of reports) {
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(result));
      result = await saveReport(r);
    }

    expect(result.reports.length).toBeLessThanOrEqual(100);
  });

  it('extracts competitors from report analyses', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ ...sampleStore, competitors: [] }));

    const report: IntelligenceReport = {
      id: 'report_2',
      generatedAt: new Date().toISOString(),
      baselineProvider: 'Andwell Health Partners',
      competitorsAnalyzed: 1,
      pagesReviewed: 0,
      serviceLinesMapped: 0,
      subservicesMapped: 0,
      matchedServiceFindings: 0,
      potentialAndwellAdvantages: 0,
      humanReviewItems: 0,
      executiveSummary: '',
      executiveInsights: [],
      competitorScores: [],
      analyses: [{ name: 'New Comp', url: 'https://new-comp.com', market: 'MA' }] as any,
      allFindings: [],
      allSubserviceFindings: [],
      crawlErrors: [],
    };

    const result = await saveReport(report);
    const comp = result.competitors.find((c) => c.url === 'https://new-comp.com');
    expect(comp).toBeDefined();
    if (comp) {
      expect(comp.name).toBe('New Comp');
    }
  });
});

describe('getReport', () => {
  it('returns null when report is not found', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(sampleStore));

    const result = await getReport('nonexistent');
    expect(result).toBeNull();
  });

  it('returns a report when it exists', async () => {
    const store = {
      ...sampleStore,
      reports: [{
        id: 'report_found',
        generatedAt: new Date().toISOString(),
        baselineProvider: 'Andwell Health Partners' as const,
        competitorsAnalyzed: 1,
        pagesReviewed: 0,
        serviceLinesMapped: 0,
        subservicesMapped: 0,
        matchedServiceFindings: 0,
        potentialAndwellAdvantages: 0,
        humanReviewItems: 0,
        executiveSummary: 'Found report',
        executiveInsights: [],
        competitorScores: [],
        analyses: [],
        allFindings: [],
        allSubserviceFindings: [],
        crawlErrors: [],
      }],
    };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(store));

    const result = await getReport('report_found');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.id).toBe('report_found');
      expect(result.executiveSummary).toBe('Found report');
    }
  });
});

describe('saveReview', () => {
  it('returns a review with generated id and updatedAt', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(sampleStore));

    const result = await saveReview({ findingId: 'finding_1', status: 'Approved for sales use' });

    expect(result.id).toContain('review_');
    expect(result.findingId).toBe('finding_1');
    expect(result.status).toBe('Approved for sales use');
    expect(result.updatedAt).toBeTruthy();
  });

  it('uses provided id when given', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(sampleStore));

    const result = await saveReview({ id: 'custom-id', findingId: 'f2', status: 'Needs edits' });

    expect(result.id).toBe('custom-id');
  });

  it('includes optional fields', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(sampleStore));

    const result = await saveReview({
      findingId: 'f3',
      status: 'Manager review suggested',
      note: 'Check the source',
      reviewer: 'Alice',
    });

    expect(result.note).toBe('Check the source');
    expect(result.reviewer).toBe('Alice');
  });
});

describe('saveCatalogOverride', () => {
  it('returns an override with updatedAt timestamp', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(sampleStore));

    const result = await saveCatalogOverride({
      serviceLine: 'Home Healthcare',
      description: 'Updated description',
      safeLanguage: 'Safe wording',
      avoid: 'Dont say this',
      approvalStatus: 'Approved',
    });

    expect(result.serviceLine).toBe('Home Healthcare');
    expect(result.description).toBe('Updated description');
    expect(result.updatedAt).toBeTruthy();
  });

  it('saves with minimal fields', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(sampleStore));

    const result = await saveCatalogOverride({ serviceLine: 'Therapy Care' });

    expect(result.serviceLine).toBe('Therapy Care');
    expect(result.approvalStatus).toBeUndefined();
  });
});
