'use client';

import { useState, useCallback, useEffect } from 'react';
import { L2Metrics, UnstakingStep, ValidationError } from '@/types';
import { useUserStaking, usePendingWithdrawal } from '@/hooks/useUserStaking';
import { formatTON } from '@/lib/calculations';

interface UnstakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: L2Metrics;
  onSuccess?: () => void;
}

export function UnstakingModal({ isOpen, onClose, metrics, onSuccess }: UnstakingModalProps) {
  const [step, setStep] = useState<UnstakingStep>('input');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<ValidationError | null>(null);

  const { 
    stakingInfo, 
    txState, 
    validateUnstakeAmount,
    hasPendingWithdrawal,
    requestWithdrawal, 
    resetTxState 
  } = useUserStaking(metrics.network.id);

  const pendingInfo = usePendingWithdrawal(metrics.network.id);
  const amount = parseFloat(inputValue) || 0;

  // 모달 닫힐 때 상태 리셋
  useEffect(() => {
    if (!isOpen) {
      setStep('input');
      setInputValue('');
      setError(null);
      resetTxState();
    }
  }, [isOpen, resetTxState]);

  // 입력값 검증
  const validate = useCallback((): boolean => {
    const validationError = validateUnstakeAmount(amount);
    if (validationError) {
      setError(validationError);
      return false;
    }
    setError(null);
    return true;
  }, [amount, validateUnstakeAmount]);

  // Request Withdrawal 버튼 클릭
  const handleUnstakeClick = useCallback(() => {
    if (!validate()) return;
    setStep('warning');
  }, [validate]);

  // Warning 확인 후 진행
  const handleConfirmWarning = useCallback(() => {
    setStep('confirm');
  }, []);

  // Request Withdrawal 실행
  const handleConfirmUnstake = useCallback(async () => {
    setStep('pending');
    try {
      await requestWithdrawal(amount);
      setStep('success');
      onSuccess?.();
    } catch {
      setStep('error');
    }
  }, [requestWithdrawal, amount, onSuccess]);

  // 출금 후 L2가 Risk 상태가 될 수 있는지 체크
  const willBecomeRisk = metrics.isEligible && 
    (metrics.network.totalStaked - amount < metrics.minRequired);

  // 예상 출금 가능 날짜 (2주 후)
  const estimatedUnlockDate = new Date();
  estimatedUnlockDate.setDate(estimatedUnlockDate.getDate() + 14);

  if (!isOpen) return null;

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
              Unstake TON
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
            {metrics.network.name}에서 출금을 요청합니다
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step: Input */}
          {step === 'input' && (
            <div className="space-y-4">
              {/* Staked Balance Info */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">스테이킹 중인 금액</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formatTON(stakingInfo.stakedAmount)} TON
                </span>
              </div>

              {/* Pending Warning */}
              {hasPendingWithdrawal && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        진행 중인 출금 요청이 있습니다
                      </p>
                      <p className="text-amber-600 dark:text-amber-300 mt-1">
                        추가 요청 시 대기 시간이 초기화될 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Input */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value.replace(/[^0-9.]/g, ''));
                      setError(null);
                    }}
                    placeholder="출금 요청할 금액"
                    className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  <button
                    onClick={() => setInputValue(stakingInfo.stakedAmount.toString())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    MAX
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-500">{error.message}</p>
                )}
              </div>

              {/* Risk Warning */}
              {amount > 0 && willBecomeRisk && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-sm">
                      <p className="font-medium text-red-800 dark:text-red-200">
                        주의: L2가 Risk 상태가 됩니다
                      </p>
                      <p className="text-red-600 dark:text-red-300 mt-1">
                        이 출금으로 인해 L2의 보상 자격이 상실될 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Unstake Button */}
              <button
                onClick={handleUnstakeClick}
                disabled={amount <= 0}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                Request Withdrawal
              </button>
            </div>
          )}

          {/* Step: Warning (2주 락업 경고) */}
          {step === 'warning' && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200">
                  2주 대기 기간 안내
                </h3>
                <p className="text-sm text-amber-600 dark:text-amber-300 mt-2">
                  출금 요청 후 <strong>약 2주(100,800 블록)</strong> 동안 자산이 잠깁니다.
                  대기 기간이 지난 후에만 실제 출금이 가능합니다.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">출금 요청 금액</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatTON(amount)} TON
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">예상 출금 가능일</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {estimatedUnlockDate.toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('input')}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmWarning}
                  className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors"
                >
                  진행하기
                </button>
              </div>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  출금 요청 확인
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {metrics.network.name}에서 출금을 요청합니다
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTON(amount)} TON
                </p>
              </div>
              <button
                onClick={handleConfirmUnstake}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
              >
                Confirm Request
              </button>
            </div>
          )}

          {/* Step: Pending */}
          {step === 'pending' && (
            <div className="space-y-4 text-center py-8">
              <div className="w-16 h-16 mx-auto">
                <svg className="animate-spin w-full h-full text-red-600" fill="none" viewBox="0 0 24 24">
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
                  출금 요청 완료!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {estimatedUnlockDate.toLocaleDateString('ko-KR')} 이후에 수령 가능합니다
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 대기 기간이 지나면 "Withdraw" 버튼이 활성화됩니다.
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
                onClick={() => setStep('input')}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
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
