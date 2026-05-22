import { describe, it, expect } from 'vitest';
import { nav, roleGuidance } from './data';
import type { View, RoleView } from './types';

describe('nav', () => {
  it('contains at least 30 navigation items', () => {
    expect(nav.length).toBeGreaterThanOrEqual(30);
  });

  it('all items have key, label, and note', () => {
    for (const item of nav) {
      expect(item.key).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.note).toBeTruthy();
    }
  });

  it('includes home as first item', () => {
    expect(nav[0].key).toBe('home');
    expect(nav[0].label).toBe('Home');
  });

  it('includes diagnostics as last item', () => {
    const last = nav[nav.length - 1];
    expect(last.key).toBe('diagnostics');
    expect(last.label).toBe('System Check');
  });

  it('all keys are valid View types', () => {
    const validViews: View[] = nav.map((item) => item.key);
    for (const view of validViews) {
      expect(view).toEqual(expect.any(String));
    }
  });

  it('no duplicate keys', () => {
    const keys = nav.map((item) => item.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('all notes are non-empty strings', () => {
    for (const item of nav) {
      expect(typeof item.note).toBe('string');
      expect(item.note.length).toBeGreaterThan(0);
    }
  });

  it('includes board-packet, growth, expert, and ask views', () => {
    const keys = nav.map((item) => item.key);
    expect(keys).toContain('board-packet');
    expect(keys).toContain('growth');
    expect(keys).toContain('expert');
    expect(keys).toContain('ask');
  });
});

describe('roleGuidance', () => {
  it('has entries for all RoleView values', () => {
    const roles: RoleView[] = ['Executive', 'Growth Leader', 'Sales Leader', 'Sales Rep', 'Board', 'Admin'];
    for (const role of roles) {
      expect(roleGuidance[role]).toBeDefined();
    }
  });

  it('each role has headline, focus, and action', () => {
    for (const role of Object.keys(roleGuidance) as RoleView[]) {
      const guidance = roleGuidance[role];
      expect(typeof guidance.headline).toBe('string');
      expect(guidance.headline.length).toBeGreaterThan(0);
      expect(typeof guidance.focus).toBe('string');
      expect(guidance.focus.length).toBeGreaterThan(0);
      expect(typeof guidance.action).toBe('string');
      expect(guidance.action.length).toBeGreaterThan(0);
    }
  });

  it('Executive guidance mentions leadership', () => {
    expect(roleGuidance.Executive.headline).toContain('Leadership');
  });

  it('Admin guidance mentions diagnostics', () => {
    expect(roleGuidance.Admin.focus).toContain('diagnostics');
  });

  it('Sales Rep guidance mentions Ask the Hub', () => {
    expect(roleGuidance['Sales Rep'].action).toContain('Ask the Hub');
  });

  it('Board guidance mentions board narrative', () => {
    expect(roleGuidance.Board.action).toContain('board narrative');
  });

  it('Growth Leader guidance mentions county sequencing', () => {
    expect(roleGuidance['Growth Leader'].focus).toContain('county sequencing');
  });

  it('Sales Leader guidance mentions Battlecards', () => {
    expect(roleGuidance['Sales Leader'].action).toContain('Battlecards');
  });
});
