interface CountyMarketData {
  totalMedicareBeneficiaries: number;
  hospitalReferralRegion: string;
  populationOver65: number;
  homeHealthAgencies: number;
}

export const cmsCountyMarketData: Record<string, CountyMarketData> = {
  York: { totalMedicareBeneficiaries: 28000, hospitalReferralRegion: "Portland", populationOver65: 42000, homeHealthAgencies: 8 },
};
export const cmsCountyMarket = {} as const;

