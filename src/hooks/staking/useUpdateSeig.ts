import Candidate from "@/abis/Candidate.json";
import { useWriteContract } from "wagmi";
import { useTx } from "../tx/useTx";

export default function useUpdateSeig(layer2: string) {
	const { data: txData, error: writeError, writeContract } = useWriteContract();

	const updateSeig = () => {
		return writeContract({
			address: layer2 as `0x${string}`,
			abi: Candidate.abi,
			functionName: "updateSeigniorage",
		});
	};

	const {} = useTx({ hash: txData, layer2: layer2 as `0x${string}` });

	return {
		updateSeig,
		writeError,
	};
}
