import { Chain } from "wagmi";

export const mainnet = {
  id: 1,
  name: "Ethereum",
  network: "Ethereum",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: [process.env.NEXT_PUBLIC_ETHEREUM_RPC as string] },
    default: { http: [process.env.NEXT_PUBLIC_ETHEREUM_RPC as string] },
  },
  blockExplorers: {
    etherscan: {
      name: "Etherscan",
      url: "https://etherscan.io",
    },
    default: {
      name: "Etherscan",
      url: "https://etherscan.io",
    },
  },
} as const satisfies Chain;

export const sepolia = {
  id: 11155111,
  name: "Sepolia",
  network: "Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: [process.env.NEXT_PUBLIC_SEPOLIA_RPC as string] },
    default: { http: [process.env.NEXT_PUBLIC_SEPOLIA_RPC as string] },
  },
  blockExplorers: {
    etherscan: {
      name: "Etherscan-Sepolia",
      url: "https://sepolia.etherscan.io/",
    },
    default: {
      name: "Etherscan-Sepolia",
      url: "https://sepolia.etherscan.io/",
    },
  },
} as const satisfies Chain;