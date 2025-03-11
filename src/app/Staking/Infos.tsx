import {
  Box,
  Text,
  Flex,
  HStack,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { useState } from 'react';
import QUESTION_ICON from '@/assets/images/input_question_icon.svg';
import Image from 'next/image';
import { StakingInfo } from './components/StakingInfo';

export default function Infos() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Flex alignItems={"center"} h={"100%"} flexDir={'column'} w={'500px'}>
      <Text 
        fontSize="45px" 
        fontWeight={700} 
        textAlign={'left'} 
        mb={'24px'}
        w={'100%'}
      >
        TON Staking
      </Text>
          
      <Text color="#252525" fontSize={'15px'} fontWeight={300} maxW="container.md">
          Stake your TON with a DAO candidate to earn seigniorage rewards while
          delegating your voting power to help shape Tokamak Network's
          governance.
      </Text>
      
      <Flex my={'36px'} alignItems={'start'} w={'100%'} fontSize={'11px'} color={'#304156'} fontWeight={400}>
        <HStack mr={'21px'} h={'21px'}>
          <Box w={2} h={2} rounded="full" bg="blue.500" />
          <Flex fontSize="sm" flexDir={'row'}>
            <Text mr={'3px'}>
              DAO Committee Member 
            </Text>
            <Tooltip label="Information about DAO Committee Members">
              <Image src={QUESTION_ICON} alt="question icon" />
            </Tooltip>
          </Flex>
        </HStack>
        <HStack flexDir={'row'}>
          <Box w={2} h={2} rounded="full" bg="green.500" />
          <Flex fontSize="sm" flexDir={'row'}>
            <Text mr={'3px'}>
              DAO Candidate
            </Text>
            <Tooltip label="Information about DAO Candidates" >
              <Image src={QUESTION_ICON} alt="question icon" />
            </Tooltip>
          </Flex>
        </HStack>
      </Flex>
      
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        mb={'45px'}
        w={'100%'}
      >
        <StakingInfo 
          title={'Staking APY'}
          label={'Annual Percentage Yield for staking'}
          value={'25.00 - 30.40'}
          unit={'%'}
        />
        <StakingInfo 
          title={'Total staked'}
          value={'10,594,766'}
          unit={'TON'}
        />
        <StakingInfo 
          title={'Seigniorage emission'}
          label={'Daily emission of TON tokens'}
          value={'~28,224'}
          unit={'TON per day'}
        />
      </Flex>
      
      {/* <InputGroup maxW="container.md" mb={8}>
        <Input
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          rounded="full"
          borderColor={borderColor}
          _hover={{ borderColor: 'gray.300' }}
          _focus={{ borderColor: 'blue.500', boxShadow: 'outline' }}
        />
        <InputRightElement>
            <SearchIcon color="gray.400" />
        </InputRightElement>
      </InputGroup> */}
    </Flex>
  )
}