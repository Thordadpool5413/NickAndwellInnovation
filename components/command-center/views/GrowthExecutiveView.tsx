'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import type { Scenario } from '../../../lib/growth-plan/data/constants';
import ExecutiveView from '../../../lib/growth-plan/views/ExecutiveView';

export function GrowthExecutiveView({ scenario }: { scenario?: Scenario }) {
  const { rows, totals } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  return <GrowthPlanShell><ExecutiveView rows={rows} totals={totals} /></GrowthPlanShell>;
}
