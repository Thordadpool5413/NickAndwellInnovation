import { describe, it, expect } from 'vitest';
import { normalizeExtraction, isAIExtractionConfigured } from './ai-extractor';
import type { CompetitorInput, CrawledPage } from './types';

function makePage(overrides?: Partial<CrawledPage>): CrawledPage {
  return { url: 'https://competitor.com', title: 'Test', text: 'sample text', excerpt: 'sample', ...overrides };
}

const defaultInput: CompetitorInput = { url: 'https://competitor.com', name: 'Test Provider' };

describe('normalizeExtraction', () => {
  it('fills providerName from raw when input name is absent', () => {
    const input: CompetitorInput = { url: 'https://example.com' };
    const raw = { providerName: 'Acme Health' };
    const result = normalizeExtraction(raw, input, [makePage()]);
    expect(result.providerName).toBe('Acme Health');
  });

  it('uses input name over raw providerName', () => {
    const raw = { providerName: 'Wrong Name' };
    const result = normalizeExtraction(raw, defaultInput, [makePage()]);
    expect(result.providerName).toBe('Test Provider');
  });

  it('defaults empty strings to fallback', () => {
    const raw = { providerName: '', leadershipSummary: '' };
    const result = normalizeExtraction(raw, defaultInput, [makePage()]);
    expect(result.providerName).toBe('Test Provider');
    expect(result.leadershipSummary).toBe('AI leadership summary was not returned.');
  });

  it('normalizes servicesMentioned to array of strings', () => {
    const raw = { servicesMentioned: ['Hospice', 'Home Health', ''] };
    const result = normalizeExtraction(raw, defaultInput, [makePage()]);
    expect(result.servicesMentioned).toEqual(['Hospice', 'Home Health']);
  });

  it('handles non-array fields gracefully', () => {
    const raw = { servicesMentioned: 'not an array', proofPoints: null };
    const result = normalizeExtraction(raw, defaultInput, [makePage()]);
    expect(result.servicesMentioned).toEqual([]);
    expect(result.proofPoints).toEqual([]);
  });

  it('clamps depthScore to 0-100', () => {
    const raw = { serviceLineDepth: [{ serviceLine: 'Hospice', depthScore: 150, evidenceStrength: 'Strong', status: 'Clearly offered', sourceCount: 5, matchRationale: 'test', summary: 'test', competitorAdvantages: [], andwellAdvantages: [], proofPoints: [], referralCallsToAction: [], reviewRisk: 'Low' }] };
    const result = normalizeExtraction(raw, defaultInput, [makePage()]);
    expect(result.serviceLineDepth[0].depthScore).toBe(100);
  });

  it('assigns valid status from allowed values', () => {
    const raw = { subserviceDepth: [{ serviceLine: 'Hospice', subservice: 'Pain management', status: 'Clearly offered', confidence: 'High', evidenceStrength: 'Strong', sourceCount: 3, matchRationale: 'test', evidenceExcerpt: 'test', safeSalesLanguage: 'safe', doNotSayLanguage: 'avoid' }] };
    const result = normalizeExtraction(raw, defaultInput, [makePage()]);
    expect(result.subserviceDepth[0].status).toBe('Clearly offered');
  });

  it('falls back to Needs human review for invalid status', () => {
    const raw = { subserviceDepth: [{ serviceLine: 'Hospice', subservice: 'Pain', status: 'Invalid status', confidence: 'High', evidenceStrength: 'Strong', sourceCount: 1, matchRationale: 'test', evidenceExcerpt: 'test', safeSalesLanguage: 'safe', doNotSayLanguage: 'avoid' }] };
    const result = normalizeExtraction(raw, defaultInput, [makePage()]);
    expect(result.subserviceDepth[0].status).toBe('Needs human review');
  });

  it('filters pageEvidence items without a url', () => {
    const raw = { pageEvidence: [{ url: '', title: 'No URL page', pageType: 'General page', servicesFound: [], proofPoints: [], referralSignals: [], limitations: [] }] };
    const result = normalizeExtraction(raw, defaultInput, [makePage()]);
    expect(result.pageEvidence).toHaveLength(0);
  });

  it('preserves valid pageEvidence entries', () => {
    const raw = { pageEvidence: [{ url: 'https://competitor.com/service', title: 'Services', pageType: 'Service page', servicesFound: ['Hospice'], proofPoints: ['24/7 care'], referralSignals: ['call us'], limitations: [] }] };
    const result = normalizeExtraction(raw, defaultInput, [makePage()]);
    expect(result.pageEvidence).toHaveLength(1);
    expect(result.pageEvidence[0].pageType).toBe('Service page');
  });

  it('sets rawConfidence to Low for invalid values', () => {
    const raw = { rawConfidence: 'Very High' };
    const result = normalizeExtraction(raw, defaultInput, [makePage()]);
    expect(result.rawConfidence).toBe('Low');
  });
});

describe('isAIExtractionConfigured', () => {
  it('returns false when no API key set', () => {
    const prev = process.env.LLM_PROVIDER;
    delete process.env.LLM_PROVIDER;
    const prevKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    expect(isAIExtractionConfigured()).toBe(false);
    if (prevKey) process.env.OPENAI_API_KEY = prevKey;
    if (prev) process.env.LLM_PROVIDER = prev;
  });
});
