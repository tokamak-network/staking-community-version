// hooks/useStaking.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  useContractRead, 
  useContractWrite, 
  useWaitForTransaction, 
  useAccount, 
  usePrepareContractWrite,
  useBalance 
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

// 스테이킹 컨트랙트 ABI 예시 (실제 프로젝트에 맞게 수정 필요)
const stakingABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'unstake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'earned',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRewardRate',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastUpdateTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

interface UseStakingProps {
  contractAddress: `0x${string}`;  // 스테이킹 컨트랙트 주소
  tokenDecimals?: number;          // 토큰 소수점 자릿수
  stakingPoolId?: string;          // 스테이킹 풀 ID (필요한 경우)
}

interface StakingInfo {
  stakedBalance: string;           // 스테이킹한 토큰 양
  rewards: string;                 // 누적 보상 양
  lastUpdate: number;              // 마지막 업데이트 시간 (Unix 타임스탬프)
  apy: number;                     // APY (연간 수익률)
  isLoading: boolean;              // 데이터 로딩 중 여부
}

export function useStaking({ 
  contractAddress, 
  tokenDecimals = 18,
  stakingPoolId
}: UseStakingProps) {
  // 계정 정보
  const { address, isConnected } = useAccount();
  
  // 상태 관리
  const [stakingInfo, setStakingInfo] = useState<StakingInfo>({
    stakedBalance: '0',
    rewards: '0',
    lastUpdate: 0,
    apy: 0,
    isLoading: true
  });

  // 스테이킹된 토큰 잔액 조회
  const { data: stakedBalance, isLoading: isBalanceLoading } = useContractRead({
    address: contractAddress,
    abi: stakingABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    enabled: isConnected && !!address,
    watch: true,
  });

  // 누적된 보상 조회
  const { data: earnedRewards, isLoading: isRewardsLoading } = useContractRead({
    address: contractAddress,
    abi: stakingABI,
    functionName: 'earned',
    args: [address as `0x${string}`],
    enabled: isConnected && !!address,
    watch: true,
  });

  // 마지막 업데이트 시간 조회
  const { data: lastUpdateTime } = useContractRead({
    address: contractAddress,
    abi: stakingABI,
    functionName: 'lastUpdateTime',
    enabled: isConnected,
    watch: true,
  });

  // 보상률 조회 (APY 계산용)
  const { data: rewardRate } = useContractRead({
    address: contractAddress,
    abi: stakingABI,
    functionName: 'getRewardRate',
    enabled: isConnected,
  });

  // 스테이킹 데이터 업데이트
  useEffect(() => {
    if (isConnected) {
      setStakingInfo({
        stakedBalance: stakedBalance ? formatUnits(stakedBalance as bigint, tokenDecimals) : '0',
        rewards: earnedRewards ? formatUnits(earnedRewards as bigint, tokenDecimals) : '0',
        lastUpdate: lastUpdateTime ? Number(lastUpdateTime) : 0,
        apy: rewardRate ? Number(rewardRate) * 31536000 * 100 : 0, // 31536000 = 365일 * 24시간 * 60분 * 60초
        isLoading: isBalanceLoading || isRewardsLoading
      });
    }
  }, [stakedBalance, earnedRewards, lastUpdateTime, rewardRate, isBalanceLoading, isRewardsLoading, isConnected, tokenDecimals]);

  // 스테이킹 기능
  const { config: stakeConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: stakingABI,
    functionName: 'stake',
    enabled: false, // 실시간 검증은 비활성화 (금액이 동적으로 변경되므로)
  });

  const { 
    write: stake,
    data: stakeData,
    isLoading: isStaking
  } = useContractWrite(stakeConfig);

  const { isLoading: isStakePending, isSuccess: isStakeSuccess } = useWaitForTransaction({
    hash: stakeData?.hash,
  });

  // 언스테이킹 기능
  const { config: unstakeConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: stakingABI,
    functionName: 'unstake',
    enabled: false,
  });

  const { 
    write: unstake,
    data: unstakeData,
    isLoading: isUnstaking 
  } = useContractWrite(unstakeConfig);

  const { isLoading: isUnstakePending, isSuccess: isUnstakeSuccess } = useWaitForTransaction({
    hash: unstakeData?.hash,
  });

  // 출금 기능
  const { config: withdrawConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: stakingABI,
    functionName: 'withdraw',
    enabled: isConnected,
  });

  const { 
    write: withdraw,
    data: withdrawData,
    isLoading: isWithdrawing 
  } = useContractWrite(withdrawConfig);

  const { isLoading: isWithdrawPending, isSuccess: isWithdrawSuccess } = useWaitForTransaction({
    hash: withdrawData?.hash,
  });

  // 스테이킹 함수
  const handleStake = useCallback((amount: `${number}`) => {
    if (!stake) return;
    
  }, [stake, tokenDecimals]);

  // 언스테이킹 함수
  const handleUnstake = useCallback((amount: `${number}`) => {
    if (!unstake) return;
    try {
      const amountInWei = parseUnits(amount, tokenDecimals);
      
    } catch (error) {
      console.error('Unstaking error:', error);
    }
  }, [unstake, tokenDecimals]);

  // 출금 함수
  const handleWithdraw = useCallback(() => {
    if (!withdraw) return;
    try {
      withdraw();
    } catch (error) {
      console.error('Withdraw error:', error);
    }
  }, [withdraw]);

  return {
    stakingInfo,
    handleStake,
    handleUnstake,
    handleWithdraw,
    isStaking: isStaking || isStakePending,
    isUnstaking: isUnstaking || isUnstakePending,
    isWithdrawing: isWithdrawing || isWithdrawPending,
    isStakeSuccess,
    isUnstakeSuccess,
    isWithdrawSuccess,
  };
}

export default useStaking;