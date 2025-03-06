import { useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  Badge,
  Avatar,
  AvatarBadge,
  useColorModeValue,
  SimpleGrid,
  Tooltip,
  Stack
} from '@chakra-ui/react';
import useCallOperators from '@/hooks/staking/useCallOperators';

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState('');

  const getAvatarColor = (name: string) => {
    const colors = [
      'red.400', 'orange.400', 'yellow.400', 'green.400', 
      'teal.400', 'blue.400', 'cyan.400', 'purple.400', 
      'pink.400', 'linkedin.400', 'facebook.400', 'messenger.400',
      'whatsapp.400', 'twitter.400', 'telegram.400'
    ];
    
    // Use name as seed to pick a color
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[seed % colors.length];
  };
  const { operators } = useCallOperators();
  console.log(operators);

  const stakingProjects = [
    {
      id: 'tokamak1',
      name: 'Tokamak1',
      stakingAPY: '34.56%',
      totalStaked: '8,990,253.10 TON',
      yourStaked: '1,000.00 TON',
      isL2: false,
    },
    {
      id: 'hammer-dao',
      name: 'Hammer DAO',
      stakingAPY: '34.56%',
      totalStaked: '636,558.29 TON',
      yourStaked: '',
      isL2: false,
    },
    {
      id: 'titan-sepolia',
      name: 'Titan-Sepolia',
      stakingAPY: '34.56%',
      totalStaked: '990,253.10 TON',
      yourStaked: '',
      isL2: true,
    },
    {
      id: 'thanos-sepolia',
      name: 'Thanos-Sepolia',
      stakingAPY: '34.56%',
      totalStaked: '90,253.10 TON',
      yourStaked: '',
      isL2: true,
    },
    {
      id: 'staked',
      name: 'Staked',
      stakingAPY: '34.56%',
      totalStaked: '24,968.01 TON',
      yourStaked: '1,000.00 TON',
      isL2: false,
    },
    {
      id: 'dsrv',
      name: 'DSRV',
      stakingAPY: '34.56%',
      totalStaked: '16,301.40 TON',
      yourStaked: '',
      isL2: false,
    },
    {
      id: 'dxm-corp',
      name: 'DXM Corp',
      stakingAPY: '34.56%',
      totalStaked: '2,841.65 TON',
      yourStaked: '',
      isL2: false,
    },
    {
      id: 'despread',
      name: 'DeSpread',
      stakingAPY: '34.56%',
      totalStaked: '2,828.72 TON',
      yourStaked: '',
      isL2: false,
    },
    {
      id: 'decipher',
      name: 'decipher',
      stakingAPY: '34.56%',
      totalStaked: '2,529.87 TON',
      yourStaked: '',
      isL2: false,
    },
    {
      id: 'danal-fintech',
      name: 'Danal Fintech',
      stakingAPY: '34.56%',
      totalStaked: '14,947.54 TON',
      yourStaked: '',
      isL2: false,
    },
    {
      id: 'tokent',
      name: 'Tokent',
      stakingAPY: '34.56%',
      totalStaked: '0 TON',
      yourStaked: '',
      isL2: false,
    },
  ];

  const filteredProjects = stakingProjects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgHover = useColorModeValue('gray.50', 'gray.700');

  return (
    <VStack spacing={4} align="stretch" mb={8}>
      {filteredProjects.map((project) => (
        <Flex
          key={project.id}
          align="center"
          
          rounded="md"
          p={4}
          transition="all 0.2s"
          _hover={{ bg: bgHover, boxShadow: 'sm' }}
        >
          <Box position="relative" mr={4}>
            <Box w={2} h={2} rounded="full" bg="green.500" />
          </Box>
          
          <Avatar 
            size="md" 
            name={project.name} 
            bgColor={getAvatarColor(project.name)}
            mr={4}
          />
          
          <Box flex="1">
            <Flex align="center" mb={2}>
              <Heading size="sm" mr={2}>{project.name}</Heading>
              {project.isL2 && (
                <Badge colorScheme="blue" fontSize="0.7em">L2</Badge>
              )}
            </Flex>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box>
                <Text fontSize="xs" color="gray.500">Staking APY</Text>
                <Text fontSize="sm" fontWeight="medium">{project.stakingAPY}</Text>
              </Box>
              
              <Box>
                <Text fontSize="xs" color="gray.500">Total Staked</Text>
                <Text fontSize="sm" fontWeight="medium">{project.totalStaked}</Text>
              </Box>
              
              {project.yourStaked && (
                <Box>
                  <Text fontSize="xs" color="gray.500">Your Staked</Text>
                  <Text fontSize="sm" fontWeight="medium">{project.yourStaked}</Text>
                </Box>
              )}
            </SimpleGrid>
          </Box>
        </Flex>
      ))}
    </VStack>
  );
}