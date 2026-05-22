import type { View } from './types';
import { LayoutDashboard, TrendingUp, Presentation, Rocket, Brain, Cpu, FileText, Upload, Table, Swords, FileBarChart, MessageSquare, BookOpen, Activity, Shield, Hammer, Users, Map, CheckSquare, Sliders, FileSpreadsheet, ScrollText, GraduationCap, Globe, MapPin, Phone, Crosshair, Layers, Database, DollarSign, Target, Clock, ListChecks, Home as HomeIcon } from 'lucide-react';

export const navIcons: Record<View, React.ComponentType<{ className?: string }>> = {
  home: HomeIcon, dashboard: LayoutDashboard, decisions: CheckSquare, scenarios: Sliders, growth: TrendingUp, board: Presentation, launch: Rocket, heatmap: Map,
  expert: Brain, ai: Cpu, prompt: FileText, intake: Upload, matrix: Table,
  battlecards: Swords, governance: Shield, builder: Hammer, referrals: Users, reports: FileBarChart, ask: MessageSquare, catalog: BookOpen, diagnostics: Activity,
  brief: FileSpreadsheet, narrative: ScrollText, 'board-packet': Presentation, coaching: GraduationCap,
  'executive-view': Globe, 'county-plan': MapPin, 'referral-plan': Phone, 'competitive-view': Crosshair,
  'service-lines': Layers, 'cms-data': Database, 'financial-model': DollarSign, 'staffing-model': Users,
  sensitivity: Activity, 'opportunity-score': Target, 'launch-timeline': Clock, 'board-report': FileText, 'launch-checklist': ListChecks,
};

export const navGroups: { label: string; keys: View[] }[] = [
  { label: 'Expert OS', keys: ['home', 'dashboard', 'ask'] },
  { label: 'Workspaces', keys: ['heatmap', 'growth', 'battlecards', 'board-packet'] },
  { label: 'Operations', keys: ['intake', 'reports', 'diagnostics'] },
];

export const workspaceToolsConfig: Partial<Record<View, { label: string; keys: View[] }>> = {
  heatmap: { label: 'Intelligence tools', keys: ['heatmap', 'expert', 'ai', 'matrix', 'governance', 'brief', 'narrative'] },
  growth: { label: 'Growth tools', keys: ['growth', 'launch', 'scenarios', 'executive-view', 'county-plan', 'financial-model', 'staffing-model', 'sensitivity', 'launch-timeline'] },
  battlecards: { label: 'Field tools', keys: ['battlecards', 'builder', 'referrals', 'coaching', 'ask'] },
  'board-packet': { label: 'Board tools', keys: ['board-packet', 'board', 'narrative', 'board-report', 'launch-checklist', 'decisions'] },
};

export const viewNames: Record<View, string> = {
  home: 'Home', dashboard: 'Dashboard', decisions: 'Decision Queue', scenarios: 'Scenarios',
  growth: 'Growth Command', board: 'Board Room', launch: 'Launch Plan', heatmap: 'Opportunity Heat Map',
  expert: 'Expert Center', ai: 'AI Intelligence', prompt: 'Prompt Engine', intake: 'Intake',
  matrix: 'Evidence Matrix', battlecards: 'Battlecards', governance: 'Claim Governance',
  builder: 'Battlecard Builder', referrals: 'Referral Sources', reports: 'Reports', ask: 'Ask the Hub',
  catalog: 'Catalog', diagnostics: 'Diagnostics', brief: 'Strategy Brief', narrative: 'Executive Narrative',
  'board-packet': 'Board Packet', coaching: 'Coaching Mode',
  'executive-view': 'Executive View', 'county-plan': 'County Plan', 'referral-plan': 'Referral Plan',
  'competitive-view': 'Competitive View', 'service-lines': 'Service Lines', 'cms-data': 'CMS Data',
  'financial-model': 'Financial Model', 'staffing-model': 'Staffing Model', sensitivity: 'Sensitivity',
  'opportunity-score': 'Opportunity Score', 'launch-timeline': 'Launch Timeline', 'board-report': 'Board Report',
  'launch-checklist': 'Launch Checklist',
};
