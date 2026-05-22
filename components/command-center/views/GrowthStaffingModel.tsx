'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import type { Scenario } from '../../../lib/growth-plan/data/constants';
import StaffingModel from '../../../lib/growth-plan/views/StaffingModel';

export function GrowthStaffingModel({ scenario }: { scenario?: Scenario }) {
  const { rows } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  return <GrowthPlanShell><StaffingModel rows={rows} /></GrowthPlanShell>;
}
