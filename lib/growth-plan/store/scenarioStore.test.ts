import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useScenarioStore } from './scenarioStore';
import { DEFAULT_SCENARIO } from '../data/constants';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
  useScenarioStore.setState({
    currentScenario: DEFAULT_SCENARIO,
    scenarios: [],
    activeScenarioId: null,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useScenarioStore', () => {
  describe('initial state', () => {
    it('starts with default scenario', () => {
      const state = useScenarioStore.getState();
      expect(state.currentScenario).toEqual(DEFAULT_SCENARIO);
    });

    it('starts with empty scenarios list', () => {
      expect(useScenarioStore.getState().scenarios).toHaveLength(0);
    });

    it('starts with null activeScenarioId', () => {
      expect(useScenarioStore.getState().activeScenarioId).toBeNull();
    });
  });

  describe('updateScenario', () => {
    it('updates conversionRate', () => {
      useScenarioStore.getState().updateScenario({ conversionRate: 0.85 });
      expect(useScenarioStore.getState().currentScenario.conversionRate).toBe(0.85);
    });

    it('merges partial updates without losing other fields', () => {
      useScenarioStore.getState().updateScenario({ conversionRate: 0.9 });
      const state = useScenarioStore.getState().currentScenario;
      expect(state.conversionRate).toBe(0.9);
      expect(state.hhCapture).toEqual(DEFAULT_SCENARIO.hhCapture);
      expect(state.woundCapture).toEqual(DEFAULT_SCENARIO.woundCapture);
      expect(state.therapyCapture).toEqual(DEFAULT_SCENARIO.therapyCapture);
    });

    it('updates capture arrays', () => {
      const newHh = [0.2, 0.25, 0.3];
      useScenarioStore.getState().updateScenario({ hhCapture: newHh });
      expect(useScenarioStore.getState().currentScenario.hhCapture).toEqual(newHh);
    });

    it('updates marginOverrides', () => {
      const overrides = { 'York-HH': 0.05 };
      useScenarioStore.getState().updateScenario({ marginOverrides: overrides });
      expect(useScenarioStore.getState().currentScenario.marginOverrides).toEqual(overrides);
    });
  });

  describe('saveScenario', () => {
    it('saves a scenario and returns its id', () => {
      const id = useScenarioStore.getState().saveScenario('Test Plan');
      expect(typeof id).toBe('string');
      expect(useScenarioStore.getState().scenarios).toHaveLength(1);
      expect(useScenarioStore.getState().scenarios[0].name).toBe('Test Plan');
    });

    it('saves with description', () => {
      const id = useScenarioStore.getState().saveScenario('Test Plan', 'A test description');
      const saved = useScenarioStore.getState().scenarios.find(s => s.id === id);
      expect(saved?.description).toBe('A test description');
    });

    it('defaults description to empty string', () => {
      const id = useScenarioStore.getState().saveScenario('No Desc');
      const saved = useScenarioStore.getState().scenarios.find(s => s.id === id);
      expect(saved?.description).toBe('');
    });

    it('saves the current scenario data', () => {
      useScenarioStore.getState().updateScenario({ conversionRate: 0.5 });
      const id = useScenarioStore.getState().saveScenario('Low Conversion');
      const saved = useScenarioStore.getState().scenarios.find(s => s.id === id);
      expect(saved?.data.conversionRate).toBe(0.5);
    });

    it('sets activeScenarioId to the new scenario id', () => {
      const id = useScenarioStore.getState().saveScenario('Active');
      expect(useScenarioStore.getState().activeScenarioId).toBe(id);
    });
  });

  describe('loadScenario', () => {
    it('restores a saved scenario into currentScenario', () => {
      const id = useScenarioStore.getState().saveScenario('My Plan');
      useScenarioStore.getState().updateScenario({ conversionRate: 0.99 });
      useScenarioStore.getState().loadScenario(id);
      expect(useScenarioStore.getState().currentScenario.conversionRate).toBe(DEFAULT_SCENARIO.conversionRate);
    });

    it('sets activeScenarioId when loading', () => {
      const id = useScenarioStore.getState().saveScenario('Load Me');
      useScenarioStore.getState().loadScenario(id);
      expect(useScenarioStore.getState().activeScenarioId).toBe(id);
    });

    it('does nothing when id does not exist', () => {
      const stateBefore = useScenarioStore.getState().currentScenario;
      useScenarioStore.getState().loadScenario('non-existent');
      expect(useScenarioStore.getState().currentScenario).toEqual(stateBefore);
    });
  });

  describe('deleteScenario', () => {
    it('removes a saved scenario', () => {
      useScenarioStore.getState().saveScenario('Delete Me');
      const id = useScenarioStore.getState().scenarios[0].id;
      useScenarioStore.getState().deleteScenario(id);
      expect(useScenarioStore.getState().scenarios).toHaveLength(0);
    });

    it('clears activeScenarioId when deleting the active scenario', () => {
      const id = useScenarioStore.getState().saveScenario('Active');
      useScenarioStore.getState().deleteScenario(id);
      expect(useScenarioStore.getState().activeScenarioId).toBeNull();
    });

    it('does not clear activeScenarioId when deleting a different scenario', () => {
      useScenarioStore.getState().saveScenario('First');
      vi.advanceTimersByTime(1);
      useScenarioStore.getState().saveScenario('Second');
      const ids = useScenarioStore.getState().scenarios.map(s => s.id);
      useScenarioStore.getState().deleteScenario(ids[0]);
      expect(useScenarioStore.getState().activeScenarioId).toBe(ids[1]);
    });
  });

  describe('updateScenarioMetadata', () => {
    it('updates name and description of a saved scenario', () => {
      const id = useScenarioStore.getState().saveScenario('Old', 'Old desc');
      useScenarioStore.getState().updateScenarioMetadata(id, 'New', 'New desc');
      const saved = useScenarioStore.getState().scenarios.find(s => s.id === id);
      expect(saved?.name).toBe('New');
      expect(saved?.description).toBe('New desc');
    });

    it('does not affect other scenarios', () => {
      useScenarioStore.getState().saveScenario('One');
      vi.advanceTimersByTime(1);
      useScenarioStore.getState().saveScenario('Two');
      const ids = useScenarioStore.getState().scenarios.map(s => s.id);
      useScenarioStore.getState().updateScenarioMetadata(ids[0], 'Changed', '');
      const unchanged = useScenarioStore.getState().scenarios.find(s => s.id === ids[1]);
      expect(unchanged?.name).toBe('Two');
    });

    it('does nothing when id does not exist', () => {
      const countBefore = useScenarioStore.getState().scenarios.length;
      useScenarioStore.getState().updateScenarioMetadata('nope', 'X', 'Y');
      expect(useScenarioStore.getState().scenarios).toHaveLength(countBefore);
    });
  });

  describe('compareScenarios', () => {
    it('returns the current scenario when "current" is requested', () => {
      const result = useScenarioStore.getState().compareScenarios(['current']);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('current');
      expect((result[0] as { name: string }).name).toBe('Current');
    });

    it('returns saved scenarios by id', () => {
      const id = useScenarioStore.getState().saveScenario('Compare');
      const result = useScenarioStore.getState().compareScenarios([id]);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe(id);
    });

    it('returns undefined for missing ids', () => {
      const result = useScenarioStore.getState().compareScenarios(['missing']);
      expect(result[0]).toBeUndefined();
    });

    it('returns mixed results for current, saved, and missing ids', () => {
      const id = useScenarioStore.getState().saveScenario('Mix');
      const result = useScenarioStore.getState().compareScenarios(['current', id, 'ghost']);
      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('current');
      expect(result[1]?.id).toBe(id);
      expect(result[2]).toBeUndefined();
    });
  });

  describe('resetToDefault', () => {
    it('resets currentScenario to DEFAULT_SCENARIO', () => {
      useScenarioStore.getState().updateScenario({ conversionRate: 0.5 });
      useScenarioStore.getState().resetToDefault();
      expect(useScenarioStore.getState().currentScenario).toEqual(DEFAULT_SCENARIO);
    });

    it('sets activeScenarioId to null', () => {
      useScenarioStore.getState().saveScenario('Test');
      useScenarioStore.getState().resetToDefault();
      expect(useScenarioStore.getState().activeScenarioId).toBeNull();
    });

    it('does not clear saved scenarios', () => {
      useScenarioStore.getState().saveScenario('Keep Me');
      useScenarioStore.getState().resetToDefault();
      expect(useScenarioStore.getState().scenarios).toHaveLength(1);
    });
  });

  describe('exportScenarios', () => {
    it('returns a JSON string with current, scenarios, and exportDate', () => {
      useScenarioStore.getState().saveScenario('Export Test');
      const json = useScenarioStore.getState().exportScenarios();
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('current');
      expect(parsed).toHaveProperty('scenarios');
      expect(parsed).toHaveProperty('exportDate');
      expect(parsed.scenarios).toHaveLength(1);
    });

    it('includes current scenario data in the export', () => {
      useScenarioStore.getState().updateScenario({ conversionRate: 0.3 });
      const json = useScenarioStore.getState().exportScenarios();
      const parsed = JSON.parse(json);
      expect(parsed.current.conversionRate).toBe(0.3);
    });
  });

  describe('importScenarios', () => {
    it('imports a valid JSON string', () => {
      const json = JSON.stringify({
        current: DEFAULT_SCENARIO,
        scenarios: [{ id: '1', name: 'Imported', description: '', data: DEFAULT_SCENARIO, createdAt: '2025-01-01' }],
      });
      const result = useScenarioStore.getState().importScenarios(json);
      expect(result).toBe(true);
      expect(useScenarioStore.getState().scenarios).toHaveLength(1);
    });

    it('returns false for invalid JSON', () => {
      const result = useScenarioStore.getState().importScenarios('not json');
      expect(result).toBe(false);
    });

    it('uses default scenario when current is missing in import', () => {
      const json = JSON.stringify({ scenarios: [] });
      useScenarioStore.getState().importScenarios(json);
      expect(useScenarioStore.getState().currentScenario).toEqual(DEFAULT_SCENARIO);
    });

    it('defaults scenarios to empty array when missing', () => {
      const json = JSON.stringify({ current: DEFAULT_SCENARIO });
      useScenarioStore.getState().importScenarios(json);
      expect(useScenarioStore.getState().scenarios).toEqual([]);
    });

    it('handles malformed data gracefully and logs error', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = useScenarioStore.getState().importScenarios('{bad json');
      expect(result).toBe(false);
      vi.restoreAllMocks();
    });
  });

  describe('getScenarioStats', () => {
    it('returns zero stats when no scenarios exist', () => {
      const stats = useScenarioStore.getState().getScenarioStats();
      expect(stats.totalScenarios).toBe(0);
      expect(stats.hasSavedScenarios).toBe(false);
      expect(stats.activeScenario).toBeUndefined();
    });

    it('returns correct stats when a scenario exists and is active', () => {
      const id = useScenarioStore.getState().saveScenario('Stats Test');
      const stats = useScenarioStore.getState().getScenarioStats();
      expect(stats.totalScenarios).toBe(1);
      expect(stats.hasSavedScenarios).toBe(true);
      expect(stats.activeScenario?.id).toBe(id);
    });

    it('returns undefined active scenario when none is active', () => {
      useScenarioStore.getState().saveScenario('No Active');
      useScenarioStore.setState({ activeScenarioId: null });
      const stats = useScenarioStore.getState().getScenarioStats();
      expect(stats.activeScenario).toBeUndefined();
    });
  });
});
