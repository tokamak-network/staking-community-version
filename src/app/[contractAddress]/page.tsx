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
} from '@chakra-ui/react';
import { ArrowBackIcon, InfoIcon } from '@chakra-ui/icons';
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
import { useExpectedSeig } from '@/hooks/staking/useCalculateExpectedSeig';
import useSelectOperatorModal from '@/hooks/modal/useSelectOperatorModal';
import QUESTION_ICON from '@/assets/images/input_question_icon.svg';
import useCalculatorModal from '@/hooks/modal/useCalculatorModal';
import { useTONBalance, useUserStakeAmount, useOperatorStake } from '@ton-staking-sdk/react-kit';
import { useWithdrawableLength } from '@/hooks/staking/useWithdrawable';
import { format } from 'path';
import useCallOperators from '@/hooks/staking/useCallOperators';
import useStakeWTON from '@/hooks/staking/useStakeWTON';
import useRestake from '@/hooks/staking/useRestake';
import useUpdateSeig from '@/hooks/staking/useUpdateSeig';
import useWithdraw from '@/hooks/staking/useWithdraw';
import useUnstake from '@/hooks/staking/useUnstake';
import { txPendingStatus } from '@/recoil/transaction/tx';

const {
  TON_ADDRESS,
  WTON_ADDRESS,
  DepositManager_ADDRESS,
} = CONTRACT_ADDRESS;

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const operatorAddress = params?.contractAddress as `0x${string}`;
  
  const { address, isConnected } = useAccount();
  const toast = useToast();
  
  const operators = useRecoilValue(filteredOperatorsState);
  const [currentOperator, setCurrentOperator] = useState<Operator | null>(null);

  const [value, setValue] = useRecoilState(inputState);
  const { onOpenSelectModal } = useSelectOperatorModal()
  const [txPending, ] = useRecoilState(txPendingStatus);
  const { refreshOperator } = useCallOperators();
  
  useEffect(() => {  
    if (operatorAddress && operators.length > 0) {
      const operator = operators.find(op => op.address === operatorAddress);
      setCurrentOperator(operator || null);
      console.log(currentOperator)
    }
  }, [operatorAddress, operators, txPending]);
  
  const { expectedSeig, lastSeigBlock } = useExpectedSeig(operatorAddress as `0x${string}`, currentOperator?.totalStaked || '0');

  const [activeToken, setActiveToken] = useState<string>('TON');
  const [activeAction, setActiveAction] = useState<string>('Stake'); 
  
  const { openCalculatorModal, isOpen } = useCalculatorModal();

  const { data: tonBalance } = useTONBalance({ account: address });
  const { data: operatorStake } = useOperatorStake({ layer2Address: (currentOperator?.address || '') as `0x${string}` })
  const { data: stakedAmount } = useUserStakeAmount({
    layer2Address: (currentOperator?.address || '') as `0x${string}`, 
    accountAddress: address  as `0x${string}` 
  })
  // console.log(operatorStake)
  const { withdrawableLength, withdrawableAmount, pendingRequests, pendingUnstaked } = useWithdrawableLength(currentOperator?.address as `0x${string}`);
  const { stakeTON: _stakeTON } = useStakeTON(currentOperator?.address || '');
  const { stakeWTON } = useStakeWTON(currentOperator?.address || '');
  const { unstake } = useUnstake(currentOperator?.address || '');
  const { restake } = useRestake(currentOperator?.address || '');
  const { withdraw } = useWithdraw(currentOperator?.address || '');
  const { updateSeig } = useUpdateSeig(currentOperator?.address || '');

  useEffect(() => {
    // ref
  }, [currentOperator]);
  // console.log(activeAction)
  const onClick = useCallback(() => {
    const amount = floatParser(value);
    console.log(amount, activeAction)
    if (amount) {
      switch (activeAction) {
        case 'Stake':
          const marshalData = getData();
          const wtonMarshalData = getDataForWton();
          const weiAmount = convertToWei(amount.toString());
          const rayAmount = convertToRay(amount.toString());
          
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
        case 'Restake':
          return restake({
            args: [operatorAddress, pendingRequests]
          })
        default:
          return console.error("action mode is not found");
      }
    }
  }, [activeAction, withdrawableLength, value])

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
  
  const isL2 = currentOperator?.name.toLowerCase().includes('sepolia');

  const actionButtonStyle = (isActive: boolean) => ({
    h: '32px',
    borderRadius: '16px',
    border: '1px',
    borderColor: '#E7EBF2',
    bgColor: isActive ? '#2a72e5' : 'white',
    w: '80px',
    fontSize: '12px',
    fontWeight: 600,
    color: isActive ? 'white' : '#808992',
    _hover: {
      bgColor: isActive ? '#1a62d5' : '#f5f7fa',
      borderColor: isActive ? '#1a62d5' : '#d7dbe2',
      transform: 'translateY(-1px)',
      boxShadow: 'sm',
    },
    transition: 'all 0.2s ease-in-out'
  });

  const mainButtonStyle = {
    w: "full",
    variant: "outline",
    bgColor: value !== '0.00' && value && value !== '0' ? '#257EEE' : '#E9EDF1',
    color: value !== '0.00' && value && value !== '0' ? '#fff' : "#86929d",
    h: "60px",
    fontWeight: 500,
    fontSize: '14px',
    justifyContent: "center",
    mb: 6,
    isDisabled: value === '0.00' || !value || value === '0',
    _hover: {
      bgColor: value !== '0.00' && value && value !== '0' ? '#1a62d5' : '#E9EDF1',
    },
    transition: 'all 0.2s ease-in-out'
  };

  const updateSeigniorageStyle = {
    fontSize: '12px', 
    color: '#2a72e5', 
    cursor: 'pointer', 
    // textAlign: 'right', 
    fontWeight: 400,
    _hover: {
      color: '#1a62d5',
      textDecoration: 'underline'
    },
    transition: 'all 0.2s ease'
  };

  return (
    <Container maxW="515px" py={5}>
      <Flex mb={6} align="center" justifyContent={'space-between'}>
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
          value={'34.56 %'}
          label=""
        />
        <HeadInfo 
          title="Total staked" 
          value={`${formatUnits(operatorStake, 27) } TON`}
          label=""
        />
        <HeadInfo 
          title="Commission rate" 
          value={'10 %'}
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
        <Button 
          onClick={() => {
            setValue(formatUnits(withdrawableAmount, 27))
            setActiveAction('Withdraw')
          }}
          {...actionButtonStyle(activeAction === 'Withdraw')}
        >
          Withdraw
        </Button>
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
          Staking Calculator
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
          <TokenTypeSelector 
            tab={activeToken}
            setTab={setActiveToken}
          />
          <Text 
            ml="auto" 
            color={'#7E7E8F'}
            fontSize={'12px'}
            fontWeight={400}
          >
            Balance: {formatUnits(tonBalance, 18) || '0'} TON
          </Text>
        </Flex>

        <Flex mb={'15px'} align="center" justifyContent={'space-between'}  flexDir={'row'} h={'90px'}>
          {
            activeAction === 'Withdraw' || activeAction === 'Restake' ?
            <Flex
              fontSize={'30px'}
              fontFamily={'Open Sans'}
              fontWeight={600}
              ml={'15px'}
            >
              {formatUnits(activeAction === 'Withdraw' ? withdrawableAmount : pendingUnstaked, 27)}
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
          {...mainButtonStyle}
        >
          {
            value !== '0.00' && value && value !== '0' 
              ? activeAction === 'Stake' ? 'Stake'
              : activeAction === 'Unstake' ? 'Unstake'
              : activeAction === 'Withdraw' ? 'Withdraw'
              : 'Restake'
              : 'Enter an amount'
          } 
        </Button>

        <VStack spacing={6} align="stretch">
          <Flex justify="space-between"  fontWeight={600} color={'#1c1c1c'}>
            <Text >Your Staked amount</Text>
            <VStack spacing={0} align="end">
              <Text fontSize={'14px'}>
                {formatUnits(stakedAmount || '0', 27)} TON
              </Text>
            </VStack>
          </Flex>
          
          <Divider />
          
          <Flex justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight={600} color={'#1c1c1c'}>Unclaimed Staking Reward</Text>
              <Text fontSize="12px" color="#808992">
                Seigniorage is updated {
                lastSeigBlock
                }.
              </Text>
            </VStack>
            <VStack>
              <Text 
                fontSize={'14px'} 
                fontWeight={600}
                textAlign={'right'} 
                w={'100%'}
              >
                {formatUnits(expectedSeig, 27)} TON
              </Text>
              { 
                formatUnits(expectedSeig, 27) !== '0' && (
                  <Flex 
                    onClick={() => updateSeig()}
                    {...updateSeigniorageStyle}
                  >
                    Update Seigniorage
                  </Flex>
                )
              }
            </VStack>
          </Flex>
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
              <Flex justify="space-between"  fontWeight={600} color={'#1c1c1c'}>
                <Text>TON Bridged to L2</Text>
                <VStack spacing={0} align="end">
                  <Text fontSize={'14px'}>
                    {formatUnits(stakedAmount || '0', 27)} TON
                  </Text>
                </VStack>
              </Flex>
              
              <Divider />
              
              <Flex justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight={600} color={'#1c1c1c'}>Claimable seigniorage</Text>
                </VStack>
                <VStack>
                  <Text 
                    fontSize={'14px'} 
                    fontWeight={600}
                    textAlign={'right'}
                    w={'100%'}
                  >
                    {formatUnits(currentOperator?.sequencerSeig || '0', 27)} TON
                  </Text>
                  { 
                    formatUnits(currentOperator?.sequencerSeig || '0', 27) !== '0' && (
                      <Flex 
                        onClick={() => updateSeig({args: [operatorAddress]})}
                        {...updateSeigniorageStyle}
                      >
                        Claim
                      </Flex>
                    )
                  }
                </VStack>
              </Flex>
            </VStack>
          </Box>
        </VStack> : ''
      }
      

      { 
        activeAction === 'Stake' &&
        <Text fontSize="sm" color={'#3E495C'} textAlign="center" px={4} fontWeight={400}>
          <Text as="span" color={'#FF2D78'}>Warning:</Text> Staking TON will earn you TON staking rewards. However, you have to unstake and wait for 93,046 blocks (~14 days) to withdraw.
        </Text>
      }
      
      {/* <StakingCalculator
        isOpen={isOpen}
        onClose={onClose}
        apy={stakingInfo.apy}
        tokenPrice={1.42} // 예시 가격
      /> */}
    </Container>
  );
};