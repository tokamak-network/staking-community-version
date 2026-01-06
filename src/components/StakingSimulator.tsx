'use client';

import { useState, useMemo, useCallback } from 'react';
import { L2Metrics, SimulationResult } from '@/types';
import { useStakingSimulation } from '@/hooks/useStakingData';
import { formatTON, formatPercentage } from '@/lib/calculations';

interface StakingSimulatorProps {
  metrics: L2Metrics;
  onSimulationChange?: (additionalStake: number) => void; // 부모 컴포넌트에 시뮬레이션 값 전달
}

export function StakingSimulator({ metrics, onSimulationChange }: StakingSimulatorProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const { simulate } = useStakingSimulation();
  
  const additionalStake = useMemo(() => {
    const parsed = parseFloat(inputValue.replace(/,/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }, [inputValue]);
  
  const simulationResult: SimulationResult | null = useMemo(() => {
    if (additionalStake <= 0) return null;
    try {
      return simulate({
        l2Id: metrics.network.id,
        additionalStake,
      });
    } catch {
      return null;
    }
  }, [additionalStake, metrics.network.id, simulate]);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setInputValue(value);
    
    const parsed = parseFloat(value.replace(/,/g, ''));
    const stake = isNaN(parsed) ? 0 : parsed;
    onSimulationChange?.(stake);
  }, [onSimulationChange]);
  
  const handlePresetClick = useCallback((amount: number) => {
    setInputValue(amount.toString());
    onSimulationChange?.(amount);
  }, [onSimulationChange]);
  
  const presetAmounts = [100000, 500000, 1000000, 5000000];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Staking Simulator
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        스테이킹 전 결과를 미리 확인하세요
      </p>
      
      {/* Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          추가 스테이킹 금액 (TON)
        </label>
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="금액을 입력하세요..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            TON
          </span>
        </div>
        
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {presetAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handlePresetClick(amount)}
              className="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              +{formatTON(amount)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Results Section */}
      {simulationResult && (
        <div className="space-y-4">
          {/* Status Change Alert (가장 강력한 동기부여 요소) */}
          {simulationResult.willAffectEligibility && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    🎉 상태 변경: Risk → Active
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    이 스테이킹으로 L2가 보상 자격을 얻게 됩니다!
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Safety Buffer (스펙 요구사항) */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Safety Buffer (최소 요구량 대비 여유)
            </h4>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">현재</p>
                <p className={`text-xl font-bold ${
                  simulationResult.currentBuffer >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {simulationResult.currentBuffer >= 0 ? '+' : ''}{formatTON(simulationResult.currentBuffer)}
                </p>
              </div>
              
              <div className="flex items-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">예상</p>
                <p className={`text-xl font-bold ${
                  simulationResult.projectedBuffer >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {simulationResult.projectedBuffer >= 0 ? '+' : ''}{formatTON(simulationResult.projectedBuffer)}
                </p>
              </div>
            </div>
            {/* 버퍼 % 표시 (스펙: "최소 요구량보다 15% 더 여유가 생깁니다") */}
            {simulationResult.bufferPercent > 0 && (
              <p className="text-center text-sm text-green-600 dark:text-green-400 mt-3 font-medium">
                최소 요구량보다 <strong>{formatPercentage(simulationResult.bufferPercent, 1)}</strong> 더 여유가 생깁니다
              </p>
            )}
          </div>
          
          {/* APY Comparison */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              APY 변화
            </h4>
            
            <div className="flex items-center justify-center gap-8">
              {/* Current APY */}
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">현재</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.isEligible ? formatPercentage(simulationResult.currentApy, 2) : 'N/A'}
                </p>
              </div>
              
              {/* Arrow */}
              <div className="flex items-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              
              {/* Projected APY */}
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">예상</p>
                <p className={`text-2xl font-bold ${
                  simulationResult.projectedApy > simulationResult.currentApy
                    ? 'text-red-500'
                    : 'text-green-500'
                }`}>
                  {formatPercentage(simulationResult.projectedApy, 2)}
                </p>
              </div>
            </div>
            
            {/* Change indicator */}
            <div className="mt-3 text-center">
              {simulationResult.projectedApy !== simulationResult.currentApy && metrics.isEligible && (
                <span className={`text-sm font-medium ${
                  simulationResult.projectedApy < simulationResult.currentApy
                    ? 'text-red-500'
                    : 'text-green-500'
                }`}>
                  {simulationResult.projectedApy < simulationResult.currentApy ? '▼' : '▲'} 
                  {' '}
                  {formatPercentage(Math.abs(simulationResult.projectedApy - simulationResult.currentApy), 2)}
                </span>
              )}
            </div>
          </div>
          
          {/* Share % (스펙 요구사항) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">나의 지분 (Share %)</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatPercentage(simulationResult.projectedSharePercent, 2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                전체 풀 대비 내 스테이킹 비율
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">예상 할당량</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatTON(simulationResult.projectedAllocation)} TON
              </p>
              <p className="text-xs text-gray-400 mt-1">
                연간 보상 예상치
              </p>
            </div>
          </div>
          
          {/* Additional Stats */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">새로운 포화도</p>
            <div className="flex items-center mt-1">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-3">
                <div
                  className={`h-full rounded-full ${
                    simulationResult.newSaturationLevel < 30
                      ? 'bg-green-500'
                      : simulationResult.newSaturationLevel < 70
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(simulationResult.newSaturationLevel, 100)}%` }}
                />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatPercentage(simulationResult.newSaturationLevel, 1)}
              </span>
            </div>
          </div>
          
          {/* CTA Button */}
          <button
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
              simulationResult.willAffectEligibility
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {simulationResult.willAffectEligibility 
              ? '🚀 Support & Enable Rewards' 
              : 'Stake Now'}
          </button>
          
          {/* Info Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">희석 효과 안내</p>
                <p className="mt-1">
                  스테이킹을 추가하면 APY가 약간 감소할 수 있지만, L2의 자격 유지를 도와 전체 보상 풀을 증가시킵니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!simulationResult && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p>금액을 입력하여 스테이킹을 시뮬레이션하세요</p>
        </div>
      )}
    </div>
  );
}
