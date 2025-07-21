import { getContractAddress } from "@/constant/contracts";
import DepositManager from "@/abis/DepositManager.json";
import { useWriteContract, useChainId } from "wagmi";
import { useTx } from "../tx/useTx";

export default function useRestake(layer2: string) {
	const { data: txData, error: writeError, writeContract } = useWriteContract();
	const chainId = useChainId();
	const {
		TON_ADDRESS,
		WTON_ADDRESS,
		DepositManager_ADDRESS,
		SeigManager_ADDRESS,
	} = getContractAddress(chainId);

	const restake = (args: any) => {
		return writeContract({
			address: DepositManager_ADDRESS,
			abi: DepositManager,
			functionName: "redepositMulti",
			args: args,
		});
	};

	const {} = useTx({ hash: txData, layer2: layer2 as `0x${string}` });

	return {
		restake,
		writeError,
	};
}
