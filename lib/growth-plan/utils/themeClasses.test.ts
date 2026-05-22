import { describe, it, expect } from 'vitest';
import { themeClasses, typography } from './themeClasses';

describe('themeClasses.card', () => {
  it('returns string for dark mode', () => {
    const result = themeClasses.card(true);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('rounded-xl');
    expect(result).toContain('slate-800');
  });

  it('returns string for light mode', () => {
    const result = themeClasses.card(false);
    expect(result).toContain('rounded-xl');
    expect(result).toContain('white/80');
    expect(result).not.toContain('slate-800');
  });
});

describe('themeClasses.metric', () => {
  it('returns string for dark mode', () => {
    const result = themeClasses.metric(true);
    expect(result).toContain('rounded-xl');
    expect(result).toContain('slate-800');
    expect(result).toContain('hover:scale-[1.01]');
  });

  it('returns string for light mode', () => {
    const result = themeClasses.metric(false);
    expect(result).toContain('rounded-xl');
    expect(result).toContain('white/80');
    expect(result).toContain('hover:scale-[1.01]');
  });
});

describe('themeClasses.listItem', () => {
  it('returns selected dark mode classes', () => {
    const result = themeClasses.listItem(true, true);
    expect(result).toContain('rounded-lg');
    expect(result).toContain('border-blue-500/60');
    expect(result).toContain('bg-blue-950/40');
  });

  it('returns unselected dark mode classes', () => {
    const result = themeClasses.listItem(true, false);
    expect(result).toContain('rounded-lg');
    expect(result).not.toContain('border-blue-500/60');
    expect(result).toContain('border-slate-700/50');
  });

  it('returns selected light mode classes', () => {
    const result = themeClasses.listItem(false, true);
    expect(result).toContain('rounded-lg');
    expect(result).toContain('border-blue-400');
    expect(result).toContain('bg-blue-50');
  });

  it('returns unselected light mode classes', () => {
    const result = themeClasses.listItem(false, false);
    expect(result).toContain('rounded-lg');
    expect(result).not.toContain('border-blue-400');
    expect(result).toContain('border-slate-200/50');
  });
});

describe('themeClasses.sectionHeader', () => {
  it('returns dark mode header', () => {
    const result = themeClasses.sectionHeader(true);
    expect(result).toContain('text-heading-sm');
    expect(result).toContain('text-white');
  });

  it('returns light mode header', () => {
    const result = themeClasses.sectionHeader(false);
    expect(result).toContain('text-heading-sm');
    expect(result).toContain('text-slate-950');
  });
});

describe('themeClasses.badge', () => {
  it('returns success badge classes in dark mode', () => {
    const result = themeClasses.badge('success', true);
    expect(result).toContain('text-success-300');
    expect(result).toContain('bg-success-900/40');
    expect(result).toContain('rounded-full');
  });

  it('returns success badge classes in light mode', () => {
    const result = themeClasses.badge('success', false);
    expect(result).toContain('text-success-700');
    expect(result).toContain('bg-success-100');
  });

  it('returns warning badge classes', () => {
    const result = themeClasses.badge('warning', false);
    expect(result).toContain('text-warning-700');
    expect(result).toContain('bg-warning-100');
  });

  it('returns error badge classes', () => {
    const result = themeClasses.badge('error', false);
    expect(result).toContain('text-error-700');
    expect(result).toContain('bg-error-100');
  });

  it('returns info badge classes', () => {
    const result = themeClasses.badge('info', false);
    expect(result).toContain('text-info-700');
    expect(result).toContain('bg-info-100');
  });

  it('falls back to info for unknown tone', () => {
    const result = themeClasses.badge('unknown', false);
    expect(result).toContain('text-info-700');
    expect(result).toContain('bg-info-100');
  });

  it('returns expected class prefix for all tones', () => {
    const result = themeClasses.badge('success', false);
    expect(result).toMatch(/^text-xs font-bold px-2\.5 py-1 rounded-full border/);
  });
});

describe('themeClasses.positive', () => {
  it('contains text-positive font-semibold', () => {
    expect(themeClasses.positive).toBe('text-positive font-semibold');
  });
});

describe('themeClasses.negative', () => {
  it('contains text-negative font-semibold', () => {
    expect(themeClasses.negative).toBe('text-negative font-semibold');
  });
});

describe('themeClasses.neutral', () => {
  it('contains text-neutral font-semibold', () => {
    expect(themeClasses.neutral).toBe('text-neutral font-semibold');
  });
});

describe('themeClasses.grid', () => {
  it('cols2 contains grid grid-cols-1 and md:grid-cols-2', () => {
    expect(themeClasses.grid.cols2).toContain('grid grid-cols-1 md:grid-cols-2');
    expect(themeClasses.grid.cols2).toContain('gap-4');
  });

  it('cols3 contains lg:grid-cols-3', () => {
    expect(themeClasses.grid.cols3).toContain('lg:grid-cols-3');
  });

  it('cols4 contains lg:grid-cols-4', () => {
    expect(themeClasses.grid.cols4).toContain('lg:grid-cols-4');
  });
});

describe('typography', () => {
  it('heading contains text-heading-sm', () => {
    expect(typography.heading).toContain('text-heading-sm');
  });

  it('label contains dark mode text', () => {
    expect(typography.label).toContain('text-slate-500');
    expect(typography.label).toContain('dark:text-slate-400');
  });

  it('body contains text-body-sm', () => {
    expect(typography.body).toContain('text-body-sm');
  });

  it('caption contains text-caption', () => {
    expect(typography.caption).toContain('text-caption');
  });
});
