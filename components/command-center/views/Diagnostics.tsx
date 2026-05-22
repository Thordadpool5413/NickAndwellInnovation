'use client';

import React from 'react';
import { Badge, Panel, Stat } from '../Shared';
import type { ApiCheck } from '../../../lib/command-center/types';

export function Diagnostics({ diagnostics, runDiagnostics, busy }: { diagnostics: ApiCheck[]; runDiagnostics: () => void; busy: boolean }) {
  const healthy = diagnostics.filter((item) => item.ok).length;
  return <><section className="section"><div><h1>System Check</h1><p>Confirms whether Hostinger is returning JSON or HTML for API routes, including runtime startup status after deployment.</p></div><button className="btn primary" disabled={busy} onClick={runDiagnostics}>{busy ? 'Running...' : 'Run System Check'}</button></section>
    {diagnostics.length === 0 && !busy && <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
      <p className="text-small muted" style={{ margin: 0 }}>Click <strong>Run System Check</strong> to verify all API routes are returning valid JSON.</p>
    </div>}
    {diagnostics.length ? <div className="grid cols3"><Stat label="Routes checked" value={diagnostics.length} /><Stat label="Healthy" value={healthy} /><Stat label="Needs attention" value={diagnostics.length - healthy} /></div> : null}
    <div className="grid">{diagnostics.map((item) => <Panel key={item.route} title={item.route}><div className="row"><Badge tone={item.ok ? 'green' : 'red'}>{item.ok ? 'OK' : 'Problem'}</Badge><Badge>{item.status}</Badge></div><p>{item.message}</p><p className="muted">{item.preview}</p></Panel>)}</div>
  </>;
}
