// import TON from "@/constant/abi/TON.json";
import TON from "@/abis/TON.json";
import WTON from "@/abis/WTON.json";
import Layer2Registry from "@/abis/Layer2Registry.json";
import DepositManager from "@/abis/DepositManager.json";
import SeigManager from "@/abis/SeigManager.json";
import { useContractRead, usePublicClient } from "wagmi";
import { getContract } from "viem";
import { getContractAddress } from "@/constant/contracts";
import { useChainId } from "wagmi";
// import { useTx } from "@/hooks/tx/useTx";
// import ERC20 from "@/abis/ERC20ABI.json";

export default function useCallL2Registry(functionName: string, args?: any) {
	const chainId = useChainId();
	const {
		TON_ADDRESS,
		WTON_ADDRESS,
		Layer2Registry_ADDRESS,
		DepositManager_ADDRESS,
		SeigManager_ADDRESS,
		Old_DepositManager_ADDRESS,
		Old_SeigManager_ADDRESS,
	} = getContractAddress(chainId);
	const result = useContractRead({
		address: Layer2Registry_ADDRESS,
		abi: Layer2Registry,
		functionName,
		args: args,
	});
	// console.log(args, result);
	const provider = usePublicClient();
	// const contract = getContract({
	//   address: Layer2Registry_ADDRESS,
	//   abi: Layer2Registry,
	//   publicClient: provider,
	// });

	return { result };
}
