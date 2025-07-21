import { Box, Flex, HStack, Text, Tooltip } from "@chakra-ui/react";
import Image from "next/image";
import QUESTION_ICON from "@/assets/images/input_question_icon.svg";

type StakingInfoProps = {
	title: string;
	value: string;
	unit: string;
	label?: string;
};

export const StakingInfo = (args: StakingInfoProps) => {
	const { title, value, unit, label } = args;
	return (
		<Box>
			<HStack>
				<Text fontSize="112x" color="#808992" fontWeight={400}>
					{title}
				</Text>
				{label && (
					<Tooltip label={label} hasArrow>
						<Image src={QUESTION_ICON} alt="question icon" />
					</Tooltip>
				)}
			</HStack>
			<Flex fontWeight={700} fontSize="21px" flexDir={"row"} alignItems={"end"}>
				{value}
				<Text fontSize={"13px"} ml={"3px"} mb={"3px"}>
					{unit}
				</Text>
			</Flex>
		</Box>
	);
};
