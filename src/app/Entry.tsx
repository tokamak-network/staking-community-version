'use client';

import * as React from "react";
import { ChakraProvidersForNextJs } from "@/providers/chakraProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/client/queryClient";
import { usePublicClient } from "wagmi";
import { TONStakingProvider } from "@ton-staking-sdk/react-kit";
import { Flex } from "@chakra-ui/react";
import { Header } from "@/components/header";
import Modals from "./Modal";
import { getRpcUrl } from "@/constant/contracts";
import { useChainId } from 'wagmi';

export default function Entry({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  // const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const chainId = useChainId();
  const rpcUrl = getRpcUrl(chainId);

  return (
    <QueryClientProvider client={queryClient}>
      <TONStakingProvider 
        rpcUrl={rpcUrl}
        chainId={chainId}
        // walletClient={walletClient} 
        // publicClient={publicClient}
      >
        <ChakraProvidersForNextJs>
          <Flex flexDir="column" h="100vh">
            <Header />
            <Flex flexDir={'column'} justifyContent="center" alignItems="center" h="100%">
              {children}
            </Flex>
            <Modals />
          </Flex>
        </ChakraProvidersForNextJs>
      </TONStakingProvider>
    </QueryClientProvider>
  );
}