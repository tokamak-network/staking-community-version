// hooks/useCallOperators.ts
import { useEffect, useState, useMemo } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { operatorsListState, operatorsLoadingState, Operator } from "@/recoil/staking/operator";
import { useAccount, useBlockNumber, usePublicClient, useWalletClient } from "wagmi";
import { getContract, isAddress } from "viem";
import { BigNumber } from "ethers";
import useCallL2Registry from "../contracts/useCallL2Registry";
import Layer2Registry from "@/abis/Layer2Registry.json";
import CandidateAddon from "@/abis/CandidateAddon.json";
import OperatorManager from "@/abis/OperatorManager.json";
import SeigManager from "@/abis/SeigManager.json";
import WTON from "@/abis/WTON.json";
import TON from "@/abis/TON.json";
import Layer2Manager from "@/abis/Layer2Manager.json";
import SystemConfig from "@/abis/SystemConfig.json"
import Candidates from "@/abis/Candidate.json";
import CONTRACT_ADDRESS from "@/constant/contracts";
import { useAllOperators } from '@ton-staking-sdk/react-kit';

type SortDirection = "asc" | "desc";

// 캐시 객체 생성
const contractCache = new Map<string, any>();

export default function useCallOperators() {
  const [operatorsList, setOperatorsList] = useRecoilState(operatorsListState);
  const [totalStaked, setTotalStaked] = useState('0');
  const [loading, setLoading] = useRecoilState(operatorsLoadingState);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc"); 
  const { address, isConnected } = useAccount();
  
  const publicClient = usePublicClient();
  const { data: blockNumber } = useBlockNumber();
  
  const { operators: operatorAddresses, isLoading } = useAllOperators();
  
  // 계약 인스턴스 생성 및 캐싱 함수
  const getContractInstance = useMemo(() => {
    return (contractAddress: string, abi: any): any => {
      const cacheKey = `${contractAddress}-${abi.contractName || 'unknown'}`;
      
      if (contractCache.has(cacheKey)) {
        return contractCache.get(cacheKey);
      }
      
      const contract = getContract({
        address: contractAddress as `0x${string}`,
        abi: abi.abi || abi,
        publicClient: publicClient
      });
      
      contractCache.set(cacheKey, contract);
      return contract;
    };
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
  
  const compareTotalStaked = (a: Operator, b: Operator, direction: SortDirection): number => {
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
      const aNum = Number(a.totalStaked || "0");
      const bNum = Number(b.totalStaked || "0");
      
      if (direction === "asc") {
        return aNum - bNum;
      } else {
        return bNum - aNum;
      }
    }
  };
  
  const sortOperators = (direction: SortDirection = sortDirection): void => {
    setOperatorsList(prevList => {
      const newList = [...prevList];
      newList.sort((a, b) => compareTotalStaked(a, b, direction));
      return newList;
    });
    
    setSortDirection(direction);
  };
  
  // 필수적인 경우에만 컨트랙트 존재 여부 확인
  const checkContractExists = async (address: string): Promise<boolean> => {
    try {
      if (!isAddress(address)) return false;
      
      // 캐시 키
      const cacheKey = `exists-${address}`;
      if (contractCache.has(cacheKey)) {
        return contractCache.get(cacheKey);
      }
      
      const code = await publicClient.getBytecode({
        address: address as `0x${string}`
      });
      
      const exists = code !== null && code !== undefined && code !== '0x';
      contractCache.set(cacheKey, exists);
      return exists;
    } catch (error) {
      console.error(`Error checking contract at ${address}:`, error);
      return false;
    }
  };
  
  
  const batchReadCalls = async (contract: any, methods: Array<{method: string, args?: any[]}>) => {
    return Promise.all(
      methods.map(({ method, args = [] }) => {
        return contract.read[method](args.length > 0 ? args : undefined);
      })
    );
  };
  
  useEffect(() => {
    const fetchOperators = async () => {
      console.log(operatorAddresses.length, operatorsList.length, blockNumber)
      if (!publicClient || !commonContracts || operatorAddresses.length === 0 || !blockNumber) return;
      try {
        if (operatorsList.length > 0 ) {
          setLoading(false);
          return;
        }
        
        setLoading(true);
        
        const { seigManager, wton, layer2manager, ton } = commonContracts;
        
        const operators: Operator[] = [];
        let totalStakedAmount = BigNumber.from(0);
        
        
        const operatorPromises = operatorAddresses.map(async (opAddress, index) => {
          try {
            const candidateContract = getContractInstance(opAddress as string, Candidates);
            
            const [totalStaked, memo, stakeOf] = await Promise.all([
              candidateContract.read.totalStaked(),
              candidateContract.read.memo(),
              address ? candidateContract.read.stakedOf([address]) : Promise.resolve("0")
            ]);
            
            const candidateAddon = getContractInstance(opAddress as string, CandidateAddon);
            const operatorAddress = await candidateAddon.read.operator();
            
            const operatorInfo: Operator = {
              name: typeof memo === 'string' ? memo : opAddress as string,
              address: opAddress,
              totalStaked: totalStaked?.toString() || "0",
              yourStaked: stakeOf?.toString() || "0",
              isL2: false
            };
            
            const operatorContractExists = await checkContractExists(operatorAddress as string);
            if (!operatorContractExists) {
              totalStakedAmount = totalStakedAmount.add(BigNumber.from(totalStaked?.toString() || '0'));
              return operatorInfo;
            }
            
            const operatorManager = getContractInstance(operatorAddress as string, OperatorManager);
            
            let rollupConfigAddress;
            try {
              rollupConfigAddress = await operatorManager.read.rollupConfig();
            } catch (error) {
              rollupConfigAddress = null;
            }
            
            let isL2 = false;
            let sequencerSeig;
            let lockedInL2 = '';
            
            if (rollupConfigAddress) {
              try {
                const rollupConfig = getContractInstance(rollupConfigAddress as string, SystemConfig);
                
                const bridgeDetail = await layer2manager.read.checkL1BridgeDetail([rollupConfigAddress]);
                
                if (Array.isArray(bridgeDetail)) {
                  isL2 = bridgeDetail[5] === 1 ? true : false;
                  // console.log(bridgeDetail, memo, isL2, rollupConfigAddress)
                  if (isL2) {
                    const bridgeAddress = await rollupConfig.read.optimismPortal();
                    
                    const lockedInBridge = await ton.read.balanceOf([bridgeAddress]);
                    console.log(lockedInBridge)
                    lockedInL2 = lockedInBridge.toString();
                    
                    const [wtonBalanceOfM, estimatedDistribution] = await Promise.all([
                      wton.read.balanceOf([operatorAddress]),
                      seigManager.read.estimatedDistribute([Number(blockNumber.toString()) + 1, opAddress, true])
                    ]);
                    
                    // @ts-ignore
                    const addedWton = wtonBalanceOfM + estimatedDistribution[7];
                    sequencerSeig = addedWton.toString();
                    
                    operatorInfo.isL2 = true;
                    operatorInfo.sequencerSeig = sequencerSeig;
                    operatorInfo.lockedInL2 = lockedInL2;
                  }
                }
              } catch (error) {
                console.log(`Failed to get bridge details: ${error}`);
              }
            }
            
            totalStakedAmount = totalStakedAmount.add(BigNumber.from(totalStaked?.toString() || '0'));
            return operatorInfo;
          } catch (error) {
            // console.error(`Error fetching operator at index ${index}:`, error);
            return null;
          }
        });
        
        const results = await Promise.all(operatorPromises);
        const validOperators = results.filter(Boolean) as Operator[];
        
        setTotalStaked(totalStakedAmount.toString());
        setOperatorsList(validOperators.sort((a, b) => compareTotalStaked(a, b, sortDirection)));
      } catch (error) {
        console.error("Error fetching operators:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOperators();
  }, [operatorAddresses, publicClient, isLoading, commonContracts, setLoading]);
  
  const refreshOperator = async (candidateAddress: string) => {
    try {
      if (!publicClient || !address) return false;
      
      const candidateContract = getContractInstance(candidateAddress, Candidates);
      
      // 개별 호출로 변경
      const [totalStaked, memo, stakeOf] = await Promise.all([
        candidateContract.read.totalStaked(),
        candidateContract.read.memo(),
        address ? candidateContract.read.stakedOf([address]) : Promise.resolve("0")
      ]);
      
      const operatorIndex = operatorsList.findIndex(op => op.address === candidateAddress);
      
      if (operatorIndex !== -1) {
        setOperatorsList((prevList: Operator[]) => {
          const newList = [...prevList];
          newList[operatorIndex] = {
            ...newList[operatorIndex],
            name: typeof memo === 'string' ? memo : prevList[operatorIndex].name,
            totalStaked: totalStaked?.toString() || prevList[operatorIndex].totalStaked,
            yourStaked: stakeOf?.toString() || "0",
          };
          
          return newList.sort((a, b) => compareTotalStaked(a, b, sortDirection));
        });
      }
      
      return true;
    } catch (error) {
      console.error(`Error refreshing operator ${candidateAddress}:`, error);
      return false;
    }
  };
  
  const refreshAllOperators = async () => {
    try {
      if (!publicClient || !address) return false;
      
      setLoading(true);
      
      // 모든 운영자 데이터를 병렬로 새로고침
      const refreshPromises = operatorAddresses.map(async (candidateAddress) => {
        try {
          if (!candidateAddress) return null;
          
          const candidateContract = getContractInstance(candidateAddress as string, Candidates);
          
          // 개별 호출로 변경
          const [totalStaked, memo, stakeOf] = await Promise.all([
            candidateContract.read.totalStaked(),
            candidateContract.read.memo(),
            address ? candidateContract.read.stakedOf([address]) : Promise.resolve("0")
          ]);
          
          return {
            name: typeof memo === 'string' ? memo : candidateAddress as string,
            address: candidateAddress as string,
            totalStaked: totalStaked?.toString() || "0",
            yourStaked: stakeOf?.toString() || "0",
          };
        } catch (error) {
          console.error(`Error refreshing operator ${candidateAddress}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(refreshPromises);
      const validOperators = results.filter(Boolean) as Operator[];
      
      setOperatorsList(validOperators.sort((a, b) => compareTotalStaked(a, b, sortDirection)));
      return true;
    } catch (error) {
      console.error("Error refreshing all operators:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return { 
    operatorsList,
    loading,
    refreshOperator,
    refreshAllOperators,
    sortOperators,
    totalStaked
  };
}