import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { mainnet } from 'viem/chains';
import { useContractRead, usePublicClient } from "wagmi";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http('https://mainnet.infura.io/v3/fcda353fe57a4c70803274ed05d1f047')  
});

const updateSeigniorageEventABI = parseAbiItem(
  "event AddedSeigAtLayer(address layer2, uint256 seigs, uint256 operatorSeigs, uint256 nextTotalSupply, uint256 prevTotalSupply)"
);

export function useAPY(contractAddress: `0x${string}`) {
  const [apy, setApy] = useState<number | null>(null);
  const provider = usePublicClient();
  
  useEffect(() => {
    
    
    if (!contractAddress) return;
    
    const fetchLatestAPY = async () => {
      try {
        const logs = await provider.getLogs({
          address: contractAddress,
          event: updateSeigniorageEventABI,
          fromBlock: BigInt(21970425), 
          toBlock: BigInt(21995432)
        });
        
        if (logs.length === 0) return;
        const lastLog = logs[logs.length - 1];
        const { rewardAmount, totalStaked } = lastLog.args as { rewardAmount: bigint; totalStaked: bigint };

        const periodYield = Number(rewardAmount) / Number(totalStaked);
        const annualYield = periodYield * 365;  
        const apyPercent = annualYield * 100;   
        setApy(apyPercent);
      } catch (err) {
        console.error('Failed to fetch APY:', err);
      }
    };

    fetchLatestAPY(); 
    const unwatch = publicClient.watchContractEvent({
      address: contractAddress,
      abi: [updateSeigniorageEventABI],
      eventName: 'AddedSeigAtLayer',
      onLogs: logs => {
        if (!logs.length) return;
        const latestLog = logs[logs.length - 1];
        const { rewardAmount, totalStaked } = latestLog.args as { rewardAmount: bigint; totalStaked: bigint };

        const periodYield = Number(rewardAmount) / Number(totalStaked);
        const annualYield = periodYield * 365;
        const apyPercent = annualYield * 100;
        setApy(apyPercent);
      }
    });

    return () => {
      unwatch();
    };
  }, [contractAddress]);

  return apy;
}
