import { StakingConstants } from '@/types';

// Protocol Constants (Based on Logic Spec)
export const STAKING_CONSTANTS: StakingConstants = {
  A: 50_000_000, // Total Annual Seigniorage: 50M TON
  d: 0.3, // 30% to DAO
  L: 35_000_000, // L = (1-d) * A = 0.7 * 50M = 35M TON
  theta: 0.5, // Minimum staking ratio: 50%
  k: 100_000_000, // Half-saturation point: 100M TON
  alpha: 0.8, // 80% to validators
};

// Current inflation rate (approx 7.3% at year 10 per spec)
export const CURRENT_INFLATION_RATE = 0.073;

// UI Constants
export const SATURATION_THRESHOLDS = {
  LOW: 30, // Green zone
  MEDIUM: 70, // Yellow zone
  HIGH: 100, // Red zone (over-saturated)
};
