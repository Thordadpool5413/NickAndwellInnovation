// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, ThemeToggle } from './ThemeProvider';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
});

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(<ThemeProvider><div>child</div></ThemeProvider>);
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('renders children before mount', () => {
    render(<ThemeProvider><span>unmounted</span></ThemeProvider>);
    expect(screen.getByText('unmounted')).toBeInTheDocument();
  });

  it('applies dark class when saved in localStorage', () => {
    localStorage.setItem('andwell-theme', 'dark');
    render(<ThemeProvider><div>child</div></ThemeProvider>);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('applies light class when saved in localStorage', () => {
    localStorage.setItem('andwell-theme', 'light');
    render(<ThemeProvider><div>child</div></ThemeProvider>);
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('ignores invalid theme value', () => {
    localStorage.setItem('andwell-theme', 'invalid');
    render(<ThemeProvider><div>child</div></ThemeProvider>);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });
});

describe('ThemeToggle', () => {
  it('renders a toggle button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('toggles theme on click', () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(localStorage.getItem('andwell-theme')).toBe('light');
    fireEvent.click(btn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('andwell-theme')).toBe('dark');
  });
});
