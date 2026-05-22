import { describe, it, expect } from 'vitest';
import {
  easings,
  durations,
  interpolate,
  formatNumberWithAnimation,
  getAnimationClass,
  getStaggerDelay,
  springAnimation
} from './animations';

describe('easings', () => {
  it('has all expected easing keys', () => {
    const keys = ['linear', 'easeIn', 'easeOut', 'easeInOut', 'easeInQuad', 'easeOutQuad', 'easeInCubic', 'easeOutCubic', 'easeInQuart', 'easeOutQuart', 'easeInQuint', 'easeOutQuint', 'easeInExpo', 'easeOutExpo', 'easeInCirc', 'easeOutCirc', 'easeInElastic', 'easeOutElastic', 'easeInBounce', 'easeOutBounce'];
    for (const key of keys) {
      expect(easings).toHaveProperty(key);
    }
  });

  it('linear is a valid CSS easing value', () => {
    expect(easings.linear).toBe('linear');
  });

  it('easeInOut is a cubic-bezier', () => {
    expect(easings.easeInOut).toMatch(/^cubic-bezier/);
  });
});

describe('durations', () => {
  it('has all expected duration keys', () => {
    const keys = ['instant', 'fastest', 'faster', 'fast', 'normal', 'slow', 'slower', 'slowest'];
    for (const key of keys) {
      expect(durations).toHaveProperty(key);
    }
  });

  it('instant is 0', () => {
    expect(durations.instant).toBe(0);
  });

  it('normal is 400', () => {
    expect(durations.normal).toBe(400);
  });

  it('durations are in ascending order', () => {
    const values = [durations.instant, durations.fastest, durations.faster, durations.fast, durations.normal, durations.slow, durations.slower, durations.slowest];
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });
});

describe('interpolate', () => {
  it('returns start when progress is 0', () => {
    expect(interpolate(10, 20, 0)).toBe(10);
  });

  it('returns end when progress is 1', () => {
    expect(interpolate(10, 20, 1)).toBe(20);
  });

  it('returns midpoint when progress is 0.5', () => {
    expect(interpolate(10, 20, 0.5)).toBe(15);
  });

  it('handles negative start', () => {
    expect(interpolate(-10, 10, 0.5)).toBe(0);
  });

  it('handles progress beyond range', () => {
    expect(interpolate(0, 100, 1.5)).toBe(150);
  });

  it('handles negative progress', () => {
    expect(interpolate(0, 100, -0.5)).toBe(-50);
  });

  it('handles equal start and end', () => {
    expect(interpolate(50, 50, 0.75)).toBe(50);
  });
});

describe('formatNumberWithAnimation', () => {
  it('returns locale string for number without formatter', () => {
    const result = formatNumberWithAnimation(1234567);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('uses custom formatter when provided', () => {
    const formatter = (n: number) => `$${n.toFixed(2)}`;
    expect(formatNumberWithAnimation(42, formatter)).toBe('$42.00');
  });

  it('returns string representation for non-number', () => {
    const result = formatNumberWithAnimation(undefined as unknown as number);
    expect(result).toBe('undefined');
  });

  it('returns string representation for null', () => {
    const result = formatNumberWithAnimation(null as unknown as number);
    expect(result).toBe('null');
  });

  it('handles zero', () => {
    const formatter = (n: number) => `${n}%`;
    expect(formatNumberWithAnimation(0, formatter)).toBe('0%');
  });

  it('handles negative numbers', () => {
    const formatter = (n: number) => n.toFixed(1);
    expect(formatNumberWithAnimation(-100, formatter)).toBe('-100.0');
  });

  it('applies formatter only when provided', () => {
    expect(formatNumberWithAnimation(1000)).toBe('1,000');
  });
});

describe('getAnimationClass', () => {
  it('returns correct class for slideIn', () => {
    expect(getAnimationClass('slideIn')).toBe('animate-slide-in');
  });

  it('returns correct class for fadeIn', () => {
    expect(getAnimationClass('fadeIn')).toBe('animate-fade-in');
  });

  it('returns correct class for shake', () => {
    expect(getAnimationClass('shake')).toBe('animate-shake');
  });

  it('returns fadeIn as default for unknown variant', () => {
    expect(getAnimationClass('unknown')).toBe('animate-fade-in');
  });

  it('returns fadeIn for empty string', () => {
    expect(getAnimationClass('')).toBe('animate-fade-in');
  });

  it('returns correct class for bounceIn', () => {
    expect(getAnimationClass('bounceIn')).toBe('animate-bounce-in');
  });

  it('returns correct class for slideInLeft', () => {
    expect(getAnimationClass('slideInLeft')).toBe('animate-slide-in-left');
  });
});

describe('getStaggerDelay', () => {
  it('returns 0ms for index 0 with default base', () => {
    expect(getStaggerDelay(0)).toBe('0ms');
  });

  it('returns 50ms for index 1 with default base', () => {
    expect(getStaggerDelay(1)).toBe('50ms');
  });

  it('returns 200ms for index 4 with default base', () => {
    expect(getStaggerDelay(4)).toBe('200ms');
  });

  it('uses custom base delay', () => {
    expect(getStaggerDelay(3, 100)).toBe('300ms');
  });

  it('handles negative index', () => {
    expect(getStaggerDelay(-1)).toBe('-50ms');
  });

  it('handles zero base delay', () => {
    expect(getStaggerDelay(5, 0)).toBe('0ms');
  });
});

describe('springAnimation', () => {
  it('returns default values when called without args', () => {
    const result = springAnimation();
    expect(result).toEqual({
      mass: 1,
      tension: 170,
      friction: 26,
      config: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    });
  });

  it('uses custom mass, tension, and friction', () => {
    const result = springAnimation(2, 300, 40);
    expect(result.mass).toBe(2);
    expect(result.tension).toBe(300);
    expect(result.friction).toBe(40);
  });

  it('config is always the same cubic-bezier', () => {
    const result = springAnimation(5, 100, 10);
    expect(result.config).toBe('cubic-bezier(0.68, -0.55, 0.265, 1.55)');
  });
});
