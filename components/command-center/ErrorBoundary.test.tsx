// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function GoodChild() {
  return <div>everything is fine</div>;
}

function BadChild(): React.ReactElement {
  throw new Error('test error');
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(<ErrorBoundary name="TestWidget"><GoodChild /></ErrorBoundary>);
    expect(screen.getByText('everything is fine')).toBeInTheDocument();
  });

  it('shows error UI when a child throws', () => {
    render(<ErrorBoundary name="TestWidget"><BadChild /></ErrorBoundary>);
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });

  it('renders the component name in the error message', () => {
    render(<ErrorBoundary name="DashboardPanel"><BadChild /></ErrorBoundary>);
    expect(screen.getByText('DashboardPanel encountered an error.')).toBeInTheDocument();
  });

  it('renders retry button on error', () => {
    render(<ErrorBoundary name="TestWidget"><BadChild /></ErrorBoundary>);
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('does not show error UI when no error occurs', () => {
    render(<ErrorBoundary name="TestWidget"><GoodChild /></ErrorBoundary>);
    expect(screen.queryByText('Something broke')).not.toBeInTheDocument();
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('retry re-catches the error when child keeps throwing', () => {
    render(<ErrorBoundary name="TestWidget"><BadChild /></ErrorBoundary>);
    screen.getByText('Retry').click();
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });
});
