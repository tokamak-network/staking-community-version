import { InfoIcon } from "@chakra-ui/icons"
import { Heading, HStack, Tooltip, VStack, Text } from "@chakra-ui/react"

type HedInfoType = {
  title: string,
  value: string,
  label?: string
}

export const HeadInfo = (args: HedInfoType) => {
  const { title, value, label } = args

  return (
    <VStack align="center" spacing={1}>
      <HStack>
        <Text color="gray.500" fontSize="12px">{title}</Text>
        <Tooltip label={label}>
          <InfoIcon color="gray.400" boxSize={3} />
        </Tooltip>
      </HStack>
      <Heading fontSize={'21px'}>{value}</Heading>
    </VStack>
  )
}