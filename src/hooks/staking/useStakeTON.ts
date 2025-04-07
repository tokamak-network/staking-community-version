import CONTRACT_ADDRESS from "@/constant/contracts";
import TON from '@/abis/TON.json';
import {  useContractWrite } from "wagmi";

import { useTx } from "../tx/useTx";


const {
  TON_ADDRESS,
} = CONTRACT_ADDRESS;

export default function useStakeTON(layer2: string) {
  
  const {
    data: stakeTonData,
    write: stakeTON
  } = useContractWrite({
    address: TON_ADDRESS,
    abi: TON,
    functionName: "approveAndCall",
  })

  const {} = useTx({ hash: stakeTonData?.hash, layer2: layer2 as `0x${string}` });

  return { stakeTON, stakeTonData }
}
