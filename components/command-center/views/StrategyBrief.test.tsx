// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StrategyBrief } from './StrategyBrief';

vi.mock('../../../lib/strategy-brief', () => ({
  generateStrategyBrief: vi.fn(() => ({
    audience: 'Executive',
    title: 'Executive Strategy Brief',
    summary: 'Strategy brief generated for Executive audience.',
    sections: [
      { heading: 'Competitive Landscape', content: 'Mock landscape content.' },
      { heading: 'Market Opportunity', content: 'Mock market opportunity content.' },
    ],
    keyMetrics: [
      { label: 'Y1 Revenue', value: '$1.0M' },
      { label: 'Priority Counties', value: '3' },
    ],
    generatedAt: '2025-01-15',
  })),
}));

const mockTotals = {
  starts: [100, 200, 300] as [number, number, number],
  referrals: [50, 100, 150] as [number, number, number],
  revenue: [1000000, 2000000, 3000000] as [number, number, number],
  contribution: [200000, 400000, 600000] as [number, number, number],
  totalRevenue: 6000000,
  totalContribution: 1200000,
  totalReferrals: 300,
};

const mockReport = {
  id: 'report-1',
  generatedAt: '2025-01-15',
  baselineProvider: 'Andwell Health Partners' as const,
  competitorsAnalyzed: 5,
  pagesReviewed: 20,
  serviceLinesMapped: 3,
  subservicesMapped: 10,
  matchedServiceFindings: 15,
  potentialAndwellAdvantages: 4,
  humanReviewItems: 2,
  executiveSummary: 'Summary text',
  executiveInsights: [],
  competitorScores: [],
  analyses: [],
  allFindings: [],
  allSubserviceFindings: [],
  crawlErrors: [],
};

describe('StrategyBrief', () => {
  it('renders loading state when no report', () => {
    render(<StrategyBrief currentReport={null} growthRows={[]} totals={mockTotals} />);
    expect(screen.getByText('No report loaded')).toBeInTheDocument();
  });

  it('renders brief when report is provided', () => {
    render(<StrategyBrief currentReport={mockReport} growthRows={[]} totals={mockTotals} />);
    expect(screen.getByText('AI Strategy Brief')).toBeInTheDocument();
  });

  it('shows audience badge', () => {
    render(<StrategyBrief currentReport={mockReport} growthRows={[]} totals={mockTotals} />);
    expect(screen.getAllByText('Executive').length).toBeGreaterThanOrEqual(1);
  });

  it('renders audience selector buttons', () => {
    render(<StrategyBrief currentReport={mockReport} growthRows={[]} totals={mockTotals} />);
    expect(screen.getByText('Sales Leader')).toBeInTheDocument();
    expect(screen.getByText('Field Rep')).toBeInTheDocument();
    expect(screen.getByText('Board')).toBeInTheDocument();
    expect(screen.getByText('Compliance')).toBeInTheDocument();
    expect(screen.getByText('Referral Partner')).toBeInTheDocument();
  });

  it('renders key metrics', () => {
    render(<StrategyBrief currentReport={mockReport} growthRows={[]} totals={mockTotals} />);
    expect(screen.getByText('$1.0M')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders brief sections', () => {
    render(<StrategyBrief currentReport={mockReport} growthRows={[]} totals={mockTotals} />);
    expect(screen.getByText('Competitive Landscape')).toBeInTheDocument();
    expect(screen.getByText('Market Opportunity')).toBeInTheDocument();
    expect(screen.getByText('Mock landscape content.')).toBeInTheDocument();
  });

  it('shows generated timestamp', () => {
    render(<StrategyBrief currentReport={mockReport} growthRows={[]} totals={mockTotals} />);
    expect(screen.getByText('2025-01-15')).toBeInTheDocument();
  });
});
