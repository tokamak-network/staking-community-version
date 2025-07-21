// Infos.tsx
import {
	Box,
	Text,
	Flex,
	HStack,
	Tooltip,
	Spinner,
	Button,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import QUESTION_ICON from "@/assets/images/input_question_icon.svg";
import Image from "next/image";
import { StakingInfo } from "./components/StakingInfo";
import { useStakingInformation } from "@/hooks/info/useStakingInfo";
import { SupplyValueProps } from "recoil/staking/info";
import useCallOperators from "@/hooks/staking/useCallOperators";

export default function Infos() {
	const [isLoading, setIsLoading] = useState(true);
	const { stakingInfo } = useStakingInformation();
	const { refreshAllOperators } = useCallOperators();

	useEffect(() => {
		if (
			stakingInfo &&
			stakingInfo.length > 0 &&
			stakingInfo[0].value !== 0 &&
			stakingInfo[0].value !== Infinity
		) {
			setIsLoading(false);
		}
	}, [stakingInfo]);

	return (
		<Flex
			alignItems="center"
			justifyContent={"center"}
			h="100%"
			flexDir="column"
			w="500px"
		>
			<Flex
				mt={"10px"}
				flexDir={"row"}
				justifyContent={"space-between"}
				alignItems={"center"}
				w={"100%"}
			>
				<Text
					fontSize="45px"
					fontWeight={700}
					textAlign="left"
					mb="24px"
					w="100%"
				>
					TON Staking
				</Text>
				{/* <Flex mr={'20px'} mb={'5px'}>
          <Button onClick={() => refreshAllOperators()}>
            refresh
          </Button>
        </Flex> */}
			</Flex>

			<Text
				color="#252525"
				fontSize="15px"
				fontWeight={300}
				maxW="container.md"
			>
				{`Stake your TON with a DAO candidate to earn seigniorage rewards while
        delegating your voting power to help shape Tokamak Network's
        governance.`}
			</Text>

			<Flex
				my="18px"
				alignItems="start"
				w="100%"
				fontSize="11px"
				color="#304156"
				fontWeight={400}
			>
				{/* <HStack mr="21px" h="21px">
          <Box w={2} h={2} rounded="full" bg="blue.500" />
          <Flex fontSize="sm" flexDir="row">
            <Text mr="3px">
              DAO Committee Member 
            </Text>
            <Tooltip label="Information about DAO Committee Members">
              <Image src={QUESTION_ICON} alt="question icon" />
            </Tooltip>
          </Flex>
        </HStack>
        <HStack flexDir="row">
          <Box w={2} h={2} rounded="full" bg="green.500" />
          <Flex fontSize="sm" flexDir="row">
            <Text mr="3px">
              DAO Candidate
            </Text>
            <Tooltip label="Information about DAO Candidates">
              <Image src={QUESTION_ICON} alt="question icon" />
            </Tooltip>
          </Flex>
        </HStack> */}
			</Flex>

			{isLoading ? (
				<Flex justify="center" align="center" w="100%" py="20px">
					<Spinner size="lg" color="blue.500" />
				</Flex>
			) : (
				<Flex
					direction={{ base: "column", md: "row" }}
					justify="space-between"
					mb="45px"
					w="100%"
				>
					{stakingInfo.map((info: SupplyValueProps, index: number) => (
						<StakingInfo
							key={index}
							title={info.title}
							label={info.tooltip}
							value={
								typeof info.value === "number"
									? info.value.toFixed(2)
									: info.value
							}
							unit={info.unit}
						/>
					))}
				</Flex>
			)}
		</Flex>
	);
}
