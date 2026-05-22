'use client';

import dynamic from 'next/dynamic';
import { useCommandCenter } from '../../lib/command-center/store';
import { useCommandCenterDerivedData } from '../../lib/command-center/use-derivations';
import { Home } from './views/Home';
import { ErrorBoundary } from './ErrorBoundary';
import { viewNames } from '../../lib/command-center/constants';

const Dashboard = dynamic(() => import('./views/Dashboard').then(m => m.Dashboard));
const GrowthCommand = dynamic(() => import('./views/GrowthCommand').then(m => m.GrowthCommand));
const BoardRoom = dynamic(() => import('./views/BoardRoom').then(m => m.BoardRoom));
const LaunchPlan = dynamic(() => import('./views/LaunchPlan').then(m => m.LaunchPlan));
const ExpertCenter = dynamic(() => import('./views/ExpertCenter').then(m => m.ExpertCenter));
const AIIntelligence = dynamic(() => import('./views/AIIntelligence').then(m => m.AIIntelligence));
const PromptEngine = dynamic(() => import('./views/PromptEngine').then(m => m.PromptEngine));
const Intake = dynamic(() => import('./views/Intake').then(m => m.Intake));
const Matrix = dynamic(() => import('./views/Matrix').then(m => m.Matrix));
const Battlecards = dynamic(() => import('./views/Battlecards').then(m => m.Battlecards));
const Reports = dynamic(() => import('./views/Reports').then(m => m.Reports));
const AskHub = dynamic(() => import('./views/AskHub').then(m => m.AskHub));
const Catalog = dynamic(() => import('./views/Catalog').then(m => m.Catalog));
const Diagnostics = dynamic(() => import('./views/Diagnostics').then(m => m.Diagnostics));
const ClaimGovernance = dynamic(() => import('./views/ClaimGovernance').then(m => m.ClaimGovernance));
const OpportunityHeatMap = dynamic(() => import('./views/OpportunityHeatMap').then(m => m.OpportunityHeatMap));
const DecisionQueue = dynamic(() => import('./views/DecisionQueue').then(m => m.DecisionQueue));
const ScenarioPresets = dynamic(() => import('./views/ScenarioPresets').then(m => m.ScenarioPresets));
const BattlecardBuilder = dynamic(() => import('./views/BattlecardBuilder').then(m => m.BattlecardBuilder));
const ReferralSources = dynamic(() => import('./views/ReferralSources').then(m => m.ReferralSources));
const StrategyBrief = dynamic(() => import('./views/StrategyBrief').then(m => m.StrategyBrief));
const ExecutiveNarrative = dynamic(() => import('./views/ExecutiveNarrative').then(m => m.ExecutiveNarrative));
const BoardPacket = dynamic(() => import('./views/BoardPacket').then(m => m.BoardPacket));
const CoachingMode = dynamic(() => import('./views/CoachingMode').then(m => m.CoachingMode));
const GrowthExecutiveView = dynamic(() => import('./views/GrowthExecutiveView').then(m => m.GrowthExecutiveView));
const GrowthCountyPlan = dynamic(() => import('./views/GrowthCountyPlan').then(m => m.GrowthCountyPlan));
const GrowthReferralPlan = dynamic(() => import('./views/GrowthReferralPlan').then(m => m.GrowthReferralPlan));
const GrowthCompetitiveView = dynamic(() => import('./views/GrowthCompetitiveView').then(m => m.GrowthCompetitiveView));
const GrowthServiceLines = dynamic(() => import('./views/GrowthServiceLines').then(m => m.GrowthServiceLines));
const GrowthCmsData = dynamic(() => import('./views/GrowthCmsData').then(m => m.GrowthCmsData));
const GrowthFinancialModel = dynamic(() => import('./views/GrowthFinancialModel').then(m => m.GrowthFinancialModel));
const GrowthStaffingModel = dynamic(() => import('./views/GrowthStaffingModel').then(m => m.GrowthStaffingModel));
const GrowthSensitivity = dynamic(() => import('./views/GrowthSensitivity').then(m => m.GrowthSensitivity));
const GrowthOpportunityScore = dynamic(() => import('./views/GrowthOpportunityScore').then(m => m.GrowthOpportunityScore));
const GrowthLaunchTimeline = dynamic(() => import('./views/GrowthLaunchTimeline').then(m => m.GrowthLaunchTimeline));
const GrowthBoardReport = dynamic(() => import('./views/GrowthBoardReport').then(m => m.GrowthBoardReport));
const GrowthLaunchChecklist = dynamic(() => import('./views/GrowthLaunchChecklist').then(m => m.GrowthLaunchChecklist));

export function ViewRouter() {
  const view = useCommandCenter((s) => s.view);
  const setView = useCommandCenter((s) => s.setView);
  const roleView = useCommandCenter((s) => s.roleView);
  const currentReport = useCommandCenter((s) => s.currentReport);
  const competitors = useCommandCenter((s) => s.competitors);
  const setCompetitors = useCommandCenter((s) => s.setCompetitors);
  const urlInput = useCommandCenter((s) => s.urlInput);
  const setUrlInput = useCommandCenter((s) => s.setUrlInput);
  const matrixFilter = useCommandCenter((s) => s.matrixFilter);
  const setMatrixFilter = useCommandCenter((s) => s.setMatrixFilter);
  const matrixSearch = useCommandCenter((s) => s.matrixSearch);
  const setMatrixSearch = useCommandCenter((s) => s.setMatrixSearch);
  const reports = useCommandCenter((s) => s.reports);
  const question = useCommandCenter((s) => s.question);
  const setQuestion = useCommandCenter((s) => s.setQuestion);
  const askResponse = useCommandCenter((s) => s.askResponse);
  const diagnostics = useCommandCenter((s) => s.diagnostics);
  const busy = useCommandCenter((s) => s.busy);
  const growthScenario = useCommandCenter((s) => s.growthScenario);
  const setGrowthScenario = useCommandCenter((s) => s.setGrowthScenario);
  const clearLegacyBrowserStorage = useCommandCenter((s) => s.clearLegacyBrowserStorage);
  const refreshServerState = useCommandCenter((s) => s.refreshServerState);
  const addUrls = useCommandCenter((s) => s.addUrls);
  const saveCompetitors = useCommandCenter((s) => s.saveCompetitors);
  const runAnalysis = useCommandCenter((s) => s.runAnalysis);
  const loadReport = useCommandCenter((s) => s.loadReport);
  const askHub = useCommandCenter((s) => s.askHub);
  const runDiagnostics = useCommandCenter((s) => s.runDiagnostics);
  const exportJson = useCommandCenter((s) => s.exportJson);

  const {
    subsystemScenario, aiAnalyses, growthRows, growthTotals,
    growthServiceRollup, staffingPlan, expertBrief, topThreat, topOpportunity,
  } = useCommandCenterDerivedData(growthScenario, currentReport);

  return <ErrorBoundary name={viewNames[view]}>
    {view === 'home' && <Home roleView={roleView} />}
    {view === 'dashboard' && <Dashboard expertBrief={expertBrief} roleView={roleView} setView={setView} clearLegacyBrowserStorage={clearLegacyBrowserStorage} />}
    {view === 'growth' && <GrowthCommand rows={growthRows} totals={growthTotals} serviceRollup={growthServiceRollup} scenario={growthScenario} setScenario={setGrowthScenario} setView={setView} />}
    {view === 'board' && <BoardRoom currentReport={currentReport} totals={growthTotals} rows={growthRows} topThreat={topThreat} topOpportunity={topOpportunity} setView={setView} />}
    {view === 'launch' && <LaunchPlan rows={growthRows} totals={growthTotals} staffingPlan={staffingPlan} setView={setView} />}
    {view === 'heatmap' && <OpportunityHeatMap rows={growthRows} totals={growthTotals} />}
    {view === 'brief' && <StrategyBrief currentReport={currentReport} growthRows={growthRows} totals={growthTotals} />}
    {view === 'narrative' && <ExecutiveNarrative currentReport={currentReport} growthRows={growthRows} totals={growthTotals} />}
    {view === 'board-packet' && <BoardPacket currentReport={currentReport} growthRows={growthRows} totals={growthTotals} staffingPlan={staffingPlan} />}
    {view === 'coaching' && <CoachingMode currentReport={currentReport} />}
    {view === 'executive-view' && <GrowthExecutiveView scenario={subsystemScenario} />}
    {view === 'county-plan' && <GrowthCountyPlan scenario={subsystemScenario} />}
    {view === 'referral-plan' && <GrowthReferralPlan scenario={subsystemScenario} />}
    {view === 'competitive-view' && <GrowthCompetitiveView />}
    {view === 'service-lines' && <GrowthServiceLines />}
    {view === 'cms-data' && <GrowthCmsData />}
    {view === 'financial-model' && <GrowthFinancialModel scenario={subsystemScenario} />}
    {view === 'staffing-model' && <GrowthStaffingModel scenario={subsystemScenario} />}
    {view === 'sensitivity' && <GrowthSensitivity scenario={subsystemScenario} />}
    {view === 'opportunity-score' && <GrowthOpportunityScore scenario={subsystemScenario} />}
    {view === 'launch-timeline' && <GrowthLaunchTimeline scenario={subsystemScenario} />}
    {view === 'board-report' && <GrowthBoardReport scenario={subsystemScenario} />}
    {view === 'launch-checklist' && <GrowthLaunchChecklist />}
    {view === 'decisions' && <DecisionQueue currentReport={currentReport} growthRows={growthRows} />}
    {view === 'scenarios' && <ScenarioPresets scenario={growthScenario} setScenario={setGrowthScenario} growthRows={growthRows} />}
    {view === 'expert' && <ExpertCenter currentReport={currentReport} setView={setView} />}
    {view === 'ai' && <AIIntelligence currentReport={currentReport} aiAnalyses={aiAnalyses} />}
    {view === 'prompt' && <PromptEngine />}
    {view === 'intake' && <Intake competitors={competitors} setCompetitors={setCompetitors} urlInput={urlInput} setUrlInput={setUrlInput} addUrls={addUrls} saveCompetitors={saveCompetitors} runAnalysis={runAnalysis} busy={busy} />}
    {view === 'matrix' && <Matrix currentReport={currentReport} matrixFilter={matrixFilter} setMatrixFilter={setMatrixFilter} matrixSearch={matrixSearch} setMatrixSearch={setMatrixSearch} />}
    {view === 'battlecards' && <Battlecards currentReport={currentReport} />}
    {view === 'governance' && <ClaimGovernance currentReport={currentReport} />}
    {view === 'builder' && <BattlecardBuilder currentReport={currentReport} />}
    {view === 'referrals' && <ReferralSources />}
    {view === 'reports' && <Reports reports={reports} currentReport={currentReport} loadReport={loadReport} exportJson={exportJson} refreshServerState={refreshServerState} busy={busy} />}
    {view === 'ask' && <AskHub question={question} setQuestion={setQuestion} askHub={askHub} askResponse={askResponse} busy={busy} currentReport={currentReport} />}
    {view === 'catalog' && <Catalog />}
    {view === 'diagnostics' && <Diagnostics diagnostics={diagnostics} runDiagnostics={runDiagnostics} busy={busy} />}
    {!['home','dashboard','growth','board','launch','heatmap','brief','narrative','board-packet','coaching','executive-view','county-plan','referral-plan','competitive-view','service-lines','cms-data','financial-model','staffing-model','sensitivity','opportunity-score','launch-timeline','board-report','launch-checklist','decisions','scenarios','expert','ai','prompt','intake','matrix','battlecards','governance','builder','referrals','reports','ask','catalog','diagnostics'].includes(view) && <Home roleView={roleView} />}
  </ErrorBoundary>;
}
