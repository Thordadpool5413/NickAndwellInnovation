export interface CmsCountyData {
  totalMedicareBeneficiaries: number;
  hospitalReferralRegion: string;
  populationOver65: number;
  homeHealthAgencies: number;
  ffs: Record<string, unknown>;
  hh: Record<string, unknown>;
  hos: Record<string, unknown>;
}

interface CountyMarketData {
  totalMedicareBeneficiaries: number;
  hospitalReferralRegion: string;
  populationOver65: number;
  homeHealthAgencies: number;
  ffs: Record<string, unknown>;
  hh: Record<string, unknown>;
  hos: Record<string, unknown>;
}

export const cmsCountyMarketData: Record<string, CountyMarketData> = {
  York: {
    totalMedicareBeneficiaries: 28000,
    hospitalReferralRegion: "Portland",
    populationOver65: 42000,
    homeHealthAgencies: 8,
    ffs: {},
    hh: {},
    hos: {},
  },
};
export const cmsCountyMarket = {} as const;

