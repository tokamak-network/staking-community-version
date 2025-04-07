import Candidate from '@/abis/Candidate.json'
import { useAccount, usePublicClient, useContractWrite } from "wagmi";
import { useTx } from "../tx/useTx";


export default function useUpdateSeig(layer2: string) {

  const {
    data: updateSeigData,
    write: updateSeig
  } = useContractWrite({
    address: layer2 as `0x${string}`,
    abi: Candidate.abi,
    functionName: "updateSeigniorage"
  })
  const {} = useTx({ hash: updateSeigData?.hash, layer2: layer2 as `0x${string}` });

  return { updateSeig, updateSeigData }
}
