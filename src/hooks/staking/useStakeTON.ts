import CONTRACT_ADDRESS from "@/constant/contracts";
import TON from '@/abis/TON.json';
import {  useWriteContract } from "wagmi";
import { config } from "@/config/wagmi";
import { useTx } from "../tx/useTx";


const {
  TON_ADDRESS,
} = CONTRACT_ADDRESS;

export default function useStakeTON(layer2: string) {
  const { writeContract } = useWriteContract({ config })
  
  const stakeTON = writeContract({
    address: TON_ADDRESS,
    abi: TON,
    functionName: "approveAndCall",
  })
  console.log(stakeTON)
  // const {} = useTx({ hash: stakeTON?.hash, layer2: layer2 as `0x${string}` });

  return { stakeTON }
}
