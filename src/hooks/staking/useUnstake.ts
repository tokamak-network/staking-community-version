import { getContractAddress } from "@/constant/contracts";
import TON from "@/abis/TON.json";
import WTON from "@/abis/WTON.json";
import DepositManager from "@/abis/DepositManager.json";

import { useWriteContract, useChainId } from "wagmi";

import { useTx } from "../tx/useTx";

export default function useUnstake(layer2: string) {
	const { data: txData, error: writeError, writeContract } = useWriteContract();
	const chainId = useChainId();
	const {
		TON_ADDRESS,
		WTON_ADDRESS,
		DepositManager_ADDRESS,
		SeigManager_ADDRESS,
	} = getContractAddress(chainId);

	const unstake = (args: any) => {
		return writeContract({
			address: DepositManager_ADDRESS,
			abi: DepositManager,
			functionName: "requestWithdrawal",
			args: args,
		});
	};

	const {} = useTx({ hash: txData, layer2: layer2 as `0x${string}` });

	return {
		unstake,
		writeError,
	};
}
