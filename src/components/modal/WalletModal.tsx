// components/WalletModal.tsx
import React, { FC, useCallback, useEffect, useState, useRef } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Box,
	Text,
	Flex,
	Link,
	useClipboard,
	Button,
	useToast,
} from "@chakra-ui/react";
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
// import { WalletPending } from './components/Pending';
import usePrevious from "@/hooks/general/usePrevious";
import useWalletModal from "@/hooks/modal/useWalletModal";
import Image from "next/image";
import METAMASK from "assets/images/metamask_icon.png";
import ACCOUNT_COPY from "@/assets/images/account_copy_icon.png";
import ETHERSCAN_LINK from "@/assets/images/etherscan_link_icon.png";
import { DEFAULT_NETWORK, SUPPORTED_CHAIN_IDS } from "@/constant/index";
// import { useWindowDimensions } from '@/hooks/general/useWindowDimension';
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
		<Flex
			id={id}
			w="100%"
			p={3}
			cursor="pointer"
			_hover={{ bg: "gray.50" }}
			onClick={onClick}
			alignItems="center"
			borderBottom="1px"
			borderColor="gray.100"
			h="56px"
		>
			<Flex alignItems="center" w="100%">
				<Box mr={3} w="24px" h="24px">
					<Image src={METAMASK} alt={header} />
				</Box>
				<Text fontWeight="600" fontSize="14px">
					{header}
				</Text>
			</Flex>
		</Flex>
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
		<Flex
			direction="column"
			px={4}
			py={6}
			justifyContent="center"
			alignItems="center"
		>
			<Text mb={4}></Text>
			{error && (
				<>
					<Text color="red.500" mb={2}>
						Connection error
					</Text>
					<Button
						onClick={() => {
							setPendingError(false);
							tryActivation(connector);
						}}
					>
						Try again
					</Button>
				</>
			)}
		</Flex>
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
	const toast = useToast();
	const { hasCopied } = useClipboard(address ?? "");
	const [pendingWallet, setPendingWallet] = useState<Connector | undefined>();
	const [walletView, setWalletView] = useState<string>(WALLET_VIEWS.ACCOUNT);

	const [rightOffset, setRightOffset] = useState<number>(0);

	// const [accountValue, setAccountValue] = useLocalStorage('account', {});

	const previousAddress = usePrevious(address);
	const prevAddressRef = useRef<string | undefined>(address);

	useEffect(() => {
		const width = window.innerWidth;
		setRightOffset((width - 1150) / 2);
	}, []);

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
		toast({ title: "Copied to Clipboard", status: "success", duration: 2000 });
	}, [address, toast]);

	const switchToDefaultNetwork = useCallback(
		async (connector: Connector) => {
			if (!(window as any).ethereum) return;
			const hex = "0x" + Number(DEFAULT_NETWORK).toString(16);
			try {
				await (window as any).ethereum.request({
					method: "wallet_switchEthereumChain",
					params: [{ chainId: hex }],
				});
				toast({ title: "Switched network", status: "success" });
			} catch {
				toast({ title: "Failed to switch network", status: "error" });
			}
		},
		[toast],
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
			<Flex flexDir={"row"}>
				<Text colorScheme="gray.200" fontSize="13px" mr={"10px"} mt={"2px"}>
					Connected with {name}
				</Text>
				<Button
					onClick={handleWalletChange}
					w={"58px"}
					h={"22px"}
					bgColor={"#257eee"}
					color={"#fff"}
					fontWeight={600}
					fontSize={"12px"}
					outline="none"
					variant="outline"
				>
					Change
				</Button>
			</Flex>
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
			// 계정이 변경된 경우
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

	return (
		<Modal
			isOpen={isOpen}
			onClose={closeSelectModal}
			closeOnOverlayClick={false}
			closeOnEsc={false}
			// isCentered
		>
			<ModalContent
				w="280px"
				mx="auto"
				position={"absolute"}
				right={`${rightOffset}px`}
			>
				{(address && !chainSupported) ||
				(chainId && !SUPPORTED_CHAIN_IDS.includes(chainId)) ? (
					<>
						<ModalHeader>Network not supported</ModalHeader>
						<ModalCloseButton />
						<ModalBody>
							<Text mb={4}>Please switch to Mainnet or Sepolia.</Text>
							<Flex direction="column" gap={2}>
								<Button
									colorScheme="blue"
									w="full"
									onClick={async () => {
										if (!(window as any).ethereum) return;
										try {
											await (window as any).ethereum.request({
												method: "wallet_switchEthereumChain",
												params: [{ chainId: "0x1" }],
											});
											toast({
												title: "Switched to Mainnet",
												status: "success",
											});
										} catch {
											toast({
												title: "Failed to switch to Mainnet",
												status: "error",
											});
										}
									}}
								>
									Switch to Mainnet
								</Button>
								<Button
									colorScheme="blue"
									w="full"
									onClick={async () => {
										if (!(window as any).ethereum) return;
										try {
											await (window as any).ethereum.request({
												method: "wallet_switchEthereumChain",
												params: [{ chainId: "0xaa36a7" }], // 11155111 in hex
											});
											toast({
												title: "Switched to Sepolia",
												status: "success",
											});
										} catch (error) {
											toast({
												title: "Failed to switch to Sepolia",
												status: "error",
											});
										}
									}}
								>
									Switch to Sepolia
								</Button>
							</Flex>
						</ModalBody>
					</>
				) : (
					view === WALLET_VIEWS.ACCOUNT &&
					address &&
					SUPPORTED_CHAIN_IDS.includes(chainId || 0) && (
						<>
							<ModalHeader fontFamily={"TitilliumWeb"}>
								<Text>Account</Text>
								<Text fontSize={"12px"} color={"#86929d"} fontWeight={"normal"}>
									My account & connect change
								</Text>
							</ModalHeader>
							<ModalCloseButton />
							<ModalBody p={0} fontFamily={"TitilliumWeb"}>
								<Flex
									w={"280px"}
									borderY={"1px"}
									borderColor={"#f4f6f8"}
									ml={0}
								>
									{address && (
										<Flex my={"24px"} ml={"25px"}>
											<Text fontSize="15px" fontWeight={600} mr={"12px"}>
												{trimAddress({
													address: address,
													firstChar: 7,
													lastChar: 4,
													dots: "....",
												})}
											</Text>
											<Flex
												w={"22px"}
												h={"22px"}
												mr={"7px"}
												onClick={handleCopy}
												cursor="pointer"
											>
												<Image src={ACCOUNT_COPY} alt={"alt"} />
											</Flex>
											<Link
												isExternal
												href={`https://etherscan.io/address/${address}`}
												fontSize="sm"
												_hover={{
													textDecoration: "none",
												}}
											>
												<Image src={ETHERSCAN_LINK} alt={"alt"} />
											</Link>
										</Flex>
									)}
								</Flex>
								{/* <Flex w={'100%'} borderY={'1px'} borderColor={'#f4f6f8'} h={'50px'} justifyContent={'center'} alignItems={'center'}>
                {formatConnectorName()}
              </Flex> */}
								<Flex
									h={"64px"}
									justifyContent={"center"}
									alignItems={"center"}
								>
									<Flex
										fontSize={"15px"}
										color={"#2a72e5"}
										fontWeight={600}
										cursor={"pointer"}
										onClick={() => {
											disconnect();
											closeSelectModal();
											// setView(WALLET_VIEWS.OPTIONS);
										}}
									>
										Logout
									</Flex>
								</Flex>
							</ModalBody>
						</>
					)
				)}

				{view === WALLET_VIEWS.OPTIONS &&
					SUPPORTED_CHAIN_IDS.includes(chainId || 0) && (
						<>
							<ModalHeader fontFamily={"TitilliumWeb"}>
								<Text>Connect Wallet</Text>
								<Text fontSize={"12px"} color={"#86929d"} fontWeight={"normal"}>
									To start using Staking
								</Text>
							</ModalHeader>
							<ModalCloseButton />
							<ModalBody pb={6} fontFamily={"TitilliumWeb"} px={0}>
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
									<Flex
										flexDir={"column"}
										fontSize={"13px"}
										fontFamily={"TitilliumWeb"}
										ml={"25px"}
									>
										<Text pt={3}>New to Ethereum? </Text>
										<Link
											isExternal
											href="https://ethereum.org/wallets/"
											color={"#2a72e5"}
										>
											Learn more about wallets
										</Link>
									</Flex>
								)}
							</ModalBody>
						</>
					)}

				{view === WALLET_VIEWS.PENDING && (
					<>
						<ModalHeader>Connecting…</ModalHeader>
						<ModalBody>
							<WalletPending
								connector={pendingWallet}
								error={pendingError}
								setPendingError={setPendingError}
								tryActivation={tryActivation}
							/>
						</ModalBody>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};

export default WalletModal;
