// import TON from "@/constant/abi/TON.json";

import SeigManager from "@/abis/SeigManager.json";
import { useContractRead, usePublicClient } from "wagmi";
import { getContractAddress } from "@/constant/contracts";
import { useChainId } from "wagmi";

export default function useCallSeigManager(functionName: string, args?: any) {
	const chainId = useChainId();
	const { SeigManager_ADDRESS } = getContractAddress(chainId);

	const result = useContractRead({
		address: SeigManager_ADDRESS,
		abi: SeigManager,
		functionName,
		args: args,
	});

	// const provider = usePublicClient();
	// const contract = getContract({
	//   address: Layer2Registry_ADDRESS,
	//   abi: Layer2Registry,
	//   publicClient: provider,
	// });

	return { result };
}
