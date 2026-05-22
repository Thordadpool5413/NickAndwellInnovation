export interface NamedProviderRow {
  id: string;
  name: string;
  counties: string[];
  services: string[];
  marketShare: number;
  revenue: number;
}

export interface ProviderData {
  id: string;
  name: string;
  counties: string[];
  services: string[];
  marketShare: number;
}

export const providers: ProviderData[] = [];
export const namedProviderRows: NamedProviderRow[] = [];
export const marketShareBuildRows: NamedProviderRow[] = [];
export const marketShareFormulaRows: NamedProviderRow[] = [];
