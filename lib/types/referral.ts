import type { ClaimStatus, ReferralSourceType } from './core';

export type CategorizedClaim = {
  claim: string;
  category: ClaimStatus;
  reason: string;
  competitorName: string;
  sourceUrl?: string;
  serviceLine?: string;
};

export type ReferralSourceProfile = {
  sourceType: ReferralSourceType;
  leadService: string;
  painPoints: string[];
  discoveryQuestions: string[];
  positioningLanguage: string;
  referralCta: string;
  serviceLines: { name: string; relevance: 'High' | 'Medium' | 'Low'; reason: string }[];
};
