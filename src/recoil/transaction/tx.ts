export enum TransactionState {
	Failed = "Failed",
	New = "New",
	Rejected = "Rejected",
	Sending = "Sending",
	Sent = "Sent",
}

export interface TxInterface {
	transactionHash: `0x${string}` | undefined;
	transactionState: "success" | "fail" | undefined;
	network: number;
	outNetwork?: number;
	isToasted: boolean;
}

import { atom, selector } from "recoil";
import { ethers } from "ethers";

export const estimatedGasFee = atom<number | undefined>({
	key: "estimatedGasFee",
	default: undefined,
});

export const transactionData = atom<any[]>({
	key: "transactionData",
	default: [],
});

export const txDataStatus = atom<{ [txHash: string]: TxInterface } | undefined>(
	{
		key: "txDataStatus",
		default: undefined,
	},
);

export const txDataSelector = selector({
	key: "txDataSelector",
	get: async ({ get }) => {
		const txData = get(txDataStatus);
	},
});

export const txPendingStatus = atom<boolean>({
	key: "txPendingStatus",
	default: false,
});

export const txHashStatus = atom<string | undefined>({
	key: "txHashStatus",
	default: undefined,
});

export const txHashLog = atom<{
	logs: ethers.utils.Result | undefined;
}>({
	key: "txHashLog",
	default: {
		logs: undefined,
	},
});
