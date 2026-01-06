'use client';

import { usePortfolio } from '@/hooks/useUserStaking';
import { formatTON } from '@/lib/calculations';
import { PortfolioItemStatus } from '@/types';

interface MyPortfolioProps {
  onStakeClick?: (l2Id: string) => void;
  onUnstakeClick?: (l2Id: string) => void;
  onWithdrawClick?: (l2Id: string) => void;
}

export function MyPortfolio({ onStakeClick, onUnstakeClick, onWithdrawClick }: MyPortfolioProps) {
  const { portfolioItems, totalStaked, totalPending, totalClaimable } = usePortfolio();

  const getStatusBadge = (status: PortfolioItemStatus) => {
    switch (status) {
      case 'staked':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 rounded-full">
            Staked
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded-full">
            Pending
          </span>
        );
      case 'claimable':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
            Claimable
          </span>
        );
    }
  };

  const getActionButton = (item: typeof portfolioItems[0]) => {
    switch (item.status) {
      case 'staked':
        return (
          <button
            onClick={() => onUnstakeClick?.(item.l2Id)}
            className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Unstake
          </button>
        );
      case 'pending':
        return (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            대기 중
          </span>
        );
      case 'claimable':
        return (
          <button
            onClick={() => onWithdrawClick?.(item.l2Id)}
            className="px-3 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors"
          >
            Withdraw
          </button>
        );
    }
  };

  if (portfolioItems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          My Portfolio
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p>스테이킹된 자산이 없습니다</p>
          <p className="text-sm mt-1">L2를 선택하여 스테이킹을 시작하세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        My Portfolio
      </h3>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Staked</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatTON(totalStaked)}
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {formatTON(totalPending)}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Claimable</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {formatTON(totalClaimable)}
          </p>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {portfolioItems.map((item, index) => (
          <div
            key={`${item.l2Id}-${item.status}-${index}`}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {item.l2Name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {item.l2Name}
                  </span>
                  {getStatusBadge(item.status)}
                </div>
                {item.status === 'pending' && item.estimatedUnlockAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {new Date(item.estimatedUnlockAt).toLocaleDateString('ko-KR')} 수령 가능
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatTON(item.amount)} TON
              </span>
              {getActionButton(item)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
