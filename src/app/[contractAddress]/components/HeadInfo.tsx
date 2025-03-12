import QUESTION_ICON from '@/assets/images/input_question_icon.svg';
import { Heading, HStack, Tooltip, VStack, Text } from "@chakra-ui/react"
import Image from 'next/image';

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
        {
          label &&
          <Tooltip label={label}>
            <Image src={QUESTION_ICON} alt={''} />
          </Tooltip>
        }
      </HStack>
      <Heading fontSize={'21px'}>{value}</Heading>
    </VStack>
  )
}