'use client';

import { useMemo } from 'react';
import { mockL2Networks } from '@/data/mockL2Networks';
import { STAKING_CONSTANTS } from '@/data/constants';
import { 
  calculateL2Metrics, 
  calculateGlobalStats,
  simulateStaking 
} from '@/lib/calculations';
import { L2Metrics, GlobalStats, SimulationInput, SimulationResult } from '@/types';

/**
 * Hook for accessing all L2 networks with calculated metrics
 */
export function useL2Networks(): L2Metrics[] {
  return useMemo(() => {
    return mockL2Networks
      .map(network => calculateL2Metrics(network, mockL2Networks, STAKING_CONSTANTS))
      .sort((a, b) => b.network.bridgedTon - a.network.bridgedTon); // Sort by Bridged TON (Performance)
  }, []);
}

/**
 * Hook for accessing a single L2 network by ID
 */
export function useL2Network(id: string): L2Metrics | null {
  const networks = useL2Networks();
  return useMemo(() => {
    return networks.find(n => n.network.id === id) || null;
  }, [networks, id]);
}

/**
 * Hook for global statistics
 */
export function useGlobalStats(): GlobalStats {
  return useMemo(() => {
    return calculateGlobalStats(mockL2Networks, STAKING_CONSTANTS);
  }, []);
}

/**
 * Hook for staking simulation
 */
export function useStakingSimulation() {
  return useMemo(() => ({
    simulate: (input: SimulationInput): SimulationResult => {
      return simulateStaking(input, mockL2Networks, STAKING_CONSTANTS);
    }
  }), []);
}

/**
 * Get maximum Bridged TON among all networks (for progress bars)
 */
export function useMaxBridgedTon(): number {
  return useMemo(() => {
    return Math.max(...mockL2Networks.map(n => n.bridgedTon));
  }, []);
}
