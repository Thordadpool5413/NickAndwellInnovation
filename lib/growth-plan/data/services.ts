export interface ServiceData {
  id: string;
  name: string;
  category: string;
  revenueBaseline: number;
  growthRate: number;
  countiesServed: number;
}

export const services: ServiceData[] = [];
