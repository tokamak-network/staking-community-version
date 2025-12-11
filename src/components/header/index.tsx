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
			<header className="py-3 sm:py-4 sticky z-10 w-full bg-white/80 backdrop-blur-sm border-b border-gray-100">
				<div className="max-w-screen-xl mx-auto px-3 sm:px-4">
					<div className="flex justify-between items-center gap-2">
						{/* Logo Section */}
						<div className="flex items-center min-w-0 flex-shrink">
							<h1 className="flex flex-row items-center text-lg sm:text-2xl font-extrabold font-nanum-square">
								<span className="whitespace-nowrap">Tokamak</span>
								<span className="text-blue-500 ml-1 whitespace-nowrap">
									staking
								</span>
								<span className="hidden sm:inline-block w-[67px] ml-1 text-[10px] sm:text-[11px] leading-[11px] text-gray-500">
									Community version
								</span>
							</h1>
						</div>

						{/* Connect Button */}
						<div className="flex items-center flex-shrink-0">
							<button className="border border-[#d7d9df] text-[#86929d] min-w-[120px] sm:min-w-[151px] h-[40px] sm:h-[35px] px-3 sm:px-4 text-sm font-semibold rounded-full bg-white z-[100] hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation">
								<span>Connect</span>
							</button>
						</div>
					</div>
				</div>
			</header>
		);
	}

	return (
		<header className="py-3 sm:py-4 sticky z-10 w-full bg-white/80 backdrop-blur-sm border-b border-gray-100">
			<div className="max-w-screen-xl mx-auto px-3 sm:px-4">
				<div className="flex justify-between items-center gap-2">
					{/* Logo Section */}
					<div className="flex items-center min-w-0 flex-shrink">
						<h1 className="flex flex-row items-center text-lg sm:text-2xl font-extrabold font-nanum-square">
							<span className="whitespace-nowrap">Tokamak</span>
							<span className="text-blue-500 ml-1 whitespace-nowrap">
								staking
							</span>
							<span className="hidden sm:inline-block w-[67px] ml-1 text-[10px] sm:text-[11px] leading-[11px] text-gray-500">
								Community version
							</span>
						</h1>
					</div>

					{/* Connect Button */}
					<div className="flex items-center flex-shrink-0">
						<button
							className="border border-[#d7d9df] text-[#86929d] min-w-[120px] sm:min-w-[151px] h-[44px] sm:h-[38px] px-3 sm:px-4 text-sm font-semibold rounded-full bg-white z-[100] hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
							onClick={() => onOpenSelectModal()}
						>
							{address && SUPPORTED_CHAIN_IDS.includes(chainId || 0) ? (
								<div className="flex flex-row justify-center items-center">
									<div className="mr-2 relative top-0.5 flex-shrink-0">
										<Jazzicon
											diameter={22}
											seed={jsNumberForAddress(address as string)}
										/>
									</div>
									<span className="text-left font-normal text-gray-700 text-sm">
										{trimAddress({
											address: address as string,
											firstChar: 4,
											lastChar: 4,
											dots: "...",
										})}
									</span>
								</div>
							) : (
								<span>Connect</span>
							)}
						</button>
					</div>
				</div>
			</div>
		</header>
	);
};

const WalletOption = ({
	id,
	onClick,
	header,
	subheader,
	icon,
	active = false,
}: {
	id: string;
	onClick?: () => void;
	header: string;
	subheader?: string;
	icon: string;
	active?: boolean;
	link?: string;
	color?: string;
}) => {
	return (
		<div
			id={id}
			className="w-full p-3 cursor-pointer hover:bg-gray-50 flex items-center border-b border-gray-100 h-14"
			onClick={onClick}
		>
			<div className="flex items-center w-full">
				<div className="mr-3 w-6 h-6">
					<Image src={METAMASK} alt={header} />
				</div>
				<span className="font-semibold text-sm">
					{header}
				</span>
			</div>
		</div>
	);
};

const WalletPending = ({
	error,
	connector,
	setPendingError,
	tryActivation,
}: {
	error: boolean;
	connector: any;
	setPendingError: (error: boolean) => void;
	tryActivation: (connector: any) => void;
}) => {
	return (
		<div className="flex flex-col px-4 py-6 justify-center items-center">
			<span className="mb-4"></span>
			{error && (
				<>
					<span className="text-red-500 mb-2">
						Connection error
					</span>
					<button
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
						onClick={() => {
							setPendingError(false);
							tryActivation(connector);
						}}
					>
						Try again
					</button>
				</>
			)}
		</div>
	);
};

const WalletConnector: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [hasMounted, setHasMounted] = useState(false);
	const [chainSupport, setChainSupport] = useState<boolean>(false);

	const { address, isConnected, connector: activeConnector } = useAccount();
	const { connect, connectors, error: connectError } = useConnect();
	const { disconnect } = useDisconnect();

	const { chains, switchChain } = useSwitchChain();
	const chain = useChains();
	const chainId = useChainId();

	useEffect(() => {
		if (chainId !== 1 && chainId !== 11155111) {
			setChainSupport(true);
		} else {
			setChainSupport(false);
		}
	}, [switchChain, chainId]);

	useEffect(() => {
		if (isConnected && address) {
			setWalletView(WALLET_VIEWS.ACCOUNT);
		} else {
			setWalletView(WALLET_VIEWS.OPTIONS);
		}
	}, [isConnected, address]);

	const handleWalletChange = useCallback(() => {
		setWalletView(WALLET_VIEWS.OPTIONS);
	}, []);

	const tryActivation = async (connector: Connector) => {
		setPendingWallet(connector);
		setWalletView(WALLET_VIEWS.PENDING);

		try {
			connect({ connector });
		} catch (error) {
			console.error("Connection error:", error);
			setPendingError(true);
		}
	};

	const handleCopyAction = useCallback(() => {
		if (address) {
			copy(address);
			// Toast notification would go here
		}
	}, [address]);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	const [walletView, setWalletView] = useState<string>(WALLET_VIEWS.ACCOUNT);
	const [pendingWallet, setPendingWallet] = useState<Connector | undefined>();
	const [pendingError, setPendingError] = useState<boolean>(false);

	if (!hasMounted) {
		return null;
	}

	const formatConnectorName = () => {
		if (!activeConnector) return null;

		const walletName = Object.keys(SUPPORTED_WALLETS).find(
			(key) => SUPPORTED_WALLETS[key].connector === activeConnector.id,
		);

		const name = walletName
			? SUPPORTED_WALLETS[walletName].name
			: activeConnector.name;

		return (
			<div className="flex flex-row">
				<span className="text-gray-200 text-[13px] mr-2.5 mt-0.5">
					Connected with {name}
				</span>
				<button
					onClick={handleWalletChange}
					className="w-[58px] h-[22px] bg-[#257eee] text-white font-semibold text-xs outline-none border border-[#257eee] rounded hover:bg-[#1a5cbf] transition-colors"
				>
					Change
				</button>
			</div>
		);
	};

	const getOptions = () => {
		return connectors.map((connector) => {
			const walletInfo = Object.values(SUPPORTED_WALLETS).find(
				(wallet) => wallet.connector === connector.id,
			) || {
				name: connector.name,
				iconName: "default-wallet.png",
				description: `Connect to your ${connector.name}`,
			};

			return (
				<WalletOption
					id={`connect-${connector.id}`}
					key={connector.id}
					onClick={() => tryActivation(connector)}
					header={walletInfo.name || connector.name}
					subheader={walletInfo.description}
					icon={walletInfo.iconName}
					active={connector === activeConnector}
				/>
			);
		});
	};

	return (
		<>
			{!isConnected ? (
				<div className="relative">
					<button
						className="bg-white w-[137px] border border-[#D7D9DF] rounded-[17.5px] text-[#86929d] font-titillium-web px-4 py-2 hover:bg-gray-50 transition-colors"
						onClick={() => setIsOpen(!isOpen)}
					>
						<div>
							<span>Connect Wallet</span>
						</div>
					</button>
					{isOpen && (
						<div className="absolute right-11 top-full mt-2 w-[280px] bg-white rounded-lg shadow-lg z-50">
							<div className="font-titillium-web p-4">
								<span>Connect Wallet</span>
								<div className="text-xs text-[#86929d] font-normal">
									To start using Staking
								</div>
							</div>
							<div className="font-titillium-web pb-6 px-0">
								{walletView === WALLET_VIEWS.PENDING ? (
									<WalletPending
										connector={pendingWallet}
										error={pendingError}
										setPendingError={setPendingError}
										tryActivation={tryActivation}
									/>
								) : (
									<>{getOptions()}</>
								)}
								{walletView !== WALLET_VIEWS.PENDING && (
									<div className="flex flex-col text-[13px] font-titillium-web ml-6 mb-4">
										<span className="pt-3">New to Ethereum? </span>
										<Link
											target="_blank"
											rel="noopener noreferrer"
											href="https://ethereum.org/wallets/"
											className="text-[#2a72e5] hover:underline"
										>
											Learn more about wallets
										</Link>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			) : (
				<div className="relative">
					<button
						className="w-[157px] h-[35px] rounded-[17.5px] border border-[#D7D9DF] bg-white hover:bg-gray-50 transition-colors"
						onClick={() => setIsOpen(!isOpen)}
					>
						<div>
							<div className="flex flex-row justify-center items-center">
								<div className="mr-2 relative top-0.5">
									<Jazzicon
										diameter={23}
										seed={jsNumberForAddress(address as string)}
									/>
								</div>
								<span className="text-left font-normal font-titillium-web">
									{trimAddress({
										address: address as string,
										firstChar: 7,
										lastChar: 4,
										dots: "....",
									})}
								</span>
							</div>
						</div>
					</button>
					{isOpen && (
						<div className="absolute right-11 top-full mt-2 w-[280px] bg-white rounded-lg shadow-lg z-50">
							<div className="font-titillium-web p-4">
								<span>Account</span>
								<div className="text-xs text-[#86929d] font-normal">
									My account & connect change
								</div>
							</div>
							<div className="w-full border-y border-[#f4f6f8] ml-0">
								{address && (
									<div className="flex my-6 ml-6">
										<span className="text-[15px] font-semibold mr-3">
											{`0x${address.slice(2, 9)}...${address.slice(-4)}`}
										</span>
										<div
											className="w-[22px] h-[22px] mr-1.5 cursor-pointer hover:opacity-70 transition-opacity"
											onClick={handleCopyAction}
										>
											<Image src={ACCOUNT_COPY} alt="Copy" />
										</div>
										<Link
											target="_blank"
											rel="noopener noreferrer"
											href={`https://etherscan.io/address/${address}`}
											className="hover:opacity-70 transition-opacity"
										>
											<Image src={ETHERSCAN_LINK} alt="Etherscan" />
										</Link>
									</div>
								)}
							</div>
							<div className="w-full border-y border-[#f4f6f8] h-[50px] flex justify-center items-center">
								{formatConnectorName()}
							</div>
							<div className="h-16 flex justify-center items-center">
								<button
									className="text-[15px] text-[#2a72e5] font-semibold cursor-pointer hover:underline"
									onClick={() => {
										disconnect();
										setIsOpen(false);
									}}
								>
									Logout
								</button>
							</div>
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default WalletConnector;
