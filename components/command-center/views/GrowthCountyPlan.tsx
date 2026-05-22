'use client';

import React, { useMemo, useState } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import type { Scenario } from '../../../lib/growth-plan/data/constants';
import CountyPlan from '../../../lib/growth-plan/views/CountyPlan';

export function GrowthCountyPlan({ scenario }: { scenario?: Scenario }) {
  const { rows } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  const [selectedCounty, setSelectedCounty] = useState('York');
  return <GrowthPlanShell><CountyPlan rows={rows} selectedCounty={selectedCounty} setSelectedCounty={setSelectedCounty} /></GrowthPlanShell>;
}
