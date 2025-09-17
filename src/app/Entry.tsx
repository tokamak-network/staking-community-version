"use client";

import * as React from "react";
import { ChakraProvidersForNextJs } from "@/providers/chakraProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/client/queryClient";
import { usePublicClient } from "wagmi";
import { TONStakingProvider } from "@tokamak-ecosystem/staking-sdk-react-kit";
import { Header } from "@/components/header";
import Modals from "./Modal";
import { getRpcUrl } from "@/constant/contracts";
import { useChainId } from "wagmi";

export default function Entry({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();
	const publicClient = usePublicClient();

	const chainId = useChainId();
	const rpcUrl = getRpcUrl(chainId);

	return (
		<QueryClientProvider client={queryClient}>
			<TONStakingProvider
				rpcUrl={rpcUrl}
				chainId={chainId}
			>
				<div className="flex flex-col h-screen">
					<Header />
					<div className="flex flex-col justify-center items-center h-full">
						{children}
					</div>
					<Modals />
				</div>	
			</TONStakingProvider>
		</QueryClientProvider>
	);
}
