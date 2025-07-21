import Candidates from "@/abis/Candidate.json";
import { useContractRead, usePublicClient } from "wagmi";
import { getContract } from "viem";
// import { useTx } from "@/hooks/tx/useTx";

export default function useCallCandidate(
	functionName: string,
	address: any,
	args?: any,
) {
	const result = useContractRead({
		address: address,
		abi: Candidates.abi,
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
