import type { Status, Confidence, ReviewStatus, ThreatLevel, CrawledPageType, MatrixScore, AISalesBattlecard } from './core';
import type { CrawledPage, EvidenceSource } from './crawl';

export type AIServiceLineDepth = {
  serviceLine: string;
  depthScore: number;
  evidenceStrength: 'Strong' | 'Moderate' | 'Weak' | 'Not found';
  status?: Status;
  sourceCount?: number;
  matchRationale?: string;
  summary: string;
  competitorAdvantages: string[];
  andwellAdvantages: string[];
  proofPoints: string[];
  referralCallsToAction: string[];
  reviewRisk: 'Low' | 'Medium' | 'High';
};

export type AISubserviceDepth = {
  serviceLine: string;
  subservice: string;
  status: Status;
  confidence: Confidence;
  evidenceStrength?: 'Strong' | 'Moderate' | 'Weak' | 'Not found';
  sourceCount?: number;
  matchRationale?: string;
  evidenceExcerpt: string;
  sourceUrl?: string;
  safeSalesLanguage: string;
  doNotSayLanguage: string;
};

export type AICompetitorExtraction = {
  providerName: string;
  aiModel: string;
  generatedAt: string;
  servicesMentioned: string[];
  benefitsMentioned: string[];
  claimsMade: string[];
  programsOffered: string[];
  proofPoints: string[];
  referralCallsToAction: string[];
  serviceLineDepth: AIServiceLineDepth[];
  subserviceDepth: AISubserviceDepth[];
  competitorAdvantages: string[];
  andwellAdvantages: string[];
  safeSalesLanguage: string[];
  doNotSayLanguage: string[];
  reviewRisks: string[];
  leadershipSummary: string;
  salesBattlecards: AISalesBattlecard[];
  pageEvidence: {
    url: string;
    title: string;
    pageType: CrawledPageType;
    servicesFound: string[];
    proofPoints: string[];
    referralSignals: string[];
    limitations: string[];
  }[];
  rawConfidence: 'High' | 'Medium' | 'Low';
};

export type SubserviceFinding = {
  id: string;
  competitorId: string;
  competitorName: string;
  serviceLine: string;
  subservice: string;
  andwellStatus: Status;
  competitorStatus: Status;
  confidence: Confidence;
  sourceUrl?: string;
  sourceTitle?: string;
  evidenceExcerpt: string;
  evidenceSources?: EvidenceSource[];
  matrixScore?: MatrixScore;
  matchedTerms: string[];
  aiInterpretation: string;
  safeSalesWording: string;
  avoidSaying: string;
  reviewStatus: ReviewStatus;
};

export type Finding = {
  id: string;
  competitorId: string;
  competitorName: string;
  serviceLine: string;
  andwellStatus: Status;
  competitorStatus: Status;
  confidence: Confidence;
  sourceUrl?: string;
  sourceTitle?: string;
  evidenceExcerpt: string;
  evidenceSources?: EvidenceSource[];
  matrixScore?: MatrixScore;
  aiInterpretation: string;
  matchLevel: string;
  andwellAdvantage: string;
  competitorAdvantage: string;
  safeSalesWording: string;
  avoidSaying: string;
  reviewStatus: ReviewStatus;
  subserviceFindings: SubserviceFinding[];
  clearlyMatchedSubservices: number;
  totalSubservices: number;
  subserviceDepthScore: number;
};

export type CompetitorScore = {
  competitorId: string;
  competitorName: string;
  serviceLineMatchScore: number;
  subserviceDepthScore: number;
  andwellDifferentiationScore: number;
  competitorVisibilityScore: number;
  evidenceStrengthScore: number;
  reviewRiskScore: number;
  threatLevel: ThreatLevel;
  strongestMatches: string[];
  strongestAndwellAdvantages: string[];
  needsReview: string[];
  leadWith: string[];
  executiveReadout: string;
};

export type CompetitorAnalysis = {
  id: string;
  name: string;
  url: string;
  market: string;
  analyzedAt: string;
  pagesReviewed: CrawledPage[];
  findings: Finding[];
  subserviceFindings: SubserviceFinding[];
  score: CompetitorScore;
  aiExtraction?: AICompetitorExtraction;
  aiEnhanced?: boolean;
};
