'use client';

import { nav } from '../../lib/command-center/data';
import { useCommandCenter } from '../../lib/command-center/store';
import { ThemeToggle } from '../ThemeProvider';
import { CommandSearch } from './views/CommandSearch';

export function PageHeader() {
  const view = useCommandCenter((s) => s.view);
  const setView = useCommandCenter((s) => s.setView);
  const currentReport = useCommandCenter((s) => s.currentReport);
  const busy = useCommandCenter((s) => s.busy);
  const phase = useCommandCenter((s) => s.phase);
  const refreshServerState = useCommandCenter((s) => s.refreshServerState);
  if (view === 'home') return null;
  return <header className="head proHead"><div><small>{currentReport?.expertBrief ? `Foremost Expert | ${currentReport.expertBrief.expertScore}` : currentReport?.aiEnabled ? `AI Enhanced | ${currentReport.aiModel || 'OpenAI'}` : 'Stable Build'}</small><h2>{nav.find((item) => item.key === view)?.label || 'Andwell Innovation'}</h2></div><div className="row"><ThemeToggle /><span className={`badge ${busy ? 'amber' : 'green'}`}>{phase}</span><CommandSearch currentReport={currentReport} onNavigate={setView} /><button className="btn" disabled={busy} onClick={refreshServerState}>Load Server Data</button><button className="btn" onClick={() => setView('diagnostics')}>System Check</button></div></header>;
}
