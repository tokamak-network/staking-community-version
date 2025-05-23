import { LoadingDots } from "@/components/Loader/LoadingDots";
import commafy from "@/utils/trim/commafy";
import { Flex, Text, VStack } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useCallback } from "react";
import { useAccount } from "wagmi";

type ValueSectionProps = {
  title: string;
  value: string;
  seigUpdated?: string;
  isLoading?: boolean;
  manager?: string;
  onClaim?: () => void;
}
export const ValueSection = (args: ValueSectionProps) => {
  const { title, value, seigUpdated, onClaim, isLoading, manager } = args;
  const { address } = useAccount();
  const formatUnits = useCallback((amount: string, unit: number) => {
    try {
      return commafy(ethers.utils.formatUnits(amount, unit), 2);
    } catch (e) {
      return '0';
    }
  }, []);

  const updateSeigniorageStyle = {
    fontSize: '12px', 
    color: '#2a72e5', 
    cursor: 'pointer', 
    // textAlign: 'right', 
    fontWeight: 400,
    _hover: {
      color: '#1a62d5',
      textDecoration: 'underline'
    },
    transition: 'all 0.2s ease'
  };

  return (
    <Flex justify="space-between"  fontWeight={600} color={'#1c1c1c'}>
      <VStack align="start" spacing={1}>
        <Text>{title}</Text>
        {
          seigUpdated &&
          <Text fontSize="12px" color="#808992">
            Seigniorage is updated { seigUpdated }.
          </Text>
        }
      </VStack>
      <VStack spacing={0} align="end">
        <Text fontSize={'14px'}>
          <Flex justifyContent={'flex-end'} alignItems={'center'}>
            {
              isLoading ? (
                <Flex mr={'3px'}>
                  <LoadingDots size={'small'} />
                </Flex>
              ) :
              (formatUnits(value || '0', title === 'TON Bridged to L2' ? 18 : 27))
            } TON
          </Flex>
          { 
            ((onClaim && seigUpdated )|| (onClaim && manager === address)) && (
              <Flex 
                onClick={onClaim}
                {...updateSeigniorageStyle}
                justifyContent={'flex-end'}
              >
                {seigUpdated ? 'Update seigniorage' : 'Claim'}
              </Flex>
            )
          }
        </Text>
      </VStack>
    </Flex>
  )
}