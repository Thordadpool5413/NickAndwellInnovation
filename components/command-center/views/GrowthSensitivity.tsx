'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import type { Scenario } from '../../../lib/growth-plan/data/constants';
import SensitivityAnalysis from '../../../lib/growth-plan/views/SensitivityAnalysis';

export function GrowthSensitivity({ scenario }: { scenario?: Scenario }) {
  const { rows } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  return <GrowthPlanShell><SensitivityAnalysis rows={rows} /></GrowthPlanShell>;
}
