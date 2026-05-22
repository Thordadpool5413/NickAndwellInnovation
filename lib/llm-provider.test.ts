import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getProvider, getProviderDiagnostics } from './llm-provider';

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.restoreAllMocks();
  process.env = { ...originalEnv };
});

describe('getProvider', () => {
  it('returns OpenAI provider by default', () => {
    delete process.env.LLM_PROVIDER;
    const provider = getProvider();
    expect(provider.name).toBe('OpenAI');
  });

  it('returns OpenAI when LLM_PROVIDER=openai', () => {
    process.env.LLM_PROVIDER = 'openai';
    expect(getProvider().name).toBe('OpenAI');
  });

  it('returns Anthropic when LLM_PROVIDER=anthropic', () => {
    process.env.LLM_PROVIDER = 'anthropic';
    expect(getProvider().name).toBe('Anthropic');
  });

  it('returns Ollama when LLM_PROVIDER=ollama', () => {
    process.env.LLM_PROVIDER = 'ollama';
    expect(getProvider().name).toBe('Ollama');
  });

  it('all providers implement the call method', async () => {
    const providers = [getProvider()];
    process.env.LLM_PROVIDER = 'anthropic';
    providers.push(getProvider());
    process.env.LLM_PROVIDER = 'ollama';
    providers.push(getProvider());

    for (const p of providers) {
      expect(typeof p.call).toBe('function');
      expect(typeof p.name).toBe('string');
      expect(p.name.length).toBeGreaterThan(0);
    }
  });
});

describe('getProviderDiagnostics', () => {
  it('reports openai provider by default', () => {
    delete process.env.LLM_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    const diag = getProviderDiagnostics();
    expect(diag.provider).toBe('openai');
    expect(diag.configured).toBe(false);
    expect(diag.envKey).toBe('OPENAI_API_KEY');
  });

  it('reports configured=true when key is set', () => {
    process.env.OPENAI_API_KEY = 'sk-test123';
    const diag = getProviderDiagnostics();
    expect(diag.configured).toBe(true);
  });

  it('reports ollama as configured without env key', () => {
    process.env.LLM_PROVIDER = 'ollama';
    const diag = getProviderDiagnostics();
    expect(diag.provider).toBe('ollama');
    expect(diag.configured).toBe(true);
    expect(diag.envKey).toBe('none (local)');
  });

  it('reports anthropic provider', () => {
    process.env.LLM_PROVIDER = 'anthropic';
    const diag = getProviderDiagnostics();
    expect(diag.provider).toBe('anthropic');
    expect(diag.envKey).toBe('ANTHROPIC_API_KEY');
  });
});
