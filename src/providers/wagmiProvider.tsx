// providers/wagmi.ts
"use client";

import { http, createConfig } from "wagmi";
// import { MetaMaskConnector } from "@wagmi/connectors/metaMask";
import { mainnet, sepolia } from '@wagmi/core/chains'
import { metaMask } from '@wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    metaMask()
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
