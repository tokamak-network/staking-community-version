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

export default function useStakeWTON(layer2: string) {
  const {
    data: stakeWtonData,
    write: stakeWTON
  } = useContractWrite({
    address: WTON_ADDRESS,
    abi: WTON,
    functionName: "approveAndCall",
  })

 const {} = useTx({ hash: stakeWtonData?.hash, layer2: layer2 as `0x${string}`  });


  return { stakeWTON, stakeWtonData }
}
