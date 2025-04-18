// components/StakingHeader.tsx
import React, { useCallback } from 'react';
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
  IconButton
} from '@chakra-ui/react';
import { CloseIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { Connector, useAccount } from 'wagmi';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { ChevronDownIcon, CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { 
  useConnect, 
  useDisconnect, 
  useBalance,
  useNetwork,
  useSwitchNetwork
} from 'wagmi';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import trimAddress from '@/utils/trim/trim';
import copy from 'copy-to-clipboard';
import METAMASK from 'assets/images/metamask_icon.png';
import ACCOUNT_COPY from 'assets/images/account_copy_icon.png';
import ETHERSCAN_LINK from 'assets/images/etherscan_link_icon.png';

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
};


export const SUPPORTED_WALLETS: { [key: string]: any } = {
  METAMASK: {
    connector: 'metaMask',
    name: 'MetaMask',
    iconName: 'metamask_icon.png',
    description: 'Connect to your MetaMask Wallet',
    color: '#E8831D',
  },
  WALLET_CONNECT: {
    connector: 'walletConnect',
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to your WalletConnect Wallet',
    color: '#3B99FC',
  },
  COINBASE_WALLET: {
    connector: 'coinbaseWallet',
    name: 'Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Connect to your Coinbase Wallet',
    color: '#315CF5',
  },
};


export const Header = () => {
  return (
    <Box 
      as="header"
      py={4}
      position="sticky"
      zIndex={10}
      w="100%"
    >
      <Container maxW="container.xl">
        <Flex justifyContent="space-between" alignItems="center">
          <HStack spacing={3}>
            <Heading as="h1" size="md">
              Project Name-<Text as="span" color="blue.500">staking</Text>
            </Heading>
          </HStack>

          <HStack>
            <WalletConnector />
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
  active = false 
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
  tryActivation 
}: { 
  error: boolean; 
  connector: any; 
  setPendingError: (error: boolean) => void; 
  tryActivation: (connector: any) => void; 
}) => {
  return (
    <Flex direction="column" px={4} py={6} justifyContent="center" alignItems="center">
      <Text mb={4}></Text>
      {error && (
        <>
          <Text color="red.500" mb={2}>Connection error</Text>
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
  
  const { address, isConnected, connector: activeConnector } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  
  const { chain } = useNetwork();
  const { chains, switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    if (isConnected && address) {
      setWalletView(WALLET_VIEWS.ACCOUNT);
    } else {
      setWalletView(WALLET_VIEWS.OPTIONS);
    }
  }, [isConnected, address])

  const handleWalletChange = useCallback(() => {
    setWalletView(WALLET_VIEWS.OPTIONS);
  }, []);

  const tryActivation = async (connector: Connector) => {
    setPendingWallet(connector);
    setWalletView(WALLET_VIEWS.PENDING);
    
    try {
      connect({ connector });
    } catch (error) {
      console.error('Connection error:', error);
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


  const { onCopy } = useClipboard(address || '');

  const [walletView, setWalletView] = useState<string>(WALLET_VIEWS.ACCOUNT);
  const [pendingWallet, setPendingWallet] = useState<Connector | undefined>();
  const [pendingError, setPendingError] = useState<boolean>(false);

  const menuBg = useColorModeValue('white', 'gray.700');

  if (!hasMounted) {
    return null;
  }
  
  const formatConnectorName = () => {
    if (!activeConnector) return null;
    
    const walletName = Object.keys(SUPPORTED_WALLETS).find(
      key => SUPPORTED_WALLETS[key].connector === activeConnector.id
    );
    
    const name = walletName ? SUPPORTED_WALLETS[walletName].name : activeConnector.name;
    
    return (
      <Flex flexDir={'row'}>
        <Text colorScheme="gray.200" fontSize="13px" mr={'10px'} mt={'2px'}>
          Connected with {name} 
        </Text>
        <Button 
          onClick={handleWalletChange} 
          w={'58px'} 
          h={'22px'} 
          bgColor={'#257eee'} 
          color={'#fff'} 
          fontWeight={600} 
          fontSize={'12px'} 
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
        wallet => wallet.connector === connector.id
      ) || {
        name: connector.name,
        iconName: 'default-wallet.png',
        description: `Connect to your ${connector.name}`
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
            bgColor={'#fff'}
            w="137px"
            border={'1px'}
            borderColor={'#D7D9DF'}
            borderRadius={'17.5px'}
            color={'#86929d'}
            fontFamily={'TitilliumWeb'}
          >
            Connect Wallet
          </MenuButton>
          <MenuList
            bg={menuBg}
            w={'280px'}
            p={'0px'}
            // position={'absolute'}
            right={'45px'}
          >
            <Box fontFamily={'TitilliumWeb'} p={4}>
              <Text>
                Connect Wallet
              </Text>
              <Text
                fontSize={'12px'}
                color={'#86929d'}
                fontWeight={'normal'}
              >
                To start using Staking
              </Text>
            </Box>
            <Box fontFamily={'TitilliumWeb'} pb={6} px={0}>
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
                <Flex flexDir={'column'} fontSize={'13px'} fontFamily={'TitilliumWeb'} ml={'25px'} mb={4}>
                  <Text pt={3} >
                    New to Ethereum?{' '}
                  </Text>
                  <Link 
                    target="_blank" 
                  rel="noopener noreferrer" 
                    href="https://ethereum.org/wallets/"
                    color={'#2a72e5'}
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
            w={'157px'}
            h={'35px'}
            borderRadius={'17.5px'}
            border= {"1px solid #D7D9DF"}
            bg={'#fff'}
            // _hover={{ bg: 'blue.600' }}
            size="md"
          >
            <Flex flexDir={'row'} justifyContent={'center'} alignItems={'center'}>
              <span style={{ marginRight: '5px', top: '2px', position: 'relative' }}>
                <Jazzicon diameter={23} seed={jsNumberForAddress(address as string)} />
              </span>
              <Text 
                textAlign={'left'} 
                fontWeight={'normal'}
                fontFamily={'TitilliumWeb'}
              >
                {trimAddress({
                  address: address as string,
                  firstChar: 7,
                  lastChar: 4,
                  dots: '....',
                })}
              </Text>
            </Flex>
          </MenuButton>
          <MenuList
            bg={menuBg}
            w={'280px'}
            p={'0px'}
            // position={'position'}
            right={'45px'}
          >
            {connectError || (chain && chain.unsupported) ? (
              <>
                <Box p={4}>
                  {chain && chain.unsupported ? (
                    <Text>
                      Network not supported.
                      <br />
                      Please change to a supported network.
                    </Text>
                  ) : (
                    <Text>Error connecting</Text>
                  )}
                </Box>
                <Box p={4} pb={6}>
                  {chain && chain.unsupported ? (
                    <Button onClick={() => switchNetwork?.(1)}>
                      Switch to Ethereum Mainnet
                    </Button>
                  ) : (
                    'Error connecting. Try refreshing the page.'
                  )}
                </Box>
              </>
            ) : (
              <>
                <Box fontFamily={'TitilliumWeb'} p={4}>
                  <Text>
                    Account
                  </Text>
                  <Text
                    fontSize={'12px'}
                    color={'#86929d'}
                    fontWeight={'normal'}
                  >
                    My account & connect change
                  </Text>
                </Box>
                <Flex w={'100%'} borderY={'1px'} borderColor={'#f4f6f8'} ml={0}>
                  {address && (
                    <Flex my={'24px'} ml={'25px'}>
                      <Text fontSize="15px" fontWeight={600} mr={'12px'}>
                        {`0x${address.slice(2, 9)}...${address.slice(-4)}`}
                      </Text>
                      <Flex w={'22px'} h={'22px'} mr={'7px'} onClick={handleCopyAction} cursor="pointer">
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
                <Flex w={'100%'} borderY={'1px'} borderColor={'#f4f6f8'} h={'50px'} justifyContent={'center'} alignItems={'center'}>
                  {formatConnectorName()}
                </Flex>
                <Flex h={'64px'} justifyContent={'center'} alignItems={'center'}>
                  <Flex 
                    fontSize={'15px'} 
                    color={'#2a72e5'} 
                    fontWeight={600}
                    cursor={'pointer'}
                    onClick={() => {
                      disconnect();
                      onClose();
                    }}
                  >
                    Logout
                  </Flex>
                </Flex>
              </>
            )}
          </MenuList>
        </Menu>
      )}
    </>
  );
};

export default WalletConnector;