import CONTRACT_ADDRESS from "@/constant/contracts";
import TON from '@/abis/TON.json';
import WTON from '@/abis/WTON.json';
import DepositManager from '@/abis/DepositManager.json';
import { useAccount, usePublicClient, useContractWrite } from "wagmi";;
import { useTx } from "../tx/useTx";


const {
  DepositManager_ADDRESS,
  SeigManager_ADDRESS
} = CONTRACT_ADDRESS;

export default function useWithdrawL2(layer2: string) {
  
  const {
    data: withdrawL2Data,
    write: withdrawL2
  } = useContractWrite({
    address: DepositManager_ADDRESS,
    abi: DepositManager,
    functionName: "withdrawAndDepositL2",
  })

  const {} = useTx({ hash: withdrawL2Data?.hash, layer2: layer2 as `0x${string}` });

  return { withdrawL2, withdrawL2Data }
}
