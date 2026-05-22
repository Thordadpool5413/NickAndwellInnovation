import type { CrawledPageType } from './core';

export type CrawledPage = {
  url: string;
  title: string;
  siteName?: string;
  organizationName?: string;
  text: string;
  excerpt: string;
  pageType?: CrawledPageType;
  intelligenceScore?: number;
  evidenceSignals?: string[];
};

export type EvidenceSource = {
  url: string;
  title: string;
  pageType?: CrawledPageType;
  excerpt: string;
  matchedTerms: string[];
  score: number;
};
