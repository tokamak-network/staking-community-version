import { formatUnits } from 'viem';
import { 
  useContractRead, 
  useBlockNumber, 
  useAccount, 
  usePublicClient,
  useWalletClient 
} from 'wagmi';
import { useEffect, useState, useMemo } from 'react';
// Atom import currently commented out
// import { useRecoilState } from 'recoil';
// import { txState } from '@/atom/global/transaction';
import CONTRACT_ADDRESS from '@/constant/contracts';

// ABIs
import Coinage from '@/abis/AutoRefactorCoinage.json';
import RefactorCoinageSnapshotABI from '@/abis/RefactorCoinageSnapshot.json';
import TON_ABI from '@/abis/TON.json';
import WTON_ABI from '@/abis/WTON.json';
import DepositManager_ABI from '@/abis/DepositManager.json';
import SeigManager_ABI from '@/abis/SeigManager.json';

// Type definitions
interface BalanceAndFactor {
  balance: bigint;
  refactoredCount: bigint;
}

interface FactorResult {
  factor: bigint;
  refactorCount: bigint;
}

interface DataInputs {
  publicClient: any;
  walletClient: any;
  account: `0x${string}` | undefined;
  candidateContract: `0x${string}` | undefined;
  tot: `0x${string}` | undefined;
  coinageAddress: `0x${string}` | undefined;
  lastSeigBlock: bigint | undefined;
  seigPerBlock: bigint | undefined;
  relativeSeigRate: bigint | undefined;
  tonTotalSupply: bigint | undefined;
  tonBalanceOfWTON: bigint | undefined;
  tonBalanceOfZero: bigint | undefined;
  tonBalanceOfOne: bigint | undefined;
  blockNumber: bigint | undefined;
  stakedAmount: string;
}

interface SeigResult {
  expectedSeig: string;
  seigOfLayer: string;
  lastSeigBlock: string;
}

// Constants
const CONSTANTS = {
  RAYDIFF: BigInt('1' + '0'.repeat(9)),
  RAY: BigInt('1' + '0'.repeat(27)),
  REFACTOR_DIVIDER: BigInt(2),
  REFACTOR_BOUNDARY: BigInt('1' + '0'.repeat(28)),
  ZERO_ADDRESS: '0x0000000000000000000000000000000000000000' as const,
  ONE_ADDRESS: '0x0000000000000000000000000000000000000001' as const
};

/**
 * Sets the factor for refactoring
 */
const setFactor = (factor_: bigint): FactorResult => {
  let count = 0;
  let f = factor_;

  while (f >= CONSTANTS.REFACTOR_BOUNDARY) {
    f = f / CONSTANTS.REFACTOR_DIVIDER;
    count++;
  }
  
  return { factor: f, refactorCount: BigInt(count) };
};

/**
 * Applies factor calculation
 */
const applyFactor = (
  factor: bigint, 
  refactorCount: bigint, 
  balance: bigint, 
  refactoredCount: bigint
): bigint => {
  let v = (balance * factor) / CONSTANTS.RAY;
  
  // REFACTOR_DIVIDER^(refactorCount - refactoredCount) calculation
  const powerDiff = refactorCount - refactoredCount;
  let multiplier = BigInt(1);
  
  for (let i = 0; i < powerDiff; i++) {
    multiplier *= CONSTANTS.REFACTOR_DIVIDER;
  }
  
  v = v * multiplier;
  return v;
};

/**
 * Hook to calculate expected seig rewards
 * @param candidateContract - The candidate contract address
 * @param stakedAmount - The amount staked
 * @param candidate - The candidate address
 * @returns Expected seig and layer seig
 */
export function useExpectedSeig(
  candidateContract: `0x${string}` | undefined, 
  stakedAmount: string, 
  // candidate: string
): SeigResult {
  const [expectedSeig, setExpectedSeig] = useState<string>('');
  const [seigOfLayer, setSeigOfLayer] = useState<string>('');
  // State management commented out
  // const [txPending, setTxPending] = useRecoilState(txState);
  
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { data: blockNumber } = useBlockNumber({ watch: true }) as { data: bigint | undefined };

  // SeigManager contract reads
  const { data: lastSeigBlock } = useContractRead({
    address: CONTRACT_ADDRESS.SeigManager_ADDRESS as `0x${string}`,
    abi: SeigManager_ABI,
    functionName: 'lastSeigBlock',
    enabled: !!candidateContract,
  }) as { data: bigint | undefined };
    

  const { data: seigPerBlock } = useContractRead({
    address: CONTRACT_ADDRESS.SeigManager_ADDRESS as `0x${string}`,
    abi: SeigManager_ABI,
    functionName: 'seigPerBlock',
    enabled: !!candidateContract,
  }) as { data: bigint | undefined };

  const { data: relativeSeigRate } = useContractRead({
    address: CONTRACT_ADDRESS.SeigManager_ADDRESS as `0x${string}`,
    abi: SeigManager_ABI,
    functionName: 'relativeSeigRate',
    enabled: !!candidateContract,
  }) as { data: bigint | undefined };

  const { data: tot } = useContractRead({
    address: CONTRACT_ADDRESS.SeigManager_ADDRESS as `0x${string}`,
    abi: SeigManager_ABI,
    functionName: 'tot',
    enabled: !!candidateContract,
  }) ;

  const { data: commissionRates } = useContractRead({
    address: CONTRACT_ADDRESS.SeigManager_ADDRESS as `0x${string}`,
    abi: SeigManager_ABI,
    functionName: 'commissionRates',
    args: [candidateContract as `0x${string}`],
    enabled: !!candidateContract,
  });

  const { data: isCommissionRateNegative } = useContractRead({
    address: CONTRACT_ADDRESS.SeigManager_ADDRESS as `0x${string}`,
    abi: SeigManager_ABI,
    functionName: 'isCommissionRateNegative',
    args: [candidateContract as `0x${string}`],
    enabled: !!candidateContract,
  });

  const { data: coinageAddress } = useContractRead({
    address: CONTRACT_ADDRESS.SeigManager_ADDRESS as `0x${string}`,
    abi: SeigManager_ABI,
    functionName: 'coinages',
    args: [candidateContract as `0x${string}`],
    enabled: !!candidateContract,
  });

  // TON contract reads
  const { data: tonTotalSupply } = useContractRead({
    address: CONTRACT_ADDRESS.TON_ADDRESS as `0x${string}`,
    abi: TON_ABI,
    functionName: 'totalSupply',
    enabled: !!candidateContract,
  }) as { data: bigint | undefined };

  const { data: tonBalanceOfWTON } = useContractRead({
    address: CONTRACT_ADDRESS.TON_ADDRESS as `0x${string}`,
    abi: TON_ABI,
    functionName: 'balanceOf',
    args: [CONTRACT_ADDRESS.WTON_ADDRESS as `0x${string}`],
    enabled: !!candidateContract,
  }) as { data: bigint | undefined };

  const { data: tonBalanceOfZero } = useContractRead({
    address: CONTRACT_ADDRESS.TON_ADDRESS as `0x${string}`,
    abi: TON_ABI,
    functionName: 'balanceOf',
    args: [CONSTANTS.ZERO_ADDRESS as `0x${string}`],
    enabled: !!candidateContract,
  }) as { data: bigint | undefined };

  const { data: tonBalanceOfOne } = useContractRead({
    address: CONTRACT_ADDRESS.TON_ADDRESS as `0x${string}`,
    abi: TON_ABI,
    functionName: 'balanceOf',
    args: [CONSTANTS.ONE_ADDRESS as `0x${string}`],
    enabled: !!candidateContract,
  }) as { data: bigint | undefined };

  // Main calculation effect
  useEffect(() => {
    const calculateSeig = async (): Promise<void> => {
   
      // if (!isDataReady(dataInputs)) {
      //   return;
      // }

      try {
        // Tot contract reads
        const [totTotalSupply, totFactor, totBalanceAndFactorResult] = await Promise.all([
          publicClient.readContract({
            address: tot as `0x${string}`,
            abi: RefactorCoinageSnapshotABI,
            functionName: 'totalSupply',
          }) as Promise<bigint>,
          publicClient.readContract({
            address: tot as `0x${string}`,
            abi: RefactorCoinageSnapshotABI,
            functionName: 'factor',
          }) as Promise<bigint>,
          publicClient.readContract({
            address: tot as `0x${string}`,
            abi: RefactorCoinageSnapshotABI,
            functionName: 'getBalanceAndFactor',
            args: [candidateContract as `0x${string}`],
          }) as Promise<BalanceAndFactor[]>
        ]);

        // Coinage contract reads
        const [coinageTotalSupply, userStaked] = await Promise.all([
          publicClient.readContract({
            address: coinageAddress as `0x${string}`,
            abi: Coinage,
            functionName: 'totalSupply',
          }) as Promise<bigint>,
          publicClient.readContract({
            address: coinageAddress as `0x${string}`,
            abi: Coinage,
            functionName: 'balanceOf',
            args: [account as `0x${string}`],
          }) as Promise<bigint>
        ]);

        // Calculation steps
        // 1. Calculate tos
        const tos = (BigInt(tonTotalSupply!.toString()) - 
                    BigInt(tonBalanceOfWTON!.toString()) - 
                    BigInt(tonBalanceOfZero!.toString()) - 
                    BigInt(tonBalanceOfOne!.toString())) * 
                    CONSTANTS.RAYDIFF + 
                    totTotalSupply;

        // 2. Calculate maxSeig
        const span = blockNumber! - lastSeigBlock!;
        const maxSeig = seigPerBlock! * span;

        // 3. Calculate stakedSeig
        const stakedSeig1 = (maxSeig * totTotalSupply) / tos;
        const unstakedSeig = maxSeig - stakedSeig1;
        const stakedSeig = stakedSeig1 + (unstakedSeig * relativeSeigRate!) / CONSTANTS.RAY;

        // 4. Calculate new totTotalSupply and factor
        const nextTotTotalSupply = totTotalSupply + stakedSeig;
        const newTotFactor = (nextTotTotalSupply * totFactor) / totTotalSupply;

        // 5. Refactoring calculation
        const { factor: newFactor, refactorCount } = setFactor(newTotFactor);

        // 6. Calculate new balance
        const balance = totBalanceAndFactorResult[0].balance;
        const refactoredCount = totBalanceAndFactorResult[0].refactoredCount;
        
        const nextBalanceOfLayerInTot = applyFactor(
          newFactor, 
          refactorCount, 
          balance, 
          refactoredCount
        );

        // 7. Final seig calculation
        const _seigOfLayer = nextBalanceOfLayerInTot - coinageTotalSupply;
        
        let seig: bigint;
        const commissionRateValue = commissionRates ? BigInt(commissionRates.toString()) : BigInt(0);
        
        if (commissionRateValue !== BigInt(0)) {
          if (!isCommissionRateNegative) {
            const operatorSeigs = (_seigOfLayer * commissionRateValue) / CONSTANTS.RAY;
            const restSeigs = _seigOfLayer - operatorSeigs;
            const userSeig = (restSeigs * userStaked) / BigInt(stakedAmount);
            
            // seig = 
            //   candidate === account 
            //   ? userSeig + operatorSeigs 
            //   : userSeig;
            seig = userSeig
          } else {
            // Handle negative commission if needed
            seig = (_seigOfLayer * userStaked) / BigInt(stakedAmount);
          }
        } else {
          seig = (_seigOfLayer * userStaked) / BigInt(stakedAmount);
        }

        setSeigOfLayer(_seigOfLayer.toString());
        setExpectedSeig(seig.toString());
      } catch (e) {
        console.error('Error calculating expectedSeig:', e);
      }
    };

    calculateSeig();
  }, [
    account, 
    candidateContract, 
    // txPending, 
    stakedAmount,
  ]);

  return { expectedSeig, seigOfLayer, lastSeigBlock: lastSeigBlock?.toString() || '' };
}