'use client';

import { useState, useCallback, useEffect } from 'react';
import { L2Metrics, WithdrawStep } from '@/types';
import { useUserStaking, usePendingWithdrawal } from '@/hooks/useUserStaking';
import { formatTON } from '@/lib/calculations';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: L2Metrics;
  onSuccess?: () => void;
}

export function WithdrawModal({ isOpen, onClose, metrics, onSuccess }: WithdrawModalProps) {
  const [step, setStep] = useState<WithdrawStep>('confirm');

  const { 
    stakingInfo, 
    txState, 
    processWithdrawal, 
    resetTxState 
  } = useUserStaking(metrics.network.id);

  const pendingInfo = usePendingWithdrawal(metrics.network.id);

  // 모달 닫힐 때 상태 리셋
  useEffect(() => {
    if (!isOpen) {
      setStep('confirm');
      resetTxState();
    }
  }, [isOpen, resetTxState]);

  // Withdraw 실행
  const handleWithdraw = useCallback(async () => {
    setStep('pending');
    try {
      await processWithdrawal();
      setStep('success');
      onSuccess?.();
    } catch {
      setStep('error');
    }
  }, [processWithdrawal, onSuccess]);

  const claimableAmount = stakingInfo.claimableAmount;

  if (!isOpen) return null;

  // 수령 가능한 금액이 없는 경우
  if (claimableAmount <= 0 && !pendingInfo.hasPending) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            수령 가능한 자산이 없습니다
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            출금 요청을 먼저 진행해주세요.
          </p>
          <button
            onClick={onClose}
            className="mt-4 w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  // 대기 중인 경우 (아직 수령 불가)
  if (pendingInfo.hasPending && !pendingInfo.isClaimable) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Withdraw TON
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <div className="w-20 h-20 mx-auto bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              대기 중
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              출금 대기 기간이 아직 남았습니다
            </p>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">대기 중인 금액</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formatTON(pendingInfo.amount || 0)} TON
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">남은 블록</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {pendingInfo.remainingBlocks?.toLocaleString()} blocks
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">예상 대기 시간</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  약 {pendingInfo.remainingDays}일 {pendingInfo.remainingHours}시간
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">예상 수령 가능일</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {pendingInfo.estimatedUnlockAt 
                    ? new Date(pendingInfo.estimatedUnlockAt).toLocaleDateString('ko-KR')
                    : '-'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-4 w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Withdraw TON
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            대기 완료된 자산을 수령합니다
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4 text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  수령 가능! 🎉
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  대기 기간이 완료되어 자산을 수령할 수 있습니다
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">수령 가능 금액</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatTON(claimableAmount)} TON
                </p>
              </div>

              <button
                onClick={handleWithdraw}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
              >
                Withdraw Now
              </button>
            </div>
          )}

          {/* Step: Pending */}
          {step === 'pending' && (
            <div className="space-y-4 text-center py-8">
              <div className="w-16 h-16 mx-auto">
                <svg className="animate-spin w-full h-full text-green-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Processing...
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  지갑에서 트랜잭션을 확인해주세요
                </p>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  자산 수령 완료! 🎉
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatTON(claimableAmount)} TON이 지갑으로 전송되었습니다
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💰 지갑 잔액을 확인해주세요!
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors"
              >
                닫기
              </button>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  트랜잭션 실패
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {txState.error || '다시 시도해주세요.'}
                </p>
              </div>
              <button
                onClick={() => setStep('confirm')}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
