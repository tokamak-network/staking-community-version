'use client';

import { useState, useCallback } from 'react';
import { WalletState, ValidationError } from '@/types';
import { mockWalletState, SUPPORTED_CHAIN_IDS } from '@/data/mockUserData';

/**
 * Mock 지갑 연결 훅
 * 실제 구현 시 Wagmi/Viem으로 교체
 */
export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>(mockWalletState);
  const [isConnecting, setIsConnecting] = useState(false);

  // 지갑 연결
  const connect = useCallback(async () => {
    setIsConnecting(true);
    // Mock: 1초 후 연결
    await new Promise(resolve => setTimeout(resolve, 1000));
    setWallet({
      ...mockWalletState,
      isConnected: true,
    });
    setIsConnecting(false);
  }, []);

  // 지갑 연결 해제
  const disconnect = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      chainId: null,
      balance: 0,
    });
  }, []);

  // 네트워크 체크
  const isCorrectNetwork = wallet.chainId !== null && SUPPORTED_CHAIN_IDS.includes(wallet.chainId);

  // 잔액 검증
  const validateBalance = useCallback((amount: number): ValidationError | null => {
    if (amount <= 0) {
      return { field: 'amount', message: '금액은 0보다 커야 합니다.' };
    }
    if (amount > wallet.balance) {
      return { field: 'amount', message: '잔액이 부족합니다.' };
    }
    return null;
  }, [wallet.balance]);

  // 잔액 업데이트 (트랜잭션 후)
  const updateBalance = useCallback((newBalance: number) => {
    setWallet(prev => ({ ...prev, balance: newBalance }));
  }, []);

  return {
    wallet,
    isConnecting,
    isCorrectNetwork,
    connect,
    disconnect,
    validateBalance,
    updateBalance,
  };
}

/**
 * 지갑 연결 필요 여부 체크
 */
export function useRequireWallet() {
  const { wallet, connect, isCorrectNetwork } = useWallet();

  const requireConnection = useCallback(async (): Promise<boolean> => {
    if (!wallet.isConnected) {
      await connect();
      return true;
    }
    return wallet.isConnected;
  }, [wallet.isConnected, connect]);

  return {
    isConnected: wallet.isConnected,
    isCorrectNetwork,
    requireConnection,
  };
}
