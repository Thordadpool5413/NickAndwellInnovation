import { COLORS } from './constants';

export interface ServiceInfo {
  id: string;
  name: string;
  category: string;
  revenueBaseline: number;
  growthRate: number;
  countiesServed: number;
  color: string;
  role: string;
  unit: string;
  reimbursement: number;
  margin: number;
  conversion: number;
  demandRate: number;
}

export const services: Record<string, ServiceInfo> = {
  'Home Healthcare': {
    id: 'home-healthcare',
    name: 'Home Healthcare',
    category: 'Skilled home care',
    revenueBaseline: 3189,
    growthRate: 0,
    countiesServed: 0,
    color: COLORS.blue,
    role: 'Foundation service line',
    unit: 'admissions',
    reimbursement: 3189,
    margin: 0.18,
    conversion: 0.75,
    demandRate: 0.08,
  },
  'Mobile Wound': {
    id: 'mobile-wound',
    name: 'Mobile Wound',
    category: 'Specialty care',
    revenueBaseline: 1800,
    growthRate: 0,
    countiesServed: 0,
    color: COLORS.red,
    role: 'Specialty growth line',
    unit: 'wound service starts',
    reimbursement: 1800,
    margin: 0.24,
    conversion: 0.75,
    demandRate: 0.025,
  },
  'Therapy Care': {
    id: 'therapy-care',
    name: 'Therapy Care',
    category: 'Therapy services',
    revenueBaseline: 1650,
    growthRate: 0,
    countiesServed: 0,
    color: COLORS.green,
    role: 'Referral retention line',
    unit: 'therapy service starts',
    reimbursement: 1650,
    margin: 0.2,
    conversion: 0.75,
    demandRate: 0.05,
  },
  GUIDE: {
    id: 'guide',
    name: 'GUIDE',
    category: 'Validation only',
    revenueBaseline: 0,
    growthRate: 0,
    countiesServed: 0,
    color: COLORS.purple,
    role: 'Validation only line',
    unit: 'validated dementia care enrollments',
    reimbursement: 0,
    margin: 0,
    conversion: 0.75,
    demandRate: 0,
  },
  Hospice: {
    id: 'hospice',
    name: 'Hospice',
    category: 'Future expansion',
    revenueBaseline: 0,
    growthRate: 0,
    countiesServed: 0,
    color: '#9333ea',
    role: 'Future expansion line',
    unit: 'hospice admissions',
    reimbursement: 0,
    margin: 0,
    conversion: 0.75,
    demandRate: 0,
  },
};

export const SERVICE_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(services).map(([service, info]) => [service, info.color]),
);

export default services;
