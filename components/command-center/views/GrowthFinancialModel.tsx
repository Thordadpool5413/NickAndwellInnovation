'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import type { Scenario } from '../../../lib/growth-plan/data/constants';
import FinancialModel from '../../../lib/growth-plan/views/FinancialModel';

export function GrowthFinancialModel({ scenario }: { scenario?: Scenario }) {
  const { rows } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  return <GrowthPlanShell><FinancialModel rows={rows} /></GrowthPlanShell>;
}
