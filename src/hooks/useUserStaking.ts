'use client';

import { useState, useCallback, useMemo } from 'react';
import { UserStakingInfo, PendingWithdrawal, PortfolioItem, TransactionState, ValidationError } from '@/types';
import { 
  mockUserStakingInfo, 
  mockPendingWithdrawals, 
  WITHDRAWAL_DELAY_BLOCKS,
  CURRENT_BLOCK 
} from '@/data/mockUserData';
import { mockL2Networks } from '@/data/mockL2Networks';

/**
 * 사용자 스테이킹 정보 훅
 */
export function useUserStaking(l2Id: string) {
  const [stakingInfo, setStakingInfo] = useState<UserStakingInfo>(
    mockUserStakingInfo[l2Id] || {
      l2Id,
      stakedAmount: 0,
      pendingAmount: 0,
      claimableAmount: 0,
      allowance: 0,
    }
  );

  const [txState, setTxState] = useState<TransactionState>({
    status: 'idle',
    hash: null,
    error: null,
  });

  // Allowance 체크
  const needsApproval = useCallback((amount: number): boolean => {
    return stakingInfo.allowance < amount;
  }, [stakingInfo.allowance]);

  // 스테이킹 잔액 검증
  const validateUnstakeAmount = useCallback((amount: number): ValidationError | null => {
    if (amount <= 0) {
      return { field: 'amount', message: '금액은 0보다 커야 합니다.' };
    }
    if (amount > stakingInfo.stakedAmount) {
      return { field: 'amount', message: '스테이킹 된 수량보다 많이 요청할 수 없습니다.' };
    }
    return null;
  }, [stakingInfo.stakedAmount]);

  // Pending 요청 존재 여부
  const hasPendingWithdrawal = stakingInfo.pendingAmount > 0;

  // Mock: Approve 트랜잭션
  const approve = useCallback(async (amount: number): Promise<boolean> => {
    setTxState({ status: 'approving', hash: null, error: null });
    
    // Mock 딜레이
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock 성공
    setStakingInfo(prev => ({ ...prev, allowance: prev.allowance + amount }));
    setTxState({ status: 'approved', hash: '0xapprove...mock', error: null });
    
    return true;
  }, []);

  // Mock: Stake 트랜잭션
  const stake = useCallback(async (amount: number): Promise<boolean> => {
    setTxState({ status: 'confirming', hash: null, error: null });
    
    // Mock 딜레이
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock 성공 - Optimistic Update
    setStakingInfo(prev => ({
      ...prev,
      stakedAmount: prev.stakedAmount + amount,
      allowance: prev.allowance - amount,
    }));
    setTxState({ status: 'success', hash: '0xstake...mock', error: null });
    
    return true;
  }, []);

  // Mock: Unstake (Request Withdrawal) 트랜잭션
  const requestWithdrawal = useCallback(async (amount: number): Promise<boolean> => {
    setTxState({ status: 'confirming', hash: null, error: null });
    
    // Mock 딜레이
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock 성공
    setStakingInfo(prev => ({
      ...prev,
      stakedAmount: prev.stakedAmount - amount,
      pendingAmount: prev.pendingAmount + amount,
    }));
    setTxState({ status: 'success', hash: '0xunstake...mock', error: null });
    
    return true;
  }, []);

  // Mock: Withdraw (Process Withdrawal) 트랜잭션
  const processWithdrawal = useCallback(async (): Promise<boolean> => {
    setTxState({ status: 'confirming', hash: null, error: null });
    
    // Mock 딜레이
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock 성공
    const claimable = stakingInfo.claimableAmount;
    setStakingInfo(prev => ({
      ...prev,
      claimableAmount: 0,
    }));
    setTxState({ status: 'success', hash: '0xwithdraw...mock', error: null });
    
    return true;
  }, [stakingInfo.claimableAmount]);

  // 트랜잭션 상태 리셋
  const resetTxState = useCallback(() => {
    setTxState({ status: 'idle', hash: null, error: null });
  }, []);

  return {
    stakingInfo,
    txState,
    needsApproval,
    validateUnstakeAmount,
    hasPendingWithdrawal,
    approve,
    stake,
    requestWithdrawal,
    processWithdrawal,
    resetTxState,
  };
}

/**
 * 사용자 포트폴리오 (전체 L2 합산)
 */
export function usePortfolio() {
  const [portfolioItems] = useState<PortfolioItem[]>(() => {
    const items: PortfolioItem[] = [];
    
    Object.entries(mockUserStakingInfo).forEach(([l2Id, info]) => {
      const l2 = mockL2Networks.find(n => n.id === l2Id);
      const l2Name = l2?.name || l2Id;
      
      if (info.stakedAmount > 0) {
        items.push({
          l2Id,
          l2Name,
          status: 'staked',
          amount: info.stakedAmount,
        });
      }
      
      if (info.pendingAmount > 0) {
        const pending = mockPendingWithdrawals.find(p => p.l2Id === l2Id);
        items.push({
          l2Id,
          l2Name,
          status: 'pending',
          amount: info.pendingAmount,
          unlockBlock: pending?.unlockBlock,
          estimatedUnlockAt: pending?.estimatedUnlockAt,
        });
      }
      
      if (info.claimableAmount > 0) {
        items.push({
          l2Id,
          l2Name,
          status: 'claimable',
          amount: info.claimableAmount,
        });
      }
    });
    
    return items;
  });

  // 총 스테이킹 양
  const totalStaked = useMemo(() => 
    portfolioItems
      .filter(item => item.status === 'staked')
      .reduce((sum, item) => sum + item.amount, 0),
    [portfolioItems]
  );

  // 총 대기 중 양
  const totalPending = useMemo(() =>
    portfolioItems
      .filter(item => item.status === 'pending')
      .reduce((sum, item) => sum + item.amount, 0),
    [portfolioItems]
  );

  // 총 수령 가능 양
  const totalClaimable = useMemo(() =>
    portfolioItems
      .filter(item => item.status === 'claimable')
      .reduce((sum, item) => sum + item.amount, 0),
    [portfolioItems]
  );

  return {
    portfolioItems,
    totalStaked,
    totalPending,
    totalClaimable,
  };
}

/**
 * Pending Withdrawal 상태 체크
 */
export function usePendingWithdrawal(l2Id: string) {
  const pending = mockPendingWithdrawals.find(p => p.l2Id === l2Id);
  
  if (!pending) {
    return {
      hasPending: false,
      isClaimable: false,
      remainingBlocks: 0,
      estimatedTime: null,
    };
  }

  const remainingBlocks = Math.max(0, pending.unlockBlock - CURRENT_BLOCK);
  const isClaimable = remainingBlocks <= 0;
  
  // 남은 시간 계산 (12초/블록 기준)
  const remainingSeconds = remainingBlocks * 12;
  const remainingDays = Math.floor(remainingSeconds / 86400);
  const remainingHours = Math.floor((remainingSeconds % 86400) / 3600);

  return {
    hasPending: true,
    isClaimable,
    remainingBlocks,
    remainingDays,
    remainingHours,
    amount: pending.amount,
    estimatedUnlockAt: pending.estimatedUnlockAt,
  };
}
