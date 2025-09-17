// components/WalletModal.tsx
import React, { FC, useCallback, useEffect, useState, useRef } from "react";
import {
	useAccount,
	useConnect,
	useDisconnect,
	useSwitchChain,
	useChains,
	Connector,
} from "wagmi";
import trimAddress from "@/utils/trim/trim";
import copy from "copy-to-clipboard";
import usePrevious from "@/hooks/general/usePrevious";
import useWalletModal from "@/hooks/modal/useWalletModal";
import Image from "next/image";
import METAMASK from "assets/images/metamask_icon.png";
import ACCOUNT_COPY from "@/assets/images/account_copy_icon.png";
import ETHERSCAN_LINK from "@/assets/images/etherscan_link_icon.png";
import { DEFAULT_NETWORK, SUPPORTED_CHAIN_IDS } from "@/constant/index";
import { chainIdState } from "@/recoil/chainId";
import { useRecoilState } from "recoil";

const WALLET_VIEWS = {
	OPTIONS: "options",
	ACCOUNT: "account",
	PENDING: "pending",
} as const;

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
			className="w-full p-3 cursor-pointer hover:bg-gray-50 flex items-center border-b border-gray-100 h-14 transition-colors"
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

const WalletModal: FC = () => {
	const { address, isConnected, connector: activeConnector } = useAccount();
	const { connect, connectors, error: connectError } = useConnect();
	const { disconnect } = useDisconnect();
	const { chains, switchChain } = useSwitchChain();
	const chain = useChains();
	const [chainId, setChainId] = useRecoilState(chainIdState);
	const { isOpen, closeSelectModal } = useWalletModal();
	const [view, setView] = useState<string>(WALLET_VIEWS.OPTIONS);
	const [pendingError, setPendingError] = useState(false);
	const [chainSupported, setChainSupported] = useState(true);
	const [hasCopied, setHasCopied] = useState(false);
	const [pendingWallet, setPendingWallet] = useState<Connector | undefined>();
	const [walletView, setWalletView] = useState<string>(WALLET_VIEWS.ACCOUNT);
	const [modalPosition, setModalPosition] = useState<'center' | 'top-right' | 'custom'>('custom');
	const [rightOffset, setRightOffset] = useState<number>(0);

	const previousAddress = usePrevious(address);
	const prevAddressRef = useRef<string | undefined>(address);

	// 모달 위치 설정
	useEffect(() => {
		const width = window.innerWidth;
		
		switch (modalPosition) {
			case 'center':
				setRightOffset(0); // 중앙 정렬
				break;
			case 'top-right':
				setRightOffset(20); // 오른쪽 상단에서 20px 떨어진 위치
				break;
			case 'custom':
				setRightOffset((width - 1150) / 2); // 기존 로직
				break;
			default:
				setRightOffset(0);
		}
	}, [modalPosition]);

	useEffect(() => {
		const { ethereum } = window;
		if (!ethereum || !ethereum.request) {
			setChainId(null);
			return;
		}

		const getChainId = async () => {
			try {
				const hexChainId = await ethereum.request({ method: "eth_chainId" });
				const parsed = parseInt(hexChainId, 16);
				setChainId(parsed);
			} catch (err) {
				console.error("Failed to get chainId:", err);
				setChainId(null);
			}
		};
		getChainId();

		const handleChainChanged = (hexChainId: string) => {
			try {
				const parsed = parseInt(hexChainId, 16);
				setChainId(parsed);
			} catch {
				setChainId(null);
			}
		};
		ethereum.on("chainChanged", handleChainChanged);
		setWalletView(WALLET_VIEWS.OPTIONS);

		return () => {
			if (ethereum.removeListener) {
				ethereum.removeListener("chainChanged", handleChainChanged);
			}
		};
	}, []);

	useEffect(() => {
		if (address && !previousAddress) {
			closeSelectModal();
		}
	}, [address, previousAddress, closeSelectModal]);

	useEffect(() => {
		if (!chainId) return;
		setChainSupported(SUPPORTED_CHAIN_IDS.includes(chainId));
		if (!SUPPORTED_CHAIN_IDS.includes(chainId)) {
			disconnect();
			setWalletView(WALLET_VIEWS.OPTIONS);
		}
	}, [chainId]);

	useEffect(() => {
		if (isConnected) {
			setView(WALLET_VIEWS.ACCOUNT);
		} else {
			setView(WALLET_VIEWS.OPTIONS);
		}
	}, [isConnected]);

	const handleWalletChange = useCallback(() => {
		setView(WALLET_VIEWS.OPTIONS);
		setWalletView(WALLET_VIEWS.OPTIONS);
	}, []);

	const tryActivation = async (connector: Connector) => {
		setPendingWallet(connector);
		setView(WALLET_VIEWS.PENDING);
		setWalletView(WALLET_VIEWS.PENDING);
		if (isConnected && address) setView(WALLET_VIEWS.ACCOUNT);

		try {
			connect({ connector });
		} catch (error) {
			console.error("Connection error:", error);
			setPendingError(true);
		}
	};

	const handleCopy = useCallback(() => {
		if (!address) return;
		copy(address);
		setHasCopied(true);
		setTimeout(() => setHasCopied(false), 2000);
	}, [address]);

	const switchToDefaultNetwork = useCallback(
		async (connector: Connector) => {
			if (!(window as any).ethereum) return;
			const hex = "0x" + Number(DEFAULT_NETWORK).toString(16);
			try {
				await (window as any).ethereum.request({
					method: "wallet_switchEthereumChain",
					params: [{ chainId: hex }],
				});
				console.log("Switched network");
			} catch {
				console.log("Failed to switch network");
			}
		},
		[],
	);

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

	useEffect(() => {
		if (
			prevAddressRef.current &&
			address &&
			prevAddressRef.current !== address
		) {
			console.log(
				"Account changed from",
				prevAddressRef.current,
				"to",
				address,
			);
			window.location.reload();
		}
		prevAddressRef.current = address;
	}, [address]);

	useEffect(() => {
		if (typeof window !== "undefined" && window.ethereum) {
			const handleAccountsChanged = (accounts: string[]) => {
				if (accounts.length === 0) {
					disconnect();
					closeSelectModal();
				} else {
					const newAddress = accounts[0];
					if (newAddress !== address) {
						window.location.reload();
					}
				}
			};

			const handleChainChanged = (chainId: string) => {
				window.location.href = "/";
			};

			const handleDisconnect = () => {
				disconnect();
				closeSelectModal();
			};

			const handleConnect = (connectInfo: { chainId: string }) => {
				window.location.reload();
			};

			const checkConnection = async () => {
				try {
					const accounts = await window.ethereum.request({
						method: "eth_accounts",
					});
					if (accounts.length > 0 && !isConnected) {
						window.location.reload();
					}
				} catch (error) {
					console.error("Error checking connection:", error);
				}
			};

			checkConnection();

			window.ethereum.on("accountsChanged", handleAccountsChanged);
			window.ethereum.on("chainChanged", handleChainChanged);
			window.ethereum.on("disconnect", handleDisconnect);
			window.ethereum.on("connect", handleConnect);

			return () => {
				window.ethereum.removeListener(
					"accountsChanged",
					handleAccountsChanged,
				);
				window.ethereum.removeListener("chainChanged", handleChainChanged);
				window.ethereum.removeListener("disconnect", handleDisconnect);
				window.ethereum.removeListener("connect", handleConnect);
			};
		}
	}, [address, disconnect, closeSelectModal, isConnected]);

	if (!isOpen) return null;

	const getModalPositionClasses = () => {
		switch (modalPosition) {
			case 'center':
				return "fixed inset-0 z-50 flex items-center justify-center";
			case 'top-right':
				return "fixed inset-0 z-50 flex items-start justify-end pt-4 pr-4";
			case 'custom':
				return "fixed inset-0 z-50 flex items-start justify-end mt-16";
			default:
				return "fixed inset-0 z-50 flex items-center justify-center";
		}
	};

	return (
		<div className={getModalPositionClasses()}>
			{/* Overlay */}
			<div 
				className="fixed inset-0 bg-black bg-opacity-0"
				onClick={closeSelectModal}
			/>
			
			{/* Modal Content */}
			<div 
				className={`relative bg-white w-[280px] rounded-lg shadow-lg ${
					modalPosition === 'center' ? 'mx-auto' : ''
				}`}
				style={{ 
					right: modalPosition === 'custom' ? `${rightOffset}px` : undefined 
				}}
			>
				{(address && !chainSupported) ||
				(chainId && !SUPPORTED_CHAIN_IDS.includes(chainId)) ? (
					<>
						<div className="p-4 border-b">
							<h2 className="text-lg font-semibold">Network not supported</h2>
							<button
								onClick={closeSelectModal}
								className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<div className="p-4">
							<p className="mb-4">Please switch to Mainnet or Sepolia.</p>
							<div className="flex flex-col gap-2">
								<button
									className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
									onClick={async () => {
										if (!(window as any).ethereum) return;
										try {
											await (window as any).ethereum.request({
												method: "wallet_switchEthereumChain",
												params: [{ chainId: "0x1" }],
											});
											console.log("Switched to Mainnet");
										} catch {
											console.log("Failed to switch to Mainnet");
										}
									}}
								>
									Switch to Mainnet
								</button>
								<button
									className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
									onClick={async () => {
										if (!(window as any).ethereum) return;
										try {
											await (window as any).ethereum.request({
												method: "wallet_switchEthereumChain",
												params: [{ chainId: "0xaa36a7" }], // 11155111 in hex
											});
											console.log("Switched to Sepolia");
										} catch (error) {
											console.log("Failed to switch to Sepolia");
										}
									}}
								>
									Switch to Sepolia
								</button>
							</div>
						</div>
					</>
				) : (
					view === WALLET_VIEWS.ACCOUNT &&
					address &&
					SUPPORTED_CHAIN_IDS.includes(chainId || 0) && (
						<>
							<div className="p-4 border-b font-titillium-web">
								<div className="flex justify-between items-center">
									<div>
										<h2 className="text-lg font-semibold">Account</h2>
										<p className="text-xs text-[#86929d] font-normal">
											My account & connect change
										</p>
									</div>
									<button
										onClick={closeSelectModal}
										className="text-gray-400 hover:text-gray-600 transition-colors"
									>
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							</div>
							<div className="p-0 font-titillium-web">
								<div className="w-[280px] border-y border-[#f4f6f8] ml-0">
									{address && (
										<div className="flex my-6 ml-6">
											<span className="text-[15px] font-semibold mr-3">
												{trimAddress({
													address: address,
													firstChar: 7,
													lastChar: 4,
													dots: "....",
												})}
											</span>
											<div
												className="w-[22px] h-[22px] mr-1.5 cursor-pointer hover:opacity-70 transition-opacity"
												onClick={handleCopy}
											>
												<Image src={ACCOUNT_COPY} alt={"alt"} />
											</div>
											<a
												href={`https://etherscan.io/address/${address}`}
												target="_blank"
												rel="noopener noreferrer"
												className="hover:opacity-70 transition-opacity"
											>
												<Image src={ETHERSCAN_LINK} alt={"alt"} />
											</a>
										</div>
									)}
								</div>
								<div className="h-16 flex justify-center items-center">
									<button
										className="text-[15px] text-[#2a72e5] font-semibold cursor-pointer hover:underline"
										onClick={() => {
											disconnect();
											closeSelectModal();
										}}
									>
										Logout
									</button>
								</div>
							</div>
						</>
					)
				)}

				{view === WALLET_VIEWS.OPTIONS &&
					SUPPORTED_CHAIN_IDS.includes(chainId || 0) && (
						<>
							<div className="p-4 border-b font-titillium-web">
								<div className="flex justify-between items-center">
									<div>
										<h2 className="text-lg font-semibold">Connect Wallet</h2>
										<p className="text-xs text-[#86929d] font-normal">
											To start using Staking
										</p>
									</div>
									<button
										onClick={closeSelectModal}
										className="text-gray-400 hover:text-gray-600 transition-colors"
									>
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							</div>
							<div className="pb-6 font-titillium-web px-0">
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
									<div className="flex flex-col text-[13px] font-titillium-web ml-6">
										<span className="pt-3">New to Ethereum? </span>
										<a
											href="https://ethereum.org/wallets/"
											target="_blank"
											rel="noopener noreferrer"
											className="text-[#2a72e5] hover:underline"
										>
											Learn more about wallets
										</a>
									</div>
								)}
							</div>
						</>
					)}

				{view === WALLET_VIEWS.PENDING && (
					<>
						<div className="p-4 border-b">
							<h2 className="text-lg font-semibold">Connecting…</h2>
						</div>
						<div className="p-4">
							<WalletPending
								connector={pendingWallet}
								error={pendingError}
								setPendingError={setPendingError}
								tryActivation={tryActivation}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default WalletModal;
