// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExecutiveNarrative } from './ExecutiveNarrative';

vi.mock('../../../lib/strategy-brief', () => ({
  generateExecutiveNarrative: vi.fn(() => ({
    executiveReadout: 'Mock executive readout content.',
    boardNarrative: 'Mock board narrative content.',
    riskSummary: 'Mock risk summary content.',
    launchRecommendation: 'Mock launch recommendation content.',
    strategicPriorities: ['Priority one', 'Priority two', 'Priority three'],
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

describe('ExecutiveNarrative', () => {
  it('renders loading state when no report', () => {
    render(<ExecutiveNarrative currentReport={null} growthRows={[]} totals={mockTotals} />);
    expect(screen.getByText('No report loaded')).toBeInTheDocument();
  });

  it('renders narrative when report is provided', () => {
    render(<ExecutiveNarrative currentReport={mockReport} growthRows={[]} totals={mockTotals} />);
    expect(screen.getByText('Executive Narrative Engine')).toBeInTheDocument();
  });

  it('displays executive readout section', () => {
    render(<ExecutiveNarrative currentReport={mockReport} growthRows={[]} totals={mockTotals} />);
    expect(screen.getByText('Executive Readout')).toBeInTheDocument();
    expect(screen.getByText('Mock executive readout content.')).toBeInTheDocument();
  });

  it('displays board narrative section', () => {
    render(<ExecutiveNarrative currentReport={mockReport} growthRows={[]} totals={mockTotals} />);
    expect(screen.getByText('Board Narrative')).toBeInTheDocument();
    expect(screen.getByText('Mock board narrative content.')).toBeInTheDocument();
  });

  it('displays risk summary and launch recommendation', () => {
    render(<ExecutiveNarrative currentReport={mockReport} growthRows={[]} totals={mockTotals} />);
    expect(screen.getByText('Risk Summary')).toBeInTheDocument();
    expect(screen.getByText('Launch Recommendation')).toBeInTheDocument();
  });

  it('renders strategic priorities list', () => {
    render(<ExecutiveNarrative currentReport={mockReport} growthRows={[]} totals={mockTotals} />);
    expect(screen.getByText('Strategic Priorities')).toBeInTheDocument();
    expect(screen.getByText('Priority one')).toBeInTheDocument();
    expect(screen.getByText('Priority two')).toBeInTheDocument();
    expect(screen.getByText('Priority three')).toBeInTheDocument();
  });

  it('shows generated timestamp', () => {
    render(<ExecutiveNarrative currentReport={mockReport} growthRows={[]} totals={mockTotals} />);
    expect(screen.getByText('2025-01-15')).toBeInTheDocument();
  });
});
