import type { ClaimStatus, CategorizedClaim, CompetitorAnalysis } from './types';
import { andwellCatalog } from './andwell';

const highRiskPatterns = [
  /guarantee/i, /100[%]/i, /best/i, /leading/i, /number one/i, /top rated/i,
  /only (provider|company|organization)/i, /exclusive/i, /unmatched/i,
  /lowest (price|cost|rate)/i, /cheaper/i, /free/i, /no (cost|charge|fee)/i,
  /covers? everything/i, /all (insurance|plans)/i, /accept everyone/i,
  /immediate (admission|enroll|start)/i, /same day (admission|service|start)/i,
  /24\/7 (admission|enroll)/i, /no (wait|waiting) list/i
];

const doNotUsePatterns = [
  /competitor.*doesn'?t (offer|have|provide)/i, /they (don'?t|do not) (offer|have|provide)/i,
  /competitor.*lacks/i, /competitor.*fails/i, /competitor.*(behind|inferior)/i,
  /we'?re better/i, /we (beat|win|dominate)/i
];

const internalOnlyPatterns = [
  /pricing/i, /contract/i, /reimbursement/i, /margin/i, /revenue/i,
  /internal (data|metric|score)/i, /proprietary/i, /confidential/i,
  /negotiated/i, /rate (sheet|card)/i, /fee schedule/i
];

const needsReviewPatterns = [
  /may (offer|have|provide)/i, /might/i, /could/i, /possibly/i, /appears? to/i,
  /seems?/i, /reportedly/i, /according to (an? )?(unconfirmed|unofficial)/i,
  /unclear/i, /unverified/i, /not yet (confirmed|verified)/i
];

function classifyClaim(claim: string, competitorName: string, analysis?: CompetitorAnalysis): ClaimStatus {
  if (highRiskPatterns.some((p) => p.test(claim))) return 'High risk';
  if (doNotUsePatterns.some((p) => p.test(claim))) return 'Do not use';
  if (internalOnlyPatterns.some((p) => p.test(claim))) return 'Internal only';
  if (needsReviewPatterns.some((p) => p.test(claim))) return 'Needs review';
  const catalogMatch = andwellCatalog.find((s) => claim.toLowerCase().includes(s.serviceLine.toLowerCase()));
  if (catalogMatch && !claim.toLowerCase().includes(competitorName.toLowerCase())) {
    if (!analysis?.aiExtraction?.benefitsMentioned.some((b) => claim.toLowerCase().includes(b.toLowerCase()))) {
      return 'Needs review';
    }
  }
  return 'Safe';
}

function classifyReason(claim: string, status: ClaimStatus): string {
  if (status === 'High risk') return 'Contains absolute, superlative, or exclusive language — not safe for field use without legal review.';
  if (status === 'Do not use') return 'Negative or comparative language about a competitor — may create legal exposure.';
  if (status === 'Internal only') return 'References confidential business information — not for external use.';
  if (status === 'Needs review') return 'Language is speculative or may conflate Andwell service lines — requires human confirmation.';
  return 'Claim is factual, specific, and free of superlative, negative, or confidential language.';
}

export function categorizeClaims(analysis: CompetitorAnalysis): CategorizedClaim[] {
  const claims: CategorizedClaim[] = [];
  const all = [
    ...(analysis.aiExtraction?.claimsMade || []).map((c) => ({ claim: c, serviceLine: undefined as string | undefined })),
    ...(analysis.aiExtraction?.benefitsMentioned || []).map((c) => ({ claim: c, serviceLine: undefined as string | undefined })),
    ...(analysis.aiExtraction?.proofPoints || []).map((c) => ({ claim: c, serviceLine: undefined as string | undefined })),
    ...(analysis.aiExtraction?.competitorAdvantages || []).map((c) => ({ claim: c, serviceLine: undefined as string | undefined })),
    ...(analysis.aiExtraction?.safeSalesLanguage || []).map((c) => ({ claim: c, serviceLine: undefined as string | undefined })),
  ];
  const seen = new Set<string>();
  for (const entry of all) {
    const normalized = entry.claim.trim().toLowerCase();
    if (!normalized || seen.has(normalized) || normalized.length < 10) continue;
    seen.add(normalized);
    const status = classifyClaim(entry.claim, analysis.name, analysis);
    claims.push({
      claim: entry.claim,
      category: status,
      reason: classifyReason(entry.claim, status),
      competitorName: analysis.name,
      sourceUrl: analysis.url,
      serviceLine: entry.serviceLine || analysis.aiExtraction?.serviceLineDepth?.[0]?.serviceLine
    });
  }
  return claims;
}

export function categorizeAllClaims(report: { analyses: CompetitorAnalysis[] }): CategorizedClaim[] {
  return report.analyses.flatMap((a) => categorizeClaims(a));
}

export function filterApprovedClaims(claims: CategorizedClaim[]): CategorizedClaim[] {
  return claims.filter((c) => c.category === 'Safe');
}

export function claimStatusTone(status: ClaimStatus): 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'dark' {
  if (status === 'Safe') return 'green';
  if (status === 'Needs review') return 'amber';
  if (status === 'Do not use') return 'red';
  if (status === 'Internal only') return 'blue';
  return 'red';
}

const safeRewritePatterns: [RegExp, string][] = [
  [/guarantee/gi, 'is designed to'],
  [/100[%]/g, 'consistently'],
  [/\bbest\b/gi, 'well-suited'],
  [/\bleading\b/gi, 'notable'],
  [/number one/gi, 'highly regarded'],
  [/top rated/gi, 'well reviewed'],
  [/only (provider|company|organization)/gi, 'one of the providers'],
  [/\bexclusive\b/gi, 'focused'],
  [/\bunmatched\b/gi, 'distinctive'],
  [/lowest (price|cost|rate)/gi, 'competitive'],
  [/\bcheaper\b/gi, 'more cost-effective'],
  [/\bfree\b/gi, 'no additional cost'],
  [/no (cost|charge|fee)/gi, 'included'],
  [/covers? everything/gi, 'covers a broad range of'],
  [/all (insurance|plans)/gi, 'many insurance plans'],
  [/accept everyone/gi, 'accept a wide range of patients'],
  [/immediate (admission|enroll|start)/gi, 'prompt'],
  [/same day (admission|service|start)/gi, 'timely'],
  [/24\/7 (admission|enroll)/gi, 'around-the-clock'],
  [/no (wait|waiting) list/gi, 'minimal wait'],
  [/competitor.*doesn'?t (offer|have|provide)/gi, ''],
  [/they (don'?t|do not) (offer|have|provide)/gi, ''],
  [/competitor.*lacks/gi, ''],
  [/competitor.*fails/gi, ''],
  [/competitor.*(behind|inferior)/gi, ''],
  [/we'?re better/gi, 'our approach focuses on'],
  [/we (beat|win|dominate)/gi, 'we aim to excel at'],
];

export function generateSafeAlternative(claim: string): string {
  let safe = claim;
  for (const [pattern, replacement] of safeRewritePatterns) {
    safe = safe.replace(pattern, replacement);
  }
  safe = safe.replace(/\s+/g, ' ').trim();
  if (safe === claim || !safe) return claim;
  return safe;
}

export function rewriteClaim(claim: string, status: ClaimStatus): { original: string; safe: string; changed: boolean } {
  if (status === 'Safe') return { original: claim, safe: claim, changed: false };
  const safe = generateSafeAlternative(claim);
  return { original: claim, safe, changed: safe !== claim };
}

export function rewriteAllClaims(claims: CategorizedClaim[]): CategorizedClaim[] {
  return claims.map((c) => {
    const { safe, changed } = rewriteClaim(c.claim, c.category);
    return changed ? { ...c, claim: safe, category: 'Safe', reason: 'Auto-rewritten to safe alternative.' } : c;
  });
}
