"use client";

import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import commafy from "@/utils/trim/commafy";
import { Operator } from "@/recoil/staking/operator";
import React from "react";
import {
	useCandidateStake,
	useCheckCandidateType,
	useIsCandidateAddon,
	useOperatorManager,
	useUserStakeAmount,
} from "@ton-staking-sdk/react-kit";
import { getAvatarBgColor, getInitials } from "@/utils/color/getAvatarInfo";
import { LoadingDots } from "@/components/Loader/LoadingDots";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

interface OperatorItemProps {
	operator: Operator;
}

export const OperatorItem: React.FC<OperatorItemProps> = React.memo(
	({ operator }) => {
		const isL2 = operator.isL2;
		const { address } = useAccount();
		const router = useRouter();

		const navigateToOperatorDetail = () => {
			router.push(`/${operator.address}`);
		};

		return (
			<div
				className="flex items-center w-fit py-4 h-[66px] my-3 cursor-pointer overflow-x-visible"
				onClick={navigateToOperatorDetail}
			>
				<div className="w-full">
					<div className="flex items-center gap-2 mb-1">
						<h2 className="text-[#304156] text-2xl font-bold">
							{operator.name}
						</h2>
						{isL2 && (
							<div className="bg-[#257eee] w-[34px] h-[18px] rounded-[3px] flex justify-center items-center text-xs text-white font-semibold font-roboto">
								L2
							</div>
						)}
					</div>

					<div className="flex flex-col md:flex-row items-start md:items-center gap-0 md:gap-8">
						<div className="flex items-center text-[#86929D] text-[13px] font-normal">
							<span>Total Staked</span>
							<div className="ml-2 font-medium flex flex-row items-center">
								{commafy(
									ethers.utils.formatUnits(
										operator.totalStaked
											? operator.totalStaked.toString()
											: "0",
										27,
									),
									2,
								)}
								<span className="ml-1">TON</span>
							</div>
						</div>

						{operator.yourStaked && operator.yourStaked !== "0" && (
							<div className="flex items-center text-[#304156] text-[13px] font-normal ml-[15px]">
								<span>Your Staked</span>
								<div className="ml-2 font-medium flex flex-row items-center">
									{commafy(
										ethers.utils.formatUnits(
											operator.yourStaked
												? operator.yourStaked.toString()
												: "0",
											27,
										),
										2,
									)}
									<span className="ml-1">TON</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	},
);

OperatorItem.displayName = "OperatorItem";
