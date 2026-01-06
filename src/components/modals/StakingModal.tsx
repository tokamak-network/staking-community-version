'use client';

import { useState, useCallback, useEffect } from 'react';
import { L2Metrics, StakingStep, ValidationError } from '@/types';
import { useWallet } from '@/hooks/useWallet';
import { useUserStaking } from '@/hooks/useUserStaking';
import { formatTON, formatPercentage } from '@/lib/calculations';

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: L2Metrics;
  onSuccess?: () => void;
}

export function StakingModal({ isOpen, onClose, metrics, onSuccess }: StakingModalProps) {
  const [step, setStep] = useState<StakingStep>('input');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<ValidationError | null>(null);

  const { wallet, validateBalance, isCorrectNetwork } = useWallet();
  const { 
    stakingInfo, 
    txState, 
    needsApproval, 
    approve, 
    stake, 
    resetTxState 
  } = useUserStaking(metrics.network.id);

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
    // 지갑 연결 체크
    if (!wallet.isConnected) {
      setError({ field: 'wallet', message: '지갑을 연결해주세요.' });
      return false;
    }

    // 네트워크 체크
    if (!isCorrectNetwork) {
      setError({ field: 'network', message: '올바른 네트워크로 전환해주세요.' });
      return false;
    }

    // 금액 체크
    if (amount <= 0) {
      setError({ field: 'amount', message: '금액을 입력해주세요.' });
      return false;
    }

    // 잔액 체크
    const balanceError = validateBalance(amount);
    if (balanceError) {
      setError(balanceError);
      return false;
    }

    setError(null);
    return true;
  }, [wallet.isConnected, isCorrectNetwork, amount, validateBalance]);

  // Stake 버튼 클릭
  const handleStakeClick = useCallback(async () => {
    if (!validate()) return;

    // Approval 필요 여부 체크
    if (needsApproval(amount)) {
      setStep('approve');
    } else {
      setStep('confirm');
    }
  }, [validate, needsApproval, amount]);

  // Approve 실행
  const handleApprove = useCallback(async () => {
    setStep('pending');
    try {
      await approve(amount);
      setStep('confirm');
    } catch {
      setStep('error');
    }
  }, [approve, amount]);

  // Stake 실행
  const handleConfirmStake = useCallback(async () => {
    setStep('pending');
    try {
      await stake(amount);
      setStep('success');
      onSuccess?.();
    } catch {
      setStep('error');
    }
  }, [stake, amount, onSuccess]);

  // 예상 결과 계산
  const projectedBuffer = metrics.buffer + amount;
  const willBeActive = !metrics.isEligible && (metrics.network.totalStaked + amount >= metrics.minRequired);

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
              Stake TON
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
            {metrics.network.name}에 TON을 스테이킹합니다
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step: Input */}
          {step === 'input' && (
            <div className="space-y-4">
              {/* Balance Info */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">사용 가능 잔액</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formatTON(wallet.balance)} TON
                </span>
              </div>

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
                    placeholder="스테이킹할 금액"
                    className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  <button
                    onClick={() => setInputValue(wallet.balance.toString())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    MAX
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-500">{error.message}</p>
                )}
              </div>

              {/* Preview */}
              {amount > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">예상 Safety Buffer</span>
                    <span className={`font-medium ${projectedBuffer >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {projectedBuffer >= 0 ? '+' : ''}{formatTON(projectedBuffer)} TON
                    </span>
                  </div>
                  
                  {willBeActive && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">
                        L2가 Active 상태가 됩니다!
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Stake Button */}
              <button
                onClick={handleStakeClick}
                disabled={amount <= 0}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                Stake
              </button>
            </div>
          )}

          {/* Step: Approve */}
          {step === 'approve' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  TON 사용 승인 필요
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  스테이킹을 위해 TON 토큰 사용을 승인해주세요
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTON(amount)} TON
                </p>
              </div>
              <button
                onClick={handleApprove}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                Approve TON
              </button>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  스테이킹 확인
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  아래 금액을 {metrics.network.name}에 스테이킹합니다
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTON(amount)} TON
                </p>
              </div>
              <button
                onClick={handleConfirmStake}
                className={`w-full py-3 px-4 font-semibold rounded-xl transition-colors ${
                  willBeActive
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {willBeActive ? '🚀 Support & Enable Rewards' : 'Confirm Stake'}
              </button>
            </div>
          )}

          {/* Step: Pending */}
          {step === 'pending' && (
            <div className="space-y-4 text-center py-8">
              <div className="w-16 h-16 mx-auto">
                <svg className="animate-spin w-full h-full text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {txState.status === 'approving' ? 'Approving...' : 'Staking...'}
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
                  스테이킹 완료! 🎉
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatTON(amount)} TON이 {metrics.network.name}에 스테이킹되었습니다
                </p>
              </div>
              {willBeActive && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    🌟 회원님의 참여로 L2가 Active 상태가 되었습니다!
                  </p>
                </div>
              )}
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
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
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
