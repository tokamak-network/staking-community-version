import QUESTION_ICON from "@/assets/images/input_question_icon.svg";
import { LoadingDots } from "@/components/Loader/LoadingDots";
import { Heading, HStack, Tooltip, VStack, Text, Flex } from "@chakra-ui/react";
import Image from "next/image";

type HedInfoType = {
	title: string;
	value: string;
	label?: string;
	isLoading?: boolean;
};

export const HeadInfo = (args: HedInfoType) => {
	const { title, value, label, isLoading } = args;

	return (
		<VStack align="center" spacing={1}>
			<HStack>
				<Text color="gray.500" fontSize="12px">
					{title}
				</Text>
				{label && (
					<Tooltip label={label} hasArrow>
						<Image src={QUESTION_ICON} alt={""} />
					</Tooltip>
				)}
			</HStack>
			<Heading fontSize={"21px"}>
				{isLoading ? (
					<Flex mr={"3px"} mt={"5px"}>
						<Flex mt={"10px"} mr={"5px"}>
							<LoadingDots size={"small"} />
						</Flex>
						TON
					</Flex>
				) : (
					value
				)}
			</Heading>
		</VStack>
	);
};
