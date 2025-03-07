// hooks/useCallOperators.ts
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { operatorsListState, operatorsLoadingState, Operator } from "recoil/operator";
import { usePublicClient } from "wagmi";
import { getContract } from "viem";
import { BigNumber } from "ethers";
import useCallL2Registry from "../contracts/useCallL2Registry";
import Layer2Registry from "@/abis/Layer2Registry.json";
import Candidates from "@/abis/Candidate.json";
import CONTRACT_ADDRESS from "@/constant/contracts";
import { useAPY } from "./useAPY";

type SortDirection = "asc" | "desc";

export default function useCallOperators() {
  const [operatorsList, setOperatorsList] = useRecoilState(operatorsListState);
  const [loading, setLoading] = useRecoilState(operatorsLoadingState);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc"); // 기본값은 내림차순
  
  const publicClient = usePublicClient();
  
  const { result: numLayer2Result } = useCallL2Registry("numLayer2s");
  
  // totalStaked 값을 비교하기 위한 헬퍼 함수
  const compareTotalStaked = (a: Operator, b: Operator, direction: SortDirection): number => {
    try {
      // 문자열을 BigNumber로 변환하여 비교 (오버플로우 방지)
      const aBN = BigNumber.from(a.totalStaked || "0");
      const bBN = BigNumber.from(b.totalStaked || "0");
      
      // BigNumber의 비교 메서드 사용
      if (aBN.eq(bBN)) return 0;
      
      // 오름차순: 작은 값이 먼저
      if (direction === "asc") {
        return aBN.lt(bBN) ? -1 : 1;
      } 
      // 내림차순: 큰 값이 먼저
      else {
        return aBN.gt(bBN) ? -1 : 1;
      }
    } catch (error) {
      // BigNumber 변환 실패 시 문자열 비교 시도
      const aNum = Number(a.totalStaked || "0");
      const bNum = Number(b.totalStaked || "0");
      
      if (direction === "asc") {
        return aNum - bNum;
      } else {
        return bNum - aNum;
      }
    }
  };
  
  // 목록을 정렬하는 함수
  const sortOperators = (direction: SortDirection = sortDirection): void => {
    setOperatorsList(prevList => {
      const newList = [...prevList];
      newList.sort((a, b) => compareTotalStaked(a, b, direction));
      return newList;
    });
    
    // 정렬 방향 상태 업데이트
    setSortDirection(direction);
  };
  
  // 정렬 방향 토글 함수
  const toggleSortDirection = (): void => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    sortOperators(newDirection);
  };
  
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        if (!numLayer2Result?.data || !publicClient) return;
        
        setLoading(true);
        const numLayer2 = Number(numLayer2Result.data);
        
        const layer2RegistryContract = getContract({
          address: CONTRACT_ADDRESS.Layer2Registry_ADDRESS,
          abi: Layer2Registry,
          publicClient: publicClient,
        });
        
        const operators: Operator[] = [];
        
        for (let i = 0; i < numLayer2; i++) {
          try {
            const operatorAddress: string = await layer2RegistryContract.read.layer2ByIndex([i]) as unknown as string;
            
            if (!operatorAddress) continue;
            
            const candidateContract = getContract({
              address: operatorAddress as `0x${string}`,
              abi: Candidates.abi,
              publicClient: publicClient,
            });
            
            const [totalStaked, memo] = await Promise.all([
              candidateContract.read.totalStaked(),
              candidateContract.read.memo()
            ]);
            
            const operatorInfo: Operator = {
              name: typeof memo === 'string' ? memo : "Unknown",
              address: operatorAddress,
              totalStaked: totalStaked?.toString() || "0",
            };
            
            operators.push(operatorInfo);
          } catch (error) {
            console.error(`Error fetching operator at index ${i}:`, error);
          }
        }
        
        setOperatorsList(operators.sort((a, b) => compareTotalStaked(a, b, sortDirection)));
      } catch (error) {
        console.error("Error fetching operators:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOperators();
  }, [numLayer2Result?.data, publicClient, setOperatorsList, setLoading, sortDirection]);
  
  const refreshOperator = async (operatorAddress: string) => {
    try {
      if (!publicClient) return;
      
      const candidateContract = getContract({
        address: operatorAddress as `0x${string}`,
        abi: Candidates.abi,
        publicClient: publicClient,
      });
      
      const [totalStaked, memo] = await Promise.all([
        candidateContract.read.totalStaked(),
        candidateContract.read.memo()
      ]);
      
      const operatorIndex = (operatorsList as Operator[]).findIndex(op => op.address === operatorAddress);
      
      if (operatorIndex !== -1) {
        setOperatorsList((prevList: Operator[]) => {
          const newList = [...prevList];
          newList[operatorIndex] = {
            name: typeof memo === 'string' ? memo : prevList[operatorIndex].name,
            address: prevList[operatorIndex].address,
            totalStaked: totalStaked?.toString() || prevList[operatorIndex].totalStaked
          };
          
          // 업데이트 후 재정렬
          return newList.sort((a, b) => compareTotalStaked(a, b, sortDirection));
        });
      }
      
      return true;
    } catch (error) {
      console.error(`Error refreshing operator ${operatorAddress}:`, error);
      return false;
    }
  };
  
  const refreshAllOperators = async () => {
    try {
      setLoading(true);
      
      if (!publicClient || !numLayer2Result?.data) {
        return false;
      }
      
      const numLayer2 = Number(numLayer2Result.data);
      const layer2RegistryContract = getContract({
        address: CONTRACT_ADDRESS.Layer2Registry_ADDRESS,
        abi: Layer2Registry,
        publicClient: publicClient,
      });
      
      const operators: Operator[] = [];
      
      for (let i = 0; i < numLayer2; i++) {
        try {
          const operatorAddress = await layer2RegistryContract.read.layer2ByIndex([i]);
          
          if (!operatorAddress) continue;
          
          const candidateContract = getContract({
            address: operatorAddress as `0x${string}`,
            abi: Candidates.abi,
            publicClient: publicClient,
          });

          
          const [totalStaked, memo] = await Promise.all([
            candidateContract.read.totalStaked(),
            candidateContract.read.memo()
          ]);
          
          operators.push({
            name: typeof memo === 'string' ? memo : "Unknown",
            address: operatorAddress as `0x${string}`,
            totalStaked: totalStaked?.toString() || "0",
          });
        } catch (error) {
          console.error(`Error refreshing operator at index ${i}:`, error);
        }
      }
      
      // 정렬된 상태로 목록 설정
      setOperatorsList(operators.sort((a, b) => compareTotalStaked(a, b, sortDirection)));
      return true;
    } catch (error) {
      console.error("Error refreshing all operators:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  // console.log(operatorsList[0])
          const a = useAPY('0x0F42D1C40b95DF7A1478639918fc358B4aF5298D');
          // console.log(a)
  return { 
    operatorsList,
    loading,
    refreshOperator,
    refreshAllOperators,
    sortOperators,
    toggleSortDirection,
    sortDirection
  };
}