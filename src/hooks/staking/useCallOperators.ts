// hooks/useCallOperators.ts
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { operatorsListState, operatorsLoadingState, Operator } from "@/recoil/staking/operator";
import { useAccount, useBlockNumber, usePublicClient, useWalletClient } from "wagmi";
import { getContract, isAddress } from "viem";
import { BigNumber } from "ethers";
import useCallL2Registry from "../contracts/useCallL2Registry";
import Layer2Registry from "@/abis/Layer2Registry.json";
import OperatorManager from "@/abis/OperatorManager.json";
import CandidateAddon from "@/constant/abis/CandidateAddOn.json";
import SeigManager from "@/abis/SeigManager.json";
import WTON from "@/abis/WTON.json";
import TON from "@/abis/TON.json";
import Layer2Manager from "@/abis/Layer2Manager.json";
import SystemConfig from "@/abis/SystemConfig.json"
import Candidates from "@/abis/Candidate.json";
import CONTRACT_ADDRESS from "@/constant/contracts";
import { useAllCandidates } from '@ton-staking-sdk/react-kit';
import trimAddress from "@/utils/trim/trim";

type SortDirection = "asc" | "desc";

// 글로벌 캐시 객체 - 컴포넌트 리렌더링에 영향받지 않음
const contractCache = new Map<string, any>();
const contractExistsCache = new Map<string, boolean>();
const operatorDataCache = new Map<string, Operator>();

export default function useCallOperators() {
  const [operatorsList, setOperatorsList] = useRecoilState(operatorsListState);
  const [totalStaked, setTotalStaked] = useState('0');
  const [loading, setLoading] = useRecoilState(operatorsLoadingState);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc"); 
  const { address, isConnected } = useAccount();
  
  const publicClient = usePublicClient();
  const { data: blockNumber } = useBlockNumber();
  
  const { candidates: operatorAddresses, isLoading } = useAllCandidates();
  
  const getContractInstance = useCallback((contractAddress: string, abi: any): any => {
    if (!publicClient || !contractAddress) return null;
    
    const cacheKey = `${contractAddress}-${abi.contractName || 'unknown'}`;
    
    if (contractCache.has(cacheKey)) {
      return contractCache.get(cacheKey);
    }
    
    try {
      const contract = getContract({
        address: contractAddress as `0x${string}`,
        abi: abi.abi || abi,
        publicClient: publicClient
      });
      
      contractCache.set(cacheKey, contract);
      return contract;
    } catch (error) {
      console.error(`Failed to get contract instance for ${contractAddress}:`, error);
      return null;
    }
  }, [publicClient]);
  
  // 메모이제이션된 공통 컨트랙트 인스턴스
  const commonContracts = useMemo(() => {
    if (!publicClient) return null;
    
    return {
      seigManager: getContractInstance(CONTRACT_ADDRESS.SeigManager_ADDRESS, SeigManager),
      wton: getContractInstance(CONTRACT_ADDRESS.WTON_ADDRESS, WTON),
      layer2manager: getContractInstance(CONTRACT_ADDRESS.Layer2Manager_ADDRESS, Layer2Manager),
      ton: getContractInstance(CONTRACT_ADDRESS.TON_ADDRESS, TON)
    };
  }, [publicClient, getContractInstance]);
  
  // 컨트랙트 존재 여부 확인 - 최적화를 위한 메모이제이션
  const checkContractExists = useCallback(async (address: string): Promise<boolean> => {
    try {
      if (!publicClient || !isAddress(address)) return false;
      
      // 캐시에서 확인
      if (contractExistsCache.has(address)) {
        return contractExistsCache.get(address) as boolean;
      }
      
      const code = await publicClient.getBytecode({
        address: address as `0x${string}`
      });
      
      const exists = code !== null && code !== undefined && code !== '0x';
      contractExistsCache.set(address, exists);
      return exists;
    } catch (error) {
      console.error(`Error checking contract at ${address}:`, error);
      return false;
    }
  }, [publicClient]);
  
  // 정렬 로직 최적화 - useCallback으로 함수 메모이제이션
  const compareTotalStaked = useCallback((a: Operator, b: Operator, direction: SortDirection): number => {
    try {
      const aBN = BigNumber.from(a.totalStaked || "0");
      const bBN = BigNumber.from(b.totalStaked || "0");
      
      if (aBN.eq(bBN)) return 0;
      
      if (direction === "asc") {
        return aBN.lt(bBN) ? -1 : 1;
      } else {
        return aBN.gt(bBN) ? -1 : 1;
      }
    } catch (error) {
      // BigNumber 변환 실패시 일반 숫자로 비교
      const aNum = Number(a.totalStaked || "0");
      const bNum = Number(b.totalStaked || "0");
      
      if (direction === "asc") {
        return aNum - bNum;
      } else {
        return bNum - aNum;
      }
    }
  }, []);
  
  // 정렬 함수 최적화
  const sortOperators = useCallback((direction: SortDirection = sortDirection): void => {
    setOperatorsList(prevList => {
      const newList = [...prevList];
      newList.sort((a, b) => compareTotalStaked(a, b, direction));
      return newList;
    });
    
    setSortDirection(direction);
  }, [sortDirection, compareTotalStaked, setOperatorsList]);
  
  // 배치 호출 함수 최적화
  const batchReadCalls = useCallback(async (contract: any, methods: Array<{method: string, args?: any[]}>) => {
    if (!contract) return [];
    
    try {
      return await Promise.all(
        methods.map(({ method, args = [] }) => {
          if (!contract.read || !contract.read[method]) {
            console.error(`Method ${method} not found on contract`);
            return Promise.resolve(null);
          }
          return contract.read[method](args.length > 0 ? args : undefined).catch((err: any) => {
            console.error(`Error calling ${method}:`, err);
            return null;
          });
        })
      );
    } catch (error) {
      console.error("Error in batch read calls:", error);
      return [];
    }
  }, []);
  
  const fetchOperatorData = useCallback(async (opAddress: string): Promise<Operator | null> => {
    if (!opAddress || !publicClient || !commonContracts) return null;
    
    try {
      // if (operatorDataCache.has(opAddress) && !address) {
      //   return operatorDataCache.get(opAddress) as Operator;
      // }
      
      const candidateContract = getContractInstance(opAddress, Candidates);
      if (!candidateContract) return null;
      
      const [totalStaked, memo, stakeOf] = await Promise.all([
        candidateContract.read.totalStaked().catch(() => "0"),
        candidateContract.read.memo().catch(() => trimAddress({
          address: opAddress as string,
          firstChar: 7,
          lastChar: 4,
          dots: '....',
        })),
        address ? candidateContract.read.stakedOf([address]).catch(() => "0") : Promise.resolve("0")
      ]);
      
      const candidateAddon = getContractInstance(opAddress, CandidateAddon);
      if (!candidateAddon) return null;
      
      let operatorAddress;
      try {
        operatorAddress = await candidateAddon.read.operator();
      } catch (error) {
        operatorAddress = null;
      }
      console.log(memo )
      const operatorInfo: Operator = {
        name: typeof memo === 'string' ? memo : trimAddress({
          address: opAddress as string,
          firstChar: 7,
          lastChar: 4,
          dots: '....',
        }),
        address: opAddress,
        totalStaked: totalStaked?.toString() || "0",
        yourStaked: stakeOf?.toString() || "0",
        isL2: false
      };
      
      if (operatorAddress) {
        const operatorContractExists = await checkContractExists(operatorAddress as string);
        
        if (operatorContractExists) {
          const operatorManager = getContractInstance(operatorAddress as string, OperatorManager);
          if (operatorManager) {
            let rollupConfigAddress;
            try {
              rollupConfigAddress = await operatorManager.read.rollupConfig();
            } catch (error) {
              rollupConfigAddress = null;
            }
            
            if (rollupConfigAddress) {
              try {
                const { layer2manager, seigManager, wton, ton } = commonContracts;
                const rollupConfig = getContractInstance(rollupConfigAddress as string, SystemConfig);
                
                if (rollupConfig && layer2manager) {
                  const bridgeDetail = await layer2manager.read.checkL1BridgeDetail([rollupConfigAddress]);
                  
                  if (Array.isArray(bridgeDetail) && bridgeDetail[5] === 1) {
                    operatorInfo.isL2 = true;
                    
                    if (rollupConfig && ton && wton && seigManager && blockNumber) {
                      const [bridgeAddress, wtonBalanceOfM] = await Promise.all([
                        rollupConfig.read.optimismPortal().catch(() => null),
                        wton.read.balanceOf([operatorAddress]).catch(() => "0")
                      ]);
                      
                      if (bridgeAddress) {
                        const lockedInBridge = await ton.read.balanceOf([bridgeAddress]).catch(() => "0");
                        operatorInfo.lockedInL2 = lockedInBridge.toString();
                      }
                      
                      try {
                        const estimatedDistribution = await seigManager.read.estimatedDistribute([
                          Number(blockNumber.toString()) + 1,
                          opAddress,
                          true
                        ]);
                        
                        if (estimatedDistribution && estimatedDistribution[7] !== undefined) {
                          const addedWton = BigNumber.from(wtonBalanceOfM || "0").add(
                            BigNumber.from(estimatedDistribution[7] || "0")
                          );
                          operatorInfo.sequencerSeig = addedWton.toString();
                        }
                      } catch (error) {
                        console.error("Error estimating distribution:", error);
                      }
                    }
                  }
                }
              } catch (error) {
                console.error(`Failed to get bridge details for ${opAddress}:`, error);
              }
            }
          }
        }
      }
      
      if (!address) {
        operatorDataCache.set(opAddress, operatorInfo);
      }
      
      return operatorInfo;
    } catch (error) {
      console.error(`Error fetching operator data for ${opAddress}:`, error);
      return null;
    }
  }, [publicClient, commonContracts, address, blockNumber, getContractInstance, checkContractExists]);
  
  useEffect(() => {
    if (
      !publicClient || 
      !commonContracts || 
      operatorAddresses.length === 0 || 
      !blockNumber || 
      isLoading || 
      (operatorsList.length > 0 && !loading)
    ) {
      return;
    }
    
    const fetchOperators = async () => {
      try {
        setLoading(true);
        
        // 청크 단위로 병렬 처리 (10개씩 나누어 처리)
        const chunkSize = 10;
        let totalStakedAmount = BigNumber.from(0);
        const operators: Operator[] = [];
        
        for (let i = 0; i < operatorAddresses.length; i += chunkSize) {
          const chunk = operatorAddresses.slice(i, i + chunkSize);
          
          // 각 청크를 병렬로 처리
          const chunkResults = await Promise.all(
            chunk.map(opAddress => fetchOperatorData(opAddress as string))
          );
          
          // 유효한 결과만 필터링하고 집계
          const validResults = chunkResults.filter(Boolean) as Operator[];
          operators.push(...validResults);
          
          // totalStaked 집계
          validResults.forEach(op => {
            totalStakedAmount = totalStakedAmount.add(BigNumber.from(op.totalStaked || "0"));
          });
        }
        
        // 전체 결과 정렬 및 상태 업데이트
        const sortedOperators = [...operators].sort((a, b) => compareTotalStaked(a, b, sortDirection));
        setTotalStaked(totalStakedAmount.toString());
        setOperatorsList(sortedOperators);
      } catch (error) {
        console.error("Error fetching operators:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOperators();
  }, [
    publicClient, 
    commonContracts, 
    operatorAddresses, 
    blockNumber, 
    isLoading, 
    compareTotalStaked, 
    fetchOperatorData, 
    sortDirection,
    setOperatorsList,
    operatorsList.length,
    loading
  ]);
  
  // 개별 오퍼레이터 새로고침 함수
  const refreshOperator = useCallback(async (candidateAddress: string) => {
    try {
      if (!publicClient || !candidateAddress) return false;
      
      // 오퍼레이터 데이터 새로 가져오기
      const updatedOperator = await fetchOperatorData(candidateAddress);
      if (!updatedOperator) return false;
      
      // 목록 업데이트
      setOperatorsList((prevList: Operator[]) => {
        const operatorIndex = prevList.findIndex(op => op.address === candidateAddress);
        
        if (operatorIndex === -1) return prevList;
        
        const newList = [...prevList];
        newList[operatorIndex] = updatedOperator;
        
        return newList.sort((a, b) => compareTotalStaked(a, b, sortDirection));
      });
      
      // 캐시 업데이트
      operatorDataCache.delete(candidateAddress);
      
      return true;
    } catch (error) {
      console.error(`Error refreshing operator ${candidateAddress}:`, error);
      return false;
    }
  }, [publicClient, fetchOperatorData, compareTotalStaked, sortDirection, setOperatorsList]);
  
  // 모든 오퍼레이터 새로고침 함수
  const refreshAllOperators = useCallback(async () => {
    try {
      if (!publicClient || operatorAddresses.length === 0) return false;
      
      setLoading(true);
      
      // 캐시 초기화
      operatorDataCache.clear();
      
      // 청크 단위로 병렬 처리
      const chunkSize = 10;
      const operators: Operator[] = [];
      let totalStakedAmount = BigNumber.from(0);
      
      for (let i = 0; i < operatorAddresses.length; i += chunkSize) {
        const chunk = operatorAddresses.slice(i, i + chunkSize);
        
        // 각 청크를 병렬로 처리
        const chunkResults = await Promise.all(
          chunk.map(opAddress => fetchOperatorData(opAddress as string))
        );
        
        // 유효한 결과만 필터링하고 집계
        const validResults = chunkResults.filter(Boolean) as Operator[];
        operators.push(...validResults);
        
        // totalStaked 집계
        validResults.forEach(op => {
          totalStakedAmount = totalStakedAmount.add(BigNumber.from(op.totalStaked || "0"));
        });
      }
      
      // 전체 결과 정렬 및 상태 업데이트
      const sortedOperators = [...operators].sort((a, b) => compareTotalStaked(a, b, sortDirection));
      setTotalStaked(totalStakedAmount.toString());
      setOperatorsList(sortedOperators);
      
      return true;
    } catch (error) {
      console.error("Error refreshing all operators:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [
    publicClient, 
    operatorAddresses, 
    fetchOperatorData, 
    compareTotalStaked, 
    sortDirection, 
    setOperatorsList
  ]);
  
  return { 
    operatorsList,
    loading,
    refreshOperator,
    refreshAllOperators,
    sortOperators,
    totalStaked
  };
}