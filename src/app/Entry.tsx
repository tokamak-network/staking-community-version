'use client'
"use client";
import { ChakraProvidersForNextJs } from "@/providers/chakraProvider";
// import "css/scrollbar.css";
// import TxToast from "@/components/modal/TxToast";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/client/queryClient";
import Script from "next/script";
import { Flex } from "@chakra-ui/react";
// import Modals from "./Modals";
// import Drawers from "./Drawers";
// import Footer from "@/components/footer";
import { sepolia } from 'viem/chains';
import { Header } from "@/components/header";
import Modals from "./Modal";
import { TONStakingProvider } from '@ton-staking-sdk/react-kit';
import { createWalletClient, custom } from "viem";
import { TONStakingSDK, Chain } from '@ton-staking-sdk/core';

// const DynamicHeader = dynamic(() => import("@/components/header/Index"), {
//   loading: () => <></>,
//   ssr: false,
// });

/**
 * test domain building commit
 * test.app.bridge.tokamak.network
 * 2024-08-30
 */

// const GlobalComponents = () => {
//   return (
//     <>
//       {/* <HistoryDrawer /> */}
//       <TxToast />
//     </>
//   );
// };


export default function Entry({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  
  const client = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum!)
  })

  const sdk = new TONStakingSDK(
    process.env.NEXT_PUBLIC_SEPOLIA_RPC as string,
    11155111,
  );

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TONStakingProvider
          rpcUrl={process.env.NEXT_PUBLIC_SEPOLIA_RPC as string}
          chainId={11155111}
        >
          <ChakraProvidersForNextJs>
            <Flex flexDir={"column"} h={"100vh"}>
              <Header />
              <Flex flexDir={"column"} flexGrow={1}>
                <Flex
                  justifyContent={"center"}
                  alignItems={"center"}
                  h={"100%"}
                >
                  {children}
                </Flex>
                {/* <Footer /> */}
              </Flex>
              {/* <GlobalComponents /> */}
              {/* <Drawers /> */}
              <Modals />
            </Flex>
          </ChakraProvidersForNextJs>
        </TONStakingProvider>
      </QueryClientProvider>
    </>
  );
}
// function App() {
//   const account = useAccount()
//   const { connectors, connect, status, error } = useConnect()
//   const { disconnect } = useDisconnect()

//   return (
    // <>
      {/* <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === 'connected' && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div> */}



    // </>
  // )
// }


