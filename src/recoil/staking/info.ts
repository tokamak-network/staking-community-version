import { atom, selector } from "recoil";

export type SupplyValueProps = {
	title: string;
	tooltip: string;
	tooltip2?: string;
	unit: string;
	value: string | number;
	dollor?: number | string;
	width?: string;
};

// Default staking info values
const defaultStakingInfo: SupplyValueProps[] = [
	{
		title: "Staking APY",
		tooltip:
			"This is the annual return assuming no seigniorage distribution; if seigniorage is distributed, the actual return may be higher.",
		value: 0,
		dollor: 0,
		unit: "%",
		width: "325px",
	},
	{
		title: "Total staked",
		tooltip: "",
		value: 0,
		dollor: 0,
		unit: "TON",
	},
	{
		title: "Seigniorage emission",
		tooltip:
			"3.92 TON is minted with each Ethereum block and distributed as follows: TON stakers (74%), DAO (20%), PowerTON holders (0%), and L2 operators (6%).",
		value: 0,
		dollor: 0,
		unit: "TON per day",
		width: "470px",
	},
];

// Define the Recoil atom for staking info
export const stakingInfoState = atom<SupplyValueProps[]>({
	key: "stakingInfoState",
	default: defaultStakingInfo,
});

// Define the Recoil atom for ROI
export const roiState = atom<number>({
	key: "roiState",
	default: 0,
});

// Create a selector to get specific staking info items by title
export const stakingInfoByTitleSelector = selector({
	key: "stakingInfoByTitleSelector",
	get: ({ get }) => {
		const stakingInfo = get(stakingInfoState);

		return (title: string) => {
			return stakingInfo.find((item) => item.title === title);
		};
	},
});

// Create a selector to get APY value directly
export const stakingAPYSelector = selector({
	key: "stakingAPYSelector",
	get: ({ get }) => {
		const stakingInfo = get(stakingInfoState);
		const apyItem = stakingInfo.find((item) => item.title === "Staking APY");
		return apyItem?.value || 0;
	},
});

// Create a selector to get total staked value directly
export const totalStakedSelector = selector({
	key: "totalStakedSelector",
	get: ({ get }) => {
		const stakingInfo = get(stakingInfoState);
		const totalStakedItem = stakingInfo.find(
			(item) => item.title === "Total staked",
		);
		return totalStakedItem?.value || 0;
	},
});
