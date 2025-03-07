// hooks/useCallOperators.ts
import { useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { operatorsListState, operatorsLoadingState, Operator } from "recoil/operator";
import { usePublicClient } from "wagmi";
import { getContract } from "viem";
import useCallL2Registry from "../contracts/useCallL2Registry";
import Layer2Registry from "@/abis/Layer2Registry.json";
import Candidates from "@/abis/Candidate.json";
import CONTRACT_ADDRESS from "@/constant/contracts";

export default function useCallOperators() {
  const [operatorsList, setOperatorsList] = useRecoilState(operatorsListState);
  const [loading, setLoading] = useRecoilState(operatorsLoadingState);
  
  const publicClient = usePublicClient();
  
  const { result: numLayer2Result } = useCallL2Registry("numLayer2s");
  
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        if (!numLayer2Result?.data || !publicClient) return;
        
        setLoading(true);
        const numLayer2 = Number(numLayer2Result.data);
        console.log("Number of layer2:", numLayer2);
        
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
              totalStaked: totalStaked?.toString() || "0",
            };
            
            operators.push(operatorInfo);
          } catch (error) {
            console.error(`Error fetching operator at index ${i}:`, error);
          }
        }
        
        setOperatorsList(operators);
      } catch (error) {
        console.error("Error fetching operators:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOperators();
  }, [numLayer2Result?.data, publicClient, setOperatorsList, setLoading]);
  
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
      
      const operatorIndex = (operatorsList as Operator[]).findIndex((_, index) => index === (operatorsList as Operator[]).findIndex((_, i) => i === Number(operatorAddress)));
      
      if (operatorIndex !== -1) {
        setOperatorsList((prevList: Operator[]) => {
          const newList = [...prevList];
          newList[operatorIndex] = {
            name: typeof memo === 'string' ? memo : prevList[operatorIndex].name,
            totalStaked: totalStaked?.toString() || prevList[operatorIndex].totalStaked
          };
          return newList;
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
            totalStaked: totalStaked?.toString() || "0",
          });
        } catch (error) {
          console.error(`Error refreshing operator at index ${i}:`, error);
        }
      }
      
      setOperatorsList(operators);
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
    refreshAllOperators
  };
}