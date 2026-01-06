// L2 Network 정보
export interface L2Network {
  id: string;
  name: string;
  bridgedTon: number; // B_i: Bridged TON in L2 i
  totalStaked: number; // T_i: Total Staked TON in L2 i
  validatorCount: number;
  createdAt: string;
}

// 스테이킹 상수 (Protocol Parameters)
export interface StakingConstants {
  A: number; // Total Annual Seigniorage
  d: number; // DAO distribution parameter (0 < d < 1)
  L: number; // Upper bound of seigniorage: L = (1-d) * A
  theta: number; // Minimum staking ratio parameter (0 < θ ≤ 1)
  k: number; // Half-saturation point constant
  alpha: number; // Validator distribution ratio
}

// L2 자격 상태
export type EligibilityStatus = 'active' | 'risk';

// L2 계산 결과
export interface L2Metrics {
  network: L2Network;
  isEligible: boolean; // 1_i indicator
  status: EligibilityStatus;
  minRequired: number; // θ * B_i
  buffer: number; // T_i - θ * B_i
  saturationLevel: number; // 0-100%
  apy: number;
  allocation: number; // S_i: Individual L2 allocation
}

// 글로벌 통계
export interface GlobalStats {
  totalEffectiveBridgedTon: number; // x = Σ(1_i * B_i)
  totalDistributableSeigniorage: number; // y(x)
  inflationRate: number;
  totalL2Count: number;
  eligibleL2Count: number;
}

// 시뮬레이션 입력
export interface SimulationInput {
  l2Id: string;
  additionalStake: number; // ΔT
}

// 시뮬레이션 결과
export interface SimulationResult {
  currentApy: number;
  projectedApy: number;
  currentAllocation: number;
  projectedAllocation: number;
  newSaturationLevel: number;
  willAffectEligibility: boolean;
  // 추가 필드 (스펙 요구사항)
  currentSharePercent: number;    // 현재 나의 지분 비율
  projectedSharePercent: number;  // 예상 지분 비율
  currentBuffer: number;          // 현재 Safety Buffer
  projectedBuffer: number;        // 예상 Safety Buffer
  bufferPercent: number;          // 버퍼 퍼센트 (buffer / minRequired * 100)
}

// ===== 트랜잭션 관련 타입 (05_Interaction_Specs) =====

// 지갑 연결 상태
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: number; // TON 잔액
}

// 사용자별 L2 스테이킹 정보
export interface UserStakingInfo {
  l2Id: string;
  stakedAmount: number;      // 현재 스테이킹된 양
  pendingAmount: number;     // 출금 요청 중인 양
  claimableAmount: number;   // 수령 가능한 양
  allowance: number;         // Approve된 양
}

// 출금 요청 정보
export interface PendingWithdrawal {
  l2Id: string;
  amount: number;
  requestBlock: number;      // 요청한 블록 번호
  unlockBlock: number;       // 출금 가능한 블록 번호
  requestedAt: string;       // 요청 시간 (ISO)
  estimatedUnlockAt: string; // 예상 출금 가능 시간 (ISO)
}

// 트랜잭션 상태
export type TransactionStatus = 
  | 'idle' 
  | 'approving' 
  | 'approved'
  | 'confirming' 
  | 'pending' 
  | 'success' 
  | 'error';

// 트랜잭션 상태 정보
export interface TransactionState {
  status: TransactionStatus;
  hash: string | null;
  error: string | null;
}

// 스테이킹 모달 단계
export type StakingStep = 'input' | 'approve' | 'confirm' | 'pending' | 'success' | 'error';

// 언스테이킹 모달 단계
export type UnstakingStep = 'input' | 'warning' | 'confirm' | 'pending' | 'success' | 'error';

// 출금 모달 단계
export type WithdrawStep = 'confirm' | 'pending' | 'success' | 'error';

// 검증 에러 타입
export interface ValidationError {
  field: string;
  message: string;
}

// 포트폴리오 아이템 상태
export type PortfolioItemStatus = 'staked' | 'pending' | 'claimable';

// 포트폴리오 아이템
export interface PortfolioItem {
  l2Id: string;
  l2Name: string;
  status: PortfolioItemStatus;
  amount: number;
  unlockBlock?: number;        // pending일 경우
  estimatedUnlockAt?: string;  // pending일 경우
}
