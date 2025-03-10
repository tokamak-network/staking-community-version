import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { mainnet } from 'viem/chains';
import { useContractRead, usePublicClient } from "wagmi";

// viem Public Client 설정 (네트워크와 RPC 엔드포인트 지정)
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http('https://mainnet.infura.io/v3/fcda353fe57a4c70803274ed05d1f047')  // RPC 엔드포인트 URL로 교체
});

// updateSeigniorage 이벤트의 ABI 정의 (indexed 여부에 따라 인자 표기)
const updateSeigniorageEventABI = parseAbiItem(
  "event AddedSeigAtLayer(address layer2, uint256 seigs, uint256 operatorSeigs, uint256 nextTotalSupply, uint256 prevTotalSupply)"
);

export function useAPY(contractAddress: `0x${string}`) {
  const [apy, setApy] = useState<number | null>(null);
  const provider = usePublicClient();
  // console.log(provider)
  useEffect(() => {
    // console.log(contractAddress);
    
    if (!contractAddress) return;
    // console.log('bbbb')
    // 최신 updateSeigniorage 이벤트를 조회하여 초기 APY 계산
    const fetchLatestAPY = async () => {
      try {
        const logs = await provider.getLogs({
          address: contractAddress,
          event: updateSeigniorageEventABI,
          fromBlock: BigInt(21970425), 
          toBlock: BigInt(21995432)
        });
        // console.log(logs)
        if (logs.length === 0) return;  // 이벤트 발생 기록 없으면 종료
        const lastLog = logs[logs.length - 1];
        const { rewardAmount, totalStaked } = lastLog.args as { rewardAmount: bigint; totalStaked: bigint };

        // APY 계산: 최신 기간 수익률을 연간 수익률로 환산
        const periodYield = Number(rewardAmount) / Number(totalStaked);
        const annualYield = periodYield * 365;  // (예: 이벤트 주기가 하루라면 365배)
        const apyPercent = annualYield * 100;   // 백분율로 변환
        setApy(apyPercent);
      } catch (err) {
        console.error('Failed to fetch APY:', err);
      }
    };

    fetchLatestAPY();  // 컴포넌트 마운트 시 초기 APY 설정

    // updateSeigniorage 이벤트를 모니터링하여 발생 시 APY 갱신
    const unwatch = publicClient.watchContractEvent({
      address: contractAddress,
      abi: [updateSeigniorageEventABI],      // 이벤트 ABI 제공
      eventName: 'AddedSeigAtLayer',
      onLogs: logs => {
        if (!logs.length) return;
        const latestLog = logs[logs.length - 1];
        const { rewardAmount, totalStaked } = latestLog.args as { rewardAmount: bigint; totalStaked: bigint };

        // 새로운 이벤트 기준으로 APY 재계산
        const periodYield = Number(rewardAmount) / Number(totalStaked);
        const annualYield = periodYield * 365;
        const apyPercent = annualYield * 100;
        setApy(apyPercent);
      }
    });

    // 언마운트 시 이벤트 구독 해제
    return () => {
      unwatch();
    };
  }, [contractAddress]);

  return apy;
}
