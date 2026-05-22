import { andwellCatalog } from './andwell';
import { selectBestPromptPages } from './smart-ranking';
import { cleanProviderName, nameFromUrl, providerNameFromPages } from './provider-identity';
import { getProvider } from './llm-provider';
import type { AICompetitorExtraction, CompetitorInput, CrawledPage } from './types';

const maxPagesForPrompt = Math.max(3, Math.min(10, Number(process.env.OPENAI_MAX_PROMPT_PAGES || 4)));
const maxCharsPerPage = Math.max(900, Math.min(2400, Number(process.env.OPENAI_MAX_CHARS_PER_PAGE || 1000)));
const maxOutputTokens = Math.max(1800, Math.min(5000, Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 1800)));

function providerName(input: CompetitorInput, pages?: CrawledPage[]) {
  return cleanProviderName(input.name) || (pages ? providerNameFromPages(pages) : '') || nameFromUrl(input.url) || 'Competitor';
}

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function optionalText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 30) : [];
}

function status(value: unknown) {
  const allowed = ['Clearly offered', 'Mentioned only', 'Related but not equivalent', 'Not found publicly', 'Unclear', 'Needs human review'];
  const text = String(value || '').trim();
  return allowed.includes(text) ? text as AICompetitorExtraction['subserviceDepth'][number]['status'] : 'Needs human review';
}

function confidence(value: unknown) {
  const allowed = ['High', 'Moderate', 'Low', 'Not found', 'Needs review'];
  const text = String(value || '').trim();
  return allowed.includes(text) ? text as AICompetitorExtraction['subserviceDepth'][number]['confidence'] : 'Needs review';
}

function evidenceStrength(value: unknown) {
  const allowed = ['Strong', 'Moderate', 'Weak', 'Not found'];
  const text = String(value || '').trim();
  return allowed.includes(text) ? text as AICompetitorExtraction['serviceLineDepth'][number]['evidenceStrength'] : 'Weak';
}

function reviewRisk(value: unknown) {
  const allowed = ['Low', 'Medium', 'High'];
  const text = String(value || '').trim();
  return allowed.includes(text) ? text as AICompetitorExtraction['serviceLineDepth'][number]['reviewRisk'] : 'High';
}

function pageType(value: unknown): AICompetitorExtraction['pageEvidence'][number]['pageType'] {
  const allowed = ['Service page', 'Program page', 'Referral page', 'Eligibility page', 'Location page', 'About page', 'News or blog', 'Low value', 'General page'];
  const text = String(value || '').trim();
  return allowed.includes(text) ? text as AICompetitorExtraction['pageEvidence'][number]['pageType'] : 'General page';
}

function clampScore(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

export function normalizeExtraction(raw: any, input: CompetitorInput, pages: CrawledPage[]): AICompetitorExtraction {
  const suppliedName = cleanProviderName(input.name);
  return {
    providerName: suppliedName || cleanProviderName(raw?.providerName) || providerName(input, pages),
    aiModel: safeText(raw?.aiModel, 'ai-extractor'),
    generatedAt: new Date().toISOString(),
    servicesMentioned: arrayOfStrings(raw?.servicesMentioned),
    benefitsMentioned: arrayOfStrings(raw?.benefitsMentioned),
    claimsMade: arrayOfStrings(raw?.claimsMade),
    programsOffered: arrayOfStrings(raw?.programsOffered),
    proofPoints: arrayOfStrings(raw?.proofPoints),
    referralCallsToAction: arrayOfStrings(raw?.referralCallsToAction),
    serviceLineDepth: Array.isArray(raw?.serviceLineDepth) ? raw.serviceLineDepth.slice(0, 30).map((item: any) => ({
      serviceLine: safeText(item?.serviceLine, 'Needs review'),
      depthScore: clampScore(item?.depthScore),
      evidenceStrength: evidenceStrength(item?.evidenceStrength),
      status: status(item?.status),
      sourceCount: clampScore(item?.sourceCount),
      matchRationale: safeText(item?.matchRationale, 'No match rationale returned.'),
      summary: safeText(item?.summary, 'Needs review.'),
      competitorAdvantages: arrayOfStrings(item?.competitorAdvantages),
      andwellAdvantages: arrayOfStrings(item?.andwellAdvantages),
      proofPoints: arrayOfStrings(item?.proofPoints),
      referralCallsToAction: arrayOfStrings(item?.referralCallsToAction),
      reviewRisk: reviewRisk(item?.reviewRisk)
    })) : [],
    subserviceDepth: Array.isArray(raw?.subserviceDepth) ? raw.subserviceDepth.slice(0, 300).map((item: any) => ({
      serviceLine: safeText(item?.serviceLine, 'Needs review'),
      subservice: safeText(item?.subservice, 'Needs review'),
      status: status(item?.status),
      confidence: confidence(item?.confidence),
      evidenceStrength: evidenceStrength(item?.evidenceStrength),
      sourceCount: clampScore(item?.sourceCount),
      matchRationale: safeText(item?.matchRationale, 'No match rationale returned.'),
      evidenceExcerpt: safeText(item?.evidenceExcerpt, 'No evidence excerpt returned by AI.'),
      sourceUrl: optionalText(item?.sourceUrl),
      safeSalesLanguage: safeText(item?.safeSalesLanguage, 'Use evidence based language and verify before sales use.'),
      doNotSayLanguage: safeText(item?.doNotSayLanguage, 'Do not overstate competitor differences without approved evidence.')
    })) : [],
    competitorAdvantages: arrayOfStrings(raw?.competitorAdvantages),
    andwellAdvantages: arrayOfStrings(raw?.andwellAdvantages),
    safeSalesLanguage: arrayOfStrings(raw?.safeSalesLanguage),
    doNotSayLanguage: arrayOfStrings(raw?.doNotSayLanguage),
    reviewRisks: arrayOfStrings(raw?.reviewRisks),
    leadershipSummary: safeText(raw?.leadershipSummary, 'AI leadership summary was not returned.'),
    salesBattlecards: Array.isArray(raw?.salesBattlecards) ? raw.salesBattlecards.slice(0, 30).map((item: any) => ({
      serviceLine: safeText(item?.serviceLine, 'Needs review'),
      leadWith: safeText(item?.leadWith, 'Lead with Andwell service depth.'),
      referralQuestion: safeText(item?.referralQuestion, 'What specific patient need are you trying to solve?'),
      objectionResponse: safeText(item?.objectionResponse, 'Acknowledge the relationship and pivot to the specific patient need.'),
      proofPoint: safeText(item?.proofPoint, 'Use approved evidence.'),
      safeSalesLanguage: safeText(item?.safeSalesLanguage, 'Use evidence based language.'),
      doNotSayLanguage: safeText(item?.doNotSayLanguage, 'Do not say the competitor does not offer a service unless confirmed by approved evidence.')
    })) : [],
    pageEvidence: Array.isArray(raw?.pageEvidence) ? raw.pageEvidence.slice(0, 60).map((item: any) => ({
      url: safeText(item?.url, ''),
      title: safeText(item?.title, 'Untitled page'),
      pageType: pageType(item?.pageType),
      servicesFound: arrayOfStrings(item?.servicesFound),
      proofPoints: arrayOfStrings(item?.proofPoints),
      referralSignals: arrayOfStrings(item?.referralSignals),
      limitations: arrayOfStrings(item?.limitations)
    })).filter((item: any) => item.url) : [],
    rawConfidence: ['High', 'Medium', 'Low'].includes(String(raw?.rawConfidence)) ? raw.rawConfidence : 'Low'
  };
}

function promptFor(input: CompetitorInput, pages: CrawledPage[]) {
  const catalog = andwellCatalog.map((service) => ({
    serviceLine: service.serviceLine,
    category: service.category,
    description: service.description,
    subservices: service.subservices,
    safeLanguage: service.safeLanguage,
    avoid: service.avoid
  }));

  const pageBundle = selectBestPromptPages(pages, maxPagesForPrompt, maxCharsPerPage);

  return `You are an expert healthcare competitive intelligence analyst for Andwell Health Partners.

Analyze the competitor's public website evidence and return ONLY valid compact JSON. Do not include markdown. Do not make unsupported claims. Keep every string concise.

Your job is not generic scraping. You are building an Evidence Matrix for Andwell Health Partners. Scrub the provided pages page by page, classify what each page proves, then compare that evidence to the Andwell taxonomy.

Safety and compliance rules:
1. Use only the provided public website evidence.
2. Never say a competitor does not offer a service only because it was not found. Use "Not found publicly".
3. Separate clearly offered services from vague mentions, related but not equivalent language, and unclear evidence.
4. Create sales language that is safe, evidence based, and manager review friendly.
5. Compare at both service line and subservice level.
6. Prioritize pages with higher intelligenceScore when evidence conflicts.
7. Treat a dedicated service/program/referral/eligibility page as stronger evidence than a navigation label, blog mention, footer, generic marketing copy, or unrelated page.
8. Score equivalence based on care setting, patient population, eligibility, referral pathway, clinical depth, geography, proof points, and explicit public wording.
9. Andwell differentiation means Andwell publicly shows a capability more clearly or more deeply than the reviewed competitor pages. It does not mean the competitor definitely lacks it.
10. If evidence is vague, keep status as Mentioned only, Related but not equivalent, Unclear, or Needs human review.

Required analysis sequence:
1. Page evidence inventory: for each reviewed page, identify pageType, servicesFound, proofPoints, referralSignals, and limitations.
2. Service comparison: compare every Andwell serviceLine to competitor evidence and return status, depthScore, evidenceStrength, sourceCount, matchRationale, summary, advantages, proof points, CTAs, and reviewRisk.
3. Subservice comparison: compare every Andwell subservice to competitor evidence and return status, confidence, evidenceStrength, sourceCount, evidenceExcerpt, sourceUrl, matchRationale, safeSalesLanguage, and doNotSayLanguage.
4. Executive/sales synthesis: only after the evidence inventory and comparison are complete.

Required JSON keys:
providerName, servicesMentioned, benefitsMentioned, claimsMade, programsOffered, proofPoints, referralCallsToAction, serviceLineDepth, subserviceDepth, competitorAdvantages, andwellAdvantages, safeSalesLanguage, doNotSayLanguage, reviewRisks, leadershipSummary, salesBattlecards, pageEvidence, rawConfidence.

Competitor input:
${JSON.stringify({ name: providerName(input, pages), userSuppliedName: cleanProviderName(input.name) || null, url: input.url, market: input.market || 'Not provided', notes: input.notes || '' })}

Provider identity rules:
1. If userSuppliedName is present, preserve it as providerName unless public website evidence clearly identifies the same organization with a cleaner formal name.
2. Do not use page titles, page slugs, cities, service names, career pages, or generic words such as Locations, Careers, Bangor, Augusta, Services, or Home as providerName.
3. If the URL points to a location, career page, or service page, identify the parent provider organization from site metadata and page evidence.
4. If identity is unclear, keep the supplied provider name or hostname-derived organization name and flag uncertainty in reviewRisks.

Andwell service catalog:
${JSON.stringify(catalog)}

Competitor crawled pages, pre ranked by relevance:
${JSON.stringify(pageBundle)}

Return JSON in this exact shape:
{
  "providerName": "string",
  "servicesMentioned": ["string"],
  "benefitsMentioned": ["string"],
  "claimsMade": ["string"],
  "programsOffered": ["string"],
  "proofPoints": ["string"],
  "referralCallsToAction": ["string"],
  "serviceLineDepth": [
    {
      "serviceLine": "string",
      "depthScore": 0,
      "evidenceStrength": "Strong | Moderate | Weak | Not found",
      "status": "Clearly offered | Mentioned only | Related but not equivalent | Not found publicly | Unclear | Needs human review",
      "sourceCount": 0,
      "matchRationale": "string",
      "summary": "string",
      "competitorAdvantages": ["string"],
      "andwellAdvantages": ["string"],
      "proofPoints": ["string"],
      "referralCallsToAction": ["string"],
      "reviewRisk": "Low | Medium | High"
    }
  ],
  "subserviceDepth": [
    {
      "serviceLine": "string",
      "subservice": "string",
      "status": "Clearly offered | Mentioned only | Related but not equivalent | Not found publicly | Unclear | Needs human review",
      "confidence": "High | Moderate | Low | Not found | Needs review",
      "evidenceStrength": "Strong | Moderate | Weak | Not found",
      "sourceCount": 0,
      "matchRationale": "string",
      "evidenceExcerpt": "string",
      "sourceUrl": "string",
      "safeSalesLanguage": "string",
      "doNotSayLanguage": "string"
    }
  ],
  "competitorAdvantages": ["string"],
  "andwellAdvantages": ["string"],
  "safeSalesLanguage": ["string"],
  "doNotSayLanguage": ["string"],
  "reviewRisks": ["string"],
  "leadershipSummary": "string",
  "salesBattlecards": [
    {
      "serviceLine": "string",
      "leadWith": "string",
      "referralQuestion": "string",
      "objectionResponse": "string",
      "proofPoint": "string",
      "safeSalesLanguage": "string",
      "doNotSayLanguage": "string"
    }
  ],
  "pageEvidence": [
    {
      "url": "string",
      "title": "string",
      "pageType": "Service page | Program page | Referral page | Eligibility page | Location page | About page | News or blog | Low value | General page",
      "servicesFound": ["string"],
      "proofPoints": ["string"],
      "referralSignals": ["string"],
      "limitations": ["string"]
    }
  ],
  "rawConfidence": "High | Medium | Low"
}`;
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return JSON.parse(trimmed);
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
  throw new Error('LLM did not return parseable JSON.');
}

export function isAIExtractionConfigured() {
  const variant = (process.env.LLM_PROVIDER || 'openai').toLowerCase();
  if (variant === 'ollama') return true;
  if (variant === 'anthropic') return Boolean(process.env.ANTHROPIC_API_KEY);
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getAITransportDiagnostics() {
  const provider = getProvider();
  return {
    provider: provider.name,
    configured: isAIExtractionConfigured(),
    model: provider.model || 'gpt-4o-mini',
    transport: provider.transport || 'openai',
    maxPagesForPrompt,
    maxCharsPerPage,
    maxOutputTokens,
    promptPageSelection: 'smart relevance ranking',
  };
}

export async function extractCompetitorIntelligence(input: CompetitorInput, pages: CrawledPage[]): Promise<AICompetitorExtraction | null> {
  const provider = getProvider();
  if (!isAIExtractionConfigured()) return null;

  const outputText = await provider.call(promptFor(input, pages), {
    maxTokens: maxOutputTokens,
    temperature: 0.2,
  });

  const parsed = extractJson(outputText);
  return normalizeExtraction({ ...parsed, aiModel: provider.name }, input, pages);
}
