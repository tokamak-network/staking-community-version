import CONTRACT_ADDRESS from "@/constant/contracts";
import TON from '@/abis/TON.json';
import SeigManager from '@/abis/SeigManager.json'
import CandidateAddon from "@/constant/abis/CandidateAddOn.json";
import { useAccount, usePublicClient, useContractWrite } from "wagmi";
import { useTx } from "../tx/useTx";


export default function useClaim(layer2: string) {
  
  const {
    data: claimData,
    write: claim
  } = useContractWrite({
    address: layer2 as `0x${string}`,
    abi: CandidateAddon.abi,
    functionName: "updateSeigniorage",
  })
  const {} = useTx({ hash: claimData?.hash, layer2: layer2 as `0x${string}`  });

  return { claim, claimData }
}
