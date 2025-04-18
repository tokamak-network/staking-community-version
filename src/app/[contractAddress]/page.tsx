"use client"
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Text,
  HStack,
  VStack,
  IconButton,
  Divider,
  Link,
  useDisclosure,
  useToast,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
} from '@chakra-ui/react';
import { ArrowBackIcon, InfoIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useRouter, useParams } from "next/navigation";
import { useAccount, useBalance } from 'wagmi';
// import StakingCalculator from '@/components/StakingCalculator';
import { useRecoilValue, useRecoilState } from 'recoil';
import { operatorsListState, filteredOperatorsState, Operator } from "@/recoil/staking/operator";
import { ethers } from 'ethers';
import commafy from '@/utils/trim/commafy';
import CONTRACT_ADDRESS from '@/constant/contracts';
import { HeadInfo } from './components/HeadInfo';
import { TokenTypeSelector } from './components/TokenTypeSelector';
import { BalanceInput } from '@/components/input/CustomInput';
import TON_SYMBOL from '@/assets/images/ton_symbol.svg';
import WTON_SYMBOL from '@/assets/images/wton_symbol.svg';
import Image from 'next/image';
import LIST_ARROW from '@/assets/images/list-arrow_icon.svg';
import { inputState } from '@/recoil/input';
// import useTokenBalance from '@/hooks/balance/useTonBalance';
import useStakeTON from '@/hooks/staking/useStakeTON';
import { marshalString, unmarshalString } from '@/utils/format/marshalString';
import { padLeft } from 'web3-utils';
import { convertToRay, convertToWei, floatParser } from '@/utils/number/convert';
import { useExpectedSeigs } from '@/hooks/staking/useCalculateExpectedSeig';
import useSelectOperatorModal from '@/hooks/modal/useSelectOperatorModal';
import QUESTION_ICON from '@/assets/images/input_question_icon.svg';
import ETH from '@/assets/images/eth.svg';
import ARROW from '@/assets/images/right_arrow.svg';
import useCalculatorModal from '@/hooks/modal/useCalculatorModal';
import { useTONBalance, useUserStakeAmount, useExpectedSeig, useLayer2RewardInfo, useClaimableL2Seigniorage, useCheckCandidateType } from '@ton-staking-sdk/react-kit';
import { useWithdrawableLength } from '@/hooks/staking/useWithdrawable';
import { format } from 'path';
import useCallOperators from '@/hooks/staking/useCallOperators';
import useStakeWTON from '@/hooks/staking/useStakeWTON';
import useRestake from '@/hooks/staking/useRestake';
import useUpdateSeig from '@/hooks/staking/useUpdateSeig';
import useWithdraw from '@/hooks/staking/useWithdraw';
import useUnstake from '@/hooks/staking/useUnstake';
import { txPendingStatus } from '@/recoil/transaction/tx';
import { useRef } from 'react';
import { useMemo } from 'react';
import useTokenBalance from '@/hooks/balance/useTonBalance';
import useWithdrawL2 from '@/hooks/staking/useWithdrawL2';
import { ValueSection } from './components/ValueSection';
import { useStakingInformation } from '@/hooks/info/useStakingInfo';
import { actionButtonStyle, mainButtonStyle, withdrawOptionButtonStyle } from '@/style/buttonStyle';

const {
  TON_ADDRESS,
  WTON_ADDRESS,
  DepositManager_ADDRESS,
} = CONTRACT_ADDRESS;

const useOperatorData = () => {
  const { refreshOperator } = useCallOperators();
  
  return { refreshOperator };
};

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const operatorAddress = params?.contractAddress as `0x${string}`;
  
  const { address } = useAccount();
  const toast = useToast();
  
  const operators = useRecoilValue(filteredOperatorsState);
  const [currentOperator, setCurrentOperator] = useState<Operator | null>(null);

  const [value, setValue] = useRecoilState(inputState);
  const { onOpenSelectModal } = useSelectOperatorModal()
  const [txPending, ] = useRecoilState(txPendingStatus);
  const prevTxPendingRef = useRef(txPending);
  const { roi } = useStakingInformation();

  const { commissionRate } = useExpectedSeigs(currentOperator?.address as `0x${string}`, address as `0x${string}`);
  
  const { refreshOperator } = useOperatorData();
  
  useEffect(() => {  
    if (operatorAddress && operators.length > 0) {
      const operator = operators.find(op => op.address === operatorAddress);
      setCurrentOperator(operator || null);
    }
  }, [operatorAddress]);
  
  const { expectedSeig, lastSeigBlock, isLoading: seigLoading } = useExpectedSeig(
    operatorAddress as `0x${string}`, 
    BigInt(currentOperator?.totalStaked || '0'),
    address as `0x${string}`,
  );

  const { layer2Reward } = useLayer2RewardInfo({ candidateAddress: operatorAddress as `0x${string}` });
  const { claimableAmount } = useClaimableL2Seigniorage({ candidateAddress: operatorAddress as `0x${string}` });
  // const { candidateType } = useCheckCandidateType({ candidateAddress: operatorAddress as `0x${string}` });

  const [activeToken, setActiveToken] = useState<string>('TON');
  const [activeAction, setActiveAction] = useState<string>('Stake'); 
  // L2 withdrawal target selection
  const [withdrawTarget, setWithdrawTarget] = useState<string>('Ethereum');
  const [showWithdrawOptions, setShowWithdrawOptions] = useState<boolean>(false);
  
  const { openCalculatorModal, isOpen } = useCalculatorModal();

  // const { data: tokenBalance} = useTokenBalance(activeToken);
  // //@ts-ignore
  // const { data.parsedBalance: tokenBalance } = useTokenBalance(activeToken);
  // console.log(tokenBalance)
  // const { data: operatorStake } = useOperatorStake({ layer2Address: (currentOperator?.address || '') as `0x${string}` })
  // const { data: stakedAmount } = useUserStakeAmount({
  //   layer2Address: (currentOperator?.address || '') as `0x${string}`, 
  //   accountAddress: address  as `0x${string}` 
  // })

  const { data: tonBalance } = useTONBalance({ account: address });
  
  const operatorAddressForHooks = useMemo(() => currentOperator?.address || '', [currentOperator?.address]);
  
  const { withdrawableLength, withdrawableAmount, pendingRequests, pendingUnstaked } = useWithdrawableLength(operatorAddressForHooks as `0x${string}`);
  const { stakeTON: _stakeTON } = useStakeTON(operatorAddressForHooks);
  const { stakeWTON } = useStakeWTON(operatorAddressForHooks);
  const { unstake } = useUnstake(operatorAddressForHooks);
  const { restake } = useRestake(operatorAddressForHooks);
  const { withdraw } = useWithdraw(operatorAddressForHooks);
  const { withdrawL2 } = useWithdrawL2(operatorAddressForHooks);
  const { updateSeig } = useUpdateSeig(operatorAddressForHooks);

  useEffect(() => {
    if (prevTxPendingRef.current === true && txPending === false) {
      if (operatorAddress) {
        refreshOperator(operatorAddress);
      }
    }
    prevTxPendingRef.current = txPending;
  }, [txPending, operatorAddress]);
  
  // Handle withdraw action for L2
  useEffect(() => {
    if (activeAction === 'WithdrawL2' || activeAction === 'WithdrawL1' && currentOperator?.isL2) {
      setShowWithdrawOptions(true);
    } else {
      setShowWithdrawOptions(false);
    }
  }, [activeAction, currentOperator?.isL2]);
  
  const onClick = useCallback(() => {
    const amount = floatParser(value);

    if (amount) {
      const weiAmount = convertToWei(amount.toString());
      const rayAmount = convertToRay(amount.toString());
      switch (activeAction) {
        case 'Stake':
          const marshalData = getData();
          const wtonMarshalData = getDataForWton();
          
          return activeToken === 'TON' ? 
            _stakeTON({
              args: [WTON_ADDRESS, weiAmount, marshalData],
              
            }) :
            stakeWTON({
              args: [DepositManager_ADDRESS, rayAmount, wtonMarshalData]
            });
        
        case 'Unstake':
          const rayAmouont = convertToRay(amount.toString());

          return unstake({
            args: [operatorAddress, rayAmouont]
          })
        case 'Withdraw':
          return withdraw({
            args: [operatorAddress, withdrawableLength, activeToken === 'TON' ? true : false]
          })
        case 'WithdrawL1':
          return withdraw({
            args: [operatorAddress, withdrawableLength, activeToken === 'TON' ? true : false]
          })
        case 'WithdrawL2':
          return withdrawL2({
            args: [operatorAddress, rayAmount]
          })
        case 'Restake':
          return restake({
            args: [operatorAddress, pendingRequests]
          })
        default:
          return console.error("action mode is not found");
      }
    }
  }, [activeAction, withdrawableLength, value, withdrawTarget, currentOperator?.isL2])

  const formatUnits = useCallback((amount: string, unit: number) => {
    try {
      return commafy(ethers.utils.formatUnits(amount, unit), 2);
    } catch (e) {
      return '0';
    }
  }, []);

  const getData = useCallback(() => {
    if (operatorAddress)
      return marshalString(
        
        [DepositManager_ADDRESS, operatorAddress]
          .map(unmarshalString)
          .map((str) => padLeft(str, 64))
          .join(''),
      );
  }, [DepositManager_ADDRESS, operatorAddress]);
  
  const getDataForWton = useCallback(() => {
    if (operatorAddress) return marshalString(
      [operatorAddress]
        .map(unmarshalString)
        .map((str) => padLeft(str, 64))
        .join(''),
    )
  }, [])
  
  const isL2 = currentOperator?.isL2 || false;

  // Get button text based on current state
  const getButtonText = () => {
    if (value === '0.00' || !value || value === '0') return 'Enter an amount';
    
    switch (activeAction) {
      case 'Stake':
        return 'Stake';
      case 'Unstake':
        return 'Unstake';
      case 'Withdraw':
        return 'Withdraw';
      case 'WithdrawL1':
        return 'Withdraw';
      case 'WithdrawL2':
        return 'Withdraw to L2';
      case 'Restake':
        return 'Restake';
      default:
        return 'Submit';
    }
  };

  return (
    <Flex maxW="515px" w={'515px'} h={'100%'} mt={'300px'} py={5} flexDir={'column'} justifyContent={'start'}>
      <Flex mb={6} align="start" justifyContent={'space-between'}>
        <Flex alignItems={'center'} onClick={() => router.push('/')} cursor="pointer">
          <IconButton
            aria-label="Back"
            icon={<ArrowBackIcon />}
            variant="ghost"
          />
          Back
        </Flex>
        <Flex fontSize={'30px'} fontWeight={700} flexDir={'row'} ml={'20px'} alignItems={'center'}>
          {currentOperator?.name || 'Loading...'}
          {
            currentOperator?.isL2 && (
              <Flex 
                bgColor={'#257eee'}
                w={'34px'}
                h={'18px'}
                borderRadius={'3px'}
                justifyContent={'center'}
                fontSize={'12px'}
                color={'#fff'}
                fontWeight={600}
                fontFamily={'Roboto'}
                ml={'5px'}
              >
                L2
              </Flex>
            )
          }
          <Flex ml={'12px'} onClick={() => onOpenSelectModal()} cursor={'pointer'} _hover={{ transform: 'scale(1.05)' }}>
            <Image src={LIST_ARROW} alt={''} />
          </Flex>
        </Flex>
        <Flex w={'72px'}/>
      </Flex>

      <Flex justify="space-between" mb={8} flexWrap="wrap" gap={4} px={'15px'}>
        <HeadInfo 
          title="Staking APY" 
          value={roi.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' %'}
          label=""
        />
        <HeadInfo 
          title="Total staked" 
          value={`${formatUnits(currentOperator?.totalStaked || '0', 27)} TON`}
          label=""
        />
        <HeadInfo 
          title="Commission rate" 
          value={commissionRate.toString() + ' %'}
          label=""
        />
      </Flex>

      <HStack spacing={2} mb={3} flexWrap="wrap" fontSize={'12px'} px={'5px'}>
        <Button 
          onClick={() => setActiveAction('Stake')}
          {...actionButtonStyle(activeAction === 'Stake')}
        >
          Stake
        </Button>
        <Button 
          onClick={() => setActiveAction('Unstake')}
          {...actionButtonStyle(activeAction === 'Unstake')}
        >
          Unstake
        </Button>
        {
          isL2 ?
          <Menu>
            <MenuButton
              w={
                activeAction === 'WithdrawL1' || activeAction === 'WithdrawL2'
                ? '126px' 
                : '97px'
              }
              {...actionButtonStyle(activeAction === 'Withdraw')}
            >
              <Flex flexDir={'row'} justifyContent={'center'}>
                <Flex mr={'5px'}>
                  {
                    activeAction === 'WithdrawL1' 
                    ? 'Withdraw - Eth' 
                    : activeAction === 'WithdrawL2' 
                    ? 'Withdraw - L2'
                    : 'Withdraw'
                  }
                </Flex>
                <Flex w={'10px'} cursor={'pointer'} _hover={{ transform: 'scale(1.05)' }}>
                  <Image src={LIST_ARROW} alt={''} />
                </Flex>

              </Flex>
            </MenuButton>
            <MenuList
              bgColor={'transparent'}
              boxShadow={'none'}
              border={'none'}
              // zIndex={-1}
            >
              <Box 
                maxW={'96px'} 
                bgColor={'white'} 
                zIndex={100}
                borderRadius={'60x'}
                border={'1px solid #e7ebf2'}
              >
                <MenuItem
                  onClick={() => {
                    setValue(formatUnits(withdrawableAmount, 27))
                    setActiveAction('WithdrawL1')
                  }}
                  // maxW={'73px'}
                  {...withdrawOptionButtonStyle(withdrawTarget === 'Ethereum')}
                >
                  Ethereum
                </MenuItem>
                <MenuItem
                  onClick={() => setActiveAction('WithdrawL2')}
                  // w={'73px'}
                  {...withdrawOptionButtonStyle(withdrawTarget === 'L2')}
                >
                  L2
                </MenuItem>
              </Box>
            </MenuList>
          </Menu> :
          <Button 
            onClick={() => {
              setValue(formatUnits(withdrawableAmount, 27))
              setActiveAction('Withdraw')
            }}
            {...actionButtonStyle(activeAction === 'Withdraw')}
          >
            Withdraw
          </Button>
        }
        <Button 
          onClick={() => {
            setValue(formatUnits(withdrawableAmount, 27))
            setActiveAction('Restake')
          }}
          {...actionButtonStyle(activeAction === 'Restake')}
        >
          Restake
        </Button>
        <Link 
          ml="auto" 
          color="blue.500" 
          fontWeight="medium"
          cursor="pointer"
          onClick={() => openCalculatorModal()}
          _hover={{
            color: "blue.600",
            textDecoration: "underline"
          }}
        >
          Simulator
        </Link>
      </HStack>
      <Box 
        border="1px" 
        borderColor={'#E7EBF2'} 
        borderRadius="10px" 
        bgColor={'#fff'}
        p={5} 
        mb={6}
      >
        <Flex mb={5} flexWrap="wrap" gap={2}>
          {
            activeAction === 'WithdrawL2' ?
            <Flex
              color={'#1c1c1c'}
              fontFamily={'Open Sans'}
              fontSize={'12px'}
              fontWeight={600}
              alignItems={'center'}
              h={'28px'}
            >
              <Flex alignItems={'center'}>
                <Flex w={'28px'} mr={'6px'}>
                  <Image src={ETH} alt={''} />
                </Flex>
                Ethereum
              </Flex>
              <Flex w={'18px'} mx={'6px'}>
                <Image src={ARROW} alt={''} />
              </Flex>
              <Flex>
                {currentOperator?.name}
              </Flex>
            </Flex> :
            <TokenTypeSelector 
              tab={activeToken}
              setTab={setActiveToken}
            />
          }
          <Text 
            ml="auto"
            mt={'3px'}
            color={'#7E7E8F'}
            fontSize={'12px'}
            fontWeight={400}
          >
            Balance: {formatUnits(tonBalance || '0', 18)} TON
          </Text>
        </Flex>

        <Flex mb={'15px'} align="center" justifyContent={'space-between'}  flexDir={'row'} h={'90px'}>
          {
            activeAction === 'Withdraw' || activeAction === 'Restake' || activeAction === 'WithdrawL1' ?
            <Flex
              fontSize={'30px'}
              fontFamily={'Open Sans'}
              fontWeight={600}
              ml={'15px'}
            >
              {formatUnits(activeAction === 'Withdraw' || activeAction === 'WithdrawL1'  ? withdrawableAmount : pendingUnstaked, 27)}
            </Flex>
            :
            <BalanceInput 
              placeHolder={'0.00'}
              type={'staking'}
              // maxValue={stakedAmount ? stakedAmount.replace(/\,/g,'') : '0.00'}
              maxValue={formatUnits(tonBalance, 18)}
            />
          }
          <Flex align="center" mr={'15px'}>
            <Image src={ activeToken === 'TON' ? TON_SYMBOL : WTON_SYMBOL} alt={''}/>
            <Text 
              fontSize={'18px'} 
              fontWeight="bold"
              ml={'9px'}
              mt={'2px'}
            >
              {activeToken}
            </Text>
          </Flex>
        </Flex>

        <Button 
          onClick={() => onClick()}
          {...mainButtonStyle(value)}
        >
          {txPending ? <Spinner /> : getButtonText()}
        </Button>

        <VStack spacing={6} align="stretch">
          <ValueSection 
            title={'Your Staked amount'}
            value={currentOperator?.yourStaked || '0'}      
          />
          <Divider />
          <ValueSection 
            title={'Unclaimed Staking Reward'}
            value={expectedSeig}
            onClaim={() => updateSeig()}
            isLoading={seigLoading}
            seigUpdated={lastSeigBlock ?? undefined}
          />
        
        </VStack>
      </Box>
      {
        isL2 ?
        <VStack>
          <Flex 
            fontSize={'16px'} 
            fontWeight={700} 
            color={'#1c1c1c'} 
            justifyContent={'center'} 
            w={'100%'}
          >
            Sequencer seigniorage
          </Flex>
          <Box
            border="1px" 
            borderColor={'#E7EBF2'} 
            borderRadius="10px" 
            bgColor={'#fff'}
            p={5} 
            mb={6}
            w={'100%'}
          >
            <VStack spacing={6} align="stretch">
              <ValueSection 
                title={'TON Bridged to L2'}
                value={layer2Reward?.layer2Tvl.toString() || '0'}
              />
              <Divider />
              <ValueSection 
                title={'Claimable seigniorage'}
                value={claimableAmount?.toString() || '0'}
                onClaim={() => updateSeig({args: [operatorAddress]})}
              />
            </VStack>
          </Box>
        </VStack> : ''
      }
      { 
        activeAction === 'Stake' &&
        <Text fontSize="sm" color={'#3E495C'} textAlign="center" px={4} fontWeight={400} w={'100%'}>
          <Text as="span" color={'#FF2D78'}>Warning:</Text> Staking TON will earn you TON staking rewards. However, you have to unstake and wait for 93,046 blocks (~14 days) to withdraw.
        </Text>
      }
      {/* {
        isL2 && activeAction === 'Withdraw' && withdrawTarget === 'L2' && 
        <Text fontSize="sm" color={'#3E495C'} textAlign="center" px={4} fontWeight={400} w={'100%'}>
          <Text as="span" color={'#257EEE'}>Note:</Text> Withdrawing to L2 is faster but may have different fee structures compared to Ethereum Mainnet.
        </Text>
      }
      {
        isL2 && activeAction === 'Withdraw' && withdrawTarget === 'Ethereum' && 
        <Text fontSize="sm" color={'#3E495C'} textAlign="center" px={4} fontWeight={400} w={'100%'}>
          <Text as="span" color={'#FF2D78'}>Wargning:</Text> Staking TON will earn you TON staking rewards. However, you have to unstake and wait for 93,046 blocks (~14 days) to withdraw.
        </Text>
      } */}
    </Flex>
  );
};