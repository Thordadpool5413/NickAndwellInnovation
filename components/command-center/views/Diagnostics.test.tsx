// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Diagnostics } from './Diagnostics';

describe('Diagnostics', () => {
  const runDiagnostics = vi.fn();

  it('renders heading and description', () => {
    render(<Diagnostics diagnostics={[]} runDiagnostics={runDiagnostics} busy={false} />);
    expect(screen.getByText('System Check')).toBeInTheDocument();
  });

  it('renders run button', () => {
    render(<Diagnostics diagnostics={[]} runDiagnostics={runDiagnostics} busy={false} />);
    expect(screen.getByRole('button', { name: 'Run System Check' })).toBeInTheDocument();
  });

  it('shows placeholder message when no diagnostics and not busy', () => {
    render(<Diagnostics diagnostics={[]} runDiagnostics={runDiagnostics} busy={false} />);
    expect(screen.getByText(/Click/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Run System Check' })).toBeInTheDocument();
  });

  it('shows busy state on button', () => {
    render(<Diagnostics diagnostics={[]} runDiagnostics={runDiagnostics} busy={true} />);
    expect(screen.getByText('Running...')).toBeInTheDocument();
  });

  it('disables button when busy', () => {
    render(<Diagnostics diagnostics={[]} runDiagnostics={runDiagnostics} busy={true} />);
    expect(screen.getByText('Running...')).toBeDisabled();
  });

  it('renders diagnostic results', () => {
    const diagnostics = [
      { route: '/api/health', ok: true, status: 200, message: 'OK', preview: 'healthy' },
      { route: '/api/data', ok: false, status: 500, message: 'Error', preview: 'failure' },
    ];
    render(<Diagnostics diagnostics={diagnostics} runDiagnostics={runDiagnostics} busy={false} />);
    expect(screen.getByText('/api/health')).toBeInTheDocument();
    expect(screen.getByText('/api/data')).toBeInTheDocument();
  });

  it('shows stats counts', () => {
    const diagnostics = [
      { route: '/api/health', ok: true, status: 200, message: 'OK', preview: 'healthy' },
      { route: '/api/data', ok: false, status: 500, message: 'Error', preview: 'failure' },
    ];
    render(<Diagnostics diagnostics={diagnostics} runDiagnostics={runDiagnostics} busy={false} />);
    expect(screen.getByText('Routes checked')).toBeInTheDocument();
    expect(screen.getByText('Healthy')).toBeInTheDocument();
    expect(screen.getByText('Needs attention')).toBeInTheDocument();
  });
});
