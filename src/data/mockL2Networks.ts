import { L2Network } from '@/types';

// Mock L2 Networks data (sorted by Bridged TON)
export const mockL2Networks: L2Network[] = [
  {
    id: 'titan',
    name: 'Titan',
    bridgedTon: 45_000_000,
    totalStaked: 28_000_000,
    validatorCount: 156,
    createdAt: '2024-01-15',
  },
  {
    id: 'thanos',
    name: 'Thanos',
    bridgedTon: 32_000_000,
    totalStaked: 18_500_000,
    validatorCount: 98,
    createdAt: '2024-02-20',
  },
  {
    id: 'nova',
    name: 'Nova',
    bridgedTon: 22_000_000,
    totalStaked: 14_000_000,
    validatorCount: 67,
    createdAt: '2024-03-10',
  },
  {
    id: 'quantum',
    name: 'Quantum',
    bridgedTon: 15_000_000,
    totalStaked: 9_200_000,
    validatorCount: 45,
    createdAt: '2024-04-05',
  },
  {
    id: 'nexus',
    name: 'Nexus',
    bridgedTon: 12_000_000,
    totalStaked: 4_500_000, // Warning: Below minimum requirement
    validatorCount: 34,
    createdAt: '2024-05-12',
  },
  {
    id: 'pulse',
    name: 'Pulse',
    bridgedTon: 8_000_000,
    totalStaked: 5_200_000,
    validatorCount: 28,
    createdAt: '2024-06-01',
  },
  {
    id: 'orbit',
    name: 'Orbit',
    bridgedTon: 5_500_000,
    totalStaked: 3_800_000,
    validatorCount: 19,
    createdAt: '2024-07-18',
  },
  {
    id: 'zenith',
    name: 'Zenith',
    bridgedTon: 3_200_000,
    totalStaked: 1_200_000, // Warning: Below minimum requirement
    validatorCount: 12,
    createdAt: '2024-08-22',
  },
];
