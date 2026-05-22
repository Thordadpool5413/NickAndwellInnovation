import { NextRequest, NextResponse } from 'next/server';
import { checkStaleCompetitors, reCrawlCompetitor, runScheduledCheck, getMonitorEntry } from '../../../lib/monitor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const results = await checkStaleCompetitors();
  return NextResponse.json({ ok: true, competitors: results, checkedAt: new Date().toISOString() });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { action?: string; url?: string };
  if (body.action === 'recheck' && body.url) {
    const result = await reCrawlCompetitor(body.url);
    const entry = await getMonitorEntry(body.url);
    return NextResponse.json({ ok: true, ...result, entry, action: 'recheck' });
  }
  if (body.action === 'run-scheduled') {
    const result = await runScheduledCheck();
    return NextResponse.json({ ok: true, ...result, action: 'scheduled' });
  }
  return NextResponse.json({ error: 'Specify action: "recheck" with url, or "run-scheduled".' }, { status: 400 });
}
