// hooks/useCallOperators.ts
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
	operatorsListState,
	operatorsLoadingState,
	Operator,
} from "@/recoil/staking/operator";
import {
	useAccount,
	useBlockNumber,
	usePublicClient,
	useWalletClient,
	useChainId,
} from "wagmi";
import { getContract, isAddress, PublicClient } from "viem";
import { BigNumber } from "ethers";
import useCallL2Registry from "../contracts/useCallL2Registry";
import Layer2Registry from "@/abis/Layer2Registry.json";
import OperatorManager from "@/abis/OperatorManager.json";
import CandidateAddon from "@/constant/abis/CandidateAddOn.json";
import SeigManager from "@/abis/SeigManager.json";
import WTON from "@/abis/WTON.json";
import TON from "@/abis/TON.json";
import Layer2Manager from "@/abis/Layer2Manager.json";
import SystemConfig from "@/abis/SystemConfig.json";
import Candidates from "@/abis/Candidate.json";
import { getContractAddress } from "@/constant/contracts";

import { useAllCandidates } from "@ton-staking-sdk/react-kit";
import trimAddress from "@/utils/trim/trim";

type SortDirection = "asc" | "desc";

const contractCache = new Map<string, any>();
const contractExistsCache = new Map<string, boolean>();
const operatorDataCache = new Map<string, Operator>();
// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function useCallOperators() {
	const [operatorsList, setOperatorsList] = useRecoilState(operatorsListState);
	const [operatorAddress, setOperatorAddress] = useState<any[]>();
	const [totalStaked, setTotalStaked] = useState("0");
	const [loading, setLoading] = useRecoilState(operatorsLoadingState);
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const { address, isConnected } = useAccount();
	const hasFetchedRef = useRef<boolean>(false);
	const isFetchingRef = useRef<boolean>(false);

	const publicClient = usePublicClient();
	const { transport, chain } = publicClient as PublicClient;
	const { data: blockNumber } = useBlockNumber();
	// Store blockNumber in ref to avoid re-triggering effects
	const blockNumberRef = useRef<bigint | undefined>(blockNumber);
	blockNumberRef.current = blockNumber;

	const { candidates: operatorAddresses, isLoading } = useAllCandidates();

	const chainId = useChainId();
	const CONTRACT_ADDRESS = getContractAddress(chainId);

	// Reset fetch flag when address or chainId changes
	useEffect(() => {
		hasFetchedRef.current = false;
	}, [address, chainId]);

	const getContractInstance = useCallback(
		(contractAddress: string, abi: any): any => {
			if (!publicClient || !contractAddress) return null;

			const cacheKey = `${contractAddress}-${abi.contractName || "unknown"}`;

			if (contractCache.has(cacheKey)) {
				return contractCache.get(cacheKey);
			}

			try {
				const contract = getContract({
					address: contractAddress as `0x${string}`,
					abi: abi.abi || abi,
					client: publicClient,
				});

				contractCache.set(cacheKey, contract);
				return contract;
			} catch (error) {
				console.error(
					`Failed to get contract instance for ${contractAddress}:`,
					error,
				);
				return null;
			}
		},
		[publicClient],
	);

	const commonContracts = useMemo(() => {
		if (!publicClient) return null;

		return {
			seigManager: getContractInstance(
				CONTRACT_ADDRESS.SeigManager_ADDRESS,
				SeigManager,
			),
			wton: getContractInstance(CONTRACT_ADDRESS.WTON_ADDRESS, WTON),
			layer2manager: getContractInstance(
				CONTRACT_ADDRESS.Layer2Manager_ADDRESS,
				Layer2Manager,
			),
			ton: getContractInstance(CONTRACT_ADDRESS.TON_ADDRESS, TON),
		};
	}, [publicClient, getContractInstance, CONTRACT_ADDRESS]);

	const checkContractExists = useCallback(
		async (address: string): Promise<boolean> => {
			try {
				if (!publicClient || !isAddress(address)) return false;

				if (contractExistsCache.has(address)) {
					return contractExistsCache.get(address) as boolean;
				}

				const code = await publicClient.getBytecode({
					address: address as `0x${string}`,
				});

				const exists = code !== null && code !== undefined && code !== "0x";
				contractExistsCache.set(address, exists);
				return exists;
			} catch (error) {
				// console.error(`Error checking contract at ${address}:`, error);
				return false;
			}
		},
		[publicClient],
	);

	const compareTotalStaked = useCallback(
		(a: Operator, b: Operator, direction: SortDirection): number => {
			try {
				const aBN = BigNumber.from(a.totalStaked || "0");
				const bBN = BigNumber.from(b.totalStaked || "0");

				if (aBN.eq(bBN)) return 0;

				if (direction === "asc") {
					return aBN.lt(bBN) ? -1 : 1;
				} else {
					return aBN.gt(bBN) ? -1 : 1;
				}
			} catch (error) {
				const aNum = Number(a.totalStaked || "0");
				const bNum = Number(b.totalStaked || "0");

				if (direction === "asc") {
					return aNum - bNum;
				} else {
					return bNum - aNum;
				}
			}
		},
		[],
	);

	const sortOperators = useCallback(
		(direction: SortDirection = sortDirection): void => {
			setOperatorsList((prevList) => {
				const newList = [...prevList];
				newList.sort((a, b) => compareTotalStaked(a, b, direction));
				return newList;
			});

			setSortDirection(direction);
		},
		[sortDirection, compareTotalStaked, setOperatorsList],
	);

	const fetchOperatorData = useCallback(
		async (opAddress: string): Promise<Operator | null> => {
			if (!opAddress || !publicClient || !commonContracts) return null;
			const { layer2manager, seigManager, wton, ton } = commonContracts;
			const currentBlockNumber = blockNumberRef.current;

			try {
				const candidateContract = getContractInstance(opAddress, Candidates);
				if (!candidateContract) return null;

				const memo = await candidateContract.read.memo().catch(() =>
					trimAddress({
						address: opAddress as string,
						firstChar: 7,
						lastChar: 4,
						dots: "....",
					}),
				);

				const userStaked = await candidateContract.read.stakedOf([address]);
				// console.log('userStaked', userStaked)

				const totalStaked = await candidateContract.read
					.totalStaked()
					.catch(() => "0");

				const candidateAddon = getContractInstance(opAddress, CandidateAddon);
				if (!candidateAddon) return null;

				let operatorAddress;
				try {
					operatorAddress = await candidateAddon.read.operator();
				} catch (error) {
					operatorAddress = null;
				}
				// console.log(memo )
				const operatorInfo: Operator = {
					name:
						typeof memo === "string"
							? memo
							: trimAddress({
									address: opAddress as string,
									firstChar: 7,
									lastChar: 4,
									dots: "....",
								}),
					address: opAddress,
					totalStaked: totalStaked,
					yourStaked: userStaked,
					isL2: false,
					operatorAddress: operatorAddress,
				};
				operatorAddress = await candidateAddon.read.operator();
				if (operatorAddress) {
					const operatorContractExists = await checkContractExists(
						operatorAddress as string,
					);

					if (operatorContractExists) {
						const operatorManager = getContractInstance(
							operatorAddress as string,
							OperatorManager,
						);
						if (operatorManager) {
							let rollupConfigAddress;
							try {
								rollupConfigAddress = await operatorManager.read.rollupConfig();
							} catch (error) {
								rollupConfigAddress = null;
							}
							let manager;
							try {
								manager = await operatorManager.read.manager();
								operatorInfo.manager = manager;
							} catch (error) {
								manager = null;
							}

							if (rollupConfigAddress) {
								try {
									const rollupConfig = getContractInstance(
										rollupConfigAddress as string,
										SystemConfig,
									);

									if (rollupConfig && layer2manager) {
										const bridgeDetail =
											await layer2manager.read.checkL1BridgeDetail([
												rollupConfigAddress,
											]);
										// console.log(memo, bridgeDetail, rollupConfigAddress);
										if (Array.isArray(bridgeDetail) && bridgeDetail[5] === 1) {
											operatorInfo.isL2 = true;

											if (
												rollupConfig &&
												ton &&
												wton &&
												seigManager &&
												currentBlockNumber
											) {
												const [bridgeAddress, wtonBalanceOfM] =
													await Promise.all([
														rollupConfig.read
															.optimismPortal()
															.catch(() => null),
														wton.read
															.balanceOf([operatorAddress])
															.catch(() => "0"),
													]);

												if (bridgeAddress) {
													const lockedInBridge = await ton.read
														.balanceOf([bridgeAddress])
														.catch(() => "0");
													operatorInfo.lockedInL2 = lockedInBridge.toString();
												}

												try {
													const estimatedDistribution =
														await seigManager.read.estimatedDistribute([
															Number(currentBlockNumber.toString()) + 1,
															opAddress,
															true,
														]);

													if (
														estimatedDistribution &&
														estimatedDistribution[7] !== undefined
													) {
														const addedWton = BigNumber.from(
															wtonBalanceOfM || "0",
														).add(
															BigNumber.from(estimatedDistribution[7] || "0"),
														);
														operatorInfo.sequencerSeig = addedWton.toString();
													}
												} catch (error) {
													console.error(
														"Error estimating distribution:",
														error,
													);
												}
											}
										}
									}
								} catch (error) {
									console.error(
										`Failed to get bridge details for ${opAddress}:`,
										error,
									);
								}
							}
						}
					}
				}

				if (!address) {
					operatorDataCache.set(opAddress, operatorInfo);
				}

				return operatorInfo;
			} catch (error) {
				console.error(`Error fetching operator data for ${opAddress}:`, error);
				return null;
			}
		},
		[
			publicClient,
			commonContracts,
			address,
			getContractInstance,
			checkContractExists,
		],
	);

	// Use a simple trigger based on when contracts are ready
	const isReady = Boolean(publicClient && commonContracts);

	useEffect(() => {
		// Skip if already fetched or currently fetching
		if (hasFetchedRef.current || isFetchingRef.current) {
			return;
		}

		// Skip if dependencies aren't ready
		if (!isReady) {
			return;
		}

		const fetchOperators = async () => {
			// Double-check to prevent race conditions
			if (hasFetchedRef.current || isFetchingRef.current) {
				return;
			}

			isFetchingRef.current = true;
			setLoading(true);

			try {
				const l2Registry = getContractInstance(
					CONTRACT_ADDRESS.Layer2Registry_ADDRESS,
					Layer2Registry,
				);
				
				if (!l2Registry) {
					console.error("Failed to get L2 registry contract");
					isFetchingRef.current = false;
					setLoading(false);
					return;
				}

				const numLayer2 = await l2Registry.read.numLayer2s();

				const chunkSize = 10;
				let totalStakedAmount = BigNumber.from(0);
				const operators: Operator[] = [];
				const layer2s = [];

				for (let i = 0; i < numLayer2; i++) {
					const layer2 = await l2Registry.read.layer2ByIndex([i]);
					layer2s.push(layer2);
				}
				setOperatorAddress(layer2s);

				for (let i = 0; i < layer2s.length; i += chunkSize) {
					const chunk = layer2s.slice(i, i + chunkSize);

					const chunkResults = await Promise.all(
						chunk.map((opAddress) => fetchOperatorData(opAddress as string)),
					);
					const validResults = chunkResults.filter(Boolean) as Operator[];
					operators.push(...validResults);

					validResults.forEach((op) => {
						totalStakedAmount = totalStakedAmount.add(
							BigNumber.from(op.totalStaked || "0"),
						);
					});
				}

				const sortedOperators = [...operators].sort((a, b) =>
					compareTotalStaked(a, b, sortDirection),
				);

				setTotalStaked(totalStakedAmount.toString());
				setOperatorsList(sortedOperators);
				hasFetchedRef.current = true;
			} catch (error) {
				console.error("Error fetching operators:", error);
				// Reset so it can retry
				hasFetchedRef.current = false;
			} finally {
				setLoading(false);
				isFetchingRef.current = false;
			}
		};

		fetchOperators();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isReady, address, chainId]);

	const refreshOperator = useCallback(
		async (candidateAddress: string) => {
			try {
				if (!publicClient || !candidateAddress) return false;

				const updatedOperator = await fetchOperatorData(candidateAddress);
				if (!updatedOperator) return false;

				setOperatorsList((prevList: Operator[]) => {
					const operatorIndex = prevList.findIndex(
						(op) => op.address === candidateAddress,
					);

					if (operatorIndex === -1) return prevList;

					const newList = [...prevList];
					newList[operatorIndex] = updatedOperator;

					return newList.sort((a, b) =>
						compareTotalStaked(a, b, sortDirection),
					);
				});

				operatorDataCache.delete(candidateAddress);

				return true;
			} catch (error) {
				console.error(`Error refreshing operator ${candidateAddress}:`, error);
				return false;
			}
		},
		[
			publicClient,
			fetchOperatorData,
			compareTotalStaked,
			sortDirection,
			setOperatorsList,
		],
	);

	const refreshAllOperators = useCallback(async () => {
		try {
			if (!publicClient) return false;

			setLoading(true);

			operatorDataCache.clear();

			const chunkSize = 10;
			const operators: Operator[] = [];
			let totalStakedAmount = BigNumber.from(0);

			for (let i = 0; i < operatorAddresses.length; i += chunkSize) {
				const chunk = operatorAddresses.slice(i, i + chunkSize);
				// console.log('b')

				const chunkResults = await Promise.all(
					chunk.map((opAddress) => fetchOperatorData(opAddress as string)),
				);

				const validResults = chunkResults.filter(Boolean) as Operator[];
				operators.push(...validResults);

				validResults.forEach((op) => {
					totalStakedAmount = totalStakedAmount.add(
						BigNumber.from(op.totalStaked || "0"),
					);
				});
			}

			const sortedOperators = [...operators].sort((a, b) =>
				compareTotalStaked(a, b, sortDirection),
			);
			setTotalStaked(totalStakedAmount.toString());
			setOperatorsList(sortedOperators);

			return true;
		} catch (error) {
			console.error("Error refreshing all operators:", error);
			return false;
		} finally {
			setLoading(false);
		}
	}, [
		publicClient,
		// operatorAddresses,
		fetchOperatorData,
		compareTotalStaked,
		sortDirection,
		setOperatorsList,
	]);

	return {
		operatorsList,
		loading,
		refreshOperator,
		refreshAllOperators,
		sortOperators,
		totalStaked,
	};
}
