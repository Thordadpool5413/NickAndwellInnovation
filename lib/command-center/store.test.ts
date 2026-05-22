import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCommandCenter, growthDefaultScenario } from './store';
import type { CompetitorInput, IntelligenceReport } from '../types';
import type { ReportSummary, AskResponse, ApiCheck } from './types';

vi.mock('./utils', () => ({
  api: vi.fn(),
  parseCompetitorEntries: vi.fn(),
}));

const { api, parseCompetitorEntries } = await vi.importMock<{
  api: typeof import('./utils').api;
  parseCompetitorEntries: typeof import('./utils').parseCompetitorEntries;
}>('./utils');

function makeReportSummary(overrides?: Partial<ReportSummary>): ReportSummary {
  return {
    id: 'r1',
    generatedAt: '2025-01-01',
    competitorsAnalyzed: 2,
    pagesReviewed: 10,
    potentialAndwellAdvantages: 3,
    humanReviewItems: 1,
    competitors: ['A', 'B'],
    executiveSummary: 'Summary',
    ...overrides,
  };
}

function makeReport(overrides?: Partial<IntelligenceReport>): IntelligenceReport {
  return {
    id: 'rep1',
    generatedAt: '2025-01-01',
    baselineProvider: 'Andwell Health Partners',
    competitorsAnalyzed: 1,
    pagesReviewed: 5,
    serviceLinesMapped: 3,
    subservicesMapped: 10,
    matchedServiceFindings: 8,
    potentialAndwellAdvantages: 2,
    humanReviewItems: 1,
    executiveSummary: 'Test report',
    executiveInsights: [],
    competitorScores: [],
    analyses: [],
    allFindings: [],
    allSubserviceFindings: [],
    crawlErrors: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  useCommandCenter.setState({
    view: 'home',
    roleView: 'Executive',
    matrixFilter: 'all',
    matrixSearch: '',
    competitors: [],
    urlInput: '',
    reports: [],
    currentReport: null,
    question: '',
    askResponse: null,
    diagnostics: [],
    busy: false,
    phase: 'Ready',
    error: '',
    notice: '',
    growthScenario: growthDefaultScenario,
  });
});

describe('useCommandCenter', () => {
  it('has initial default state', () => {
    const state = useCommandCenter.getState();
    expect(state.view).toBe('home');
    expect(state.roleView).toBe('Executive');
    expect(state.matrixFilter).toBe('all');
    expect(state.matrixSearch).toBe('');
    expect(state.competitors).toEqual([]);
    expect(state.urlInput).toBe('');
    expect(state.reports).toEqual([]);
    expect(state.currentReport).toBeNull();
    expect(state.question).toBe('');
    expect(state.askResponse).toBeNull();
    expect(state.diagnostics).toEqual([]);
    expect(state.busy).toBe(false);
    expect(state.phase).toBe('Ready');
    expect(state.error).toBe('');
    expect(state.notice).toBe('');
    expect(state.growthScenario).toEqual(growthDefaultScenario);
  });

  it('setView updates view', () => {
    useCommandCenter.getState().setView('dashboard');
    expect(useCommandCenter.getState().view).toBe('dashboard');
  });

  it('setRoleView updates roleView', () => {
    useCommandCenter.getState().setRoleView('Admin');
    expect(useCommandCenter.getState().roleView).toBe('Admin');
  });

  it('setMatrixFilter updates matrixFilter', () => {
    useCommandCenter.getState().setMatrixFilter('review');
    expect(useCommandCenter.getState().matrixFilter).toBe('review');
  });

  it('setMatrixSearch updates matrixSearch', () => {
    useCommandCenter.getState().setMatrixSearch('hospice');
    expect(useCommandCenter.getState().matrixSearch).toBe('hospice');
  });

  it('setCompetitors replaces array value', () => {
    const comps: CompetitorInput[] = [{ url: 'https://example.com', name: 'Test' }];
    useCommandCenter.getState().setCompetitors(comps);
    expect(useCommandCenter.getState().competitors).toEqual(comps);
  });

  it('setCompetitors accepts updater function', () => {
    useCommandCenter.getState().setCompetitors([{ url: 'https://a.com', name: 'A' }]);
    useCommandCenter.getState().setCompetitors((prev) => [...prev, { url: 'https://b.com', name: 'B' }]);
    expect(useCommandCenter.getState().competitors).toHaveLength(2);
  });

  it('setUrlInput updates urlInput', () => {
    useCommandCenter.getState().setUrlInput('https://competitor.com');
    expect(useCommandCenter.getState().urlInput).toBe('https://competitor.com');
  });

  it('setReports updates reports', () => {
    const reports = [makeReportSummary()];
    useCommandCenter.getState().setReports(reports);
    expect(useCommandCenter.getState().reports).toEqual(reports);
  });

  it('setCurrentReport updates currentReport', () => {
    const report = makeReport();
    useCommandCenter.getState().setCurrentReport(report);
    expect(useCommandCenter.getState().currentReport?.id).toBe('rep1');
  });

  it('setCurrentReport accepts null', () => {
    useCommandCenter.getState().setCurrentReport(makeReport());
    useCommandCenter.getState().setCurrentReport(null);
    expect(useCommandCenter.getState().currentReport).toBeNull();
  });

  it('setQuestion updates question', () => {
    useCommandCenter.getState().setQuestion('What are our top threats?');
    expect(useCommandCenter.getState().question).toBe('What are our top threats?');
  });

  it('setAskResponse updates askResponse', () => {
    const resp: AskResponse = { answer: 'Test answer', confidence: 'High' };
    useCommandCenter.getState().setAskResponse(resp);
    expect(useCommandCenter.getState().askResponse).toEqual(resp);
  });

  it('setDiagnostics updates diagnostics', () => {
    const checks: ApiCheck[] = [{ route: '/api/health', ok: true, status: 200, message: 'OK' }];
    useCommandCenter.getState().setDiagnostics(checks);
    expect(useCommandCenter.getState().diagnostics).toHaveLength(1);
  });

  it('setGrowthScenario replaces scenario', () => {
    const alt = { conversionRate: 0.5, hhCapture: [0.2, 0.25, 0.3] as [number, number, number], woundCapture: [0.3, 0.4, 0.5] as [number, number, number], therapyCapture: [0.25, 0.35, 0.45] as [number, number, number] };
    useCommandCenter.getState().setGrowthScenario(alt);
    expect(useCommandCenter.getState().growthScenario.conversionRate).toBe(0.5);
  });

  it('setError and setNotice update error and notice', () => {
    useCommandCenter.getState().setError('Something went wrong');
    useCommandCenter.getState().setNotice('Action completed');
    expect(useCommandCenter.getState().error).toBe('Something went wrong');
    expect(useCommandCenter.getState().notice).toBe('Action completed');
  });

  it('clearLegacyBrowserStorage removes keys and sets notice', () => {
    const removeItem = vi.fn();
    vi.stubGlobal('window', { localStorage: { removeItem }, sessionStorage: { removeItem } } as any);
    useCommandCenter.getState().clearLegacyBrowserStorage();
    expect(removeItem).toHaveBeenCalledTimes(8);
    expect(useCommandCenter.getState().notice).toBe('Legacy browser report storage cleared.');
    vi.unstubAllGlobals();
  });

  it('clearLegacyBrowserStorage handles error gracefully', () => {
    vi.stubGlobal('window', {} as any);
    useCommandCenter.getState().clearLegacyBrowserStorage();
    expect(useCommandCenter.getState().notice).toBe('Browser storage was unavailable, but the app does not require local report storage.');
    vi.unstubAllGlobals();
  });

  it('addUrls parses input and appends competitors up to 25', () => {
    vi.mocked(parseCompetitorEntries).mockReturnValue([{ url: 'https://added.com', name: 'Added', market: 'Needs review' }]);
    useCommandCenter.setState({ urlInput: 'https://added.com' });
    useCommandCenter.getState().addUrls();
    expect(useCommandCenter.getState().competitors).toHaveLength(1);
    expect(useCommandCenter.getState().urlInput).toBe('');
  });

  it('addUrls caps competitors at 25', () => {
    const existing = Array.from({ length: 24 }, (_, i) => ({ url: `https://c${i}.com`, name: `C${i}`, market: 'ME' }));
    useCommandCenter.setState({ competitors: existing, urlInput: 'https://new.com\nhttps://new2.com' });
    vi.mocked(parseCompetitorEntries).mockReturnValue([
      { url: 'https://new.com', name: 'New', market: 'Needs review' },
      { url: 'https://new2.com', name: 'New2', market: 'Needs review' },
    ]);
    useCommandCenter.getState().addUrls();
    expect(useCommandCenter.getState().competitors).toHaveLength(25);
  });

  it('refreshServerState loads competitors and reports', async () => {
    vi.mocked(api).mockResolvedValueOnce({ competitors: [{ url: 'https://srv.com', name: 'Server', market: 'ME' }] });
    vi.mocked(api).mockResolvedValueOnce({ reports: [makeReportSummary()] });
    await useCommandCenter.getState().refreshServerState();
    expect(useCommandCenter.getState().competitors).toHaveLength(1);
    expect(useCommandCenter.getState().reports).toHaveLength(1);
    expect(useCommandCenter.getState().busy).toBe(false);
    expect(useCommandCenter.getState().notice).toBe('Server state loaded successfully.');
  });

  it('refreshServerState handles error', async () => {
    vi.mocked(api).mockRejectedValue(new Error('Network error'));
    await useCommandCenter.getState().refreshServerState();
    expect(useCommandCenter.getState().error).toBe('Network error');
    expect(useCommandCenter.getState().busy).toBe(false);
  });

  it('saveCompetitors posts competitors to server', async () => {
    useCommandCenter.setState({ competitors: [{ url: 'https://c.com', name: 'C', market: 'ME' }] });
    vi.mocked(api).mockResolvedValue({ competitors: [{ url: 'https://c.com', name: 'C', market: 'ME' }] });
    await useCommandCenter.getState().saveCompetitors();
    expect(api).toHaveBeenCalledWith('/api/competitors', expect.objectContaining({ method: 'POST' }));
    expect(useCommandCenter.getState().notice).toBe('Competitor library saved on the server.');
  });

  it('runAnalysis throws when no competitors', async () => {
    await useCommandCenter.getState().runAnalysis();
    expect(useCommandCenter.getState().error).toBe('Add at least one competitor URL first.');
    expect(useCommandCenter.getState().busy).toBe(false);
  });

  it('runAnalysis succeeds and navigates to expert view', async () => {
    useCommandCenter.setState({ competitors: [{ url: 'https://c.com', name: 'C', market: 'ME' }] });
    const report = makeReport({ expertBrief: { expertVersion: '1', generatedAt: '', expertScore: 85, marketPosture: '', expertSummary: '', leadershipDecision: '', salesCoachingPriority: '', fastestFieldMove: '', governanceWarning: '', strongestThreats: [], bestOpportunities: [], recommendations: [], fieldPlays: [], watchlist: [] } });
    vi.mocked(api).mockResolvedValue(report);
    await useCommandCenter.getState().runAnalysis();
    expect(useCommandCenter.getState().currentReport?.id).toBe('rep1');
    expect(useCommandCenter.getState().view).toBe('expert');
  });

  it('runAnalysis navigates to dashboard when no expert brief', async () => {
    useCommandCenter.setState({ competitors: [{ url: 'https://c.com', name: 'C', market: 'ME' }] });
    vi.mocked(api).mockResolvedValue(makeReport());
    await useCommandCenter.getState().runAnalysis();
    expect(useCommandCenter.getState().view).toBe('dashboard');
  });

  it('loadReport loads a stored report', async () => {
    vi.mocked(api).mockResolvedValue({ report: makeReport({ expertBrief: undefined }) });
    await useCommandCenter.getState().loadReport('rep1');
    expect(useCommandCenter.getState().currentReport?.id).toBe('rep1');
    expect(useCommandCenter.getState().view).toBe('dashboard');
  });

  it('loadReport handles error', async () => {
    vi.mocked(api).mockRejectedValue(new Error('Not found'));
    await useCommandCenter.getState().loadReport('bad-id');
    expect(useCommandCenter.getState().error).toBe('Not found');
  });

  it('askHub sends question and stores response', async () => {
    useCommandCenter.setState({ question: 'What is our threat level?', currentReport: makeReport() });
    const askResp: AskResponse = { answer: 'Low threat', confidence: 'High', evidence: [] };
    vi.mocked(api).mockResolvedValue(askResp);
    await useCommandCenter.getState().askHub();
    expect(useCommandCenter.getState().askResponse?.answer).toBe('Low threat');
    expect(useCommandCenter.getState().busy).toBe(false);
  });

  it('runDiagnostics checks all routes', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('{"status":"ok"}') });
    vi.stubGlobal('fetch', mockFetch);
    await useCommandCenter.getState().runDiagnostics();
    const checks = useCommandCenter.getState().diagnostics;
    expect(checks.length).toBe(11);
    expect(checks.every((c) => c.ok)).toBe(true);
    expect(useCommandCenter.getState().busy).toBe(false);
    vi.unstubAllGlobals();
  });

  it('exportJson does nothing when no currentReport', () => {
    useCommandCenter.setState({ currentReport: null });
    const click = vi.fn();
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:url'), revokeObjectURL: vi.fn() });
    vi.stubGlobal('document', { createElement: vi.fn(() => ({ href: '', download: '', click })) });
    useCommandCenter.getState().exportJson();
    expect(click).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('exportJson triggers download', () => {
    useCommandCenter.setState({ currentReport: makeReport() });
    const click = vi.fn();
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:url'), revokeObjectURL: vi.fn() });
    vi.stubGlobal('document', { createElement: vi.fn(() => ({ href: '', download: '', click })) });
    useCommandCenter.getState().exportJson();
    expect(click).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
