'use client';

import { useMemo } from 'react';
import type { IntelligenceReport } from '../types';
import type { GrowthScenario } from '../growth-plan';
import { buildGrowthRows, buildStaffingPlan, rollupGrowthByService, summarizeGrowth } from '../growth-plan';
import { generateAndwellExpertBrief } from '../andwell-expert';
import { growthScenarioToSubsystem } from './growth-plan-bridge';

export function useCommandCenterDerivedData(growthScenario: GrowthScenario, currentReport: IntelligenceReport | null) {
  const subsystemScenario = useMemo(() => growthScenarioToSubsystem(growthScenario), [growthScenario]);
  const aiAnalyses = useMemo(() => currentReport?.analyses.filter((a) => Boolean(a.aiExtraction)) || [], [currentReport]);
  const growthRows = useMemo(() => buildGrowthRows(growthScenario), [growthScenario]);
  const growthTotals = useMemo(() => summarizeGrowth(growthRows), [growthRows]);
  const growthServiceRollup = useMemo(() => rollupGrowthByService(growthRows), [growthRows]);
  const staffingPlan = useMemo(() => buildStaffingPlan(growthRows), [growthRows]);
  const expertBrief = useMemo(() => generateAndwellExpertBrief({ report: currentReport, growthRows, totals: growthTotals, staffingPlan }), [currentReport, growthRows, growthTotals, staffingPlan]);

  const topThreat = useMemo(() => {
    return [...(currentReport?.competitorScores || [])].sort((a, b) => (b.serviceLineMatchScore + b.subserviceDepthScore) - (a.serviceLineMatchScore + a.subserviceDepthScore))[0];
  }, [currentReport]);

  const topOpportunity = useMemo(() => {
    return [...(currentReport?.competitorScores || [])].sort((a, b) => b.andwellDifferentiationScore - a.andwellDifferentiationScore)[0];
  }, [currentReport]);

  return {
    subsystemScenario, aiAnalyses, growthRows, growthTotals,
    growthServiceRollup, staffingPlan, expertBrief, topThreat, topOpportunity,
  };
}
