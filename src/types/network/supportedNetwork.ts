import NETWORK_ETHEREUM from "assets/icons/network/circle/Ethereum_circle.svg";
import SYMBOL_TITAN from "assets/icons/network/darius.svg";
import SYMBOL_THANOS from "assets/icons/network/Thanos.svg";

export enum SupportedChainId {
	MAINNET = 1,
	//   ARBITRUM_ONE = 42161,
	//   ARBITRUM_GOERLI = 421613,
	//   OPTIMISM = 10,
	//   OPTIMISM_GOERLI = 420,
	//   POLYGON = 137,
	//   POLYGON_MUMBAI = 80001,
	//   CELO = 42220,
	//   CELO_ALFAJORES = 44787,
	//   BNB = 56,
	SEPOLIA = 11155111,
}

export interface SupportedChainProperties {
	chainId: SupportedChainId;
	chainName: keyof typeof SupportedChainId;
	rpcAddress: string;
	isTestnet?: boolean;
}

export const supportedChain: SupportedChainProperties[] = [
	{
		chainId: SupportedChainId.MAINNET,
		chainName: "MAINNET",
		rpcAddress: "",
	},
	{
		chainId: SupportedChainId.SEPOLIA,
		chainName: "SEPOLIA",
		rpcAddress: "",
		isTestnet: true,
	},
];
