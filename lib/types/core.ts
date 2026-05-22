export type Status = 'Clearly offered' | 'Mentioned only' | 'Related but not equivalent' | 'Not found publicly' | 'Unclear' | 'Needs human review';
export type Confidence = 'High' | 'Moderate' | 'Low' | 'Not found' | 'Needs review';
export type ReviewStatus = 'Sales usable with evidence' | 'Manager review suggested' | 'Needs human review' | 'Approved for sales use' | 'Rejected';
export type ThreatLevel = 'Low overlap' | 'Moderate overlap' | 'High overlap' | 'Strategic threat';
export type ExpertPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type ExpertAudience = 'CEO' | 'COO' | 'Sales Leader' | 'Sales Rep' | 'Admin' | 'Marketing' | 'Clinical Leader';
export type CrawledPageType = 'Service page' | 'Program page' | 'Referral page' | 'Eligibility page' | 'Location page' | 'About page' | 'News or blog' | 'Low value' | 'General page';
export type ClaimStatus = 'Safe' | 'Needs review' | 'Do not use' | 'Internal only' | 'High risk';
export type ReferralSourceType = 'Hospital' | 'SNF' | 'Primary Care' | 'Specialist' | 'Assisted Living' | 'Home Health Referral' | 'Behavioral Health' | 'Community Partner' | 'Family Caregiver';

export type ConfidenceDetails = {
  overall: Confidence;
  evidenceQuality: 'Strong' | 'Moderate' | 'Weak';
  sourceFreshness: 'Current' | 'Recent' | 'Stale';
  sourceCount: number;
  hasInternalValidation: boolean;
  hasCmsSupport: boolean;
  competitorOverlap: 'High' | 'Moderate' | 'Low';
  humanReviewed: boolean;
  reason: string;
};

export type MatrixScore = {
  overall: number;
  evidenceStrength: number;
  sourceQuality: number;
  sourceCount: number;
  matchStrength: number;
  andwellDifferentiation: number;
  reviewRisk: number;
  rationale: string[];
};

export type CompetitorInput = {
  name?: string;
  url: string;
  market?: string;
  notes?: string;
};

export type ExecutiveInsight = {
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  audience: 'CEO' | 'COO' | 'Sales Leader' | 'Sales Rep' | 'Admin';
  summary: string;
  action: string;
};

export type BattlecardTemplate = {
  competitor: string;
  county: string;
  serviceLine: string;
  audience: string;
  objection: string;
  opening: string;
  discoveryQuestions: string[];
  positioning: string;
  objectionResponse: string;
  close: string;
};

export type AISalesBattlecard = {
  serviceLine: string;
  leadWith: string;
  referralQuestion: string;
  objectionResponse: string;
  proofPoint: string;
  safeSalesLanguage: string;
  doNotSayLanguage: string;
};
