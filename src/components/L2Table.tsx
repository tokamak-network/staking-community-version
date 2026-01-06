'use client';

import Link from 'next/link';
import { StatusBadge } from './StatusBadge';
import { BridgedTonBar } from './BridgedTonBar';
import { useL2Networks, useMaxBridgedTon } from '@/hooks/useStakingData';
import { formatPercentage } from '@/lib/calculations';

export function L2Table() {
  const networks = useL2Networks();
  const maxBridgedTon = useMaxBridgedTon();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          L2 Networks
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Sorted by Bridged TON (Performance)
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Bridged TON
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Saturation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                APY
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {networks.map((metrics, index) => (
              <tr 
                key={metrics.network.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {index + 1}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {metrics.network.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {metrics.network.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {metrics.network.validatorCount} validators
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-48">
                    <BridgedTonBar 
                      value={metrics.network.bridgedTon} 
                      maxValue={maxBridgedTon} 
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-2">
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatPercentage(metrics.saturationLevel, 1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-semibold ${
                    metrics.isEligible 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-400'
                  }`}>
                    {metrics.isEligible ? formatPercentage(metrics.apy, 2) : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={metrics.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    href={`/l2/${metrics.network.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Details
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
