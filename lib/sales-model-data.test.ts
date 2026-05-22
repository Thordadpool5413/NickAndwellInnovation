import { describe, it, expect } from 'vitest';
import {
  phases,
  objectionLibrary,
  clinicalChecklist,
  phaseForScore,
  generateDiscoveryQuestions
} from './sales-model-data';

describe('phases', () => {
  it('has 4 phases', () => {
    expect(phases).toHaveLength(4);
  });

  it('phase keys are in correct order', () => {
    const keys = phases.map((p) => p.key);
    expect(keys).toEqual(['Discovery', 'Connecting', 'Guiding', 'Commitment']);
  });

  it('each phase has all required fields', () => {
    for (const phase of phases) {
      expect(phase).toHaveProperty('key');
      expect(phase).toHaveProperty('icon');
      expect(phase).toHaveProperty('promise');
      expect(phase).toHaveProperty('purpose');
      expect(phase).toHaveProperty('fieldProof');
      expect(phase).toHaveProperty('skills');
      expect(phase).toHaveProperty('fieldQuestions');
      expect(phase).toHaveProperty('avoid');
    }
  });

  it('each phase has at least 2 skills', () => {
    for (const phase of phases) {
      expect(phase.skills.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('each phase has at least 4 field questions', () => {
    for (const phase of phases) {
      expect(phase.fieldQuestions.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('each phase has at least 3 avoid items', () => {
    for (const phase of phases) {
      expect(phase.avoid.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('Discovery phase has search icon', () => {
    const discovery = phases.find((p) => p.key === 'Discovery');
    expect(discovery?.icon).toBe('search');
    expect(discovery?.promise).toContain('Understand before you guide');
  });

  it('Connecting phase has message icon', () => {
    const connecting = phases.find((p) => p.key === 'Connecting');
    expect(connecting?.icon).toBe('message');
    expect(connecting?.promise).toContain('Reflect before you redirect');
  });

  it('Guiding phase has target icon', () => {
    const guiding = phases.find((p) => p.key === 'Guiding');
    expect(guiding?.icon).toBe('target');
    expect(guiding?.promise).toContain('Match support to the stated need');
  });

  it('Commitment phase has checkCircle icon', () => {
    const commitment = phases.find((p) => p.key === 'Commitment');
    expect(commitment?.icon).toBe('checkCircle');
    expect(commitment?.promise).toContain('Create clarity without pressure');
  });
});

describe('objectionLibrary', () => {
  it('has 8 objection entries', () => {
    expect(objectionLibrary).toHaveLength(8);
  });

  it('each entry has all required fields', () => {
    for (const entry of objectionLibrary) {
      expect(entry).toHaveProperty('objection');
      expect(entry).toHaveProperty('meaning');
      expect(entry).toHaveProperty('response');
      expect(entry).toHaveProperty('returnQuestion');
    }
  });

  it('first objection is about hospice feeling too early', () => {
    expect(objectionLibrary[0].objection).toContain('Hospice feels too early');
  });

  it('last objection is about bad prior hospice experience', () => {
    expect(objectionLibrary[7].objection).toContain('bad hospice experience');
  });

  it('each objection has a non-empty return question', () => {
    for (const entry of objectionLibrary) {
      expect(entry.returnQuestion.length).toBeGreaterThan(0);
    }
  });

  it('each meaning is a complete sentence', () => {
    for (const entry of objectionLibrary) {
      expect(entry.meaning.endsWith('.')).toBe(true);
    }
  });
});

describe('clinicalChecklist', () => {
  it('has 5 clinical signals', () => {
    expect(clinicalChecklist).toHaveLength(5);
  });

  it('each entry has id, label, and help', () => {
    for (const signal of clinicalChecklist) {
      expect(signal).toHaveProperty('id');
      expect(signal).toHaveProperty('label');
      expect(signal).toHaveProperty('help');
    }
  });

  it('includes diagnosis and trajectory', () => {
    expect(clinicalChecklist[0].id).toBe('diagnosis');
    expect(clinicalChecklist[0].label).toContain('diagnosis');
  });

  it('includes decision maker and goals', () => {
    const decision = clinicalChecklist.find((s) => s.id === 'decision');
    expect(decision?.label).toContain('Decision maker');
  });

  it('each help field provides useful guidance', () => {
    for (const signal of clinicalChecklist) {
      expect(signal.help.length).toBeGreaterThan(0);
    }
  });
});

describe('phaseForScore', () => {
  it('returns Discovery for scores below 40', () => {
    expect(phaseForScore(0)).toBe('Discovery');
    expect(phaseForScore(20)).toBe('Discovery');
    expect(phaseForScore(39)).toBe('Discovery');
  });

  it('returns Connecting for scores 40-59', () => {
    expect(phaseForScore(40)).toBe('Connecting');
    expect(phaseForScore(50)).toBe('Connecting');
    expect(phaseForScore(59)).toBe('Connecting');
  });

  it('returns Guiding for scores 60-79', () => {
    expect(phaseForScore(60)).toBe('Guiding');
    expect(phaseForScore(70)).toBe('Guiding');
    expect(phaseForScore(79)).toBe('Guiding');
  });

  it('returns Commitment for scores 80 and above', () => {
    expect(phaseForScore(80)).toBe('Commitment');
    expect(phaseForScore(95)).toBe('Commitment');
    expect(phaseForScore(100)).toBe('Commitment');
  });

  it('handles negative scores', () => {
    expect(phaseForScore(-1)).toBe('Discovery');
  });

  it('handles decimal scores', () => {
    expect(phaseForScore(39.9)).toBe('Discovery');
    expect(phaseForScore(59.9)).toBe('Connecting');
    expect(phaseForScore(79.9)).toBe('Guiding');
  });
});

describe('generateDiscoveryQuestions', () => {
  it('returns 4 questions', () => {
    const questions = generateDiscoveryQuestions('Competitor X');
    expect(questions).toHaveLength(4);
  });

  it('includes the competitor name in each question', () => {
    const questions = generateDiscoveryQuestions('Competitor X');
    for (const q of questions) {
      expect(q).toContain('Competitor X');
    }
  });

  it('first question asks about current experience', () => {
    const questions = generateDiscoveryQuestions('Test Corp');
    expect(questions[0]).toContain('current experience');
  });

  it('last question asks about referral friction', () => {
    const questions = generateDiscoveryQuestions('Test Corp');
    expect(questions[3]).toContain('friction');
  });

  it('handles competitor name with special characters', () => {
    const questions = generateDiscoveryQuestions("O'Brien Health");
    for (const q of questions) {
      expect(q).toContain("O'Brien Health");
    }
  });

  it('questions end with question mark', () => {
    const questions = generateDiscoveryQuestions('Any Corp');
    for (const q of questions) {
      expect(q.endsWith('?')).toBe(true);
    }
  });
});
