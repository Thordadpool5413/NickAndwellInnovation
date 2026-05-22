export interface ServiceInfo {
  id: string;
  name: string;
  category: string;
  revenueBaseline: number;
  growthRate: number;
  countiesServed: number;
}

export const services: ServiceInfo[] = [];
export default services;
