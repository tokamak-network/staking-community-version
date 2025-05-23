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

    // 전체 높이의 1/3 지점으로 초기 위치 설정
    const totalHeight = container.scrollHeight
    const segment = totalHeight / 3
    container.scrollTop = segment

    // seamless loop 처리
    const onScroll = () => {
      const top = container.scrollTop
      // 너무 위로 당겼을 때 (1/3 이하)
      if (top < segment) {
        container.scrollTop = top + segment
      }
      // 너무 아래로 당겼을 때 (2/3 이상)
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
        </VStack>
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