export interface NamedProviderRow {
  service: string;
  providerName: string;
  locationCounty: string;
  beneficiaries: number;
  episodes: number;
  payment: number;
  providerVolumeShare: number;
  isAndwellCmsRecord: boolean;
}

export interface ProviderData {
  id: string;
  name: string;
  counties: string[];
  services: string[];
  marketShare: number;
}

export interface MarketShareBuildRow {
  layer: string;
  status: string;
  data: string;
  limitation: string;
  need: string;
}

export interface MarketShareFormulaRow {
  metric: string;
  formula: string;
  state: string;
}

export const namedProviderRows: NamedProviderRow[] = [
  { service: 'Home Healthcare', providerName: 'Northern Light Home Care & Hospice', locationCounty: 'Penobscot', beneficiaries: 2305, episodes: 4510, payment: 10395570, providerVolumeShare: 0.2026, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'Androscoggin Home Healthcare + Hospice', locationCounty: 'Androscoggin', beneficiaries: 1566, episodes: 3176, payment: 5862624, providerVolumeShare: 0.1376, isAndwellCmsRecord: true },
  { service: 'Home Healthcare', providerName: 'MaineHealth Care at Home', locationCounty: 'Cumberland', beneficiaries: 1510, episodes: 3024, payment: 6271240, providerVolumeShare: 0.1327, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'CenterWell Home Health', locationCounty: 'York', beneficiaries: 1084, episodes: 2148, payment: 4978612, providerVolumeShare: 0.0953, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'Amedisys Home Health', locationCounty: 'Kennebec', beneficiaries: 945, episodes: 1886, payment: 4162197, providerVolumeShare: 0.0831, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'CHANS Home Health & Hospice', locationCounty: 'Sagadahoc', beneficiaries: 812, episodes: 1662, payment: 3685118, providerVolumeShare: 0.0714, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'St. Joseph Homecare', locationCounty: 'Penobscot', beneficiaries: 702, episodes: 1398, payment: 3186702, providerVolumeShare: 0.0617, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'MaineGeneral HomeCare', locationCounty: 'Kennebec', beneficiaries: 628, episodes: 1234, payment: 2824116, providerVolumeShare: 0.0552, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'Beacon Hospice Home Health Services', locationCounty: 'Cumberland', beneficiaries: 584, episodes: 1151, payment: 2610848, providerVolumeShare: 0.0513, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'Aroostook Home Health Services', locationCounty: 'Aroostook', beneficiaries: 510, episodes: 1012, payment: 2304270, providerVolumeShare: 0.0448, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'Down East Home Health', locationCounty: 'Washington', beneficiaries: 396, episodes: 792, payment: 1742400, providerVolumeShare: 0.0348, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'Coastal Home Health', locationCounty: 'Knox', beneficiaries: 354, episodes: 708, payment: 1604520, providerVolumeShare: 0.0311, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'LincolnHealth Home Care', locationCounty: 'Lincoln', beneficiaries: 319, episodes: 638, payment: 1445070, providerVolumeShare: 0.0280, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'Oxford County Home Care', locationCounty: 'Oxford', beneficiaries: 306, episodes: 612, payment: 1377000, providerVolumeShare: 0.0269, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'Somerset Home Health', locationCounty: 'Somerset', beneficiaries: 288, episodes: 576, payment: 1296000, providerVolumeShare: 0.0253, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'Franklin County Home Care', locationCounty: 'Franklin', beneficiaries: 181, episodes: 362, payment: 801499, providerVolumeShare: 0.0159, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'Gentiva Home Health', locationCounty: 'York', beneficiaries: 612, episodes: 1215, payment: 2754000, providerVolumeShare: 0.0538, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'Enhabit Home Health', locationCounty: 'Cumberland', beneficiaries: 446, episodes: 888, payment: 2023440, providerVolumeShare: 0.0392, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'Bayada Home Health Care', locationCounty: 'York', beneficiaries: 402, episodes: 798, payment: 1813020, providerVolumeShare: 0.0353, isAndwellCmsRecord: false },
  { service: 'Home Healthcare', providerName: 'Regional Home Care Services', locationCounty: 'Cumberland', beneficiaries: 331, episodes: 662, payment: 1491120, providerVolumeShare: 0.0291, isAndwellCmsRecord: false },
  { service: 'Hospice', providerName: 'Androscoggin Home Healthcare + Hospice', locationCounty: 'Androscoggin', beneficiaries: 1655, episodes: 1667, payment: 20023210, providerVolumeShare: 0.1726, isAndwellCmsRecord: true },
  { service: 'Hospice', providerName: 'Northern Light Home Care & Hospice', locationCounty: 'Penobscot', beneficiaries: 1045, episodes: 1058, payment: 16551755, providerVolumeShare: 0.1090, isAndwellCmsRecord: false },
  { service: 'Hospice', providerName: 'MaineHealth Care at Home Hospice', locationCounty: 'Cumberland', beneficiaries: 1011, episodes: 1024, payment: 15909696, providerVolumeShare: 0.1054, isAndwellCmsRecord: false },
  { service: 'Hospice', providerName: 'Hospice of Southern Maine', locationCounty: 'Cumberland', beneficiaries: 947, episodes: 958, payment: 14881634, providerVolumeShare: 0.0988, isAndwellCmsRecord: false },
  { service: 'Hospice', providerName: 'CenterWell Hospice', locationCounty: 'York', beneficiaries: 851, episodes: 863, payment: 12531073, providerVolumeShare: 0.0888, isAndwellCmsRecord: false },
  { service: 'Hospice', providerName: 'Amedisys Hospice', locationCounty: 'Kennebec', beneficiaries: 407, episodes: 412, payment: 6243380, providerVolumeShare: 0.0425, isAndwellCmsRecord: false },
  { service: 'Hospice', providerName: 'Compassus Hospice', locationCounty: 'Penobscot', beneficiaries: 473, episodes: 480, payment: 7491840, providerVolumeShare: 0.0493, isAndwellCmsRecord: false },
  { service: 'Hospice', providerName: 'Beacon Hospice', locationCounty: 'Knox', beneficiaries: 176, episodes: 180, payment: 2478608, providerVolumeShare: 0.0184, isAndwellCmsRecord: false },
  { service: 'Hospice', providerName: 'Lincoln County Hospice', locationCounty: 'Lincoln', beneficiaries: 157, episodes: 160, payment: 2084018, providerVolumeShare: 0.0164, isAndwellCmsRecord: false },
  { service: 'Hospice', providerName: 'Mid Coast Hospice', locationCounty: 'Sagadahoc', beneficiaries: 131, episodes: 134, payment: 1440607, providerVolumeShare: 0.0137, isAndwellCmsRecord: false },
  { service: 'Hospice', providerName: 'Down East Hospice', locationCounty: 'Washington', beneficiaries: 99, episodes: 101, payment: 966141, providerVolumeShare: 0.0103, isAndwellCmsRecord: false },
  { service: 'Hospice', providerName: 'Aroostook Hospice', locationCounty: 'Aroostook', beneficiaries: 172, episodes: 174, payment: 1715012, providerVolumeShare: 0.0179, isAndwellCmsRecord: false },
  { service: 'Hospice', providerName: 'Oxford Hills Hospice', locationCounty: 'Oxford', beneficiaries: 210, episodes: 213, payment: 2938110, providerVolumeShare: 0.0219, isAndwellCmsRecord: false },
  { service: 'Hospice', providerName: 'Somerset Hospice Care', locationCounty: 'Somerset', beneficiaries: 171, episodes: 174, payment: 2659221, providerVolumeShare: 0.0178, isAndwellCmsRecord: false },
  { service: 'Hospice', providerName: 'Franklin Hospice', locationCounty: 'Franklin', beneficiaries: 96, episodes: 98, payment: 1377408, providerVolumeShare: 0.0100, isAndwellCmsRecord: false },
  { service: 'Hospice', providerName: 'Gentiva Hospice', locationCounty: 'York', beneficiaries: 344, episodes: 350, payment: 5064712, providerVolumeShare: 0.0359, isAndwellCmsRecord: false },
];

export const providers: ProviderData[] = namedProviderRows.map((row, index) => ({
  id: `${row.service.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`,
  name: row.providerName,
  counties: [row.locationCounty],
  services: [row.service],
  marketShare: row.providerVolumeShare,
}));

export const marketShareBuildRows: MarketShareBuildRow[] = [
  { layer: 'County market volume', status: 'Built in', data: 'CMS county FFS, home health, and hospice volume by county.', limitation: 'Does not prove every provider serves every county from its headquarters location.', need: 'County attributed referral and admission volume by provider.' },
  { layer: 'Share calculation', status: 'Partially built', data: 'Statewide provider beneficiary share and named provider file rows.', limitation: 'Provider file share is not the same as county market share.', need: 'County level numerator for Andwell and competitor volume.' },
  { layer: 'Provider density', status: 'Built in', data: 'CMS provider counts by county and FFS denominator.', limitation: 'Density shows competitive pressure, not service quality.', need: 'Referral source preference and actual acceptance performance.' },
  { layer: 'Andwell footprint', status: 'Built in', data: 'Current service presence and missing service line gaps by county.', limitation: 'Operational readiness still requires staffing validation.', need: 'Field confirmed capacity and launch readiness.' },
  { layer: 'Competitive pressure', status: 'Partially built', data: 'Named HH and hospice competitor rows, national chain flags, and provider density.', limitation: 'Competitive strength may vary by subcounty referral corridor.', need: 'Referral source interviews and field intelligence.' },
  { layer: 'Referral readiness', status: 'Partially built', data: 'Priority account lists by county.', limitation: 'Account lists need ownership and conversion evidence.', need: 'CRM activity, referrals, starts, and source level trend data.' },
];

export const marketShareFormulaRows: MarketShareFormulaRow[] = [
  { metric: 'Andwell provider file share', formula: 'Andwell CMS provider beneficiaries divided by total named provider beneficiaries.', state: 'Built in' },
  { metric: 'Provider density', formula: 'CMS provider count divided by FFS beneficiaries per 10,000.', state: 'Built in' },
  { metric: 'County market share', formula: 'Andwell county attributed volume divided by total county market volume.', state: 'Needs Andwell data' },
  { metric: 'Competitor county share', formula: 'Competitor county attributed volume divided by total county market volume.', state: 'Needs county attribution' },
  { metric: 'Referral source conversion', formula: 'Starts divided by referrals by account and service line.', state: 'Needs Andwell data' },
  { metric: 'Service line gap value', formula: 'Demand pool multiplied by capture assumption, reimbursement, and margin.', state: 'Built in' },
];
