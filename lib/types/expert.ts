import type { ExpertPriority, ExpertAudience } from './core';

export type ExpertRecommendation = {
  id: string;
  priority: ExpertPriority;
  audience: ExpertAudience;
  title: string;
  reasoning: string;
  action: string;
  safeLanguage: string;
  reviewRequired: boolean;
};

export type ExpertFieldPlay = {
  id: string;
  competitorName: string;
  serviceLine: string;
  scenario: string;
  leadWith: string;
  referralQuestion: string;
  objectionResponse: string;
  proofNeeded: string;
  avoidSaying: string;
};

export type ExpertWatchItem = {
  id: string;
  competitorName: string;
  signal: string;
  whyItMatters: string;
  nextCheck: string;
  priority: ExpertPriority;
};

export type ExpertBrief = {
  expertVersion: string;
  generatedAt: string;
  expertScore: number;
  marketPosture: string;
  expertSummary: string;
  leadershipDecision: string;
  salesCoachingPriority: string;
  fastestFieldMove: string;
  governanceWarning: string;
  strongestThreats: string[];
  bestOpportunities: string[];
  recommendations: ExpertRecommendation[];
  fieldPlays: ExpertFieldPlay[];
  watchlist: ExpertWatchItem[];
};
