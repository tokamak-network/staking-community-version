import CONTRACT_ADDRESS from "@/constant/contracts";
import TON from '@/abis/TON.json';
import WTON from '@/abis/WTON.json';
import DepositManager from '@/abis/DepositManager.json';

import { useAccount, usePublicClient, useContractWrite } from "wagmi";

import { useTx } from "../tx/useTx";


const {
  TON_ADDRESS,
  WTON_ADDRESS,
  DepositManager_ADDRESS,
  SeigManager_ADDRESS
} = CONTRACT_ADDRESS;

export default function useUnstake(layer2: string) {
  
  const {
    data: unstakeData,
    write: unstake
  } = useContractWrite({
    address: DepositManager_ADDRESS,
    abi: DepositManager,
    functionName: "requestWithdrawal",
  })
  const {} = useTx({ hash: unstakeData?.hash, layer2: layer2 as `0x${string}`  });

  return { unstake, unstakeData }
}
