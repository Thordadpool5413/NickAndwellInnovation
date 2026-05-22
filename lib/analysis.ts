import { andwellCatalog } from './andwell';
import { buildExpertBrief } from './expert-engine';
import { cleanProviderName, nameFromUrl } from './provider-identity';
import type { CompetitorAnalysis, CompetitorInput, Confidence, CrawledPage, EvidenceSource, ExecutiveInsight, Finding, IntelligenceReport, MatrixScore, Status, SubserviceFinding, CompetitorScore, ThreatLevel } from './types';

import { semanticScore } from './embedding';

const useSemanticMatching = process.env.USE_SEMANTIC_MATCHING === '1';

// --- Scoring constants ---
const PHRASE_SCORE_EXACT_MULTI = 8;
const PHRASE_SCORE_EXACT_SINGLE = 4;
const PHRASE_SCORE_HIGH_RATIO = 3;
const PHRASE_SCORE_LOW_RATIO = 1;
const PHRASE_SCORE_MISS = 0;
const PHRASE_RATIO_HIGH = 0.85;
const PHRASE_RATIO_LOW = 0.65;

const CLASSIFY_CLEARLY_OFFERED = 12;
const CLASSIFY_MENTIONED_ONLY = 7;
const CLASSIFY_RELATED = 3;
const CLASSIFY_MIN_MATCHED_FOR_CLEAR = 2;
const CLASSIFY_MAX_MATCHED = 10;

const PAGE_QUALITY_SERVICE_PROGRAM = 28;
const PAGE_QUALITY_REFERRAL_ELIGIBILITY = 24;
const PAGE_QUALITY_LOCATION = 18;
const PAGE_QUALITY_ABOUT = 12;
const PAGE_QUALITY_NEWS_BLOG = 8;
const PAGE_QUALITY_LOW_VALUE = 2;
const PAGE_QUALITY_DEFAULT = 10;

const STATUS_STRENGTH_CLEARLY_OFFERED = 100;
const STATUS_STRENGTH_MENTIONED_ONLY = 62;
const STATUS_STRENGTH_RELATED = 48;
const STATUS_STRENGTH_UNCLEAR = 26;
const STATUS_STRENGTH_NONE = 0;

const CONFIDENCE_STRENGTH_HIGH = 100;
const CONFIDENCE_STRENGTH_MODERATE = 66;
const CONFIDENCE_STRENGTH_LOW = 34;
const CONFIDENCE_STRENGTH_NEEDS_REVIEW = 20;
const CONFIDENCE_STRENGTH_NONE = 0;

// --- Matrix score weights ---
const MATRIX_STATUS_WEIGHT = 0.58;
const MATRIX_CONFIDENCE_WEIGHT = 0.28;
const MATRIX_SOURCE_BASE = 14;
const MATRIX_SOURCE_PER_UNIT = 7;
const MATRIX_EVIDENCE_WEIGHT = 0.34;
const MATRIX_SOURCE_QUALITY_WEIGHT = 0.16;
const MATRIX_MATCH_WEIGHT = 0.2;
const MATRIX_DIFFERENTIATION_WEIGHT = 0.18;
const MATRIX_RISK_WEIGHT = 0.12;

// --- Review risk constants ---
const RISK_CLEAR_HIGH_CONF_WITH_SOURCE = 12;
const RISK_NOT_FOUND_PUBLICLY = 70;
const RISK_LOW_CONFIDENCE = 82;
const RISK_DEFAULT = 48;

// --- Differentiation constants ---
const DIFF_NOT_FOUND_PUBLICLY = 92;
const DIFF_DEFAULT = 64;

// --- Summarize service thresholds ---
const SUMMARIZE_CLEAR_MIN_MATCHED = 4;
const SUMMARIZE_CLEAR_MIN_DEPTH = 35;
const SUMMARIZE_MENTIONED_MIN_MENTIONED = 4;

// --- Threat level thresholds ---
const THREAT_STRATEGIC = 75;
const THREAT_HIGH = 55;
const THREAT_MODERATE = 30;
const THREAT_OVERLAP_WEIGHT = 0.55;
const THREAT_DEPTH_WEIGHT = 0.45;

// --- Evidence source limits ---
const EVIDENCE_MAX_SOURCES = 5;
const EVIDENCE_MIN_SCORE_FILTER = 30;
const EVIDENCE_EXCERPT_RADIUS = 220;
const EVIDENCE_EXCERPT_LENGTH = 900;
const EVIDENCE_INTELLIGENCE_CAP = 20;
const EVIDENCE_MAX_MATCHED_TERMS = 12;

// --- Score component constants ---
const COMPETITOR_VISIBILITY_DENOM = 24;
const STRONGEST_MATCHES_MAX = 5;
const ADVANTAGES_MAX = 6;
const LEAD_WITH_MAX = 5;
const EXEC_READOUT_LEAD_WITH = 4;

// --- Semantic refinement ---
const SEMANTIC_BONUS_FACTOR = 30;

// --- Executive insight thresholds ---
const EXEC_HIGH_REVIEW_THRESHOLD = 20;

// --- Finding name slice ---
const FINDING_SUBSERVICE_SLICE = 8;

function norm(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function words(text: string) {
  return norm(text).split(/\s+/).filter((word) => word.length > 2);
}

function phraseScore(text: string, term: string) {
  const n = ` ${norm(text)} `;
  const t = ` ${norm(term)} `;
  if (n.includes(t)) return term.includes(' ') ? PHRASE_SCORE_EXACT_MULTI : PHRASE_SCORE_EXACT_SINGLE;
  const pieces = words(term);
  if (!pieces.length) return PHRASE_SCORE_MISS;
  const hits = pieces.filter((piece) => n.includes(` ${piece} `) || n.includes(piece)).length;
  const ratio = hits / pieces.length;
  if (ratio >= PHRASE_RATIO_HIGH) return PHRASE_SCORE_HIGH_RATIO;
  if (ratio >= PHRASE_RATIO_LOW) return PHRASE_SCORE_LOW_RATIO;
  return PHRASE_SCORE_MISS;
}

function score(text: string, terms: string[]) {
  return terms.reduce((sum, term) => sum + phraseScore(text, term), 0);
}

function providerName(input: CompetitorInput) {
  return cleanProviderName(input.name) || nameFromUrl(input.url) || 'Competitor';
}

const hints: Record<string, string[]> = {
  'Home Healthcare': ['home health','home healthcare','skilled nursing','therapy at home','medical social work','home health aide','medicare certified home health','post hospital','recover at home'],
  'In Home Care Giving': ['home care','in home care','caregiver','caregiving','personal care','companion care','homemaker','respite','bathing assistance','private duty'],
  'Mobile Wound Care': ['mobile wound','in home wound','wound care','advanced wound','ostomy','continence','skin care','wound prevention','wound clinic'],
  'Dementia Care Management through GUIDE': ['guide model','medicare guide','dementia care management','dementia care','caregiver education','respite allowance','memory care','alzheimers'],
  'Hospice Home Care': ['hospice','home hospice','end of life','comfort care','terminal illness','bereavement','chaplain','symptom management'],
  'Hospice House Care': ['hospice house','inpatient hospice','general inpatient hospice','hospice facility','symptom management facility','residential hospice'],
  'Palliative Medicine': ['palliative care','palliative medicine','serious illness','goals of care','symptom management','quality of life'],
  'Caring Comfort Program': ['serious illness support','pre hospice','not ready for hospice','volunteer support','curative treatment','comfort program','bridge program'],
  'Bereavement Support': ['bereavement','grief support','grief counseling','grief group','loss support','grief education'],
  'Community and Behavioral Health': ['behavioral health','mental health','counseling','therapy','psychological evaluation','case management','substance use','community support'],
  'Pediatric Therapy': ['pediatric therapy','occupational therapy','physical therapy','speech therapy','speech language','children therapy','school based therapy'],
  'Adult Therapy': ['physical therapy','occupational therapy','speech language pathology','adult therapy','pelvic floor','wheelchair clinic','neuro rehab','stroke recovery'],
  'Audiology': ['audiology','hearing','hearing loss','hearing aid'],
  'Maternal and Child Health': ['maternal','pediatric home health','children home health','medically fragile','postpartum','high risk pregnancy','g tube','feeding tube','perinatal hospice']
};

function evidence(pages: CrawledPage[], terms: string[]) {
  return [...pages].sort((a, b) => score(b.text, terms) - score(a.text, terms))[0];
}

function pageQuality(page: CrawledPage) {
  if (page.pageType === 'Service page' || page.pageType === 'Program page') return PAGE_QUALITY_SERVICE_PROGRAM;
  if (page.pageType === 'Referral page' || page.pageType === 'Eligibility page') return PAGE_QUALITY_REFERRAL_ELIGIBILITY;
  if (page.pageType === 'Location page') return PAGE_QUALITY_LOCATION;
  if (page.pageType === 'About page') return PAGE_QUALITY_ABOUT;
  if (page.pageType === 'News or blog') return PAGE_QUALITY_NEWS_BLOG;
  if (page.pageType === 'Low value') return PAGE_QUALITY_LOW_VALUE;
  return PAGE_QUALITY_DEFAULT;
}

function sourceExcerpt(page: CrawledPage, matchedTerms: string[]) {
  const text = page.text || page.excerpt || '';
  const lower = text.toLowerCase();
  const match = matchedTerms.find((term) => lower.includes(term.toLowerCase()));
  if (!match) return page.excerpt || text.slice(0, EVIDENCE_EXCERPT_LENGTH);
  const index = Math.max(0, lower.indexOf(match.toLowerCase()) - EVIDENCE_EXCERPT_RADIUS);
  return text.slice(index, index + EVIDENCE_EXCERPT_LENGTH).trim() || page.excerpt || text.slice(0, EVIDENCE_EXCERPT_LENGTH);
}

function evidenceSources(pages: CrawledPage[], terms: string[]): EvidenceSource[] {
  return [...pages]
    .map((page) => {
      const matchedTerms = terms.filter((term) => score(page.text, [term]) > 0).slice(0, EVIDENCE_MAX_MATCHED_TERMS);
      const termScore = score(page.text, terms);
      return {
        url: page.url,
        title: page.title,
        pageType: page.pageType,
        excerpt: sourceExcerpt(page, matchedTerms),
        matchedTerms,
        score: termScore + pageQuality(page) + Math.min(EVIDENCE_INTELLIGENCE_CAP, page.intelligenceScore || 0)
      };
    })
    .filter((source) => source.matchedTerms.length || source.score >= EVIDENCE_MIN_SCORE_FILTER)
    .sort((a, b) => b.score - a.score)
    .slice(0, EVIDENCE_MAX_SOURCES);
}

function statusStrength(status: Status) {
  if (status === 'Clearly offered') return STATUS_STRENGTH_CLEARLY_OFFERED;
  if (status === 'Mentioned only') return STATUS_STRENGTH_MENTIONED_ONLY;
  if (status === 'Related but not equivalent') return STATUS_STRENGTH_RELATED;
  if (status === 'Unclear' || status === 'Needs human review') return STATUS_STRENGTH_UNCLEAR;
  return STATUS_STRENGTH_NONE;
}

function confidenceStrength(confidence: Confidence) {
  if (confidence === 'High') return CONFIDENCE_STRENGTH_HIGH;
  if (confidence === 'Moderate') return CONFIDENCE_STRENGTH_MODERATE;
  if (confidence === 'Low') return CONFIDENCE_STRENGTH_LOW;
  if (confidence === 'Needs review') return CONFIDENCE_STRENGTH_NEEDS_REVIEW;
  return CONFIDENCE_STRENGTH_NONE;
}

function buildMatrixScore(params: { status: Status; confidence: Confidence; sources: EvidenceSource[]; matchedCount: number; totalCount: number; aiSourceCount?: number; aiRationale?: string }): MatrixScore {
  const sourceCount = Math.max(params.sources.length, params.aiSourceCount || 0);
  const bestSourceQuality = Math.min(100, params.sources.reduce((max, source) => Math.max(max, source.score), 0));
  const evidenceStrength = Math.round((statusStrength(params.status) * MATRIX_STATUS_WEIGHT) + (confidenceStrength(params.confidence) * MATRIX_CONFIDENCE_WEIGHT) + Math.min(MATRIX_SOURCE_BASE, sourceCount * MATRIX_SOURCE_PER_UNIT));
  const matchStrength = Math.round((params.matchedCount / Math.max(params.totalCount, 1)) * 100);
  const reviewRisk = params.status === 'Clearly offered' && params.confidence === 'High' && sourceCount > 0 ? RISK_CLEAR_HIGH_CONF_WITH_SOURCE : params.status === 'Not found publicly' ? RISK_NOT_FOUND_PUBLICLY : params.confidence === 'Low' ? RISK_LOW_CONFIDENCE : RISK_DEFAULT;
  const andwellDifferentiation = params.status === 'Clearly offered' ? Math.max(0, 100 - matchStrength) : params.status === 'Not found publicly' ? DIFF_NOT_FOUND_PUBLICLY : DIFF_DEFAULT;
  const overall = Math.round((evidenceStrength * MATRIX_EVIDENCE_WEIGHT) + (bestSourceQuality * MATRIX_SOURCE_QUALITY_WEIGHT) + (matchStrength * MATRIX_MATCH_WEIGHT) + (andwellDifferentiation * MATRIX_DIFFERENTIATION_WEIGHT) + ((100 - reviewRisk) * MATRIX_RISK_WEIGHT));
  const rationale = [
    `${params.status} with ${params.confidence.toLowerCase()} confidence`,
    `${sourceCount} supporting source${sourceCount === 1 ? '' : 's'}`,
    `${matchStrength}% Andwell subservice match`,
    `${andwellDifferentiation}% Andwell differentiation signal`,
    params.aiRationale || ''
  ].filter(Boolean).slice(0, 5);
  return { overall: Math.max(0, Math.min(100, overall)), evidenceStrength: Math.min(100, evidenceStrength), sourceQuality: bestSourceQuality, sourceCount, matchStrength, andwellDifferentiation, reviewRisk, rationale };
}

function classifyTerms(terms: string[], pages: CrawledPage[]): { status: Status; confidence: Confidence; page?: CrawledPage; matched: string[]; rawScore: number } {
  const all = pages.map((p) => p.text).join(' ');
  const rawScore = score(all, terms);
  const matched = terms.filter((term) => score(all, [term]) > 0).slice(0, CLASSIFY_MAX_MATCHED);
  const page = rawScore > 0 ? evidence(pages, matched.length ? matched : terms) : undefined;
  if (rawScore >= CLASSIFY_CLEARLY_OFFERED && matched.length >= CLASSIFY_MIN_MATCHED_FOR_CLEAR) return { status: 'Clearly offered', confidence: 'High', page, matched, rawScore };
  if (rawScore >= CLASSIFY_MENTIONED_ONLY) return { status: 'Mentioned only', confidence: 'Moderate', page, matched, rawScore };
  if (rawScore >= CLASSIFY_RELATED) return { status: 'Related but not equivalent', confidence: 'Moderate', page, matched, rawScore };
  if (rawScore > 0) return { status: 'Unclear', confidence: 'Low', page, matched, rawScore };
  return { status: 'Not found publicly', confidence: 'Not found', matched: [], rawScore };
}

function relatedTerms(serviceLine: string, subservice: string) {
  const base = [subservice, ...words(subservice)];
  const serviceHints = hints[serviceLine] || [serviceLine];
  if (serviceLine === 'Dementia Care Management through GUIDE' && subservice.toLowerCase().includes('guide')) return ['guide model','medicare guide','guiding an improved dementia experience'];
  if (serviceLine === 'Hospice House Care' && subservice.toLowerCase().includes('hospice house')) return ['hospice house','inpatient hospice','residential hospice','general inpatient hospice'];
  if (subservice.toLowerCase().includes('ostomy')) return ['ostomy','ostomy care','ostomy education'];
  if (subservice.toLowerCase().includes('continence')) return ['continence','incontinence','continence care'];
  if (subservice.toLowerCase().includes('pediatric')) return ['pediatric','children','child'];
  if (subservice.toLowerCase().includes('telehealth')) return ['telehealth','virtual visit','remote monitoring'];
  return [...base, ...serviceHints.slice(0, 3)];
}

function review(status: Status, confidence: Confidence): Finding['reviewStatus'] {
  if (status === 'Clearly offered' && confidence === 'High') return 'Sales usable with evidence';
  if (status === 'Not found publicly' || status === 'Unclear' || status === 'Needs human review') return 'Needs human review';
  return 'Manager review suggested';
}

function interpretation(name: string, status: Status, subject = 'this capability') {
  if (status === 'Clearly offered') return `${name} publicly appears to offer ${subject}. Review depth, geography, eligibility, and proof points before claiming competitive advantage.`;
  if (status === 'Mentioned only') return `${name} publicly mentions ${subject}, but reviewed pages do not show enough detail to treat it as fully equivalent.`;
  if (status === 'Related but not equivalent') return `${name} uses related public language for ${subject}, but the public description does not clearly match Andwell's full capability.`;
  if (status === 'Not found publicly') return `${subject} was not clearly found for ${name} in the reviewed public pages.`;
  return `${subject} needs human review before it is used in sales language.`;
}

function buildSubserviceFinding(input: CompetitorInput, competitorId: string, serviceLine: string, subservice: string, pages: CrawledPage[]): SubserviceFinding {
  const name = providerName(input);
  const terms = relatedTerms(serviceLine, subservice);
  const c = classifyTerms(terms, pages);
  const subject = `${serviceLine}: ${subservice}`;
  const sources = evidenceSources(pages, terms);
  return {
    id: `${competitorId}:${serviceLine}:${subservice}`,
    competitorId,
    competitorName: name,
    serviceLine,
    subservice,
    andwellStatus: 'Clearly offered',
    competitorStatus: c.status,
    confidence: c.confidence,
    sourceUrl: c.page?.url,
    sourceTitle: c.page?.title,
    evidenceExcerpt: sources[0]?.excerpt || c.page?.excerpt || `No explicit public evidence for ${subservice} was found in ${pages.length} reviewed pages.`,
    evidenceSources: sources,
    matrixScore: buildMatrixScore({ status: c.status, confidence: c.confidence, sources, matchedCount: c.status === 'Clearly offered' ? 1 : 0, totalCount: 1 }),
    matchedTerms: c.matched,
    aiInterpretation: interpretation(name, c.status, subject),
    safeSalesWording: c.status === 'Not found publicly'
      ? `Based on reviewed public pages, ${subservice} inside ${serviceLine} was not clearly found for ${name}. Andwell publicly lists this capability, so it may be a useful differentiator when appropriate.`
      : `${interpretation(name, c.status, subject)} Use evidence based language and do not overstate the difference.`,
    avoidSaying: `Do not say ${name} does not provide ${subservice} unless that is confirmed by an approved source. Use not found publicly when this comes from website review.`,
    reviewStatus: review(c.status, c.confidence)
  };
}

function summarizeServiceStatus(subs: SubserviceFinding[]): { status: Status; confidence: Confidence; matched: number; depth: number } {
  const matched = subs.filter((s) => s.competitorStatus === 'Clearly offered').length;
  const mentioned = subs.filter((s) => s.competitorStatus === 'Mentioned only' || s.competitorStatus === 'Related but not equivalent').length;
  const total = Math.max(subs.length, 1);
  const depth = Math.round((matched / total) * 100);
  if (matched >= SUMMARIZE_CLEAR_MIN_MATCHED || depth >= SUMMARIZE_CLEAR_MIN_DEPTH) return { status: 'Clearly offered', confidence: 'High', matched, depth };
  if (matched >= 1 || mentioned >= SUMMARIZE_MENTIONED_MIN_MENTIONED) return { status: 'Mentioned only', confidence: 'Moderate', matched, depth };
  if (mentioned >= 2) return { status: 'Related but not equivalent', confidence: 'Moderate', matched, depth };
  if (mentioned === 1) return { status: 'Unclear', confidence: 'Low', matched, depth };
  return { status: 'Not found publicly', confidence: 'Not found', matched, depth };
}

function buildFinding(input: CompetitorInput, competitorId: string, service: typeof andwellCatalog[number], pages: CrawledPage[]): Finding {
  const name = providerName(input);
  const subserviceFindings = service.subservices.map((subservice) => buildSubserviceFinding(input, competitorId, service.serviceLine, subservice, pages));
  const serviceHints = hints[service.serviceLine] || [service.serviceLine];
  const c = classifyTerms(serviceHints, pages);
  const summary = summarizeServiceStatus(subserviceFindings);
  const status = c.status === 'Clearly offered' || summary.status === 'Clearly offered' ? 'Clearly offered' : summary.status;
  const confidence = status === 'Clearly offered' ? (c.confidence === 'High' || summary.confidence === 'High' ? 'High' : 'Moderate') : summary.confidence;
  const bestPage = c.page || evidence(pages, serviceHints);
  const clearlyMatchedSubservices = summary.matched;
  const sources = evidenceSources(pages, [...serviceHints, service.serviceLine, ...service.subservices]);
  return {
    id: `${competitorId}:${service.serviceLine}`,
    competitorId,
    competitorName: name,
    serviceLine: service.serviceLine,
    andwellStatus: 'Clearly offered',
    competitorStatus: status,
    confidence,
    sourceUrl: bestPage?.url,
    sourceTitle: bestPage?.title,
    evidenceExcerpt: sources[0]?.excerpt || bestPage?.excerpt || `No explicit public evidence was found in ${pages.length} reviewed pages.`,
    evidenceSources: sources,
    matrixScore: buildMatrixScore({ status, confidence, sources, matchedCount: clearlyMatchedSubservices, totalCount: service.subservices.length }),
    aiInterpretation: `${interpretation(name, status, service.serviceLine)} ${clearlyMatchedSubservices} of ${service.subservices.length} Andwell subservices were clearly matched from public pages.`,
    matchLevel: status === 'Clearly offered' ? 'Main service line match. Subservice depth determines positioning strength.' : status === 'Not found publicly' ? 'Potential Andwell advantage based on reviewed public pages.' : 'Partial, related, or unclear public match. Review before using in sales materials.',
    andwellAdvantage: status === 'Clearly offered'
      ? `${service.serviceLine} appears to be a shared public service area. Andwell differentiation should come from subservice depth and evidence, especially capabilities not clearly found for ${name}.`
      : `Andwell publicly promotes ${service.serviceLine} with detailed capabilities including ${service.subservices.slice(0, FINDING_SUBSERVICE_SLICE).join(', ')}.`,
    competitorAdvantage: status === 'Clearly offered'
      ? `${name} publicly promotes ${service.serviceLine}. Review proof points, response time language, referral simplicity, and geography for possible competitor advantage.`
      : 'No clear competitor advantage was identified from reviewed public pages for this service line.',
    safeSalesWording: status === 'Not found publicly'
      ? `Based on reviewed public pages, ${service.serviceLine} was not clearly found for ${name}. Andwell publicly promotes this service line, so it may be a useful differentiator when appropriate.`
      : `${interpretation(name, status, service.serviceLine)} Compare individual subservices before claiming advantage.`,
    avoidSaying: `Do not say ${name} does not offer ${service.serviceLine} unless confirmed by an approved source. Use not found publicly when the finding comes only from website review.`,
    reviewStatus: review(status, confidence),
    subserviceFindings,
    clearlyMatchedSubservices,
    totalSubservices: service.subservices.length,
    subserviceDepthScore: summary.depth
  };
}

function threatLevel(overlap: number, depth: number): ThreatLevel {
  const blended = Math.round((overlap * THREAT_OVERLAP_WEIGHT) + (depth * THREAT_DEPTH_WEIGHT));
  if (blended >= THREAT_STRATEGIC) return 'Strategic threat';
  if (blended >= THREAT_HIGH) return 'High overlap';
  if (blended >= THREAT_MODERATE) return 'Moderate overlap';
  return 'Low overlap';
}

export function buildScore(analysis: Omit<CompetitorAnalysis, 'score'>): CompetitorScore {
  const total = Math.max(analysis.findings.length, 1);
  const matched = analysis.findings.filter((f) => f.competitorStatus === 'Clearly offered');
  const notMatched = analysis.findings.filter((f) => f.competitorStatus !== 'Clearly offered');
  const reviewItems = analysis.findings.filter((f) => f.reviewStatus !== 'Sales usable with evidence');
  const serviceLineMatchScore = Math.round((matched.length / total) * 100);
  const subserviceDepthScore = Math.round(analysis.findings.reduce((sum, f) => sum + f.subserviceDepthScore, 0) / total);
  const andwellDifferentiationScore = Math.round((notMatched.length / total) * 100);
  const competitorVisibilityScore = Math.min(100, Math.round((analysis.pagesReviewed.length / COMPETITOR_VISIBILITY_DENOM) * 100));
  const evidenceStrengthScore = Math.round((analysis.findings.filter((f) => f.confidence === 'High').length / total) * 100);
  const reviewRiskScore = Math.round((reviewItems.length / total) * 100);
  const strongestMatches = matched.sort((a, b) => b.subserviceDepthScore - a.subserviceDepthScore).slice(0, STRONGEST_MATCHES_MAX).map((f) => f.serviceLine);
  const strongestAndwellAdvantages = notMatched.slice(0, ADVANTAGES_MAX).map((f) => f.serviceLine);
  const needsReview = reviewItems.slice(0, ADVANTAGES_MAX).map((f) => f.serviceLine);
  const leadWith = [...new Set(['Continuum depth', ...strongestAndwellAdvantages.slice(0, LEAD_WITH_MAX)])];
  const level = threatLevel(serviceLineMatchScore, subserviceDepthScore);
  return {
    competitorId: analysis.id,
    competitorName: analysis.name,
    serviceLineMatchScore,
    subserviceDepthScore,
    andwellDifferentiationScore,
    competitorVisibilityScore,
    evidenceStrengthScore,
    reviewRiskScore,
    threatLevel: level,
    strongestMatches,
    strongestAndwellAdvantages,
    needsReview,
    leadWith,
    executiveReadout: `${analysis.name} shows ${serviceLineMatchScore}% service line overlap and ${subserviceDepthScore}% subservice depth against the Andwell taxonomy. Threat level: ${level}. Lead with ${leadWith.slice(0, EXEC_READOUT_LEAD_WITH).join(', ')} and verify review items before sales use.`
  };
}

export function analyzeCompetitor(input: CompetitorInput, pages: CrawledPage[], index: number): CompetitorAnalysis {
  const id = `competitor_${Date.now()}_${index}`;
  const partial = {
    id,
    name: providerName(input),
    url: input.url,
    market: input.market || 'Not provided',
    analyzedAt: new Date().toISOString(),
    pagesReviewed: pages,
    findings: andwellCatalog.map((service) => buildFinding(input, id, service, pages))
  };
  const subserviceFindings = partial.findings.flatMap((f) => f.subserviceFindings);
  const analysisWithoutScore = { ...partial, subserviceFindings };
  return { ...analysisWithoutScore, score: buildScore(analysisWithoutScore) };
}

function executiveInsights(scores: CompetitorScore[], humanReviewItems: number): ExecutiveInsight[] {
  const topThreat = [...scores].sort((a, b) => (b.serviceLineMatchScore + b.subserviceDepthScore) - (a.serviceLineMatchScore + a.subserviceDepthScore))[0];
  const biggestDifferentiation = [...scores].sort((a, b) => b.andwellDifferentiationScore - a.andwellDifferentiationScore)[0];
  const insights: ExecutiveInsight[] = [];
  if (topThreat) insights.push({
    title: 'Highest competitive overlap',
    priority: topThreat.threatLevel === 'Strategic threat' ? 'High' : 'Medium',
    audience: 'CEO',
    summary: `${topThreat.competitorName} has the highest overlap with Andwell based on public service line and subservice signals.`,
    action: `Review this competitor first. Focus leadership discussion on ${topThreat.strongestMatches.slice(0, 4).join(', ') || 'shared service lines'} and where Andwell can prove deeper value.`
  });
  if (biggestDifferentiation) insights.push({
    title: 'Best Andwell differentiation opportunity',
    priority: 'High',
    audience: 'Sales Leader',
    summary: `${biggestDifferentiation.competitorName} has the largest set of Andwell service areas not clearly matched in public pages.`,
    action: `Build sales coaching around ${biggestDifferentiation.strongestAndwellAdvantages.slice(0, 5).join(', ')} using safe public evidence language.`
  });
  insights.push({
    title: 'Review before sales use',
    priority: humanReviewItems > EXEC_HIGH_REVIEW_THRESHOLD ? 'High' : 'Medium',
    audience: 'Admin',
    summary: `${humanReviewItems} findings need human review or manager review before they should be treated as approved sales language.`,
    action: 'Use the Review Center to approve, edit, or reject findings before publishing battlecards to the field.'
  });
  insights.push({
    title: 'Rep coaching priority',
    priority: 'High',
    audience: 'Sales Rep',
    summary: 'The strongest selling points are usually inside subservices, not broad service categories.',
    action: 'Coach reps to lead with specific capabilities, patient situations, and referral source problems rather than saying only hospice, home health, or behavioral health.'
  });
  return insights;
}

export async function semanticRefineFindings(findings: Finding[]): Promise<Finding[]> {
  if (!useSemanticMatching) return findings;
  try {
    const enriched = await Promise.all(findings.map(async (finding) => {
      const text = `${finding.serviceLine} ${finding.competitorStatus} ${finding.evidenceExcerpt} ${finding.andwellAdvantage}`;
      const query = `${finding.serviceLine} ${finding.andwellStatus}`;
      const sim = await semanticScore(text, query);
      const semanticBonus = Math.round(sim * SEMANTIC_BONUS_FACTOR);
      if (finding.matrixScore) {
        const boosted = Math.min(100, finding.matrixScore.overall + semanticBonus);
        finding.matrixScore = { ...finding.matrixScore, overall: boosted, rationale: [...finding.matrixScore.rationale, `semantic boost: +${semanticBonus}`] };
      }
      return finding;
    }));
    return enriched;
  } catch {
    return findings;
  }
}

export function buildReport(analyses: CompetitorAnalysis[], crawlErrors: { url: string; error: string }[]): IntelligenceReport {
  const allFindings = analyses.flatMap((a) => a.findings);
  const allSubserviceFindings = analyses.flatMap((a) => a.subserviceFindings);
  const competitorScores = analyses.map((a) => a.score);
  const matchedServiceFindings = allFindings.filter((f) => f.competitorStatus === 'Clearly offered').length;
  const potentialAndwellAdvantages = allFindings.filter((f) => f.competitorStatus !== 'Clearly offered').length;
  const humanReviewItems = allFindings.filter((f) => f.reviewStatus !== 'Sales usable with evidence').length + allSubserviceFindings.filter((f) => f.reviewStatus !== 'Sales usable with evidence').length;
  const topScore = [...competitorScores].sort((a, b) => b.andwellDifferentiationScore - a.andwellDifferentiationScore)[0];
  const expertBrief = buildExpertBrief(analyses, competitorScores, allFindings, allSubserviceFindings, humanReviewItems);
  return {
    id: `report_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    baselineProvider: 'Andwell Health Partners',
    competitorsAnalyzed: analyses.length,
    pagesReviewed: analyses.reduce((sum, a) => sum + a.pagesReviewed.length, 0),
    serviceLinesMapped: andwellCatalog.length,
    subservicesMapped: andwellCatalog.reduce((sum, s) => sum + s.subservices.length, 0),
    matchedServiceFindings,
    potentialAndwellAdvantages,
    humanReviewItems,
    executiveSummary: `This analysis compared Andwell Health Partners against ${analyses.length} competitor website${analyses.length === 1 ? '' : 's'} using public website evidence. The system created ${allSubserviceFindings.length} subservice level findings, found ${matchedServiceFindings} clearly matched service line findings, and identified ${potentialAndwellAdvantages} potential Andwell advantage findings. ${topScore ? `The strongest differentiation opportunity appears to be against ${topScore.competitorName}.` : ''} Not found publicly means the service was not clearly found in reviewed public pages, not that the competitor definitively does not provide it. Expert score: ${expertBrief.expertScore}.`,
    executiveInsights: executiveInsights(competitorScores, humanReviewItems),
    competitorScores,
    analyses,
    allFindings,
    allSubserviceFindings,
    crawlErrors,
    expertBrief
  };
}
