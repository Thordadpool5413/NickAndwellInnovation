export interface LLMProvider {
  name: string;
  call(prompt: string, options: { maxTokens: number; temperature: number }): Promise<string>;
}

export type ProviderConfig = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
};

class OpenAIProvider implements LLMProvider {
  name = 'OpenAI';
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = (config.baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com').replace(/\/$/, '');
    this.model = config.model || process.env.OPENAI_MODEL || 'gpt-4.1-nano';
  }

  async call(prompt: string, options: { maxTokens: number; temperature: number }): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/responses`, {
      method: 'POST',
      headers: { authorization: `Bearer ${this.apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: this.model, input: prompt, temperature: options.temperature, max_output_tokens: options.maxTokens }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI HTTP error: ${response.status} ${errorText.slice(0, 500)}`);
    }
    const payload = await response.json();
    return payload.output_text || payload.output?.flatMap((item: any) => item.content || []).map((c: any) => c.text || '').join('\n') || '';
  }
}

class AnthropicProvider implements LLMProvider {
  name = 'Anthropic';
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.baseUrl = (config.baseUrl || process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');
    this.model = config.model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
  }

  async call(prompt: string, options: { maxTokens: number; temperature: number }): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: { 'x-api-key': this.apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: this.model, max_tokens: options.maxTokens, temperature: options.temperature, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic HTTP error: ${response.status} ${errorText.slice(0, 500)}`);
    }
    const payload = await response.json();
    return payload.content?.map((c: any) => c.text || '').join('\n') || '';
  }
}

class OllamaProvider implements LLMProvider {
  name = 'Ollama';
  private baseUrl: string;
  private model: string;

  constructor(config: ProviderConfig) {
    this.baseUrl = (config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
    this.model = config.model || process.env.OLLAMA_MODEL || 'llama3.2';
  }

  async call(prompt: string, options: { maxTokens: number; temperature: number }): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: this.model, messages: [{ role: 'user', content: prompt }], options: { num_predict: options.maxTokens, temperature: options.temperature } }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama HTTP error: ${response.status} ${errorText.slice(0, 500)}`);
    }
    const lines = (await response.text()).trim().split('\n');
    const contents: string[] = [];
    for (const line of lines) {
      try { const parsed = JSON.parse(line); if (parsed.message?.content) contents.push(parsed.message.content); } catch { /* skip line */ }
    }
    return contents.join('');
  }
}

export function getProvider(): LLMProvider {
  const variant = (process.env.LLM_PROVIDER || 'openai').toLowerCase();
  if (variant === 'anthropic') return new AnthropicProvider({});
  if (variant === 'ollama') return new OllamaProvider({});
  return new OpenAIProvider({});
}

export function getProviderDiagnostics() {
  const variant = (process.env.LLM_PROVIDER || 'openai').toLowerCase();
  const configured = variant === 'openai' ? Boolean(process.env.OPENAI_API_KEY) : variant === 'anthropic' ? Boolean(process.env.ANTHROPIC_API_KEY) : true;
  const envKey = variant === 'openai' ? 'OPENAI_API_KEY' : variant === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'none (local)';
  return { provider: variant, configured, envKey };
}
