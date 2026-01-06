import { L2Network, L2Metrics, GlobalStats, StakingConstants, SimulationInput, SimulationResult } from '@/types';
import { STAKING_CONSTANTS, CURRENT_INFLATION_RATE } from '@/data/constants';

/**
 * Rule 4: Eligibility Check
 * 1_i = 1 if T_i >= θ * B_i, else 0
 */
export function checkEligibility(totalStaked: number, bridgedTon: number, theta: number = STAKING_CONSTANTS.theta): boolean {
  return totalStaked >= theta * bridgedTon;
}

/**
 * Calculate minimum required stake
 * Required = θ * B_i
 */
export function calculateMinRequired(bridgedTon: number, theta: number = STAKING_CONSTANTS.theta): number {
  return theta * bridgedTon;
}

/**
 * Calculate buffer (safety margin)
 * Buffer = T_i - θ * B_i
 */
export function calculateBuffer(totalStaked: number, bridgedTon: number, theta: number = STAKING_CONSTANTS.theta): number {
  return totalStaked - theta * bridgedTon;
}

/**
 * Total Effective Bridged TON
 * x = Σ(1_i * B_i)
 */
export function calculateTotalEffectiveBridgedTon(networks: L2Network[], theta: number = STAKING_CONSTANTS.theta): number {
  return networks.reduce((sum, network) => {
    const isEligible = checkEligibility(network.totalStaked, network.bridgedTon, theta);
    return sum + (isEligible ? network.bridgedTon : 0);
  }, 0);
}

/**
 * Total Distributable Seigniorage (Hyperbolic Function)
 * y(x) = L * (x / (k + x))
 */
export function calculateTotalSeigniorage(
  totalEffectiveBridgedTon: number,
  constants: StakingConstants = STAKING_CONSTANTS
): number {
  const { L, k } = constants;
  return L * (totalEffectiveBridgedTon / (k + totalEffectiveBridgedTon));
}

/**
 * Individual L2 Allocation
 * S_i = y(x) * (1_i * B_i / x)
 */
export function calculateL2Allocation(
  network: L2Network,
  totalEffectiveBridgedTon: number,
  totalSeigniorage: number,
  theta: number = STAKING_CONSTANTS.theta
): number {
  const isEligible = checkEligibility(network.totalStaked, network.bridgedTon, theta);
  if (!isEligible || totalEffectiveBridgedTon === 0) return 0;
  
  return totalSeigniorage * (network.bridgedTon / totalEffectiveBridgedTon);
}

/**
 * Calculate APY for an L2
 * APY = (S_i * α / T_i) * 100
 */
export function calculateAPY(
  allocation: number,
  totalStaked: number,
  alpha: number = STAKING_CONSTANTS.alpha
): number {
  if (totalStaked === 0) return 0;
  return ((allocation * alpha) / totalStaked) * 100;
}

/**
 * Calculate saturation level (0-100%)
 * Based on how much of the hyperbolic curve has been utilized
 */
export function calculateSaturationLevel(
  bridgedTon: number,
  totalEffectiveBridgedTon: number,
  k: number = STAKING_CONSTANTS.k
): number {
  // Saturation = (x / (k + x)) * 100 for ecosystem-wide
  // For individual L2, we show its contribution relative to ecosystem
  const ecosystemSaturation = (totalEffectiveBridgedTon / (k + totalEffectiveBridgedTon)) * 100;
  const l2Contribution = totalEffectiveBridgedTon > 0 
    ? (bridgedTon / totalEffectiveBridgedTon) * ecosystemSaturation 
    : 0;
  return Math.min(l2Contribution * 2, 100); // Scale for visibility
}

/**
 * Calculate all metrics for a single L2
 */
export function calculateL2Metrics(
  network: L2Network,
  allNetworks: L2Network[],
  constants: StakingConstants = STAKING_CONSTANTS
): L2Metrics {
  const { theta, alpha, k } = constants;
  
  const isEligible = checkEligibility(network.totalStaked, network.bridgedTon, theta);
  const minRequired = calculateMinRequired(network.bridgedTon, theta);
  const buffer = calculateBuffer(network.totalStaked, network.bridgedTon, theta);
  
  const totalEffectiveBridgedTon = calculateTotalEffectiveBridgedTon(allNetworks, theta);
  const totalSeigniorage = calculateTotalSeigniorage(totalEffectiveBridgedTon, constants);
  const allocation = calculateL2Allocation(network, totalEffectiveBridgedTon, totalSeigniorage, theta);
  const apy = calculateAPY(allocation, network.totalStaked, alpha);
  const saturationLevel = calculateSaturationLevel(network.bridgedTon, totalEffectiveBridgedTon, k);
  
  return {
    network,
    isEligible,
    status: isEligible ? 'active' : 'risk',
    minRequired,
    buffer,
    saturationLevel,
    apy,
    allocation,
  };
}

/**
 * Calculate global statistics
 */
export function calculateGlobalStats(
  networks: L2Network[],
  constants: StakingConstants = STAKING_CONSTANTS
): GlobalStats {
  const totalEffectiveBridgedTon = calculateTotalEffectiveBridgedTon(networks, constants.theta);
  const totalDistributableSeigniorage = calculateTotalSeigniorage(totalEffectiveBridgedTon, constants);
  const eligibleL2Count = networks.filter(n => 
    checkEligibility(n.totalStaked, n.bridgedTon, constants.theta)
  ).length;
  
  return {
    totalEffectiveBridgedTon,
    totalDistributableSeigniorage,
    inflationRate: CURRENT_INFLATION_RATE,
    totalL2Count: networks.length,
    eligibleL2Count,
  };
}

/**
 * Simulate adding stake to an L2
 */
export function simulateStaking(
  input: SimulationInput,
  networks: L2Network[],
  constants: StakingConstants = STAKING_CONSTANTS
): SimulationResult {
  const { l2Id, additionalStake } = input;
  
  // Find current network
  const currentNetwork = networks.find(n => n.id === l2Id);
  if (!currentNetwork) {
    throw new Error(`L2 network not found: ${l2Id}`);
  }
  
  // Calculate current metrics
  const currentMetrics = calculateL2Metrics(currentNetwork, networks, constants);
  
  // Create modified network with additional stake
  const modifiedNetwork: L2Network = {
    ...currentNetwork,
    totalStaked: currentNetwork.totalStaked + additionalStake,
  };
  
  // Create modified networks list
  const modifiedNetworks = networks.map(n => 
    n.id === l2Id ? modifiedNetwork : n
  );
  
  // Calculate projected metrics
  const projectedMetrics = calculateL2Metrics(modifiedNetwork, modifiedNetworks, constants);
  
  // Check if this affects eligibility
  const wasEligible = currentMetrics.isEligible;
  const willBeEligible = projectedMetrics.isEligible;
  
  // Calculate Share % (내 지분이 해당 L2 풀에서 차지하는 비율)
  const currentSharePercent = currentNetwork.totalStaked > 0 
    ? (additionalStake / currentNetwork.totalStaked) * 100 
    : 0;
  const projectedSharePercent = modifiedNetwork.totalStaked > 0 
    ? (additionalStake / modifiedNetwork.totalStaked) * 100 
    : 0;
  
  // Calculate Safety Buffer (T_i - θ * B_i)
  const currentBuffer = currentMetrics.buffer;
  const projectedBuffer = projectedMetrics.buffer;
  
  // Calculate Buffer Percent (buffer / minRequired * 100)
  const bufferPercent = projectedMetrics.minRequired > 0
    ? (projectedBuffer / projectedMetrics.minRequired) * 100
    : 0;
  
  return {
    currentApy: currentMetrics.apy,
    projectedApy: projectedMetrics.apy,
    currentAllocation: currentMetrics.allocation,
    projectedAllocation: projectedMetrics.allocation,
    newSaturationLevel: projectedMetrics.saturationLevel,
    willAffectEligibility: !wasEligible && willBeEligible,
    currentSharePercent,
    projectedSharePercent,
    currentBuffer,
    projectedBuffer,
    bufferPercent,
  };
}

/**
 * Format large numbers for display (e.g., 1,234,567 -> 1.23M)
 */
export function formatTON(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
