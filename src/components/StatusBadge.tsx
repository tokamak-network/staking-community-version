'use client';

import { EligibilityStatus } from '@/types';

interface StatusBadgeProps {
  status: EligibilityStatus;
  showTooltip?: boolean;
}

export function StatusBadge({ status, showTooltip = true }: StatusBadgeProps) {
  const isActive = status === 'active';
  
  return (
    <div className="relative group inline-flex">
      <span
        className={`
          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${isActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }
        `}
      >
        <span
          className={`
            w-1.5 h-1.5 mr-1.5 rounded-full
            ${isActive ? 'bg-green-500' : 'bg-red-500'}
          `}
        />
        {isActive ? 'Active' : 'Risk'}
      </span>
      
      {showTooltip && !isActive && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 w-64 text-center">
          현재 스테이킹 부족으로 인해 시퀀서가 보상을 받지 못하고 있습니다. 스테이킹하여 L2를 지원하세요.
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
