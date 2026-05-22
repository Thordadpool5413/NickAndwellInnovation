import { describe, it, expect } from 'vitest';
import { computeConfidenceDetails, scoreEvidenceItem, questionTerms, weightedTextScore, pageIntelligenceScore, rankEvidenceForQuestion } from './smart-ranking';

describe('computeConfidenceDetails', () => {
  it('returns High when all signals positive', () => {
    const result = computeConfidenceDetails({
      status: 'Clearly offered',
      sourceCount: 5,
      hasFreshSource: true,
      hasCmsSupport: true,
      hasInternalValidation: true,
      competitorOverlap: 'High',
      humanReviewed: true,
    });
    expect(result.overall).toBe('High');
    expect(result.evidenceQuality).toBe('Strong');
    expect(result.sourceFreshness).toBe('Current');
  });

  it('returns Needs review with few positive signals and no negative signals', () => {
    const result = computeConfidenceDetails({
      status: 'Mentioned only',
      sourceCount: 1,
      hasFreshSource: false,
      hasCmsSupport: false,
      hasInternalValidation: false,
      competitorOverlap: 'Moderate',
      humanReviewed: false,
    });
    expect(result.overall).toBe('Needs review');
    expect(result.evidenceQuality).toBe('Moderate');
  });

  it('returns Low with negative signals', () => {
    const result = computeConfidenceDetails({
      status: 'Unclear',
      sourceCount: 0,
      hasFreshSource: false,
      hasCmsSupport: false,
      hasInternalValidation: false,
      competitorOverlap: 'Low',
      humanReviewed: false,
    });
    expect(result.overall).toBe('Low');
    expect(result.evidenceQuality).toBe('Moderate');
    expect(result.sourceFreshness).toBe('Stale');
  });

  it('returns Not found for not-found status with no sources', () => {
    const result = computeConfidenceDetails({
      status: 'Not found publicly',
      sourceCount: 0,
      hasFreshSource: false,
      hasCmsSupport: false,
      hasInternalValidation: false,
      competitorOverlap: 'Low',
      humanReviewed: false,
    });
    expect(result.overall).toBe('Not found');
  });
});

describe('questionTerms', () => {
  it('extracts meaningful terms from question', () => {
    const terms = questionTerms('What hospice services does the competitor offer in Maine?');
    expect(terms).toContain('hospice');
    expect(terms).toContain('maine');
    expect(terms).not.toContain('what');    // stop word
    expect(terms).not.toContain('the');     // too short
    expect(terms).not.toContain('services'); // in stopWords
  });

  it('returns empty for stop-word-only query', () => {
    const terms = questionTerms('what is this about');
    expect(terms).toEqual([]);
  });
});

describe('weightedTextScore', () => {
  it('scores text with matching terms', () => {
    const score = weightedTextScore('hospice palliative care services', ['hospice', 'palliative']);
    expect(score).toBeGreaterThan(0);
  });

  it('returns 0 for no match', () => {
    const score = weightedTextScore('random unrelated text', ['hospice']);
    expect(score).toBe(0);
  });
});

describe('pageIntelligenceScore', () => {
  it('returns higher score for service-rich pages', () => {
    const servicePage = {
      url: 'https://example.com/services/hospice',
      title: 'Hospice Services',
      excerpt: 'We offer hospice and palliative care',
      text: 'Hospice palliative care services medicare certified quality outcomes same day admission specialist team',
    };
    const genericPage = {
      url: 'https://example.com/about',
      title: 'About Us',
      excerpt: 'We are a company',
      text: 'We are a healthcare company serving the community since 1990',
    };
    expect(pageIntelligenceScore(servicePage)).toBeGreaterThan(pageIntelligenceScore(genericPage));
  });
});

describe('scoreEvidenceItem', () => {
  const baseItem = {
    type: 'finding',
    competitorName: 'TestCo',
    serviceLine: 'Hospice',
    subservice: 'Pain management',
    competitorStatus: 'Clearly offered' as const,
    confidence: 'High' as const,
    sourceUrl: 'https://example.com',
    sourceTitle: 'Hospice page',
    evidenceExcerpt: 'We provide comprehensive pain management',
    matchedTerms: ['pain', 'management', 'hospice'],
    safeSalesWording: 'Use evidence-based language',
    reviewStatus: 'Sales usable with evidence' as const,
  };

  it('returns positive score for matching evidence', () => {
    const score = scoreEvidenceItem(baseItem, ['pain', 'management']);
    expect(score).toBeGreaterThan(0);
  });

  it('prefers items with subservice over those without', () => {
    const without = { ...baseItem, subservice: undefined };
    const withSub = baseItem;
    expect(scoreEvidenceItem(withSub, [])).toBeGreaterThan(scoreEvidenceItem(without, []));
  });
});

describe('rankEvidenceForQuestion', () => {
  it('ranks items by relevance to question', () => {
    const items = [
      { ...({ type: 'finding', competitorName: 'A', serviceLine: 'Hospice', competitorStatus: 'Clearly offered' as const, confidence: 'High' as const, evidenceExcerpt: 'hospice services', safeSalesWording: 'safe', reviewStatus: 'Sales usable with evidence' as const }) },
      { ...({ type: 'finding', competitorName: 'B', serviceLine: 'Home Health', competitorStatus: 'Not found publicly' as const, confidence: 'Not found' as const, evidenceExcerpt: 'home health', safeSalesWording: 'safe', reviewStatus: 'Needs human review' as const }) },
    ];
    const ranked = rankEvidenceForQuestion(items, 'hospice');
    expect(ranked[0].competitorName).toBe('A');
  });
});
