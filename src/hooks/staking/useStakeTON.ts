import { getContractAddress } from "@/constant/contracts";
import TON from "@/abis/TON.json";
import { useWriteContract, useChainId } from "wagmi";
import { useTx } from "../tx/useTx";

export default function useStakeTON(layer2: string) {
	const { data: txData, error: writeError, writeContract } = useWriteContract();

	const chainId = useChainId();
	const { TON_ADDRESS } = getContractAddress(chainId);

	const stakeTON = (args: any) => {
		return writeContract({
			address: TON_ADDRESS,
			abi: TON,
			functionName: "approveAndCall",
			args: args,
		});
	};

	const {} = useTx({ hash: txData, layer2: layer2 as `0x${string}` });

	return {
		stakeTON,
	};
}
