// import { injected, trazorConnector } from "connectors/";
// import { WalletInfo } from "@/types/wallet";
// import { DEPLOYED_TYPE } from "./type";
import { ethers } from "ethers";

// export const REACT_APP_MODE = process.env.NEXT_PUBLIC_MODE as string;
export const REACT_APP_MODE = 'DEV'

export const NetworkContextName = `${new Date().getTime()}-NETWORK`;
export const DEFAULT_NETWORK: string | undefined = '11155111';
// "1"
// REACT_APP_MODE === "PRODUCTION" ? "1" : "11155111";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const MAINNET_API = process.env.NEXT_PUBLIC_API_PRODUCTION;
const DEV_API = process.env.NEXT_PUBLIC_API_DEV;

export const PUBLIC_SEPOLIA_RPC = 'https://sepolia.gateway.tenderly.co';

// export const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
// export const ETHERSCAN_API = REACT_APP_MODE === "PRODUCTION" ? "https://api.etherscan.io" : "https://api-sepolia.etherscan.io"

// export const ETHERSCAN_LINK = REACT_APP_MODE === "PRODUCTION" ? "https://etherscan.io" : "https://sepolia.etherscan.io"
export const ETHERSCAN_LINK = "https://sepolia.etherscan.io";

export const BASE_PROVIDER = ethers.getDefaultProvider("sepolia");
// REACT_APP_MODE === "PRODUCTION"
//     ? ethers.getDefaultProvider("mainnet")
//     : ethers.getDefaultProvider("sepolia");

export const RAY = '1000000000000000000000000000'
export const WEI = '1000000000000000000'


// export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
//   INJECTED: {
//     connector: injected,
//     name: "Injected",
//     iconName: "Metamask.jpg",
//     description: "Injected web3 provider.",
//     href: null,
//     color: "#010101",
//     primary: true,
//     type: "INJECTED",
//   },
//   METAMASK: {
//     connector: injected,
//     name: "MetaMask",
//     iconName: "Metamask.jpg",
//     description: "Easy-to-use browser extension.",
//     href: null,
//     color: "#E8831D",
//     type: "METAMASK",
//   },
//   TREZOR: {
//     connector: trazorConnector,
//     name: "Trezor",
//     iconName: "Trezor.png",
//     description: "Hardware Wallet.",
//     href: null,
//     color: "#E8831D",
//     type: "TREZOR",
//   },
// };
