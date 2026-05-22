import { describe, it, expect } from 'vitest';
import { cosineSimilarity, semanticScore } from './embedding';

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 6);
  });

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 6);
  });

  it('returns 0 for empty vectors when magnitude is 0', () => {
    expect(cosineSimilarity([0, 0], [0, 1])).toBe(0);
  });

  it('returns 0 for mismatched lengths', () => {
    expect(cosineSimilarity([1], [1, 2])).toBe(0);
  });

  it('handles negative values', () => {
    const result = cosineSimilarity([1, -1], [-1, 1]);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('clamps result between 0 and 1', () => {
    const result = cosineSimilarity([1, 2], [-1, -2]);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
});

describe('semanticScore', () => {
  it('returns a number between 0 and 1 for matching text', async () => {
    const score = await semanticScore('healthcare services', 'hospital care');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('returns a higher score for similar text', async () => {
    const similar = await semanticScore('home health nursing care', 'home health');
    const different = await semanticScore('automotive repair shop', 'home health');
    expect(similar).toBeGreaterThanOrEqual(different);
  });

  it('handles empty text gracefully', async () => {
    const score = await semanticScore('', 'test');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('handles empty query gracefully', async () => {
    const score = await semanticScore('test', '');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});
