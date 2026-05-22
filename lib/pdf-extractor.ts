export async function extractTextFromPdf(buffer: Buffer, url: string): Promise<string> {
  try {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text.trim() || '';
  } catch {
    return '';
  }
}

export async function crawlPdfUrl(url: string): Promise<{ text: string; excerpt: string } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'CompetitiveIntelligenceHub/1.0 public healthcare service research',
        accept: 'application/pdf',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/pdf')) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const text = await extractTextFromPdf(buffer, url);
    if (!text) return null;
    return { text: text.slice(0, 32000), excerpt: text.slice(0, 900) };
  } catch {
    return null;
  }
}

export function hasPdfExtension(url: string): boolean {
  return url.toLowerCase().includes('.pdf');
}
