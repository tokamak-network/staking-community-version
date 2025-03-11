import { Flex } from "@chakra-ui/react"

type TokenTypeSelectorProps = {
  tab: any
  setTab: any
}

export const TokenTypeSelector = (args: TokenTypeSelectorProps) => {
  const {tab, setTab} = args
  const mobile = false;

  return (
    <Flex
      w={mobile ? '100%' : '146px'}
      h={mobile ? '40px' : '25px'}
      p={'1px'}
      border={'solid 1px #e7ebf2'}
      borderRadius={'5px'}
      fontSize={mobile ? '13px' :'12px'}
      fontWeight={mobile ? 500 : 'normal'}
      justifyContent={'space-between'}
    >
      <Flex
        w={mobile ? '50%' : '73px'}
        textAlign={'center'}
        h={mobile ? '30px' : '22px'}
        borderRadius={'5px'}
        color={tab === 'TON' ? '#fff' : ''}
        bg={tab==="TON" ? '#2a72e5' : '#fff'}
        justifyContent={'center'}
        alignItems={'center'}
        onClick={() => setTab('TON')}
        cursor={'pointer'}
      >
        TON
      </Flex>
      <Flex
        w={mobile ? '50%' :'73px'}
        textAlign={'center'}
        h={mobile ? '30px' : '22px'}
        borderRadius={'5px'}
        color={tab === 'WTON' ? '#fff' : ''}
        bg={tab === "WTON" ? '#2a72e5' : '#fff'}
        justifyContent={'center'}
        alignItems={'center'}
        onClick={() => setTab('WTON')}
        cursor={'pointer'}
      >
        WTON
      </Flex>
    </Flex>
  )
}