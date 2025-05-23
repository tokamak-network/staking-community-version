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
import { PUBLIC_SEPOLIA_RPC } from "@/constant";

export default function Entry({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  // const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TONStakingProvider 
        rpcUrl={PUBLIC_SEPOLIA_RPC!}
        chainId={11155111}
        // walletClient={walletClient} 
        // publicClient={publicClient}
      >
        <ChakraProvidersForNextJs>
          <Flex flexDir="column" h="100vh">
            <Header />
            <Flex flexDir="column" flexGrow={1}>
              <Flex justifyContent="center" alignItems="center" h="100%">
                {children}
              </Flex>
            </Flex>
            <Modals />
          </Flex>
        </ChakraProvidersForNextJs>
      </TONStakingProvider>
    </QueryClientProvider>
  );
}