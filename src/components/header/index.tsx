// components/StakingHeader.tsx
import React, { useCallback } from "react";
import {
	Box,
	Flex,
	Text,
	Heading,
	HStack,
	Tag,
	Icon,
	useColorModeValue,
	Tooltip,
	Container,
	useClipboard,
	IconButton,
} from "@chakra-ui/react";
import { CloseIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { Connector, useAccount, useChainId } from "wagmi";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	Button,
	Menu,
	MenuButton,
	MenuList,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
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
			<Box as="header" py={4} position="sticky" zIndex={10} w="100%">
				<Container maxW="container.xl">
					<Flex justifyContent="space-between" alignItems="center">
						<HStack spacing={3}>
							<Flex
								as="h1"
								flexDir={"row"}
								fontSize={"24px"}
								fontWeight={800}
								fontFamily={"NanumSquare"}
							>
								Tokamak{" "}
								<Text as="span" color="blue.500" ml={"3px"}>
									{" "}
									staking
								</Text>{" "}
								<Flex
									as="span"
									w={"62px"}
									ml={"3px"}
									fontSize={"11px"}
									lineHeight={"11px"}
								>
									Community version
								</Flex>
							</Flex>
						</HStack>
						<HStack>
							<Button
								border="solid 1px #d7d9df"
								color={"#86929d"}
								w={151}
								h={35}
								fontSize={14}
								fontWeight={600}
								rounded={18}
								bg={"white.100"}
								zIndex={100}
								_hover={{}}
							>
								<Box>
									<Text>Connect wallet</Text>
								</Box>
							</Button>
						</HStack>
					</Flex>
				</Container>
			</Box>
		);
	}

	return (
		<Box as="header" py={4} position="sticky" zIndex={10} w="100%">
			<Container maxW="container.xl">
				<Flex justifyContent="space-between" alignItems="center">
					<HStack spacing={3}>
						<Flex
							as="h1"
							flexDir={"row"}
							fontSize={"24px"}
							fontWeight={800}
							fontFamily={"NanumSquare"}
						>
							Tokamak{" "}
							<Text as="span" color="blue.500" ml={"3px"}>
								{" "}
								staking
							</Text>{" "}
							<Flex
								as="span"
								w={"62px"}
								ml={"3px"}
								fontSize={"11px"}
								lineHeight={"11px"}
							>
								Community version
							</Flex>
						</Flex>
					</HStack>

					<HStack>
						<Button
							border="solid 1px #d7d9df"
							color={"#86929d"}
							w={151}
							h={35}
							fontSize={14}
							fontWeight={600}
							onClick={() => onOpenSelectModal()}
							rounded={18}
							bg={"white.100"}
							zIndex={100}
							_hover={{}}
						>
							{address && SUPPORTED_CHAIN_IDS.includes(chainId || 0) ? (
								<Box>
									<Flex
										flexDir={"row"}
										justifyContent={"center"}
										alignItems={"center"}
									>
										<Box mr={2} position="relative" top="2px">
											<Jazzicon
												diameter={23}
												seed={jsNumberForAddress(address as string)}
											/>
										</Box>
										<Text textAlign={"left"} fontWeight={"normal"}>
											{trimAddress({
												address: address as string,
												firstChar: 7,
												lastChar: 4,
												dots: "....",
											})}
										</Text>
									</Flex>
								</Box>
							) : (
								<Box>
									<Text>Connect wallet</Text>
								</Box>
							)}
						</Button>
					</HStack>
				</Flex>
			</Container>
		</Box>
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

const WalletConnector: React.FC = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();
	const [hasMounted, setHasMounted] = useState(false);
	const [chainSupport, setChainSupport] = useState<boolean>(false);

	const { address, isConnected, connector: activeConnector } = useAccount();
	const { connect, connectors, error: connectError } = useConnect();
	const { disconnect } = useDisconnect();

	// const chains as chain = useChains();
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
			toast({
				title: "Copy Success",
				status: "success",
				duration: 2000,
				isClosable: true,
			});
		}
	}, [address, toast]);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	const { onCopy } = useClipboard(address || "");

	const [walletView, setWalletView] = useState<string>(WALLET_VIEWS.ACCOUNT);
	const [pendingWallet, setPendingWallet] = useState<Connector | undefined>();
	const [pendingError, setPendingError] = useState<boolean>(false);

	const menuBg = useColorModeValue("white", "gray.700");

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

	return (
		<>
			{!isConnected ? (
				<Menu isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
					<MenuButton
						as={Button}
						bgColor={"#fff"}
						w="137px"
						border={"1px"}
						borderColor={"#D7D9DF"}
						borderRadius={"17.5px"}
						color={"#86929d"}
						fontFamily={"TitilliumWeb"}
					>
						<Box>
							<Text>Connect Wallet</Text>
						</Box>
					</MenuButton>
					<MenuList bg={menuBg} w={"280px"} p={"0px"} right={"45px"}>
						<Box fontFamily={"TitilliumWeb"} p={4}>
							<Text>Connect Wallet</Text>
							<Text fontSize={"12px"} color={"#86929d"} fontWeight={"normal"}>
								To start using Staking
							</Text>
						</Box>
						<Box fontFamily={"TitilliumWeb"} pb={6} px={0}>
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
									mb={4}
								>
									<Text pt={3}>New to Ethereum? </Text>
									<Link
										target="_blank"
										rel="noopener noreferrer"
										href="https://ethereum.org/wallets/"
										color={"#2a72e5"}
									>
										Learn more about wallets
									</Link>
								</Flex>
							)}
						</Box>
					</MenuList>
				</Menu>
			) : (
				<Menu>
					<MenuButton
						as={Button}
						w={"157px"}
						h={"35px"}
						borderRadius={"17.5px"}
						border={"1px solid #D7D9DF"}
						bg={"#fff"}
						size="md"
					>
						<Box>
							<Flex
								flexDir={"row"}
								justifyContent={"center"}
								alignItems={"center"}
							>
								<Box mr={2} position="relative" top="2px">
									<Jazzicon
										diameter={23}
										seed={jsNumberForAddress(address as string)}
									/>
								</Box>
								<Text
									textAlign={"left"}
									fontWeight={"normal"}
									fontFamily={"TitilliumWeb"}
								>
									{trimAddress({
										address: address as string,
										firstChar: 7,
										lastChar: 4,
										dots: "....",
									})}
								</Text>
							</Flex>
						</Box>
					</MenuButton>
					<MenuList bg={menuBg} w={"280px"} p={"0px"} right={"45px"}>
						<Box fontFamily={"TitilliumWeb"} p={4}>
							<Text>Account</Text>
							<Text fontSize={"12px"} color={"#86929d"} fontWeight={"normal"}>
								My account & connect change
							</Text>
						</Box>
						<Flex w={"100%"} borderY={"1px"} borderColor={"#f4f6f8"} ml={0}>
							{address && (
								<Flex my={"24px"} ml={"25px"}>
									<Text fontSize="15px" fontWeight={600} mr={"12px"}>
										{`0x${address.slice(2, 9)}...${address.slice(-4)}`}
									</Text>
									<Flex
										w={"22px"}
										h={"22px"}
										mr={"7px"}
										onClick={handleCopyAction}
										cursor="pointer"
									>
										<Image src={ACCOUNT_COPY} alt="Copy" />
									</Flex>
									<Link
										target="_blank"
										rel="noopener noreferrer"
										href={`https://etherscan.io/address/${address}`}
									>
										<Image src={ETHERSCAN_LINK} alt="Etherscan" />
									</Link>
								</Flex>
							)}
						</Flex>
						<Flex
							w={"100%"}
							borderY={"1px"}
							borderColor={"#f4f6f8"}
							h={"50px"}
							justifyContent={"center"}
							alignItems={"center"}
						>
							{formatConnectorName()}
						</Flex>
						<Flex h={"64px"} justifyContent={"center"} alignItems={"center"}>
							<Flex
								fontSize={"15px"}
								color={"#2a72e5"}
								fontWeight={600}
								cursor={"pointer"}
								onClick={() => {
									disconnect();
									onClose();
								}}
							>
								Logout
							</Flex>
						</Flex>
					</MenuList>
				</Menu>
			)}
		</>
	);
};

export default WalletConnector;
