import React from 'react';
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalCloseButton,
  Flex,
  Text,
  Box,
  Avatar,
  VStack,
  Center
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useRecoilValue } from 'recoil';
import { filteredOperatorsState } from '@/recoil/staking/operator';
import { getAvatarBgColor, getInitials } from '@/utils/color/getAvatarInfo';
import useSelectOperatorModal from '@/hooks/modal/useSelectOperatorModal';

interface OperatorItemProps {
  name: string;
  address: string;
  onClick: (address: string) => void;
}

interface OperatorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OperatorItem: React.FC<OperatorItemProps> = ({ name, address, onClick }) => {
  return (
    <Flex 
      h={'58px'}
      py={'14px'}
      px={'10px'}
      alignItems="center" 
      cursor="pointer" 
      _hover={{ bg: 'gray.50' }}
      borderRadius="md"
      onClick={() => onClick(address)}
    >
      {/* <Center 
        bg={getAvatarBgColor(name)}
        borderRadius="full"
        w="30px"
        h="30px"
        mr={4}
        fontSize="13px"
        fontWeight={500}
      >
        {getInitials(name)}
      </Center> */}
      <Text fontSize="16px" fontWeight={600} color={'#131315'}>{name}</Text>
    </Flex>
  );
};

const OperatorSelectionModal = () => {
  const router = useRouter();
  const { isOpen, closeSelectModal } = useSelectOperatorModal();
  
  const operators = useRecoilValue(filteredOperatorsState);

  const handleSelectOperator = (address: string): void => {
    router.push(`/${address}`);
    closeSelectModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={closeSelectModal} isCentered size="md">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent borderRadius="10px" maxW="360px" p={'20px'}>
        <ModalHeader 
          borderBottomWidth="1px" 
          borderColor={'#DFE4EE'}
          color="#131315" 
          // py={4}
          fontSize="16px"
          fontWeight={600}
        >
          Select an operator
        </ModalHeader>
        <ModalCloseButton size="lg" top={3.5} />
        <ModalBody p={0} maxH="796px" overflowY="auto">
          <VStack spacing={0} align="stretch" py={2}>
            {operators.map((operator, key) => (
              <OperatorItem
                key={key}
                name={operator.name}
                address={operator.address}
                onClick={handleSelectOperator}
              />
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default OperatorSelectionModal;