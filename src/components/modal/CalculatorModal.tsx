import { Flex, Modal, ModalBody, ModalContent, ModalOverlay, useTheme, Text, Button, Input } from '@chakra-ui/react';
import useCalculatorModal from '@/hooks/modal/useCalculatorModal';
import { useCallback, useMemo, useState } from 'react';
import { ModalHeader } from './components/ModalHeader';
import { CalculatorBody } from './components/CalculatorBody';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Duration, durationState } from '@/recoil/duration/duration';
import { inputCalculatorBalanceState } from '@/recoil/input';
import { calculateRoi, calculateRoiBasedonCompound } from '@/utils/apy/calculateRoi';

import useCallOperators from '@/hooks/staking/useCallOperators';
import { ethers } from 'ethers';
import useTokenBalance from '@/hooks/balance/useTonBalance';
import { useStakingInformation } from '@/hooks/info/useStakingInfo';
import useCallSeigManager from '@/hooks/contracts/useCallSeigManager';
import { useAllOperatorsTotalStaked, useOperatorStake } from '@ton-staking-sdk/react-kit';

function CalculatorModal() {
  const theme = useTheme();
  const { btnStyle } = theme;
  const { closeSelectModal, isOpen } = useCalculatorModal();

  const [duration, setDuration] = useRecoilState(durationState);
  const input = useRecoilValue(inputCalculatorBalanceState);

  const { result: totalSupplyResult } = useCallSeigManager('totalSupplyOfTon');

  const [type, setType] = useState<'calculate' | 'result'>('calculate');
  const [roi, setROI] = useState('0');
  const [rewardTON, setRewardTON] = useState('0.00');

  const tonBalance = useTokenBalance('TON');

  const { data: totalStaked, isLoading, error } = useAllOperatorsTotalStaked();

  const closeThisModal = useCallback(() => {
    setType('calculate');
    setDuration('1-year');
    closeSelectModal();
  }, [closeSelectModal]);

  const calButton = useCallback(async () => {
    const inputBalance = Number(input.replace(/,/g, ''));
    console.log(totalStaked)
    
    if (totalStaked) {
      const totalStakedString = totalStaked ? ethers.utils.formatUnits(totalStaked, 27) : '0';
      const total = Number(totalStakedString.replace(/,/g, '')) + inputBalance;
      
      const totalSupplyString = totalSupplyResult?.data ? 
          ethers.utils.formatUnits(totalSupplyResult.data.toString(), 27) : '0';
      // console.log(total, totalSupplyString, totalStakedString)
      const returnRate = calculateRoiBasedonCompound({ totalStakedAmount: total, totalSupply: Number(totalSupplyString), duration });
      // console.log(returnRate)
      const expectedSeig = inputBalance * (returnRate / 100);

      // const roi = returnRate.toLocaleString(undefined, { maximumFractionDigits: 2 });
      const rewardTON = expectedSeig.toLocaleString(undefined, { maximumFractionDigits: 2 });

      setRewardTON(rewardTON);
      setROI(
        returnRate.toString()
      );
      setType('result');
    }
  }, [totalStaked, duration, input]);

  const recalcButton = useCallback(() => {
    setType('calculate');
  }, []);

  const actionButtonStyle = (isActive: boolean) => ({
    h: '38px',
    borderRadius: '4px',
    border: '1px',
    borderColor: '#E7EBF2',
    bgColor: isActive ? '#2a72e5' : 'white',
    w: '130px',
    fontSize: '12px',
    fontWeight: 600,
    color: isActive ? 'white' : '#808992',
    _hover: {
      bgColor: isActive ? '#1a62d5' : '#f5f7fa',
      borderColor: isActive ? '#1a62d5' : '#d7dbe2',
    },
    transition: 'all 0.2s ease-in-out'
  });

  // const toStakeButton = useCallback(async () => {
  //   setSelectedModal('staking');
  //   setType('calculate');
  //   setDuration('1-year');
  // }, [setSelectedModal]);

  

  return (
    <Modal isOpen={isOpen} isCentered onClose={closeThisModal}>
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
                    <CalculatorBody userBalance={tonBalance?.data?.parsedBalance} totalStaked={totalStaked} />
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
                  <Button 
                    {...actionButtonStyle(true)}
                    fontWeight={500}
                    onClick={() => calButton()}
                  >
                    Calculate
                  </Button>
                ) : (
                  <Flex flexDir={'row'}>
                    <Button
                      {...actionButtonStyle(true)}
                      mr={'10px'}
                      // onClick={() => toStakeButton()}
                    >
                      Stake
                    </Button>
                    <Button
                      {...actionButtonStyle(true)}
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
