"use client"
import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  Badge,
  Center,
  HStack,
  Spinner
} from '@chakra-ui/react';
import useCallOperators from '@/hooks/staking/useCallOperators';
import React from 'react';
import { OperatorItem } from './components/OperatorItem';
import { LoadingDots } from '@/components/Loader/LoadingDots';

const Candidates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const { operatorsList, loading } = useCallOperators();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  // const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredOperators = operatorsList.filter(op => 
    op.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const repeatedOperators = [
    ...filteredOperators, 
    ...filteredOperators, 
    ...filteredOperators
  ];

  useEffect(() => {
    if (!mounted) return
    const container = scrollContainerRef.current
    if (!container) return

    // Set initial position to 1/3 of total height
    const totalHeight = container.scrollHeight
    const segment = totalHeight / 3
    container.scrollTop = segment

    // Handle seamless loop
    const onScroll = () => {
      const top = container.scrollTop
      // When scrolled too high (below 1/3)
      if (top < segment) {
        container.scrollTop = top + segment
      }
      // When scrolled too low (above 2/3)
      else if (top >= segment * 2) {
        container.scrollTop = top - segment
      }
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', onScroll)
    }
  }, [mounted, operatorsList.length])


  if (!mounted) {
    return (
      <Flex justify="center" align="center" h="100vh">
          <Spinner size="lg" />
      </Flex>
    );
  }
  
  return (
    <Box 
      h="1056px"  
      // maxW="600px" 
      mx="auto" 
      px={4} 
      position="relative" 
    >
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
          scrollbarWidth: 'none', // hide scrollbar for Firefox
          msOverflowStyle: 'none', // hide scrollbar for IE/Edge
          willChange: 'scroll-position', 
          overscrollBehavior: 'none',
        }}
      >
        <Flex 
          // spaci{0} 
          // align="stretch"
          w={'100%'}
          flexDir={'column'}
          style={{ willChange: 'transform' }}
        >
          {loading ? (
            <Flex justifyContent={'center'} alignItems={"center"} h="856px">
              <Spinner size="lg" color="#2a72e5" />
            </Flex>
          ) : (
            repeatedOperators.map((operator, index) => (
              <OperatorItem 
                key={index}
                operator={operator} 
              />
            ))
          )}
        </Flex>
      </Box>
      <Box
        position="absolute"
        top="0"
        left={0}
        right={0}
        h="300px"
        pointerEvents="none"
        bgGradient="linear(to-b, rgba(250,251,252,1) 0%, rgba(250,251,252,0.9) 30%, rgba(250,251,252,0.5) 60%, transparent 100%)"
        zIndex={2}
      />
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="300px"
        pointerEvents="none"
        bgGradient="linear(to-t, rgba(250,251,252,1) 0%, rgba(250,251,252,0.9) 30%, rgba(250,251,252,0.5) 60%, transparent 100%)"
        zIndex={2}
      />
    </Box>
  );
};

export default Candidates;