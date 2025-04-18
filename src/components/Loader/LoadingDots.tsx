//@ts-ignore
import { Dot, SmallDot } from './dot';
import { Flex } from '@chakra-ui/react';

export const LoadingDots = (args: {size?: string}) => {
  const { size } = args;
  return (
    <Flex >
      {
        size === 'small' ? (
          <SmallDot />
        ) : (
          <Dot />
        )
      }
      {
        size === 'small' ? (
          <SmallDot />
        ) : (
          <Dot />
        )
      }
      {
        size === 'small' ? (
          <SmallDot />
        ) : (
          <Dot />
        )
      }
    </Flex>
  );
};
