import { pipeline, env } from '@xenova/transformers';

env.localModelPath = process.env.LOCAL_MODEL_PATH || '';
env.allowRemoteModels = true;

type PipelineInstance = (texts: string[], options?: { pooling?: string; normalize?: boolean }) => Promise<{ data: number[]; dims: number[] }[]>;

let pipe: PipelineInstance | null = null;
let pipeLoadPromise: Promise<PipelineInstance> | null = null;

const modelName = process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2';

async function getPipeline(): Promise<PipelineInstance> {
  if (pipe) return pipe;
  if (!pipeLoadPromise) {
    pipeLoadPromise = pipeline('feature-extraction', modelName) as unknown as Promise<PipelineInstance>;
  }
  pipe = await pipeLoadPromise;
  return pipe;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const p = await getPipeline();
  const result = await p([text], { pooling: 'mean', normalize: true });
  return Array.from(result[0].data);
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const p = await getPipeline();
  const results: number[][] = [];
  for (const text of texts) {
    const result = await p([text], { pooling: 'mean', normalize: true });
    results.push(Array.from(result[0].data));
  }
  return results;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : Math.max(0, Math.min(1, dot / denom));
}

export async function semanticScore(text: string, query: string): Promise<number> {
  const [textEmb, queryEmb] = await getEmbeddings([text.slice(0, 8000), query.slice(0, 2000)]);
  return cosineSimilarity(textEmb, queryEmb);
}

export async function semanticSearch(
  items: { id: string; text: string }[],
  query: string,
  topK = 5,
): Promise<{ id: string; score: number }[]> {
  if (!items.length) return [];
  const queryEmb = await getEmbedding(query.slice(0, 2000));
  const texts = items.map((i) => i.text.slice(0, 8000));
  const embeddings = await getEmbeddings(texts);
  const scored = items.map((item, i) => ({
    id: item.id,
    score: cosineSimilarity(queryEmb, embeddings[i]),
  }));
  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}
