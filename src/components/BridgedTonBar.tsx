'use client';

import { formatTON } from '@/lib/calculations';

interface BridgedTonBarProps {
  value: number;
  maxValue: number;
  showLabel?: boolean;
}

export function BridgedTonBar({ value, maxValue, showLabel = true }: BridgedTonBarProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formatTON(value)} TON
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
