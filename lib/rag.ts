import { getEmbedding, getEmbeddings, cosineSimilarity } from './embedding';
import type { IntelligenceReport } from './types';

export type RagDocument = {
  id: string;
  text: string;
  metadata: {
    type: 'finding' | 'subservice' | 'analysis' | 'report';
    competitorName?: string;
    serviceLine?: string;
    subservice?: string;
    url?: string;
  };
};

export type RagResult = {
  id: string;
  score: number;
  excerpt: string;
  metadata: RagDocument['metadata'];
};

let index: { docs: RagDocument[]; embeddings: number[][] } | null = null;

export async function buildIndex(report: IntelligenceReport): Promise<void> {
  const docs: RagDocument[] = [];
  for (const analysis of report.analyses || []) {
    for (const finding of analysis.findings || []) {
      const findingText = [
        `Competitor: ${finding.competitorName}`,
        `Service: ${finding.serviceLine}`,
        `Status: ${finding.competitorStatus}`,
        `Evidence: ${finding.evidenceExcerpt}`,
        `Advantage: ${finding.andwellAdvantage}`,
        `Safe wording: ${finding.safeSalesWording}`,
      ].join('. ');
      docs.push({
        id: finding.id,
        text: findingText,
        metadata: { type: 'finding', competitorName: finding.competitorName, serviceLine: finding.serviceLine },
      });
      for (const sub of finding.subserviceFindings || []) {
        const subText = [
          `Competitor: ${sub.competitorName}`,
          `Service: ${sub.serviceLine}`,
          `Subservice: ${sub.subservice}`,
          `Status: ${sub.competitorStatus}`,
          `Evidence: ${sub.evidenceExcerpt}`,
          `Safe wording: ${sub.safeSalesWording}`,
        ].join('. ');
        docs.push({
          id: sub.id,
          text: subText,
          metadata: { type: 'subservice', competitorName: sub.competitorName, serviceLine: sub.serviceLine, subservice: sub.subservice },
        });
      }
    }
    const analysisText = [
      `Competitor: ${analysis.name}`,
      `URL: ${analysis.url}`,
      `Market: ${analysis.market}`,
      `Threat: ${analysis.score.threatLevel}`,
      `Match score: ${analysis.score.serviceLineMatchScore}%`,
      `Differentiation: ${analysis.score.andwellDifferentiationScore}%`,
    ].join('. ');
    docs.push({
      id: analysis.id,
      text: analysisText,
      metadata: { type: 'analysis', competitorName: analysis.name },
    });
  }
  const embeddings = await getEmbeddings(docs.map((d) => d.text.slice(0, 8000)));
  index = { docs, embeddings };
}

export function isIndexReady(): boolean {
  return index !== null && index.docs.length > 0;
}

export async function queryIndex(question: string, topK = 8): Promise<RagResult[]> {
  if (!index || !index.docs.length) return [];
  const queryEmb = await getEmbedding(question.slice(0, 2000));
  const scored = index.docs.map((doc, i) => ({
    doc,
    score: cosineSimilarity(queryEmb, index!.embeddings[i]),
  }));
  const top = scored.sort((a, b) => b.score - a.score).slice(0, topK);
  return top.map((entry) => ({
    id: entry.doc.id,
    score: Math.round(entry.score * 1000) / 1000,
    excerpt: entry.doc.text.slice(0, 400),
    metadata: entry.doc.metadata,
  }));
}

export async function ragQuery(
  question: string,
  report: IntelligenceReport | null,
  topK = 8,
): Promise<{ answer: string; sources: RagResult[] }> {
  if (!isIndexReady() && report) {
    await buildIndex(report);
  }
  const sources = await queryIndex(question, topK);
  if (!sources.length) {
    return { answer: 'No relevant findings found. Load a report first.', sources: [] };
  }
  const topSources = sources.slice(0, 3);
  const context = topSources.map((s) => `[${s.metadata.type}] ${s.excerpt}`).join('\n\n');
  const answer = `Based on the intelligence report, here is what I found:\n\n${context}\n\n${
    sources.length > 3 ? `(${sources.length - 3} more relevant sources available)` : ''
  }`;
  return { answer, sources };
}

export function clearIndex(): void {
  index = null;
}
