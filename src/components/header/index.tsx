// components/StakingHeader.tsx
import React, { useCallback } from "react";
import { Connector, useAccount, useChainId } from "wagmi";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	useConnect,
	useDisconnect,
	useBalance,
	useSwitchChain,
	useChains,
} from "wagmi";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import trimAddress from "@/utils/trim/trim";
import copy from "copy-to-clipboard";
import METAMASK from "assets/images/metamask_icon.png";
import ACCOUNT_COPY from "assets/images/account_copy_icon.png";
import ETHERSCAN_LINK from "assets/images/etherscan_link_icon.png";
import useWalletModal from "@/hooks/modal/useWalletModal";
import { DEFAULT_NETWORK, SUPPORTED_CHAIN_IDS } from "@/constant";

const WALLET_VIEWS = {
	OPTIONS: "options",
	OPTIONS_SECONDARY: "options_secondary",
	ACCOUNT: "account",
	PENDING: "pending",
};

export const SUPPORTED_WALLETS: { [key: string]: any } = {
	METAMASK: {
		connector: "metaMask",
		name: "MetaMask",
		iconName: "metamask_icon.png",
		description: "Connect to your MetaMask Wallet",
		color: "#E8831D",
	},
	WALLET_CONNECT: {
		connector: "walletConnect",
		name: "WalletConnect",
		iconName: "walletConnectIcon.svg",
		description: "Connect to your WalletConnect Wallet",
		color: "#3B99FC",
	},
	COINBASE_WALLET: {
		connector: "coinbaseWallet",
		name: "Coinbase Wallet",
		iconName: "coinbaseWalletIcon.svg",
		description: "Connect to your Coinbase Wallet",
		color: "#315CF5",
	},
};

export const Header = () => {
	const { onOpenSelectModal } = useWalletModal();
	const { address, isConnected, connector: activeConnector } = useAccount();
	const chainId = useChainId();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<header className="py-4 sticky z-10 w-full">
				<div className="max-w-screen-xl mx-auto px-4">
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-3">
							<h1 className="flex flex-row text-2xl font-extrabold font-nanum-square">
								Tokamak{" "}
								<span className="text-blue-500 ml-1">
									staking
								</span>{" "}
								<span className="w-[67px] ml-1 text-[11px] leading-[11px]">
									Community version
								</span>
							</h1>
						</div>
						<div className="flex items-center">
							<button 
								className="border border-[#d7d9df] text-[#86929d] w-[151px] h-[35px] text-sm font-semibold rounded-[18px] bg-white z-[100] hover:bg-gray-50 transition-colors"
								onClick={() => onOpenSelectModal()}
							>
								<div>
									<span>Connect wallet</span>
								</div>
							</button>
						</div>
					</div>
				</div>
			</header>
		);
	}

	return (
		<header className="py-4 sticky z-10 w-full">
			<div className="max-w-screen-xl mx-auto px-4">
				<div className="flex justify-between items-center">
					<div className="flex items-center space-x-3">
						<h1 className="flex flex-row text-2xl font-extrabold font-nanum-square">
							Tokamak{" "}
							<span className="text-blue-500 ml-1">
								staking
							</span>{" "}
							<span className="w-[67px] ml-1 text-[11px] leading-[11px]">
								Community version
							</span>
						</h1>
					</div>

					<div className="flex items-center">
						<button
							className="border border-[#d7d9df] text-[#86929d] w-[151px] h-[35px] text-sm font-semibold rounded-[18px] bg-white z-[100] hover:bg-gray-50 transition-colors"
							onClick={() => onOpenSelectModal()}
						>
							{address && SUPPORTED_CHAIN_IDS.includes(chainId || 0) ? (
								<div>
									<div className="flex flex-row justify-center items-center">
										<div className="mr-2 relative top-0.5">
											<Jazzicon
												diameter={23}
												seed={jsNumberForAddress(address as string)}
											/>
										</div>
										<span className="text-left font-normal">
											{trimAddress({
												address: address as string,
												firstChar: 7,
												lastChar: 4,
												dots: "....",
											})}
										</span>
									</div>
								</div>
							) : (
								<div>
									<span>Connect wallet</span>
								</div>
							)}
						</button>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
