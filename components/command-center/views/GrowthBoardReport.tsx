'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import type { Scenario } from '../../../lib/growth-plan/data/constants';
import BoardReport from '../../../lib/growth-plan/views/BoardReport';

export function GrowthBoardReport({ scenario }: { scenario?: Scenario }) {
  const { rows, totals } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  return <GrowthPlanShell><BoardReport rows={rows} totals={totals} /></GrowthPlanShell>;
}
