'use client';

import { create } from 'zustand';
import type { CompetitorInput, IntelligenceReport } from '../types';
import type { GrowthScenario } from '../growth-plan';
import type { View, RoleView, MatrixFilter, ReportSummary, ApiCheck, AskResponse } from './types';
import { api, parseCompetitorEntries } from './utils';

type SetStateAction<T> = T | ((prev: T) => T);

function resolveAction<T>(arg: SetStateAction<T>, prev: T): T {
  return typeof arg === 'function' ? (arg as (p: T) => T)(prev) : arg;
}

export interface CommandCenterState {
  view: View;
  roleView: RoleView;
  matrixFilter: MatrixFilter;
  matrixSearch: string;
  competitors: CompetitorInput[];
  urlInput: string;
  reports: ReportSummary[];
  currentReport: IntelligenceReport | null;
  question: string;
  askResponse: AskResponse | null;
  diagnostics: ApiCheck[];
  busy: boolean;
  phase: string;
  error: string;
  notice: string;
  growthScenario: GrowthScenario;

  setView: (view: View) => void;
  setRoleView: (role: RoleView) => void;
  setMatrixFilter: (filter: MatrixFilter) => void;
  setMatrixSearch: (search: string) => void;
  setCompetitors: (competitors: SetStateAction<CompetitorInput[]>) => void;
  setUrlInput: (url: string) => void;
  setReports: (reports: SetStateAction<ReportSummary[]>) => void;
  setCurrentReport: (report: SetStateAction<IntelligenceReport | null>) => void;
  setQuestion: (q: string) => void;
  setAskResponse: (resp: SetStateAction<AskResponse | null>) => void;
  setDiagnostics: (checks: SetStateAction<ApiCheck[]>) => void;
  setGrowthScenario: (s: SetStateAction<GrowthScenario>) => void;
  setError: (e: string) => void;
  setNotice: (n: string) => void;

  clearLegacyBrowserStorage: () => void;
  refreshServerState: () => Promise<void>;
  addUrls: () => void;
  saveCompetitors: () => Promise<void>;
  runAnalysis: () => Promise<void>;
  loadReport: (id: string) => Promise<void>;
  askHub: () => Promise<void>;
  runDiagnostics: () => Promise<void>;
  exportJson: () => void;
}

export const growthDefaultScenario: GrowthScenario = {
  conversionRate: 0.75,
  hhCapture: [0.1, 0.15, 0.2] as [number, number, number],
  woundCapture: [0.25, 0.35, 0.45] as [number, number, number],
  therapyCapture: [0.2, 0.3, 0.4] as [number, number, number],
};

export const useCommandCenter = create<CommandCenterState>((set, get) => ({
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

  setView: (view) => set({ view }),
  setRoleView: (roleView) => set({ roleView }),
  setMatrixFilter: (matrixFilter) => set({ matrixFilter }),
  setMatrixSearch: (matrixSearch) => set({ matrixSearch }),
  setCompetitors: (competitors) => set((state) => ({ competitors: resolveAction(competitors, state.competitors) })),
  setReports: (reports) => set((state) => ({ reports: resolveAction(reports, state.reports) })),
  setCurrentReport: (currentReport) => set((state) => ({ currentReport: resolveAction(currentReport, state.currentReport) })),
  setAskResponse: (askResponse) => set((state) => ({ askResponse: resolveAction(askResponse, state.askResponse) })),
  setDiagnostics: (diagnostics) => set((state) => ({ diagnostics: resolveAction(diagnostics, state.diagnostics) })),
  setUrlInput: (url) => set({ urlInput: url }),
  setQuestion: (q) => set({ question: q }),
  setGrowthScenario: (arg) => set((state) => ({ growthScenario: resolveAction(arg, state.growthScenario) })),
  setError: (error) => set({ error }),
  setNotice: (notice) => set({ notice }),

  clearLegacyBrowserStorage: () => {
    try {
      ['andwellReports', 'andwellReport', 'andwellCompetitiveReports', 'competitiveIntelligenceReports'].forEach((key) => {
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
      });
      set({ notice: 'Legacy browser report storage cleared.' });
    } catch {
      set({ notice: 'Browser storage was unavailable, but the app does not require local report storage.' });
    }
  },

  refreshServerState: async () => {
    set({ busy: true, phase: 'Load data', error: '', notice: '' });
    try {
      const competitorResponse = await api<{ competitors: CompetitorInput[] }>('/api/competitors');
      const reportResponse = await api<{ reports: ReportSummary[] }>('/api/reports');
      set({
        competitors: competitorResponse.competitors || [],
        reports: reportResponse.reports || [],
        notice: 'Server state loaded successfully.',
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Unable to load server state.' });
    } finally {
      set({ busy: false, phase: 'Ready' });
    }
  },

  addUrls: () => {
    const { urlInput, competitors } = get();
    const next = parseCompetitorEntries(urlInput).slice(0, Math.max(0, 25 - competitors.length));
    set({ competitors: [...competitors, ...next], urlInput: '' });
  },

  saveCompetitors: async () => {
    set({ busy: true, phase: 'Save library', error: '', notice: '' });
    try {
      const { competitors } = get();
      const response = await api<{ competitors: CompetitorInput[] }>('/api/competitors', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ competitors }),
      });
      set({ competitors: response.competitors || [], notice: 'Competitor library saved on the server.' });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Unable to save competitors.' });
    } finally {
      set({ busy: false, phase: 'Ready' });
    }
  },

  runAnalysis: async () => {
    set({ busy: true, error: '', notice: '', askResponse: null });
    try {
      const { competitors } = get();
      if (!competitors.length) throw new Error('Add at least one competitor URL first.');
      set({ phase: 'Validate URLs' });
      await new Promise((resolve) => setTimeout(resolve, 80));
      set({ phase: 'Crawl pages' });
      const report = await api<IntelligenceReport>('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ competitors, maxPagesPerSite: 8, save: true, useAI: true }),
      });
      set({ phase: 'Build brief', currentReport: report });
      set({
        notice: report.expertBrief
          ? 'Foremost expert analysis completed and saved on the server.'
          : 'Analysis completed. Run a fresh scan after deployment to generate the full expert brief.',
        view: report.expertBrief ? 'expert' : 'dashboard',
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Analysis failed.' });
    } finally {
      set({ busy: false, phase: 'Ready' });
    }
  },

  loadReport: async (id: string) => {
    set({ busy: true, phase: 'Load report', error: '', notice: '' });
    try {
      const response = await api<{ report: IntelligenceReport }>(`/api/reports?id=${encodeURIComponent(id)}`);
      set({ currentReport: response.report, notice: 'Stored report loaded.' });
      set({ view: response.report.expertBrief ? 'expert' : 'dashboard' });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Unable to load report.' });
    } finally {
      set({ busy: false, phase: 'Ready' });
    }
  },

  askHub: async () => {
    set({ busy: true, phase: 'Ask the Hub', error: '', askResponse: null });
    try {
      const { question, currentReport } = get();
      const response = await api<AskResponse>('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question, reportId: currentReport?.id }),
      });
      set({ askResponse: response });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Ask the Hub failed.' });
    } finally {
      set({ busy: false, phase: 'Ready' });
    }
  },

  runDiagnostics: async () => {
    set({ busy: true, phase: 'System Check', error: '', diagnostics: [] });
    const routes = ['/api/version', '/api/health', '/api/diagnostics', '/api/analyze', '/api/expert', '/api/competitors', '/api/reports', '/api/reviews', '/api/catalog', '/api/ask', '/api/runtime'];
    const results: ApiCheck[] = [];
    for (const route of routes) {
      try {
        const response = await fetch(route, { headers: { accept: 'application/json' }, cache: 'no-store' });
        const text = await response.text();
        const trimmed = text.trim();
        const isHtml = trimmed.startsWith('<');
        results.push({ route, ok: response.ok && !isHtml, status: response.status, message: isHtml ? 'Returned HTML instead of JSON' : 'Returned JSON or text', preview: text.slice(0, 180).replace(/\s+/g, ' ') });
      } catch (err) {
        results.push({ route, ok: false, status: 0, message: err instanceof Error ? err.message : 'Request failed' });
      }
    }
    set({ diagnostics: results, busy: false, phase: 'Ready' });
  },

  exportJson: () => {
    const { currentReport } = get();
    if (!currentReport) return;
    const blob = new Blob([JSON.stringify(currentReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'andwell-competitive-intelligence-report.json';
    try { link.click(); }
    finally { URL.revokeObjectURL(url); }
  },
}));
