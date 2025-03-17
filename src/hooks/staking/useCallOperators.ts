// hooks/useCallOperators.ts
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { operatorsListState, operatorsLoadingState, Operator } from "recoil/operator";
import { useAccount, usePublicClient } from "wagmi";
import { getContract } from "viem";
import { BigNumber } from "ethers";
import useCallL2Registry from "../contracts/useCallL2Registry";
import Layer2Registry from "@/abis/Layer2Registry.json";
import CandidateAddon from "@/abis/CandidateAddon.json";
import OperatorManager from "@/abis/OperatorManager.json";
import CandidateAddOn from "@/abis/CandidateAddon.json";
import Layer2Manager from "@/abis/Layer2Manager.json";
import Candidates from "@/abis/Candidate.json";
import CONTRACT_ADDRESS from "@/constant/contracts";
import { useAPY } from "./useAPY";

type SortDirection = "asc" | "desc";

export default function useCallOperators() {
  const [operatorsList, setOperatorsList] = useRecoilState(operatorsListState);
  const [totalStaked, setTotalStaked] = useState('0');
  const [loading, setLoading] = useRecoilState(operatorsLoadingState);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc"); // 기본값은 내림차순
  const { address, isConnected } = useAccount();
  
  const publicClient = usePublicClient();
  
  const { result: numLayer2Result } = useCallL2Registry("numLayer2s");
  
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
  
  const toggleSortDirection = (): void => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    sortOperators(newDirection);
  };
  // console.log(publicClient)
  
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        // if (operatorsList.length > 0) {
        //   setLoading(false);
        //   return;
        // }

        if (!numLayer2Result?.data || !publicClient) return;
        
        setLoading(true);
        const numLayer2 = Number(numLayer2Result.data);
        
        const layer2RegistryContract = getContract({
          address: CONTRACT_ADDRESS.Layer2Registry_ADDRESS,
          abi: Layer2Registry,
          publicClient: publicClient,
        });
        
        const operators: Operator[] = [];
        let totalStakedAmount = BigNumber.from(0);

        const layer2manager = getContract({
          address: '0x53faC2e379cBfFd4C32D2b6FBBA83De102DDA2E5',
          abi: Layer2Manager,
          publicClient: publicClient
        })
        // console.log(layer2manager)
        
        for (let i = 0; i < numLayer2; i++) {
          try {
            const candidateAddress: string = await layer2RegistryContract.read.layer2ByIndex([i]) as unknown as string;
            
            if (!candidateAddress) continue;
            
            const candidateContract = getContract({
              address: candidateAddress as `0x${string}`,
              abi: Candidates.abi,
              publicClient: publicClient,
            });

            const [totalStaked, memo, stakeOf] = await Promise.all([
              candidateContract.read.totalStaked(),
              candidateContract.read.memo(),
              candidateContract.read.stakedOf([address])
            ]);

            // const candidateAddon = getContract({
            //   address: candidateAddress as `0x${string}`,
            //   abi: CandidateAddon,
            //   publicClient: publicClient,
            // })

            // console.log(await layer2manager.read.layer2CandidateOfOperator(["0x501C74df1aDEb8024738D880B01306a92d6e722d"]))
            // const operatorAddress = await candidateAddon.read.operator();
            // const operatorManager = getContract({
            //   address: operatorAddress as `0x${string}`,
            //   abi: OperatorManager,
            //   publicClient: publicClient
            // })
            // const manager = await operatorManager.read.manager();
            

            totalStakedAmount = totalStakedAmount.add(BigNumber.from(totalStaked?.toString() || '0'))
            
            const operatorInfo: Operator = {
              name: typeof memo === 'string' ? memo : candidateAddress as string,
              address: candidateAddress,
              totalStaked: totalStaked?.toString() || "0",
              yourStaked: stakeOf?.toString() || "0"
            };
            
            operators.push(operatorInfo);
          } catch (error) {
            console.error(`Error fetching operator at index ${i}:`, error);
          }
        }
        setTotalStaked(totalStakedAmount.toString());
        setOperatorsList(operators.sort((a, b) => compareTotalStaked(a, b, sortDirection)));
      } catch (error) {
        console.error("Error fetching operators:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOperators();
  }, [numLayer2Result?.data, publicClient, setOperatorsList, setLoading, sortDirection]);
  
  const refreshOperator = async (candidateAddress: string) => {
    try {
      if (!publicClient) return;
      
      const candidateContract = getContract({
        address: candidateAddress as `0x${string}`,
        abi: Candidates.abi,
        publicClient: publicClient,
      });
      
      const [totalStaked, memo] = await Promise.all([
        candidateContract.read.totalStaked(),
        candidateContract.read.memo(),
        candidateContract.read.stakedOf({ account: address })
      ]);
      
      const operatorIndex = (operatorsList as Operator[]).findIndex(op => op.address === candidateAddress);
      
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
      console.error(`Error refreshing operator ${candidateAddress}:`, error);
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
          const candidateAddress = await layer2RegistryContract.read.layer2ByIndex([i]);
          
          if (!candidateAddress) continue;
          
          const candidateContract = getContract({
            address: candidateAddress as `0x${string}`,
            abi: Candidates.abi,
            publicClient: publicClient,
          });

          
          const [totalStaked, memo] = await Promise.all([
            candidateContract.read.totalStaked(),
            candidateContract.read.memo(),
            candidateContract.read.stakedOf({ account: address })
          ]);
          
          operators.push({
            name: typeof memo === 'string' ? memo : candidateAddress as string,
            address: candidateAddress as `0x${string}`,
            totalStaked: totalStaked?.toString() || "0",
          });
        } catch (error) {
          console.error(`Error refreshing operator at index ${i}:`, error);
        }
      }
      
      setOperatorsList(operators.sort((a, b) => compareTotalStaked(a, b, sortDirection)));
      return true;
    } catch (error) {
      console.error("Error refreshing all operators:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const a = useAPY('0x0F42D1C40b95DF7A1478639918fc358B4aF5298D');
  
  return { 
    operatorsList,
    loading,
    refreshOperator,
    refreshAllOperators,
    sortOperators,
    totalStaked
  };
}