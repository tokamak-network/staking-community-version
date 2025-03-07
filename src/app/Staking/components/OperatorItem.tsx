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
import useCallOperators from '@/hooks/staking/useCallOperators';
import { ethers } from 'ethers';
import commafy from '@/utils/trim/commafy';
import { Operator } from 'recoil/operator';
import React from 'react';

interface OperatorItemProps {
  operator: Operator;
  
}

export const OperatorItem: React.FC<OperatorItemProps> = React.memo(({ operator }) => {
  const getInitials = (name: string): string => {
    if (!name) return "?";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return name.substring(0, 2).toUpperCase();
    return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
  };

  const getAvatarBgColor = (name: string): string => {
    const hue = Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360);
    const saturation = 65 + (Math.abs(name.charCodeAt(0) % 30)); 
    const lightness = 75 + (Math.abs(name.charCodeAt(name.length - 1) % 10)); 
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const isL2 = operator.name.toLowerCase().includes('sepolia');

  return (
    <Flex
      align="center"
      w="100%"
      py={4}
      h="66px"
      my={'12px'}
    >
      <Box position="relative" mr={2}>
        <Box w={2} h={2} rounded="full" bg="green.400" />
      </Box> 
      <Center 
        bg={getAvatarBgColor(operator.name)}
        borderRadius="full"
        w="50px"
        h="50px"
        mr={4}
        fontSize="lg"
        fontWeight="bold"
      >
        {getInitials(operator.name)}
      </Center>
      <Box flex="1">
        <HStack spacing={2} mb={1}>
          <Heading size="md" fontWeight="semibold">{operator.name}</Heading>
          {isL2 && (
            <Badge colorScheme="blue" fontSize="0.7em">L2</Badge>
          )}
        </HStack>
        
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          fontSize="sm" 
          color="gray.500"
          align={{ base: 'start', md: 'center' }}
          gap={{ base: 0, md: 8 }}
        >
          <Text mr={4}>Staking APY 34.56%</Text>
          
          <Flex align="center">
            <Text>Total Staked</Text>
            <Text ml={2} fontWeight="medium" color="gray.700">
              {operator.totalStaked 
                ? commafy(ethers.utils.formatUnits(operator.totalStaked, 27), 2) 
                : commafy(Math.random() * 1000000, 2)} TON
            </Text>
          </Flex>
          
          {operator.yourStaked && (
            <Flex align="center">
              <Text>Your Staked</Text>
              <Text ml={2} fontWeight="medium" color="gray.700">{operator.yourStaked} TON</Text>
            </Flex>
          )}
        </Flex>
      </Box>
    </Flex>
  );
});