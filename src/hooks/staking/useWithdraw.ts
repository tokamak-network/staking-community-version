import CONTRACT_ADDRESS from "@/constant/contracts";
import TON from '@/abis/TON.json';
import WTON from '@/abis/WTON.json';
import DepositManager from '@/abis/DepositManager.json';
import { useWriteContract } from "wagmi";
import { useTx } from "../tx/useTx";


const {
  TON_ADDRESS,
  WTON_ADDRESS,
  DepositManager_ADDRESS,
  SeigManager_ADDRESS
} = CONTRACT_ADDRESS;

export default function useWithdraw(layer2: string) {
  const { data: txData, error: writeError, writeContract } = useWriteContract();

  const withdraw = (args: any) => {
    return writeContract({
      address: DepositManager_ADDRESS,
      abi: DepositManager,
      functionName: 'processRequests',
      args: args
    });
  };

  const {} = useTx({ hash: txData, layer2: layer2 as `0x${string}`});
  
  return {
    withdraw,       
    writeError,
  };
}
