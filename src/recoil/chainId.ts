// src/state/chainState.ts
import { atom } from "recoil";

export const chainIdState = atom<number | null>({
	key: "chainIdState",
	default: null,
});
