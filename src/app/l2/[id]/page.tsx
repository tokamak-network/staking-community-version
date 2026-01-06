'use client';

import { use, useState, useCallback } from 'react';
import Link from 'next/link';
import { useL2Network, useGlobalStats } from '@/hooks/useStakingData';
import { useUserStaking } from '@/hooks/useUserStaking';
import { StatusBadge } from '@/components/StatusBadge';
import { BridgedTonBar } from '@/components/BridgedTonBar';
import { HealthGauge } from '@/components/HealthGauge';
import { SaturationChart } from '@/components/SaturationChart';
import { StakingSimulator } from '@/components/StakingSimulator';
import { MyPortfolio } from '@/components/MyPortfolio';
import { StakingModal, UnstakingModal, WithdrawModal } from '@/components/modals';
import { formatTON, formatPercentage } from '@/lib/calculations';

interface L2DetailPageProps {
  params: Promise<{ id: string }>;
}

export default function L2DetailPage({ params }: L2DetailPageProps) {
  const { id } = use(params);
  const metrics = useL2Network(id);
  const globalStats = useGlobalStats();
  const { stakingInfo } = useUserStaking(id);
  
  // 시뮬레이션 상태를 부모에서 관리하여 자식 컴포넌트들에 전달
  const [simulatedStake, setSimulatedStake] = useState(0);
  
  // 모달 상태
  const [isStakingModalOpen, setIsStakingModalOpen] = useState(false);
  const [isUnstakingModalOpen, setIsUnstakingModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  
  const handleSimulationChange = useCallback((additionalStake: number) => {
    setSimulatedStake(additionalStake);
  }, []);

  // 모달 핸들러
  const handleStakeClick = useCallback(() => {
    setIsStakingModalOpen(true);
  }, []);

  const handleUnstakeClick = useCallback(() => {
    setIsUnstakingModalOpen(true);
  }, []);

  const handleWithdrawClick = useCallback(() => {
    setIsWithdrawModalOpen(true);
  }, []);

  const handleModalSuccess = useCallback(() => {
    // 데이터 갱신 (실제로는 Query Invalidation)
    console.log('Transaction successful, refresh data');
  }, []);

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            L2 Network Not Found
          </h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { network } = metrics;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Dashboard
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 dark:text-white font-medium">
                {network.name}
              </li>
            </ol>
          </nav>

          {/* Title Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white font-bold text-2xl">
                  {network.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {network.name}
                  </h1>
                  <StatusBadge status={metrics.status} />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {network.validatorCount} validators • Created {network.createdAt}
                </p>
              </div>
            </div>
            
            {/* Quick Stats & Actions */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">APY</p>
                <p className={`text-xl font-bold ${
                  metrics.isEligible
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400'
                }`}>
                  {metrics.isEligible ? formatPercentage(metrics.apy, 2) : 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">My Stake</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatTON(stakingInfo.stakedAmount)} TON
                </p>
              </div>
              <button
                onClick={handleStakeClick}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Stake
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Action Buttons */}
        <div className="md:hidden flex gap-3 mb-6">
          <button
            onClick={handleStakeClick}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Stake
          </button>
          {stakingInfo.stakedAmount > 0 && (
            <button
              onClick={handleUnstakeClick}
              className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
            >
              Unstake
            </button>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Bridged TON</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatTON(network.bridgedTon)}
            </p>
            <div className="mt-3">
              <BridgedTonBar 
                value={network.bridgedTon} 
                maxValue={globalStats.totalEffectiveBridgedTon}
                showLabel={false}
              />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Staked</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatTON(network.totalStaked)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {formatPercentage((network.totalStaked / network.bridgedTon) * 100, 1)} of Bridged
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Saturation Level</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatPercentage(metrics.saturationLevel, 1)}
            </p>
            <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  metrics.saturationLevel < 30
                    ? 'bg-green-500'
                    : metrics.saturationLevel < 70
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(metrics.saturationLevel, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Validators</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {network.validatorCount}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Active participants
            </p>
          </div>
        </div>

        {/* Charts Section - 시뮬레이션 값 연동 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <HealthGauge 
            metrics={metrics} 
            simulatedStake={simulatedStake}
          />
          <SaturationChart 
            metrics={metrics} 
            totalEffectiveBridgedTon={globalStats.totalEffectiveBridgedTon}
            simulatedStake={simulatedStake}
          />
        </div>

        {/* Simulator & Portfolio Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <StakingSimulator 
            metrics={metrics}
            onSimulationChange={handleSimulationChange}
          />
          <MyPortfolio
            onStakeClick={handleStakeClick}
            onUnstakeClick={handleUnstakeClick}
            onWithdrawClick={handleWithdrawClick}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Tokamak Network Staking V3 - Community Dashboard
          </p>
        </div>
      </footer>

      {/* Modals */}
      <StakingModal
        isOpen={isStakingModalOpen}
        onClose={() => setIsStakingModalOpen(false)}
        metrics={metrics}
        onSuccess={handleModalSuccess}
      />
      <UnstakingModal
        isOpen={isUnstakingModalOpen}
        onClose={() => setIsUnstakingModalOpen(false)}
        metrics={metrics}
        onSuccess={handleModalSuccess}
      />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        metrics={metrics}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
