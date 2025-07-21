import OperatorManager from "@/constant/abis/OperatorManager.json";
import { useWriteContract } from "wagmi";
import { useTx } from "../tx/useTx";

export default function useClaim(layer2: string, operatorAddress: string) {
	const { data: txData, error: writeError, writeContract } = useWriteContract();

	const claim = (args: any) => {
		return writeContract({
			address: operatorAddress as `0x${string}`,
			abi: OperatorManager,
			functionName: "claimERC20",
			args: args,
		});
	};

	const {} = useTx({ hash: txData, layer2: layer2 as `0x${string}` });

	return {
		claim,
		writeError,
	};
}
