"use client"
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Text,
  Heading,
  HStack,
  VStack,
  Input,
  IconButton,
  Divider,
  useColorModeValue,
  Icon,
  Link,
  Tooltip,
  ButtonGroup,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { ArrowBackIcon, InfoIcon } from '@chakra-ui/icons';
import { useRouter, useParams } from "next/navigation";
import { useAccount, useBalance } from 'wagmi';
// import StakingCalculator from '@/components/StakingCalculator';
import useStaking from '@/hooks/staking/useStaking';
import { useRecoilValue, useRecoilState } from 'recoil';
import { operatorsListState, filteredOperatorsState, Operator } from "recoil/operator";
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
import useTokenBalance from '@/hooks/balance/useTonBalance';
import useStakeTON from '@/hooks/staking/useStaking';
import { marshalString, unmarshalString } from '@/utils/format/marshalString';
import { padLeft } from 'web3-utils';
import { convertToRay, convertToWei, floatParser } from '@/utils/number/convert';
import { useExpectedSeig } from '@/hooks/staking/useCalculateExpectedSeig';
import useSelectOperatorModal from '@/hooks/modal/useSelectOperatorModal';
import QUESTION_ICON from '@/assets/images/input_question_icon.svg';

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
  
  useEffect(() => {  
    if (operatorAddress && operators.length > 0) {
      const operator = operators.find(op => op.address === operatorAddress);
      setCurrentOperator(operator || null);
      console.log(currentOperator)
    }
  }, [operatorAddress, operators]);
  
  const { expectedSeig, lastSeigBlock } = useExpectedSeig(operatorAddress as `0x${string}`, currentOperator?.totalStaked || '0');

  const [activeToken, setActiveToken] = useState<string>('TON');
  const [activeAction, setActiveAction] = useState<string>('Stake'); 
  const { isOpen, onOpen, onClose } = useDisclosure();

  const tonBalance = useTokenBalance(activeToken);

  const { stakeTON: _stakeTON, stakeWTON, unstake, withdraw, restake, updateSeig } = useStakeTON();

  useEffect(() => {

  }, [currentOperator]);

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
              args: [WTON_ADDRESS, weiAmount, marshalData]
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
        case 'Restake':
        default:
          return console.error("action mode is not found");
      }
    }
  }, [])

  const formatTotalStaked = useCallback((amount: string) => {
    try {
      return commafy(ethers.utils.formatUnits(amount, 27), 2);
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
  
  // L2 여부 체크
  const isL2 = currentOperator?.name.toLowerCase().includes('sepolia');

  return (
    <Container maxW="515px" py={5}>
      <Flex mb={6} align="center" justifyContent={'space-between'}>
        <Flex alignItems={'center'} onClick={() => router.back()}>
          <IconButton
            aria-label="Back"
            icon={<ArrowBackIcon />}
            variant="ghost"
          />
          Back
        </Flex>
        <Flex fontSize={'30px'} fontWeight={700} flexDir={'row'} ml={'20px'}>
          {currentOperator?.name || 'Loading...'}
          <Flex ml={'12px'} onClick={() => onOpenSelectModal()} cursor={'pointer'}>
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
          value={`${currentOperator ? formatTotalStaked(currentOperator.totalStaked) : '0'} TON`}
          label=""
        />
        <HeadInfo 
          title="Commission rate" 
          value={'10 %'}
          label=""
        />
      </Flex>

      <HStack spacing={3} mb={6} flexWrap="wrap" fontSize={'12px'} px={'18px'}>
        <Button 
          onClick={() => setActiveAction('Stake')}
          h={'32px'}
          borderRadius={'16px'}
          border={'1px'}
          borderColor={'#E7EBF2'} 
          bgColor={ activeAction === 'Stake' ? '#2a72e5' : 'white'}
          w={'80px'}
          fontSize={'12px'}
          fontWeight={600}
          color={activeAction === 'Stake' ? 'white' : '#808992'}
        >
          Stake
        </Button>
        <Button 
          // variant="outline" 
          px={8}
          onClick={() => setActiveAction('Unstake')}
          h={'32px'}
          fontSize={'12px'}
          fontWeight={600}
          borderRadius={'16px'}
          border={'1px'}
          borderColor={'#E7EBF2'} 
          bgColor={ activeAction === 'Unstake' ? '#2a72e5' : 'white'}
          w={'80px'}
          color={activeAction === 'Unstake' ? 'white' : '#808992'}
        >
          Unstake
        </Button>
        <Button 
          // variant="outline" 
          px={8}
          onClick={() => setActiveAction('Withdraw')}
          h={'32px'}
          fontSize={'12px'}
          fontWeight={600}
          borderRadius={'16px'}
          border={'1px'}
          borderColor={'#E7EBF2'} 
          bgColor={ activeAction === 'Withdraw' ? '#2a72e5' : 'white'}
          w={'80px'}
          color={activeAction === 'Withdraw' ? 'white' : '#808992'}
        >
          Withdraw
        </Button>
        <Link 
          ml="auto" 
          color="blue.500" 
          fontWeight="medium"
          cursor="pointer"
          onClick={onOpen}
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
            Balance: {tonBalance?.data?.parsedBalance || '0'} TON
          </Text>
        </Flex>

        {/* 금액 입력 */}
        <Flex mb={'15px'} align="center"  flexDir={'row'} h={'90px'}>
          <BalanceInput 
            placeHolder={'0.00'}
            type={'unstaking'}
            // maxValue={stakedAmount ? stakedAmount.replace(/\,/g,'') : '0.00'}
            maxValue={'0.00'}
          />
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
          w="full" 
          variant="outline"
          bgColor={
            value !== '0.00' && value && value === '0'
            ? '#257EEE' 
            : '#E9EDF1'
          }
          color={
            value !== '0.00' && value && value === '0' 
            ? '#fff' 
            : "#86929d"
          }
          h="60px"
          fontWeight={500}
          fontSize={'14px'}
          justifyContent="center"
          mb={6}
          isDisabled={value == '0.00' || !value || value === '0' }
          onClick={() => onClick()}
        >
          {
            value !== '0.00' && value && value === '0' 
              ? activeAction === 'Stake' ? 'Stake'
              : activeAction === 'Unstake' ? 'Unstake'
              : 'Withdraw'
              : 'Enter an amount'
          } 
        </Button>

        <VStack spacing={6} align="stretch">
          <Flex justify="space-between"  fontWeight={600} color={'#1c1c1c'}>
            <Text >Your Staked amount</Text>
            <VStack spacing={0} align="end">
              <Text fontSize={'14px'}>
                {formatTotalStaked(currentOperator?.yourStaked || '0')} TON
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
                {formatTotalStaked(expectedSeig)} TON
              </Text>
              { 
                formatTotalStaked(expectedSeig) !== '0' && (
                  <Flex 
                    fontSize={'12px'} 
                    color={'#2a72e5'} 
                    cursor={'pointer'} 
                    textAlign={'right'} 
                    fontWeight={400}
                    onClick={() => updateSeig({args: [operatorAddress]})}
                  >
                    Update Seigniorage
                  </Flex>
                )
              }
            </VStack>
          </Flex>
        </VStack>
      </Box>
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
                  {formatTotalStaked(currentOperator?.yourStaked || '0')} TON
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
                  {formatTotalStaked(expectedSeig)} TON
                </Text>
                { 
                  formatTotalStaked(expectedSeig) !== '0' && (
                    <Flex 
                      fontSize={'12px'} 
                      color={'#2a72e5'} 
                      cursor={'pointer'} 
                      textAlign={'right'} 
                      fontWeight={400}
                      onClick={() => updateSeig({args: [operatorAddress]})}
                    >
                      Claim
                    </Flex>
                  )
                }
              </VStack>
            </Flex>
          </VStack>
        </Box>
      </VStack>

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