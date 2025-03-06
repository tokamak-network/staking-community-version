import {
  Box,
  Heading,
  Text,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { useState } from 'react';
import { SearchIcon, InfoIcon, ArrowUpIcon } from '@chakra-ui/icons';

export default function Infos() {
  const [searchTerm, setSearchTerm] = useState('');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex alignItems={"center"} h={"100%"} flexDir={'column'} w={'500px'}>
      <Heading size="xl" mb={4}>Simple Staking</Heading>
          
      <Text color="gray.600" maxW="container.md">
          Stake your TON with a DAO candidate to earn seigniorage rewards while
          delegating your voting power to help shape Tokamak Network's
          governance.
      </Text>
      
      <Flex my={'36px'} alignItems={'start'} w={'100%'}>
        <HStack mr={'21px'} h={'21px'}>
          <Box w={2} h={2} rounded="full" bg="blue.500" />
          <Text fontSize="sm">
            DAO Committee Member 
            <Tooltip label="Information about DAO Committee Members">
              <InfoIcon ml={1} w={3} h={3} color="gray.400" />
            </Tooltip>
          </Text>
        </HStack>
        <HStack>
          <Box w={2} h={2} rounded="full" bg="green.500" />
          <Text fontSize="sm">
            DAO Candidate
            <Tooltip label="Information about DAO Candidates">
              <InfoIcon ml={1} w={3} h={3} color="gray.400" />
            </Tooltip>
          </Text>
        </HStack>
      </Flex>
      
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        mb={'45px'}
        w={'100%'}
      >
        <Box>
          <HStack>
            <Text fontSize="sm" color="gray.600">Staking APY</Text>
            <Tooltip label="Annual Percentage Yield for staking">
                <InfoIcon w={3} h={3} color="gray.400" />
            </Tooltip>
          </HStack>
          <Text fontWeight="semibold" fontSize="lg">25.00 - 30.40 %</Text>
        </Box>
        
        <Box>
          <Text fontSize="sm" color="gray.600">Total staked</Text>
          <Text fontWeight="semibold" fontSize="lg">
            10,594,766 <Text as="span" fontWeight="normal" fontSize="md" color="gray.600">TON</Text>
          </Text>
        </Box>
        
        <Box>
          <HStack>
            <Text fontSize="sm" color="gray.600">Seigniorage emission</Text>
            <Tooltip label="Daily emission of TON tokens">
                <InfoIcon w={3} h={3} color="gray.400" />
            </Tooltip>
          </HStack>
          <Text fontWeight="semibold" fontSize="lg">
            ~28,224 <Text as="span" fontWeight="normal" fontSize="md" color="gray.600">TON per day</Text>
          </Text>
        </Box>
      </Flex>
      
      <InputGroup maxW="container.md" mb={8}>
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
      </InputGroup>
    </Flex>
  )
}