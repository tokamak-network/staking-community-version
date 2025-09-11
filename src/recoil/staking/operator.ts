// atoms/operatorAtoms.ts
import { atom, selector } from "recoil";
import { recoilPersist } from "recoil-persist";

export interface Operator {
	name: string;
	address: string;
	totalStaked: string;
	yourStaked?: string;
	isL2?: boolean;
	sequencerSeig?: string;
	lockedInL2?: string;
	manager?: string;
	operatorAddress?: string;
}

const { persistAtom } = recoilPersist({
	key: "operators-persist",
	storage: typeof window === "undefined" ? undefined : window.localStorage,
});

export const operatorsListState = atom<Operator[]>({
	key: "operatorsListState",
	default: [],
	effects_UNSTABLE: [
		({ onSet }) => {
			onSet((newValue) => {
				if (typeof window !== "undefined") {
					const serialized = JSON.stringify(newValue, (key, value) => {
						if (typeof value === "bigint") {
							return value.toString();
						}
						return value;
					});
					window.localStorage.setItem("operators-persist", serialized);
				}
			});
		},
		persistAtom,
	],
});

export const operatorsLoadingState = atom<boolean>({
	key: "operatorsLoadingState",
	default: true,
	effects_UNSTABLE: [persistAtom],
});

// Atom for selected operator (if needed)
export const selectedOperatorState = atom<string | null>({
	key: "selectedOperatorState",
	default: null,
});

export const operatorFilterState = atom<string>({
	key: "operatorFilterState",
	default: "",
});

export const filteredOperatorsState = selector({
	key: "filteredOperatorsState",
	get: ({ get }) => {
		const operators = get(operatorsListState);
		const filter = get(operatorFilterState).toLowerCase();

		if (!filter) return operators;

		return operators.filter((operator) =>
			operator.name.toLowerCase().includes(filter),
		);
	},
});
