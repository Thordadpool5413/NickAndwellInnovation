'use client';

import { useCommandCenter } from '../lib/command-center/store';
import { Sidebar } from '../components/command-center/Sidebar';
import { PageHeader } from '../components/command-center/PageHeader';
import { FeedbackBar } from '../components/command-center/FeedbackBar';
import { WorkspaceTools } from '../components/command-center/WorkspaceTools';
import { ViewRouter } from '../components/command-center/ViewRouter';

export default function Page() {
  const { view } = useCommandCenter();
  return <div className="proShell">
    <Sidebar />
    <main className={`main proMain ${view === 'home' ? 'homeMain' : ''}`}>
      <PageHeader />
      <div className="content proContent">
        <FeedbackBar />
        <WorkspaceTools />
        <ViewRouter />
      </div>
    </main>
  </div>;
}
