// components/StakingDashboard.jsx
import { useState } from 'react';
import {
  Box,
  Flex,
} from '@chakra-ui/react';
import Info from './Infos';
import Candidates from './Candidates';

export default function StakingDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Function to generate consistent colors based on name
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