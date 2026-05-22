'use client';

import React, { useState } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import CompetitiveView from '../../../lib/growth-plan/views/CompetitiveView';

export function GrowthCompetitiveView() {
  const [selectedCounty, setSelectedCounty] = useState('York');
  return <GrowthPlanShell><CompetitiveView selectedCounty={selectedCounty} setSelectedCounty={setSelectedCounty} /></GrowthPlanShell>;
}
