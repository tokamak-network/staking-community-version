import CONTRACT_ADDRESS from "@/constant/contracts";
import TON from '@/abis/TON.json';
import WTON from '@/abis/WTON.json';
import { useAccount, usePublicClient, useContractWrite } from "wagmi";
import { useTx } from "../tx/useTx";


const {
  TON_ADDRESS,
  WTON_ADDRESS,
  DepositManager_ADDRESS,
  SeigManager_ADDRESS
} = CONTRACT_ADDRESS;

export default function useClaim(layer2: string) {
  
  const {
    data: stakeTonData,
    write: stakeTON
  } = useContractWrite({
    address: TON_ADDRESS,
    abi: TON,
    functionName: "approveAndCall",
  })
  const {} = useTx({ hash: stakeTonData?.hash, layer2: layer2 as `0x${string}`  });

  return { stakeTON, stakeTonData }
}
