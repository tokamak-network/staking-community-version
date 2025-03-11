// components/StakingDashboard.jsx
import {
  Box,
  Flex,
} from '@chakra-ui/react';
import Info from './Infos';
import Candidates from './Candidates';

export default function StakingDashboard() {
  
  return (
    <Flex maxW="container.xl" p={4} flexDir={'row'} h={'100%'} justifyContent={'center'} alignItems={'center'}>
      <Flex flexDir={'column'} justifyContent={'center'} alignItems={'center'} mr={'100px'}>
        <Info />
      </Flex>
      <Box mt={8}>
        <Candidates />
      </Box>
    </Flex>
  );
}