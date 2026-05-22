'use client';

import { workspaceToolsConfig } from '../../lib/command-center/constants';
import { nav } from '../../lib/command-center/data';
import { useCommandCenter } from '../../lib/command-center/store';

export function WorkspaceTools() {
  const view = useCommandCenter((s) => s.view);
  const setView = useCommandCenter((s) => s.setView);
  const tools = Object.values(workspaceToolsConfig).find((group) => group?.keys.includes(view));
  if (!tools) return null;
  return <div className="card" style={{ padding: '14px 16px', marginBottom: '16px' }}>
    <div className="row spread" style={{ gap: '12px' }}>
      <strong className="text-small" style={{ color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{tools.label}</strong>
      <div className="row" style={{ gap: '8px' }}>
        {tools.keys.map((key) => {
          const item = nav.find((entry) => entry.key === key);
          if (!item) return null;
          return <button key={key} className={`btn ${view === key ? 'primary' : ''}`} onClick={() => setView(key)}>{item.label}</button>;
        })}
      </div>
    </div>
  </div>;
}
