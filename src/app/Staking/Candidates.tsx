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
import { OperatorItem } from './components/OperatorItem';
import { useAPY } from '@/hooks/staking/useAPY';

const Candidates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { operatorsList, loading } = useCallOperators();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // console.log(operatorsList)
  const a = useAPY(operatorsList[0]?.address as `0x${string}`);
  // console.log(a)

  const filteredOperators = operatorsList.filter(op => 
    op.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const repeatedOperators = [
    ...filteredOperators, 
    ...filteredOperators, 
    ...filteredOperators
  ];

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let isAdjusting = false;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = (): void => {
      if (isAdjusting) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const totalContentHeight = scrollHeight / 3;
      
      if (scrollTop < 50) {
        if (scrollTimer) clearTimeout(scrollTimer);
        
        scrollTimer = setTimeout(() => {
          isAdjusting = true;
          
          container.style.scrollBehavior = 'auto';
          container.scrollTop = totalContentHeight + scrollTop;
          
          setTimeout(() => {
            isAdjusting = false;
            container.style.scrollBehavior = 'smooth';
          }, 50);
        }, 100);
      } else if (scrollTop >= (scrollHeight - clientHeight - 50)) {
        if (scrollTimer) clearTimeout(scrollTimer);
        
        scrollTimer = setTimeout(() => {
          isAdjusting = true;
          container.style.scrollBehavior = 'auto';
          container.scrollTop = totalContentHeight - clientHeight + (scrollTop - (scrollHeight - clientHeight));
          
          setTimeout(() => {
            isAdjusting = false;
            container.style.scrollBehavior = 'smooth';
          }, 50);
        }, 100);
      }
    };
    const debouncedHandleScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(handleScroll, 10); 
    };

    container.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    
    const totalContentHeight = container.scrollHeight / 3;
    container.scrollTop = totalContentHeight + 60;
    
    container.style.scrollBehavior = 'smooth';

    return () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      container.removeEventListener('scroll', debouncedHandleScroll);
    };
  }, [filteredOperators.length]);

  return (
    <Box h="1056px" w="100%" maxW="600px" mx="auto" px={4} position="relative" >
      <Box 
        ref={scrollContainerRef}
        h="1056px" 
        maxH="1056px"
        overflowY="auto"
        mt={6} 
        position="relative"
        pt="40px" 
        pb="40px" 
        css={{
          '&::-webkit-scrollbar': {
            width: '0px', 
            display: 'none', 
          },
          'scrollbarWidth': 'none', // hide scrollbar for Firefox
          '-ms-overflow-style': 'none', // hide scrollbar for IE/Edge
          'willChange': 'scroll-position', 
          'overscrollBehavior': 'none',
        }}
      >
        <VStack 
          spacing={0} 
          align="stretch"
          style={{ willChange: 'transform' }}
        >
          {loading ? (
            <Center py={10}>Loading operators...</Center>
          ) : (
            repeatedOperators.map((operator, index) => (
              <OperatorItem 
                key={index}
                operator={operator} 
              />
            ))
          )}
        </VStack>
      </Box>
      <Box
        position="absolute"
        top="0"
        left={0}
        right={0}
        h="350px"
        pointerEvents="none"
        bgGradient="linear(to-b, rgba(250,251,252,1) 0%, rgba(250,251,252,0.9) 30%, rgba(250,251,252,0.5) 60%, transparent 100%)"
        zIndex={2}
      />
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="350px"
        pointerEvents="none"
        bgGradient="linear(to-t, rgba(250,251,252,1) 0%, rgba(250,251,252,0.9) 30%, rgba(250,251,252,0.5) 60%, transparent 100%)"
        zIndex={2}
      />
    </Box>
  );
};

export default Candidates;