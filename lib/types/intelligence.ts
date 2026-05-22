import type { ExecutiveInsight } from './core';
import type { CompetitorScore, CompetitorAnalysis, Finding, SubserviceFinding } from './competitor';
import type { ExpertBrief } from './expert';

export type IntelligenceReport = {
  id: string;
  generatedAt: string;
  baselineProvider: 'Andwell Health Partners';
  competitorsAnalyzed: number;
  pagesReviewed: number;
  serviceLinesMapped: number;
  subservicesMapped: number;
  matchedServiceFindings: number;
  potentialAndwellAdvantages: number;
  humanReviewItems: number;
  executiveSummary: string;
  executiveInsights: ExecutiveInsight[];
  competitorScores: CompetitorScore[];
  analyses: CompetitorAnalysis[];
  allFindings: Finding[];
  allSubserviceFindings: SubserviceFinding[];
  crawlErrors: { url: string; error: string }[];
  aiEnabled?: boolean;
  aiModel?: string;
  aiLeadershipSummary?: string;
  expertBrief?: ExpertBrief;
};
