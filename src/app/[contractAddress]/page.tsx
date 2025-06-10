"use client"
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  IconButton,
  Divider,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useRouter, useParams } from "next/navigation";
import { useAccount } from 'wagmi';
import { useRecoilValue, useRecoilState } from 'recoil';
import { filteredOperatorsState, Operator, operatorsListState } from "@/recoil/staking/operator";
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
import useStakeTON from '@/hooks/staking/useStakeTON';
import { marshalString, unmarshalString } from '@/utils/format/marshalString';
import { padLeft } from 'web3-utils';
import { convertToRay, convertToWei, floatParser } from '@/utils/number/convert';
import { useExpectedSeigs } from '@/hooks/staking/useCalculateExpectedSeig';
import useSelectOperatorModal from '@/hooks/modal/useSelectOperatorModal';
import ETH from '@/assets/images/eth.svg';
import ARROW from '@/assets/images/right_arrow.svg';
import { 
  useTONBalance,
  useWTONBalance, 
  useUserStakeAmount, 
  useExpectedSeig, 
  useLayer2RewardInfo, 
  useClaimableL2Seigniorage, 
  useCheckCandidateType, 
  useCandidateStake, 
  useIsCandidateAddon 
} from '@ton-staking-sdk/react-kit';
import { useWithdrawableLength } from '@/hooks/staking/useWithdrawable';
import useCallOperators from '@/hooks/staking/useCallOperators';
// import useStakeWTON from '@/hooks/staking/useStakeWTON';
import useRestake from '@/hooks/staking/useRestake';
import useUpdateSeig from '@/hooks/staking/useUpdateSeig';
import useWithdraw from '@/hooks/staking/useWithdraw';
import useUnstake from '@/hooks/staking/useUnstake';
import { txPendingStatus } from '@/recoil/transaction/tx';
import { useRef } from 'react';
import { useMemo } from 'react';
import useWithdrawL2 from '@/hooks/staking/useWithdrawL2';
import { ValueSection } from './components/ValueSection';
import { useStakingInformation } from '@/hooks/info/useStakingInfo';
import { mainButtonStyle } from '@/style/buttonStyle';
import { getButtonText } from '@/utils/button/getButtonText';
import { ActionSection } from './components/ActionSection';
import { boxStyle } from '@/style/boxStyle';
import useClaim from '@/hooks/staking/useClaim';
import { useWriteContract } from 'wagmi'
import TON from '@/abis/TON.json';
import { useStakeWTON } from '@/hooks/staking/useStakeWTON';
import { useTx } from '@/hooks/tx/useTx';

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
  const candidateAddress = params?.contractAddress as `0x${string}`;
  
  const { address } = useAccount();
  const toast = useToast();
  
  const operators = useRecoilValue(filteredOperatorsState);
  const [operatorsList, setOperatorsList] = useRecoilState(operatorsListState);
  const [currentOperator, setCurrentOperator] = useState<Operator | null>(null);

  const [value, setValue] = useRecoilState(inputState);
  const { onOpenSelectModal } = useSelectOperatorModal()
  const [txPending, ] = useRecoilState(txPendingStatus);

  const prevTxPendingRef = useRef(txPending);
  const { roi } = useStakingInformation();

  // const { commissionRate } = useExpectedSeigs(candidateAddress as `0x${string}`, address as `0x${string}`);
  
  const { refreshOperator } = useOperatorData();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!address) router.push('/');
  }, [address])
  
  useEffect(() => {  
    // console.log(operatorsList, candidateAddress)
    // console.log(candidateAddress && operators.length > 0, candidateAddress, operators)
    if (candidateAddress && operatorsList.length > 0) {
      const operator = operatorsList.find(op => op.address === candidateAddress);
      // console.log(operator)
      setCurrentOperator(operator || null);
    }
  }, [candidateAddress, operatorsList, txPending]);

  const { expectedSeig,  lastSeigBlock, commissionRate: commissionRates} = useExpectedSeigs(candidateAddress as `0x${string}`, currentOperator?.totalStaked || '0');
  // console.log(expSeig)
  // const { expectedSeig, lastSeigBlock, isLoading: seigLoading, commissionRates } = useExpectedSeig(
  //   candidateAddress as `0x${string}`, 
  //   BigInt(currentOperator?.totalStaked || '0'),
  //   address as `0x${string}`,
  // );

  const { layer2Reward } = useLayer2RewardInfo({ candidateAddress: candidateAddress as `0x${string}` });
  const { claimableAmount } = useClaimableL2Seigniorage({ candidateAddress: candidateAddress as `0x${string}` });

  // console.log(claimableAmount);
  // const { data: userStaked, isLoading: userStakedLoading } = useUserStakeAmount({
  //   candidateAddress: candidateAddress as `0x${string}`,
  //   accountAddress: address as `0x${string}`
  // })
  // const { data: candidateStaked, isLoading: candidateStakeLoading } = useCandidateStake({
  //   candidateAddress: candidateAddress as `0x${string}`
  // })
  // const { candidateType } = useCheckCandidateType({ candidateAddress: candidateAddress as `0x${string}` });
  // const { isCandidateAddon} = useIsCandidateAddon({ candidateAddress: currentOperator?.address as `0x${string}` });
  // console.log(isCandidateAddon);

  const [activeToken, setActiveToken] = useState<string>('TON');
  const [activeAction, setActiveAction] = useState<string>('Stake'); 
  // L2 withdrawal target selection
  const [withdrawTarget, setWithdrawTarget] = useState<string>('Ethereum');
  const [showWithdrawOptions, setShowWithdrawOptions] = useState<boolean>(false);

  const { data: tonBalance } = useTONBalance({ account: address });
  const { data: wtonBalance } = useWTONBalance({ account: address });
  
  const operatorAddressForHooks = useMemo(() => candidateAddress || '', [candidateAddress]);
  
  const { withdrawableLength, withdrawableAmount, pendingRequests, pendingUnstaked } = useWithdrawableLength(operatorAddressForHooks as `0x${string}`);
  
  const { stakeTON } = useStakeTON(operatorAddressForHooks);
  const { stakeWTON } = useStakeWTON(operatorAddressForHooks);
  const { unstake } = useUnstake(operatorAddressForHooks);
  const { restake } = useRestake(operatorAddressForHooks);
  const { withdraw } = useWithdraw(operatorAddressForHooks);
  const { withdrawL2 } = useWithdrawL2(operatorAddressForHooks);
  const { updateSeig } = useUpdateSeig(operatorAddressForHooks);
  const { claim } = useClaim(operatorAddressForHooks, currentOperator?.operatorAddress as `0x${string}`);

  useEffect(() => {
    if (prevTxPendingRef.current === true && txPending === false) {
      if (candidateAddress) {
        refreshOperator(candidateAddress);
      }
    }
    prevTxPendingRef.current = txPending;
  }, [txPending, candidateAddress]);

  useEffect(() => {
    const token = activeAction === 'Unstake' || activeAction === 'Restake' ? 'TON' : activeToken;
    setActiveToken(token); 
  }, [activeAction]);
  
  // Handle withdraw action for L2
  useEffect(() => {
    if (activeAction === 'WithdrawL2' || activeAction === 'WithdrawL1' && currentOperator?.isL2) {
      setShowWithdrawOptions(true);
    } else {
      setShowWithdrawOptions(false);
    }
  }, [activeAction, currentOperator?.isL2]);
  
  const onClick = useCallback(async () => {
    const amount = floatParser(value);
    let tx;
    // yourStaked는 27자리 단위로 들어옴
    const yourStaked = Number(currentOperator?.yourStaked ? ethers.utils.formatUnits(currentOperator.yourStaked, 27) : 0);
    if (activeAction === 'Unstake') {
      if (!amount || amount <= 0) {
        toast({ title: 'Please enter a valid amount.', status: 'warning' });
        return;
      }
      if (amount > yourStaked) {
        toast({ title: 'Unstake amount exceeds your staked amount.', status: 'error' });
        return;
      }
    }
    if (amount) {
      const weiAmount = convertToWei(amount.toString());
      const rayAmount = convertToRay(amount.toString());
      try {
        switch (activeAction) {
          case 'Stake':
            const marshalData = getData();
            const wtonMarshalData = getDataForWton();
            tx = activeToken === 'TON' 
              ? stakeTON([WTON_ADDRESS, weiAmount, marshalData])
              : stakeWTON([
                DepositManager_ADDRESS, rayAmount, wtonMarshalData
              ]);
            break;
          case 'Unstake':
            const rayAmouont = convertToRay(amount.toString());
            tx = await unstake([
              candidateAddress, rayAmouont
            ]);
            break;
          case 'Withdraw':
            tx = await withdraw([
              candidateAddress, withdrawableLength, activeToken === 'TON' ? true : false
            ]);
            break;
          case 'WithdrawL1':
            tx = await withdraw([
              candidateAddress, withdrawableLength, activeToken === 'TON' ? true : false
            ]);
            break;
          case 'WithdrawL2':
            tx = await withdrawL2([
              candidateAddress, rayAmount
            ]);
            break;
          case 'Restake':
            tx = await restake([
              candidateAddress, pendingRequests
            ]);
            break;
          default:
            console.error('action mode is not found');
        }
      } catch (err: any) {
        toast({ title: err?.message || 'Transaction failed', status: 'error' });
      }
      return tx;
    }
  }, [activeAction, withdrawableLength, value, withdrawTarget, currentOperator?.isL2, currentOperator?.yourStaked]);

  const formatUnits = useCallback((amount: string, unit: number) => {
    try {
      return commafy(ethers.utils.formatUnits(amount, unit), 2);
    } catch (e) {
      return '0';
    }
  }, []);

  const getData = useCallback(() => {
    if (candidateAddress)
      return marshalString(
        
        [DepositManager_ADDRESS, candidateAddress]
          .map(unmarshalString)
          .map((str) => padLeft(str, 64))
          .join(''),
      );
  }, [DepositManager_ADDRESS, candidateAddress]);
  
  const getDataForWton = useCallback(() => {
    if (candidateAddress) return marshalString(
      [candidateAddress]
        .map(unmarshalString)
        .map((str) => padLeft(str, 64))
        .join(''),
    )
  }, [])
  
  const isL2 = currentOperator?.isL2 || false;
  
  const isUnstakeDisabled = useCallback(() => {
    if (!currentOperator?.yourStaked) return true;
    const stakedAmount = Number(ethers.utils.formatUnits(currentOperator.yourStaked.toString(), 27));
    if (stakedAmount === 0) return true;
    if (!value || value === '0' || value === '0.00') return true;
    return value ? Number(value) > stakedAmount : true;
  }, [currentOperator?.yourStaked, value]);

  const showUnstakeWarning = useCallback(() => {
    if (!currentOperator?.yourStaked || !value) return false;
    const stakedAmount = Number(ethers.utils.formatUnits(currentOperator.yourStaked.toString(), 27));
    return value !== '0' && value !== '0.00' && Number(value) > stakedAmount;
  }, [currentOperator?.yourStaked, value]);

  console.log(expectedSeig)
  
  return (
    <Flex maxW="515px" w={'515px'} h={'100%'} mt={'300px'} py={5} flexDir={'column'} justifyContent={'start'}>
      {/* Title Section */}
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

      {/* Info Section */}
      <Flex justify="space-between" mb={8} flexWrap="wrap" gap={4} px={'15px'}>
        <HeadInfo 
          title="Staking APY" 
          value={roi.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' %'}
          label=""
        />
        <HeadInfo 
          title="Total staked" 
          value={`${formatUnits(currentOperator?.totalStaked || '0', 27)} TON`}
          isLoading={!currentOperator?.totalStaked}
          label=""
          // isLoading={candidateStakeLoading}
        />
        <HeadInfo 
          title="Commission rate" 
          value={formatUnits((commissionRates ?? 0).toString(), 25) + ' %'}
          label=""
        />
      </Flex>

      <ActionSection 
        activeAction={activeAction}
        setActiveAction={setActiveAction}
        isL2={isL2}
        setValue={setValue}
        withdrawableAmount={withdrawableAmount}
        withdrawTarget={withdrawTarget}
        pendingUnstaked={pendingUnstaked}
      />
      {/* Main Box Section */}
      <Box 
        {...boxStyle()}
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
            activeAction === 'Unstake' || activeAction === 'Restake' ? 
            <Flex h={'25px'} /> :
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
            Balance: {
              formatUnits(
                activeToken === 'TON' ? tonBalance : wtonBalance || '0', 
                activeToken === 'TON' ? 18 : 27)
            } {activeToken}
          </Text>
        </Flex>
        {/* Balance Section */}
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
              maxValue={
                activeAction === 'Stake' 
                ? activeToken === 'TON' 
                  ? formatUnits(tonBalance, 18) 
                  : formatUnits(wtonBalance, 27)
                : formatUnits(currentOperator?.yourStaked || '0', 27)
              }
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
          isDisabled={
            value === '0.00' || !value || value === '0' || 
            (activeAction === 'Unstake' && isUnstakeDisabled())
          }
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {isClient && (
            txPending ? (
              <Flex align="center" justify="center">
                <Spinner size="sm" />
              </Flex>
            ) : (
              <Flex align="center" justify="center">
                {getButtonText(value, activeAction)}
              </Flex>
            )
          )}
        </Button>

        {activeAction === 'Unstake' && showUnstakeWarning() && (
          <Text fontSize="sm" color={'#FF2D78'} textAlign="center" px={4} fontWeight={400} w={'100%'} mb={4}>
            Warning: Unstake amount exceeds your staked amount
          </Text>
        )}

        <VStack spacing={6} align="stretch">
          <ValueSection 
            title={'Your Staked Amount'}
            value={currentOperator?.yourStaked || '0'}    
            // isLoading={userStakedLoading}  
          />
          <Divider />
          <ValueSection 
            title={'Unclaimed Staking Reward'}
            value={expectedSeig}
            onClaim={() => updateSeig()}
            // isLoading={seigLoading}
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
            {...boxStyle()}
            mb={6}
            w={'100%'}
          >
            <VStack spacing={6} align="stretch">
              <ValueSection 
                title={'TON Bridged to L2'}
                value={layer2Reward?.layer2Tvl.toString() || '0'}
                label={'TON bridged to L2 is the amount of TON that has been bridged to L2.'}
              />
              <Divider />
              <ValueSection 
                title={'Claimable seigniorage'}
                value={claimableAmount?.toString() || '0'}
                onClaim={() => claim([WTON_ADDRESS, claimableAmount])}
                manager={currentOperator?.manager}
                label={'Claimable seigniorage is the amount of seigniorage that the L2 operator can claim.'}
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
      {
        activeAction === 'Unstake' && (
          <Text fontSize="sm" color={'#3E495C'} textAlign="center" px={4} fontWeight={400} w={'100%'}>
            <Text as="span" color={'#FF2D78'}>Warning:</Text> To withdraw staked TON, it needs to be unstaked first and after 93,046 blocks (~14 days) they can be withdrawn to your account.
          </Text>
        )
      }
      {
        activeAction === 'Restake' && (
          <Text fontSize="sm" color={'#3E495C'} textAlign="center" px={4} fontWeight={400} w={'100%'}>
            <Text as="span" color={'#FF2D78'}>Warning:</Text> Restaking unstaked TON earns you TON from staking. However, to withdraw, they need to be unstaked and wait for 93,046 blocks (~14 days).
          </Text>
        )
      }
    </Flex>
  );
};
