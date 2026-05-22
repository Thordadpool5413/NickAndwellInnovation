import { describe, it, expect } from 'vitest';
import { expertPromptModules, fullCompetitiveIntelligenceInstruction } from './expert-prompts';

describe('expertPromptModules', () => {
  it('has 5 prompt modules', () => {
    expect(expertPromptModules).toHaveLength(5);
  });

  it('each module has all required fields', () => {
    for (const mod of expertPromptModules) {
      expect(mod).toHaveProperty('id');
      expect(mod).toHaveProperty('title');
      expect(mod).toHaveProperty('purpose');
      expect(mod).toHaveProperty('instructions');
      expect(mod).toHaveProperty('requiredOutput');
    }
  });

  it('each module has non-empty title and purpose', () => {
    for (const mod of expertPromptModules) {
      expect(mod.title.length).toBeGreaterThan(0);
      expect(mod.purpose.length).toBeGreaterThan(0);
    }
  });

  it('each module has at least 1 instruction', () => {
    for (const mod of expertPromptModules) {
      expect(mod.instructions.length).toBeGreaterThan(0);
    }
  });

  it('each module has at least 1 required output', () => {
    for (const mod of expertPromptModules) {
      expect(mod.requiredOutput.length).toBeGreaterThan(0);
    }
  });

  it('has unique IDs', () => {
    const ids = expertPromptModules.map((m) => m.id);
    expect([...new Set(ids)]).toHaveLength(ids.length);
  });

  it('has strategic_extraction module with expected content', () => {
    const mod = expertPromptModules.find((m) => m.id === 'strategic_extraction');
    expect(mod?.title).toBe('Strategic Service Extraction');
    expect(mod?.instructions).toContain('Read the provider website as a healthcare competitive intelligence analyst, not as a generic web scraper.');
    expect(mod?.requiredOutput).toContain('Provider service inventory');
    expect(mod?.requiredOutput).toContain('Safe sales wording');
  });

  it('has andwell_comparison module with expected content', () => {
    const mod = expertPromptModules.find((m) => m.id === 'andwell_comparison');
    expect(mod?.title).toBe('Andwell Capability Comparison');
    expect(mod?.instructions).toContain('Use Andwell as the baseline provider.');
    expect(mod?.requiredOutput).toContain('Service match matrix');
    expect(mod?.requiredOutput).toContain('Review risk score');
  });

  it('has executive_synthesis module with expected content', () => {
    const mod = expertPromptModules.find((m) => m.id === 'executive_synthesis');
    expect(mod?.title).toBe('Executive Intelligence Synthesis');
    expect(mod?.instructions).toContain('Write for executive decision making, not raw data review.');
    expect(mod?.requiredOutput).toContain('Executive summary');
    expect(mod?.requiredOutput).toContain('Leadership recommendations');
  });

  it('has sales_enablement module with expected content', () => {
    const mod = expertPromptModules.find((m) => m.id === 'sales_enablement');
    expect(mod?.title).toBe('Sales Enablement and Battlecard Generation');
    expect(mod?.instructions).toContain('Write for a sales rep preparing for a real referral conversation.');
    expect(mod?.requiredOutput).toContain('Battlecard');
    expect(mod?.requiredOutput).toContain('Safe wording');
  });

  it('has governance module with expected content', () => {
    const mod = expertPromptModules.find((m) => m.id === 'governance');
    expect(mod?.title).toBe('Compliance and Review Governance');
    expect(mod?.instructions).toContain('Every finding must have a review status.');
    expect(mod?.requiredOutput).toContain('Review status');
    expect(mod?.requiredOutput).toContain('Rejected language if applicable');
  });

  it('each module has at least 5 instructions', () => {
    for (const mod of expertPromptModules) {
      expect(mod.instructions.length).toBeGreaterThanOrEqual(5);
    }
  });
});

describe('fullCompetitiveIntelligenceInstruction', () => {
  it('is a non-empty string', () => {
    expect(fullCompetitiveIntelligenceInstruction.length).toBeGreaterThan(0);
  });

  it('mentions Andwell Health Partners', () => {
    expect(fullCompetitiveIntelligenceInstruction).toContain('Andwell Health Partners');
  });

  it('mentions not found publicly', () => {
    expect(fullCompetitiveIntelligenceInstruction).toContain('not found publicly');
  });

  it('mentions battlecards', () => {
    expect(fullCompetitiveIntelligenceInstruction).toContain('battlecards');
  });

  it('mentions sales rep and CEO', () => {
    expect(fullCompetitiveIntelligenceInstruction).toContain('sales rep');
    expect(fullCompetitiveIntelligenceInstruction).toContain('CEO');
  });

  it('mentions evidence based findings', () => {
    expect(fullCompetitiveIntelligenceInstruction).toContain('evidence based');
  });
});
