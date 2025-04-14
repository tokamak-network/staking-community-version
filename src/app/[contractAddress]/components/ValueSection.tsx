import commafy from "@/utils/trim/commafy";
import { Flex, Text, VStack } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useCallback } from "react";

type ValueSectionProps = {
  title: string;
  value: string;
  seigUpdated?: string;
  
  onClaim?: () => void;
}
export const ValueSection = (args: ValueSectionProps) => {
  const { title, value, seigUpdated, onClaim } = args;
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
          {formatUnits(value || '0', 27)} TON
          { 
            onClaim && (
              <Flex 
                onClick={onClaim}
                {...updateSeigniorageStyle}
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