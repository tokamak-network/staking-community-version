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
import Image from 'next/image';
import LIST_ARROW from '@/assets/images/list-arrow_icon.svg';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const operatorAddress = params?.contractAddress as string;
  
  const { address, isConnected } = useAccount();
  const toast = useToast();
  
  const operators = useRecoilValue(filteredOperatorsState);
  const [currentOperator, setCurrentOperator] = useState<Operator | null>(null);
  
  useEffect(() => {  
    if (operatorAddress && operators.length > 0) {
      const operator = operators.find(op => op.address === operatorAddress);
      setCurrentOperator(operator || null);
      console.log(currentOperator)
    }
  }, [operatorAddress, operators]);
  
  const { data: balanceData } = useBalance({
    address,
  });

  const [stakeAmount, setStakeAmount] = useState<string>('0.00');
  const [activeTab, setActiveTab] = useState<string>('TON');
  const [activeAction, setActiveAction] = useState<string>('Stake'); 
  const { isOpen, onOpen, onClose } = useDisclosure(); // 계산기 모달용

  // 스테이킹 훅 사용
  // const {
  //   stakingInfo,
  //   handleStake,
  //   handleUnstake,
  //   handleWithdraw,
  //   isStaking,
  //   isUnstaking,
  //   isWithdrawing,
  //   isStakeSuccess,
  //   isUnstakeSuccess,
  //   isWithdrawSuccess,
  // } = useStaking({
  //   contractAddress: CONTRACT_ADDRESS.DepositManager_ADDRESS as `0x${string}`,
  //   tokenDecimals: 18,
  // });

  const formatTotalStaked = useCallback((amount: string) => {
    try {
      return commafy(ethers.utils.formatUnits(amount, 27), 2);
    } catch (e) {
      return '0';
    }
  }, []);

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
          <Flex ml={'12px'}>
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
        borderRadius="md" 
        bgColor={'#fff'}
        p={5} 
        mb={6}
      >
        <Flex mb={5} flexWrap="wrap" gap={2}>
          <TokenTypeSelector 
            tab={activeTab}
            setTab={setActiveTab}
          />
          <Text 
            ml="auto" 
            color={'#7E7E8F'}
            fontSize={'12px'}
            fontWeight={400}
          >
            Balance: {balanceData ? parseFloat(balanceData.formatted).toLocaleString() : '0'} TON
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
          <Flex align="center">
            <Image src={TON_SYMBOL} alt={''}/>
            <Text 
              fontSize={'18px'} 
              fontWeight="bold"
              ml={'9px'}
              mt={'2px'}
            >
              TON
            </Text>
          </Flex>
        </Flex>

        {/* 입력 버튼 */}
        <Button 
          w="full" 
          variant="outline"
          bgColor={'#E9EDF1'}
          color="#86929d"
          h="60px"
          fontWeight="normal"
          justifyContent="center"
          mb={6}
          onClick={() => document.getElementById('amount-input')?.focus()}
        >
          Enter amount
        </Button>

        {/* 스테이킹 정보 */}
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between">
            <Text fontWeight="medium">Your Staked amount</Text>
            <VStack spacing={0} align="end">
              <Text>
                {/* {currentOperator?.yourStaked 
                  ? currentOperator.yourStaked 
                  : parseFloat(stakingInfo.stakedBalance).toLocaleString()} TON */}
              </Text>
              <Text color="gray.500">$ 
                {/* {currentOperator?.yourStaked 
                  ? (parseFloat(currentOperator.yourStaked) * 1.42).toLocaleString()
                  : (parseFloat(stakingInfo.stakedBalance) * 1.42).toLocaleString()} */}
              </Text>
            </VStack>
          </Flex>
          
          <Divider />
          
          <Flex justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">Unclaimed Staking Reward</Text>
              <Text fontSize="sm" color="gray.500">
                Seigniorage is updated {
                // formattedLastUpdate()
                }.
              </Text>
            </VStack>
            {/* <Text>{parseFloat(stakingInfo.rewards).toLocaleString()} TON</Text> */}
          </Flex>
        </VStack>
      </Box>

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