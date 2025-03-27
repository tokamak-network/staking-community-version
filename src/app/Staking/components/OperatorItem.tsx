'use client'

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  Badge,
  Center,
  HStack
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import commafy from '@/utils/trim/commafy';
import { Operator } from 'recoil/operator';
import React from 'react';
import { getAvatarBgColor, getInitials } from '@/utils/color/getAvatarInfo';

interface OperatorItemProps {
  operator: Operator;
}

export const OperatorItem: React.FC<OperatorItemProps> = React.memo(({ operator }) => {
  const isL2 = operator.isL2;

  const navigateToOperatorDetail = () => {
     window.location.href = `/${operator.address}`
  };

  return (
    <Flex
      align="center"
      w="100%"
      py={4}
      h="66px"
      my={'12px'}
      cursor={'pointer'}
      onClick={navigateToOperatorDetail}
      overflowX={'visible'}
    >
      {/* <Box position="relative" mr={2}>
        <Box w={2} h={2} rounded="full" bg="green.400" />
      </Box>  */}
      {/* <Center 
        bg={getAvatarBgColor(operator.name)}
        borderRadius="full"
        w="60px"
        h="60px"
        mr={4}
        color={'#fff'}
        fontSize="14px"
        fontWeight={500}
      >
        {getInitials(operator.name)}
      </Center> */}
      <Box flex="1">
        <HStack spacing={2} mb={1}>
          <Heading color={'#304156'} fontSize="24px" fontWeight={700}>{operator.name}</Heading>
          {
            isL2 && (
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
              >
                L2
              </Flex>
            )
          }
        </HStack>
        
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          align={{ base: 'start', md: 'center' }}
          gap={{ base: 0, md: 8 }}
        >
          {/* <Text mr={4}>Staking APY 34.56%</Text> */}
          
          <Flex align="center" color={'#86929D'} fontSize={'13px'} fontWeight={400}>
            <Text>Total Staked</Text>
            <Text ml={2} fontWeight="medium">
              {operator.totalStaked 
                ? commafy(ethers.utils.formatUnits(operator.totalStaked, 27), 2) 
                : commafy(Math.random() * 1000000, 2)} TON
            </Text>
          </Flex>
          
          {operator.yourStaked && operator.yourStaked !== '0' && (
            <Flex align="center" color={'#304156'} fontSize={'13px'} fontWeight={400}>
              <Text>Your Staked</Text>
              <Text ml={2} fontWeight="medium" >
              {operator.yourStaked 
                ? commafy(ethers.utils.formatUnits(operator.yourStaked, 27), 2) 
                : ''} TON
              </Text>
            </Flex>
          )}
        </Flex>
      </Box>
    </Flex>
  );
});