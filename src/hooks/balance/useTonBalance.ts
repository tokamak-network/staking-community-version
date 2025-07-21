import { useAccount, useBalance, useChainId } from "wagmi";
import { ethers } from "ethers";
import commafy from "@/utils/trim/commafy";
import { useMemo } from "react";
import { SupportedChainId } from "@/types/network/supportedNetwork";
import { getContractAddress } from "@/constant/contracts";

export default function useTokenBalance(
	// requireCall?: boolean,
	// watch?: boolean
	token: string,
) {
	const chainId = useChainId();
	const { TON_ADDRESS, WTON_ADDRESS, DepositManager_ADDRESS } =
		getContractAddress(chainId);
	const tokenAddress = token === "TON" ? TON_ADDRESS : WTON_ADDRESS;
	const { address: accountAddress } = useAccount();

	const { data, error, isLoading, isSuccess } = useBalance({
		address: accountAddress,
		token: (tokenAddress as "0x${string}") ?? null,

		// staleTime: 5000,
		// enabled: requireCall,
	});

	const tokenBalance = useMemo(() => {
		if (data) {
			return {
				data: {
					balanceBN: data,
					parsedBalance: commafy(
						ethers.utils.formatUnits(
							//@ts-ignore
							typeof data.value === "bigint" ? data.value : "0",
							data.decimals as number,
						),
					),
					parsedBalanceWithoutCommafied: commafy(
						ethers.utils.formatUnits(
							//@ts-ignore
							typeof data.value === "bigint" ? data.value : "0",
							data.decimals as number,
						),
						data.decimals as number,
					).replaceAll(",", ""),
				},
				error,
				isLoading,
				isSuccess,
			};
		}
		return null;
	}, [accountAddress, data, token]);
	// console.log(tokenBalance)
	return tokenBalance;
}
