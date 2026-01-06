import { WalletState, UserStakingInfo, PendingWithdrawal, PortfolioItem } from '@/types';

// 프로토콜 상수
export const WITHDRAWAL_DELAY_BLOCKS = 100_800; // 약 2주 (12초/블록 기준)
export const CURRENT_BLOCK = 19_500_000; // Mock 현재 블록

// Mock 지갑 상태
export const mockWalletState: WalletState = {
  isConnected: true,
  address: '0x1234...5678',
  chainId: 1, // Ethereum Mainnet
  balance: 50_000, // 50,000 TON
};

// Mock 사용자 스테이킹 정보 (L2별)
export const mockUserStakingInfo: Record<string, UserStakingInfo> = {
  titan: {
    l2Id: 'titan',
    stakedAmount: 5_000,
    pendingAmount: 0,
    claimableAmount: 0,
    allowance: 100_000,
  },
  thanos: {
    l2Id: 'thanos',
    stakedAmount: 2_500,
    pendingAmount: 1_000,
    claimableAmount: 0,
    allowance: 50_000,
  },
  nova: {
    l2Id: 'nova',
    stakedAmount: 1_000,
    pendingAmount: 0,
    claimableAmount: 500,
    allowance: 0,
  },
  quantum: {
    l2Id: 'quantum',
    stakedAmount: 0,
    pendingAmount: 0,
    claimableAmount: 0,
    allowance: 0,
  },
  nexus: {
    l2Id: 'nexus',
    stakedAmount: 0,
    pendingAmount: 0,
    claimableAmount: 0,
    allowance: 0,
  },
  pulse: {
    l2Id: 'pulse',
    stakedAmount: 0,
    pendingAmount: 0,
    claimableAmount: 0,
    allowance: 0,
  },
  orbit: {
    l2Id: 'orbit',
    stakedAmount: 0,
    pendingAmount: 0,
    claimableAmount: 0,
    allowance: 0,
  },
  zenith: {
    l2Id: 'zenith',
    stakedAmount: 0,
    pendingAmount: 0,
    claimableAmount: 0,
    allowance: 0,
  },
};

// Mock Pending Withdrawals
export const mockPendingWithdrawals: PendingWithdrawal[] = [
  {
    l2Id: 'thanos',
    amount: 1_000,
    requestBlock: 19_450_000,
    unlockBlock: 19_450_000 + WITHDRAWAL_DELAY_BLOCKS,
    requestedAt: '2025-01-01T10:00:00Z',
    estimatedUnlockAt: '2025-01-15T10:00:00Z',
  },
];

// Mock Portfolio Items (계산된 결과)
export const mockPortfolioItems: PortfolioItem[] = [
  {
    l2Id: 'titan',
    l2Name: 'Titan',
    status: 'staked',
    amount: 5_000,
  },
  {
    l2Id: 'thanos',
    l2Name: 'Thanos',
    status: 'staked',
    amount: 2_500,
  },
  {
    l2Id: 'thanos',
    l2Name: 'Thanos',
    status: 'pending',
    amount: 1_000,
    unlockBlock: 19_550_800,
    estimatedUnlockAt: '2025-01-15T10:00:00Z',
  },
  {
    l2Id: 'nova',
    l2Name: 'Nova',
    status: 'staked',
    amount: 1_000,
  },
  {
    l2Id: 'nova',
    l2Name: 'Nova',
    status: 'claimable',
    amount: 500,
  },
];

// 지원되는 네트워크
export const SUPPORTED_CHAIN_IDS = [1, 55004]; // Ethereum Mainnet, Titan

// 컨트랙트 주소 (Mock)
export const CONTRACT_ADDRESSES = {
  TON: '0x2be5e8c109e2197D077D13A82dAead6a9b3433C5',
  DepositManager: '0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e',
};
