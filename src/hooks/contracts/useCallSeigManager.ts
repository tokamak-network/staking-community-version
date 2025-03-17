// import TON from "@/constant/abi/TON.json";

import SeigManager from "@/abis/SeigManager.json";
import { useContractRead, usePublicClient } from "wagmi";

import CONTRACT_ADDRESS from "constant/contracts";

export default function useCallSeigManager(functionName: string, args?: any) {
  const {
    SeigManager_ADDRESS,
  } = CONTRACT_ADDRESS;

  const result = useContractRead({
    address: SeigManager_ADDRESS,
    abi: SeigManager,
    functionName,
    args: args
  });
  
  const provider = usePublicClient();
  // const contract = getContract({
  //   address: Layer2Registry_ADDRESS,
  //   abi: Layer2Registry,
  //   publicClient: provider,
  // });
  

  return { result };
}


