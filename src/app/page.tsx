"use client";

import { Button, Flex } from "@chakra-ui/react";
import Staking from "./Staking/index";
import { useAccount, useChainId } from "wagmi";
import Image from "next/image";
import VECTOR from "@/assets/images/Vector.svg";
import { DEFAULT_NETWORK, SUPPORTED_CHAIN_IDS } from "@/constant";
import useWalletModal from "@/hooks/modal/useWalletModal";
import dynamic from "next/dynamic";
import { useRecoilState } from "recoil";
import { chainIdState } from "@/recoil/chainId";

const Candidates = dynamic(
	() => import("./Staking/index"),
	{ ssr: false }, // ← client-only
);

export default function Page() {
	const { address } = useAccount();
	const [chainId] = useRecoilState(chainIdState);
	const { onOpenSelectModal } = useWalletModal();

	return (
		<Flex alignItems={"center"} h={"100%"} justifyContent={"center"}>
			{address && SUPPORTED_CHAIN_IDS.includes(chainId || 0) ? (
				<Candidates />
			) : (
				<Flex
					w={"338px"}
					h={"208px"}
					p={"20px"}
					alignItems={"center"}
					justifyContent={"center"}
					borderRadius={"10px"}
					bgColor={"#fff"}
					border={"1px solid #e7ebf2"}
					flexDir={"column"}
				>
					<Image src={VECTOR} alt="vector" />
					<Flex
						color={"#1c1c1c"}
						fontSize={"15px"}
						fontWeight={300}
						my={"20px"}
						fontFamily={"Open Sans"}
						textAlign={"center"}
					>
						Connect your wallet to start Tokamak staking service
					</Flex>
					<Button
						w={"298px"}
						h={"40px"}
						borderRadius={"4px"}
						bgColor={"#257eee"}
						color={"#fff"}
						fontSize={"14px"}
						fontFamily={"Roboto"}
						_hover={{
							bgColor: "#1a5cbf",
						}}
						onClick={() => onOpenSelectModal()}
					>
						Connect Wallet
					</Button>
				</Flex>
			)}
		</Flex>
	);
}
