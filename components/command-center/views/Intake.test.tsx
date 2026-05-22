// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Intake } from './Intake';

describe('Intake', () => {
  const defaultProps = {
    competitors: [],
    setCompetitors: vi.fn(),
    urlInput: '',
    setUrlInput: vi.fn(),
    addUrls: vi.fn(),
    saveCompetitors: vi.fn(),
    runAnalysis: vi.fn(),
    busy: false,
  };

  it('renders heading and description', () => {
    render(<Intake {...defaultProps} />);
    expect(screen.getByText('Competitor Intake')).toBeInTheDocument();
  });

  it('renders textarea for URL input', () => {
    render(<Intake {...defaultProps} />);
    expect(screen.getByPlaceholderText(/Northern Light Health/)).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<Intake {...defaultProps} />);
    expect(screen.getByText('Add URLs')).toBeInTheDocument();
    expect(screen.getByText('Save library')).toBeInTheDocument();
    expect(screen.getByText('Run Competitive Scan')).toBeInTheDocument();
  });

  it('shows competitor count badge', () => {
    render(<Intake {...defaultProps} competitors={[
      { url: 'https://example.com', name: 'Example' },
      { url: 'https://test.com', name: 'Test' },
    ]} />);
    expect(screen.getByText('2 of 25 selected')).toBeInTheDocument();
  });

  it('renders competitor list when competitors exist', () => {
    render(<Intake {...defaultProps} competitors={[
      { url: 'https://example.com', name: 'Example', market: 'ME' },
    ]} />);
    expect(screen.getByDisplayValue('Example')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ME')).toBeInTheDocument();
  });

  it('calls setUrlInput on textarea change', () => {
    const setUrlInput = vi.fn();
    render(<Intake {...defaultProps} setUrlInput={setUrlInput} />);
    fireEvent.change(screen.getByPlaceholderText(/Northern Light Health/), { target: { value: 'new url' } });
    expect(setUrlInput).toHaveBeenCalledWith('new url');
  });

  it('calls addUrls on button click', () => {
    const addUrls = vi.fn();
    render(<Intake {...defaultProps} addUrls={addUrls} />);
    screen.getByText('Add URLs').click();
    expect(addUrls).toHaveBeenCalled();
  });

  it('disables scan button when busy', () => {
    render(<Intake {...defaultProps} busy={true} />);
    expect(screen.getByText('Running competitive scan')).toBeDisabled();
  });

  it('disables save button when busy', () => {
    render(<Intake {...defaultProps} busy={true} />);
    expect(screen.getByText('Save library')).toBeDisabled();
  });

  it('does not render competitor list when empty', () => {
    render(<Intake {...defaultProps} />);
    expect(screen.queryByText('Competitor list')).not.toBeInTheDocument();
  });

  it('renders remove button for each competitor', () => {
    render(<Intake {...defaultProps} competitors={[
      { url: 'https://example.com', name: 'Example' },
    ]} />);
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('calls setCompetitors on name input change', () => {
    const setCompetitors = vi.fn();
    render(<Intake {...defaultProps} setCompetitors={setCompetitors} competitors={[
      { url: 'https://example.com', name: 'Example' },
    ]} />);
    fireEvent.change(screen.getByDisplayValue('Example'), { target: { value: 'New Name' } });
    expect(setCompetitors).toHaveBeenCalled();
  });
});
