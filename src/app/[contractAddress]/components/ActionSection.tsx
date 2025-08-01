import {
	actionButtonStyle,
	withdrawOptionButtonStyle,
} from "@/style/buttonStyle";
import {
	Box,
	Button,
	Flex,
	HStack,
	Link,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Tooltip,
} from "@chakra-ui/react";
import Image from "next/image";
import LIST_ARROW from "@/assets/images/list-arrow_icon.svg";
import LIST_ARROW_WHITE from "@/assets/images/list-arrow_icon_white.svg";
import { formatUnits } from "viem";
import useCalculatorModal from "@/hooks/modal/useCalculatorModal";
import QUESTION_ICON from "@/assets/images/input_question_icon.svg";
import QUESTION_ICON_WHITE from "@/assets/images/input_question_icon_white.svg";

type ActionSectionProps = {
	activeAction: string;
	setActiveAction: (action: string) => void;
	isL2: boolean;
	setValue: (value: string) => void;
	withdrawableAmount: string;
	withdrawTarget: string;
	pendingUnstaked: string;
};
export const ActionSection = (args: ActionSectionProps) => {
	const {
		activeAction,
		setActiveAction,
		isL2,
		setValue,
		withdrawableAmount,
		withdrawTarget,
		pendingUnstaked,
	} = args;
	const { openCalculatorModal, isOpen } = useCalculatorModal();

	return (
		<HStack spacing={2} mb={3} flexWrap="wrap" fontSize={"12px"} px={"5px"}>
			<Button
				onClick={() => {
					setActiveAction("Stake");
					setValue("");
				}}
				{...actionButtonStyle(activeAction === "Stake")}
			>
				Stake
			</Button>
			<Button
				onClick={() => {
					setActiveAction("Unstake");
					setValue("");
				}}
				{...actionButtonStyle(activeAction === "Unstake")}
			>
				Unstake
				<Tooltip
					// ml={'10px'}
					placement="top"
					label={
						"Withdrawing TON to L2 can be done right away without unstake via Withdraw-L2."
					}
					fontSize={"12px"}
					mb={"10px"}
					p={"9px"}
					w={"260px"}
					hasArrow
				>
					<Flex ml={"5px"}>
						<Image
							src={
								activeAction === "Unstake" ? QUESTION_ICON_WHITE : QUESTION_ICON
							}
							alt={""}
						/>
					</Flex>
				</Tooltip>
			</Button>
			{isL2 ? (
				<Menu>
					<MenuButton
						w={
							activeAction === "WithdrawL1" || activeAction === "WithdrawL2"
								? "126px"
								: "97px"
						}
						{...actionButtonStyle(
							activeAction === "WithdrawL1" || activeAction === "WithdrawL2",
						)}
					>
						<Flex flexDir={"row"} justifyContent={"center"}>
							<Flex mr={"5px"}>
								{activeAction === "WithdrawL1"
									? "Withdraw - Eth"
									: activeAction === "WithdrawL2"
										? "Withdraw - L2"
										: "Withdraw"}
							</Flex>
							<Flex
								w={"10px"}
								cursor={"pointer"}
								_hover={{ transform: "scale(1.05)" }}
							>
								<Image
									src={
										activeAction === "WithdrawL1" ||
										activeAction === "WithdrawL2"
											? LIST_ARROW_WHITE
											: LIST_ARROW
									}
									alt={""}
								/>
							</Flex>
						</Flex>
					</MenuButton>
					<MenuList
						bgColor={"transparent"}
						boxShadow={"none"}
						border={"none"}
						// zIndex={-1}
					>
						<Box
							maxW={"96px"}
							bgColor={"white"}
							zIndex={100}
							borderRadius={"60x"}
							border={"1px solid #e7ebf2"}
						>
							<MenuItem
								onClick={() => {
									setValue(formatUnits(BigInt(withdrawableAmount), 27));
									setActiveAction("WithdrawL1");
								}}
								// maxW={'73px'}
								{...withdrawOptionButtonStyle(withdrawTarget === "Ethereum")}
							>
								Ethereum
							</MenuItem>
							<MenuItem
								onClick={() => {
									setActiveAction("WithdrawL2");
									setValue("");
								}}
								// w={'73px'}
								{...withdrawOptionButtonStyle(withdrawTarget === "L2")}
							>
								L2
							</MenuItem>
						</Box>
					</MenuList>
				</Menu>
			) : (
				<Button
					onClick={() => {
						setValue(formatUnits(BigInt(withdrawableAmount), 27));
						setActiveAction("Withdraw");
					}}
					{...actionButtonStyle(activeAction === "Withdraw")}
				>
					Withdraw
				</Button>
			)}
			<Button
				onClick={() => {
					setValue(formatUnits(BigInt(pendingUnstaked), 27));
					setActiveAction("Restake");
				}}
				{...actionButtonStyle(activeAction === "Restake")}
			>
				Restake
			</Button>
			<Link
				ml="auto"
				color="blue.500"
				fontWeight="medium"
				cursor="pointer"
				onClick={() => openCalculatorModal()}
				_hover={{
					color: "blue.600",
					textDecoration: "underline",
				}}
			>
				Simulator
			</Link>
		</HStack>
	);
};
