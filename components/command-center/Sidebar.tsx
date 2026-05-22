'use client';

import { navIcons, navGroups } from '../../lib/command-center/constants';
import { nav, roleGuidance } from '../../lib/command-center/data';
import { useCommandCenter } from '../../lib/command-center/store';

export function Sidebar() {
  const view = useCommandCenter((s) => s.view);
  const setView = useCommandCenter((s) => s.setView);
  const roleView = useCommandCenter((s) => s.roleView);
  const setRoleView = useCommandCenter((s) => s.setRoleView);
  return (
    <aside className="side">
      <div className="brand proBrand"><p>Andwell Innovation</p><h1>Expert Operating System</h1><span>One expert layer for market evidence, growth strategy, staffing, field language, and board decisions.</span></div>
      <div className="roleBox">
        <label>Lens</label>
        <select className="select darkSelect" value={roleView} onChange={(event) => setRoleView(event.target.value as import('../../lib/command-center/types').RoleView)} aria-label="Role lens">
          {(Object.keys(roleGuidance) as import('../../lib/command-center/types').RoleView[]).map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
        <p>{roleGuidance[roleView].headline}</p>
      </div>
      <nav className="nav proNav">{navGroups.map((group) => <div key={group.label} className="side-group"><div className="side-group-label">{group.label}</div>{group.keys.map((key) => { const item = nav.find((n) => n.key === key); if (!item) return null; const Icon = navIcons[item.key]; return <button key={item.key} className={view === item.key ? 'active' : ''} onClick={() => setView(item.key)}><Icon className="w-4 h-4 shrink-0" /><span><strong>{item.label}</strong><small>{item.note}</small></span></button>; })}</div>)}</nav>
    </aside>
  );
}
