'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import type { Scenario } from '../../../lib/growth-plan/data/constants';
import ReferralPlan from '../../../lib/growth-plan/views/ReferralPlan';

export function GrowthReferralPlan({ scenario }: { scenario?: Scenario }) {
  const { rows } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  return <GrowthPlanShell><ReferralPlan rows={rows} /></GrowthPlanShell>;
}
