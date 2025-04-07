// hooks/useCallOperators.ts
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { operatorsListState, operatorsLoadingState, Operator } from "@/recoil/staking/operator";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
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

export default function useCallOperators() {
  const [operatorsList, setOperatorsList] = useRecoilState(operatorsListState);
  const [totalStaked, setTotalStaked] = useState('0');
  const [loading, setLoading] = useRecoilState(operatorsLoadingState);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc"); 
  const { address, isConnected } = useAccount();
  
  const publicClient = usePublicClient();
  // const walletClient = useWalletClient();
  
  const { operators: operatorAddresses, isLoading } = useAllOperators();
  
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
  
  const checkContractExists = async (address: string): Promise<boolean> => {
    try {
      if (!isAddress(address)) return false;
      
      const code = await publicClient.getBytecode({
        address: address as `0x${string}`
      });
      
      return code !== null && code !== undefined && code !== '0x';
    } catch (error) {
      console.error(`Error checking contract at ${address}:`, error);
      return false;
    }
  };
  
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        if (operatorsList.length > 0 && operatorAddresses.length < operatorsList.length) {
          setLoading(false);
          return;
        }
        
        setLoading(true);

        const seigManagerContract = getContract({
          address: CONTRACT_ADDRESS.SeigManager_ADDRESS,
          abi: SeigManager,
          publicClient: publicClient
        })

        const wtonContract = getContract({
          address: CONTRACT_ADDRESS.WTON_ADDRESS,
          abi: WTON,
          publicClient: publicClient
        })
        
        const operators: Operator[] = [];
        let totalStakedAmount = BigNumber.from(0);

        const layer2manager = getContract({
          address: '0x58B4C2FEf19f5CDdd944AadD8DC99cCC71bfeFDc',
          abi: Layer2Manager,
          publicClient: publicClient
        });

        const rollupConfig = getContract({
          address: CONTRACT_ADDRESS.RollupConfig_ADDRESS,
          abi: SystemConfig,
          publicClient: publicClient
        });
        const tonContract = getContract({
          address: CONTRACT_ADDRESS.TON_ADDRESS,
          abi: TON,
          publicClient: publicClient
        });
        
        for (let i = 0; i < operatorAddresses.length; i++) {
          try {
            
            // console.log(operatorAddresses[i])
            const candidateContract = getContract({
              address: operatorAddresses[i] as `0x${string}`,
              abi: Candidates.abi,
              publicClient: publicClient,
            });

            const [totalStaked, memo, stakeOf] = await Promise.all([
              candidateContract.read.totalStaked(),
              candidateContract.read.memo(),
              candidateContract.read.stakedOf([address])
            ]);

            const candidateAddon = getContract({
              address: operatorAddresses[i]  as `0x${string}`,
              abi: CandidateAddon,
              publicClient: publicClient,
            });

            const operatorAddress = await candidateAddon.read.operator();
          
            const operatorContractExists = await checkContractExists(operatorAddress as string);
            if (!operatorContractExists) {
            
              totalStakedAmount = totalStakedAmount.add(BigNumber.from(totalStaked?.toString() || '0'));
              
              operators.push({
                name: typeof memo === 'string' ? memo : operatorAddresses[i] as string,
                address: operatorAddresses[i],
                totalStaked: totalStaked?.toString() || "0",
                yourStaked: stakeOf?.toString() || "0",
                isL2: false
              });
              
              continue;
            }
            
            const operatorManager = getContract({
              address: operatorAddress as `0x${string}`,
              abi: OperatorManager,
              publicClient: publicClient
            });
            
            let rollupConfigAddress;
            try {
              rollupConfigAddress = await operatorManager.read.rollupConfig();
            } catch (error) {
              console.log(`rollupConfig function not available for operator: ${operatorAddress}`);
              rollupConfigAddress = null;
            }

            let bridgeDetail = null;
            let isL2 = false;
            let sequencerSeig;
            let lockedInL2 = '';
            if (rollupConfigAddress) {
              try {
                bridgeDetail = await layer2manager.read.checkL1BridgeDetail([rollupConfigAddress]);
                
                if (Array.isArray(bridgeDetail)) {
                  isL2 = bridgeDetail[5] === 1 ? true : false;
                  if (isL2) {
                    const blockNumber = await publicClient.getBlockNumber();
                    const wtonBalanceOfM = await wtonContract.read.balanceOf([operatorAddress]);
                    const estimatedDistribution = await seigManagerContract.read.estimatedDistribute([Number(blockNumber.toString()) + 1, operatorAddresses[i], true]) as { layer2Seigs: bigint };
                    // console.log(rollupConfigAddress);
                    const bridgeAddress = await rollupConfig.read.optimismPortal();
                    const lockedInBridge = await tonContract.read.balanceOf([bridgeAddress]);
                    lockedInL2 = (lockedInBridge as bigint).toString();
                    
                    //@ts-ignore
                    const addedWton = wtonBalanceOfM + estimatedDistribution[7];
                    sequencerSeig = addedWton.toString();
                  }
                }  
              } catch (error) {
                console.log(`Failed to get bridge details: ${error}`);
              }
            }

            totalStakedAmount = totalStakedAmount.add(BigNumber.from(totalStaked?.toString() || '0'));
            
            const operatorInfo: Operator = {
              name: typeof memo === 'string' ? memo : operatorAddresses[i] as unknown as string,
              address: operatorAddresses[i],
              totalStaked: totalStaked?.toString() || "0",
              yourStaked: stakeOf?.toString() || "0",
              isL2: isL2,
              sequencerSeig: sequencerSeig,
              lockedInL2: lockedInL2 
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
  }, [operatorAddresses, publicClient, isLoading, setLoading, sortDirection]);
  
  const refreshOperator = async (candidateAddress: string) => {
    try {
      if (!publicClient) return;
      console.log('aaa')
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
      
      const operatorIndex = (operatorsList as Operator[]).findIndex(op => op.address === candidateAddress);
      
      if (operatorIndex !== -1) {
        setOperatorsList((prevList: Operator[]) => {
          const newList = [...prevList];
          newList[operatorIndex] = {
            name: typeof memo === 'string' ? memo : prevList[operatorIndex].name,
            address: prevList[operatorIndex].address,
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
      setLoading(true);
      // const layer2RegistryContract = getContract({
      //   address: CONTRACT_ADDRESS.Layer2Registry_ADDRESS,
      //   abi: Layer2Registry,
      //   publicClient: publicClient,
      // });
      
      const operators: Operator[] = [];
      
      for (let i = 0; i < operatorAddresses.length; i++) {
        try {
          const candidateAddress = operatorAddresses[i];
          
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
  
  return { 
    operatorsList,
    loading,
    refreshOperator,
    refreshAllOperators,
    sortOperators,
    totalStaked
  };
}