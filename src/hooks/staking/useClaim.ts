import CandidateAddon from "@/constant/abis/CandidateAddOn.json";
import { useWriteContract } from "wagmi";
import { useTx } from "../tx/useTx";


export default function useClaim(layer2: string) {
  const { data: txData, error: writeError, writeContract } = useWriteContract();

  const claim = (args: any) => {
    return writeContract({
      address: layer2 as `0x${string}`,
      abi: CandidateAddon.abi,
      functionName: 'updateSeigniorage',
      args: args
    });
  };

  const {} = useTx({ hash: txData, layer2: layer2 as `0x${string}`});
  
  return {
    claim,       
    writeError,
  };
}
