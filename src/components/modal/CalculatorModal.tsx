import { Flex, Modal, ModalBody, ModalContent, ModalOverlay, useTheme, Text, Button, Input } from '@chakra-ui/react';
import useModal from '@/hooks/useModal';
import { useCallback, useMemo, useState } from 'react';
import { ModalHeader } from './components/ModalHeader';
import { CalculatorBody } from './components/CalculatorBody';
import { useRecoilState, useRecoilValue } from 'recoil';
import { durationState, selectedDurationState } from '@/atom/staking/duration';


import { useWeb3React } from '@web3-react/core';
import { inputBalanceState } from '@/recoil/input';
import { modalState } from '@/atom/global/modal';

import { calculateRoi, calculateRoiBasedonCompound } from '@/utils/apy/calculateRoi';

import useCallOperators from '@/hooks/staking/useCallOperators';
import { ethers } from 'ethers';
import useTokenBalance from '@/hooks/balance/useTonBalance';

function CalculatorModal() {
  const theme = useTheme();
  const { btnStyle } = theme;
  const { account } = useWeb3React();
  const { closeModal, isModalLoading, selectedModalData } = useModal();

  const [duration, setDuration] = useRecoilState(durationState);
  const input = useRecoilValue(inputBalanceState);
  const [selectedModal, setSelectedModal] = useRecoilState(modalState);

  const [type, setType] = useState<'calculate' | 'result'>('calculate');
  const [roi, setROI] = useState('0');
  const [rewardTON, setRewardTON] = useState('0.00');

  const tonBalance = useTokenBalance('TON');
  const { totalStaked } = useCallOperators();
  console.log(totalStaked)
  const totalStakedString = totalStaked ? ethers.utils.formatUnits(totalStaked, 27) : '0';

  const closeThisModal = useCallback(() => {
    // setResetValue();
    // setInput('0')
    setType('calculate');
    setDuration('1-year');
    closeModal();
  }, [closeModal]);

  const calButton = useCallback(async () => {
    const inputBalance = Number(input.replace(/,/g, ''));
    const totalSup = await getTotalSupply();
    
    if (totalStakedString && selectedModalData) {
      const total = Number(totalStakedString.replace(/,/g, '')) + inputBalance;

      const returnRate = calculateRoiBasedonCompound({ totalStakedAmount: total, totalSupply: totalSup, duration });
      const expectedSeig = inputBalance * (returnRate / 100);

      // const roi = returnRate.toLocaleString(undefined, { maximumFractionDigits: 2 });
      const rewardTON = expectedSeig.toLocaleString(undefined, { maximumFractionDigits: 2 });
      

      setRewardTON(rewardTON);
      setROI(
        selectedModalData.apy ?? '-',
      );
      setType('result');
    }
  }, [totalStakedString, duration, input]);

  const recalcButton = useCallback(() => {
    setType('calculate');
  }, []);

  const toStakeButton = useCallback(async () => {
    setSelectedModal('staking');
    setType('calculate');
    setDuration('1-year');
  }, [setSelectedModal]);

  const totalStakedAmount = useMemo(() => {
    //@ts-ignore
    return selectedModalData?.stakedAmount ?? undefined;
    //@ts-ignore
  }, [selectedModalData?.stakedAmount]);

  return (
    <Modal isOpen={selectedModal === 'calculator'} isCentered onClose={closeThisModal}>
      <ModalOverlay>
        <ModalContent bg={'#fff'} w={'350px'} borderRadius={'15px'} boxShadow={'0 2px 6px 0 rgba(61, 73, 93, 0.1)'}>
          <ModalBody>
            <Flex w="100%" flexDir={'column'} alignItems={'center'} py={'10px'}>
              <ModalHeader
                main={'Staking Calculator'}
                sub={'The calculation is based on monthly compounding interest.'}
                closeThisModal={closeThisModal}
              />
              <Flex
                w={'350px'}
                borderY={'1px'}
                py={'4px'}
                borderColor={'#f4f6f8'}
                flexDir={'column'}
                alignItems={'center'}
              >
                <Flex>
                  {type === 'calculate' ? (
                    <CalculatorBody userBalance={tonBalance?.data?.parsedBalance} totalStaked={totalStakedAmount} />
                  ) : (
                    <Flex flexDir={'column'} alignItems={'center'}>
                      <Text mt={'30px'} fontSize={'13px'} fontWeight={'normal'} color={'#2a72e5'}>
                        You can earn about
                      </Text>
                      <Flex flexDir={'row'} justifyContent={'center'} alignItems={'end'} mt={'18px'}>
                        <Text fontSize={'32px'} fontWeight={500} color={'#304156'} h={'43px'}>
                          {rewardTON}
                        </Text>
                        <Text ml={'5px'} fontSize={'13px'} fontWeight={500} color={'#3d495d'}>
                          TON
                        </Text>
                      </Flex>
                      <Flex
                        flexDir={'row'}
                        justifyContent={'space-between'}
                        mt={'30px'}
                        mb={'36px'}
                        h={'16px'}
                        w={'230px'}
                        fontSize={'12px'}
                        color={'#808992'}
                      >
                        <Text>{roi}%</Text> 
                      </Flex>
                    </Flex>
                  )}
                </Flex>
              </Flex>
              <Flex flexDir={'column'} alignItems={'center'} mt={'25px'}>
                {type === 'calculate' ? (
                  <Button w={'150px'} h={'38px'} fontSize={'14px'} {...btnStyle.btnAble()} onClick={() => calButton()}>
                    Calculate
                  </Button>
                ) : (
                  <Flex flexDir={'row'}>
                    <Button
                      w={'130px'}
                      h={'38px'}
                      fontSize={'14px'}
                      {...btnStyle.btnAble()}
                      mr={'10px'}
                      onClick={() => toStakeButton()}
                    >
                      Stake
                    </Button>
                    <Button
                      w={'130px'}
                      h={'38px'}
                      fontSize={'14px'}
                      {...btnStyle.btnAble()}
                      onClick={() => recalcButton()}
                    >
                      Recalculate
                    </Button>
                  </Flex>
                )}
              </Flex>
            </Flex>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
}

export default CalculatorModal;
