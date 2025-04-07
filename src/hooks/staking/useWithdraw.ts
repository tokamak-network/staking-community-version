import CONTRACT_ADDRESS from "@/constant/contracts";
import TON from '@/abis/TON.json';
import WTON from '@/abis/WTON.json';
import DepositManager from '@/abis/DepositManager.json';
import { useAccount, usePublicClient, useContractWrite } from "wagmi";;
import { useTx } from "../tx/useTx";


const {
  TON_ADDRESS,
  WTON_ADDRESS,
  DepositManager_ADDRESS,
  SeigManager_ADDRESS
} = CONTRACT_ADDRESS;

export default function useWithdraw(layer2: string) {
  
  const {
    data: withdrawData,
    write: withdraw
  } = useContractWrite({
    address: DepositManager_ADDRESS,
    abi: DepositManager,
    functionName: "processRequests",
  })

  const {} = useTx({ hash: withdrawData?.hash, layer2: layer2 as `0x${string}` });

  return { withdraw, withdrawData }
}
