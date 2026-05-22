'use client';

import React, { useMemo, useRef } from 'react';
import { Badge, SectionGroup } from '../Shared';
import { generateBoardPacket } from '../../../lib/strategy-brief';
import type { IntelligenceReport } from '../../../lib/types';
import type { GrowthRow, GrowthTotals, StaffingPlanItem } from '../../../lib/growth-plan';

export function BoardPacket({ currentReport, growthRows, totals, staffingPlan }: { currentReport: IntelligenceReport | null; growthRows: GrowthRow[]; totals: GrowthTotals; staffingPlan: StaffingPlanItem[] }) {
  const packet = useMemo(() => generateBoardPacket(currentReport, growthRows, totals, staffingPlan), [currentReport, growthRows, totals, staffingPlan]);
  const packetRef = useRef<HTMLDivElement>(null);
  const [staleCompetitors, setStaleCompetitors] = React.useState<{ url: string; stale: boolean; changed: boolean }[]>([]);

  React.useEffect(() => {
    if (currentReport) {
      fetch('/api/monitor').then((r) => r.json()).then((data) => {
        if (data.competitors) setStaleCompetitors(data.competitors);
      }).catch(() => {});
    }
  }, [currentReport]);

  if (!currentReport) {
    return <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
      <h3 className="text-subhead" style={{ margin: '0 0 8px' }}>No report loaded</h3>
      <p className="text-small muted">Load or run a competitive scan to generate a board packet.</p>
    </div>;
  }

  function handleExportJson() {
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'andwell-board-packet.json'; link.click(); URL.revokeObjectURL(url);
  }

  async function handleExportPdf() {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 20;
    let y = margin;
    const pageWidth = 210 - margin * 2;
    const lineHeight = 7;
    const pageHeight = 297;

    function addLine(text: string, size = 11, bold = false) {
      if (bold) doc.setFont('helvetica', 'bold');
      else doc.setFont('helvetica', 'normal');
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, pageWidth);
      for (const line of lines) {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      }
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    addLine(packet.title, 18, true);
    y += 4;

    addLine(`Generated ${packet.generatedAt}`, 9);
    y += 4;

    addLine('Executive Summary', 14, true);
    addLine(packet.executiveSummary, 10);
    y += 4;

    addLine('Market Opportunity', 14, true);
    addLine(packet.marketOpportunity, 10);
    y += 4;

    addLine('Financial Model', 14, true);
    packet.financialModel.forEach((m) => addLine(`${m.label}: ${m.value}`, 10));
    y += 4;

    addLine('Priority Counties', 14, true);
    packet.priorityCounties.forEach((pc) => addLine(`${pc.county} — ${pc.service}: ${pc.rationale} (Y1: ${pc.revenue})`, 10));
    y += 4;

    addLine('Staffing Summary', 14, true);
    packet.staffingSummary.forEach((s) => addLine(`${s.role}: Y1 ${s.y1Fte} FTE, Y3 ${s.y3Fte} FTE (${s.costY1})`, 10));
    y += 4;

    addLine('Risks & Mitigations', 14, true);
    packet.risks.forEach((r) => addLine(`[${r.severity}] ${r.risk} — Mitigation: ${r.mitigation}`, 10));
    y += 4;

    addLine('Appendix', 14, true);
    packet.appendix.forEach((a) => addLine(`- ${a}`, 10));

    doc.save('andwell-board-packet.pdf');
  }

  const staleCount = staleCompetitors.filter((c) => c.stale).length;
  const changedCount = staleCompetitors.filter((c) => c.changed).length;

  return <>
    <section className="section" ref={packetRef}>
      <div>
        <h1>Board Packet Mode</h1>
        <p className="text-body">Full export layout: executive summary, market opportunity, financial model, priority counties, staffing, risks, and appendix.</p>
      </div>
      <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
        <button className="btn primary" onClick={handleExportJson} aria-label="Export JSON">Export JSON</button>
        <button className="btn primary" onClick={handleExportPdf} aria-label="Export PDF">Export PDF</button>
        {staleCount > 0 && <Badge tone="amber">{staleCount} stale competitor{staleCount > 1 ? 's' : ''}</Badge>}
        {changedCount > 0 && <Badge tone="red">{changedCount} changed competitor{changedCount > 1 ? 's' : ''}</Badge>}
      </div>
    </section>
    <div className={`card mb-4${staleCount > 0 ? ' stale-warning' : ''}`}>
      <div className="row spread">
        <div>
          <h3 className="text-subhead">{packet.title}</h3>
          <span className="text-xs muted">Generated {packet.generatedAt}</span>
        </div>
        {staleCount > 0 && <Badge tone="amber">Stale data</Badge>}
      </div>
    </div>
    <div className="card mb-4">
      <h3 className="text-subhead">Executive Summary</h3>
      <p className="text-body" style={{ margin: '8px 0 0' }}>{packet.executiveSummary}</p>
    </div>
    <div className="card mb-4">
      <h3 className="text-subhead">Market Opportunity</h3>
      <p className="text-body" style={{ margin: '8px 0 0' }}>{packet.marketOpportunity}</p>
    </div>
    <SectionGroup title="Financial Model">
      <div className="grid cols4">{packet.financialModel.map((m, i) =>
        <div key={i} className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
          <p className="text-xs text-overline" style={{ color: 'var(--color-text-tertiary)', margin: '0 0 4px' }}>{m.label}</p>
          <strong style={{ fontSize: '20px' }}>{m.value}</strong>
        </div>
      )}</div>
    </SectionGroup>
    <SectionGroup title="Priority Counties">
      <div className="grid cols2">{packet.priorityCounties.map((pc, i) =>
        <div key={i} className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
          <div className="row spread" style={{ marginBottom: '4px' }}>
            <h4 style={{ margin: 0 }}>{pc.county}</h4>
            <Badge>{pc.service}</Badge>
          </div>
          <p className="text-small" style={{ margin: '0 0 4px', color: 'var(--color-text-secondary)' }}>{pc.rationale}</p>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Y1 revenue: {pc.revenue}</span>
        </div>
      )}</div>
    </SectionGroup>
    <SectionGroup title="Staffing Summary">
      <div className="grid cols3">{packet.staffingSummary.map((s, i) =>
        <div key={i} className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
          <h4 style={{ margin: '0 0 4px' }}>{s.role}</h4>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            <span>Y1: {s.y1Fte} FTE | Y3: {s.y3Fte} FTE</span>
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Y1 cost: {s.costY1}</span>
        </div>
      )}</div>
    </SectionGroup>
    <SectionGroup title="Risks & Mitigations">
      <div style={{ display: 'grid', gap: '8px' }}>{packet.risks.map((r, i) =>
        <div key={i} className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
          <div className="row spread" style={{ marginBottom: '4px' }}>
            <span className="text-small" style={{ fontWeight: 600 }}>{r.risk}</span>
            <Badge tone={r.severity === 'High' ? 'red' : r.severity === 'Medium' ? 'amber' : 'green'}>{r.severity}</Badge>
          </div>
          <p className="text-xs" style={{ margin: 0, color: 'var(--color-text-tertiary)' }}>Mitigation: {r.mitigation}</p>
        </div>
      )}</div>
    </SectionGroup>
    <SectionGroup title="Appendix">
      <div style={{ display: 'grid', gap: '6px' }}>{packet.appendix.map((a, i) =>
        <div key={i} style={{ padding: '8px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
          <span className="text-small">{a}</span>
        </div>
      )}</div>
    </SectionGroup>
  </>;
}
