'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import type { Scenario } from '../../../lib/growth-plan/data/constants';
import LaunchTimeline from '../../../lib/growth-plan/views/LaunchTimeline';

export function GrowthLaunchTimeline({ scenario }: { scenario?: Scenario }) {
  const { rows } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  return <GrowthPlanShell><LaunchTimeline rows={rows} /></GrowthPlanShell>;
}
