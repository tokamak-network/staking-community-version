//Phase1 contract datas
//https://www.notion.so/onther/Phase1-deploy-contract-interface-b48f4c779c7043df971ddc3dac783ec8

import { REACT_APP_MODE } from "../index";
import { PUBLIC_MAINNET_RPC, PUBLIC_SEPOLIA_RPC } from "@/constant";

type CONTRACT_ADDRESSES_TYPE = {
	TON_ADDRESS:
		| "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5"
		| "0xa30fe40285b8f5c0457dbc3b7c8a280373c40044";
	WTON_ADDRESS:
		| "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2"
		| "0x79e0d92670106c85e9067b56b8f674340dca0bbd";
	Layer2Registry_ADDRESS:
		| "0x7846c2248a7b4de77e9c2bae7fbb93bfc286837b"
		| "0xA0a9576b437E52114aDA8b0BC4149F2F5c604581";
	DepositManager_ADDRESS:
		| "0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e"
		| "0x90ffcc7F168DceDBEF1Cb6c6eB00cA73F922956F";
	SeigManager_ADDRESS:
		| "0x0b55a0f463b6defb81c6063973763951712d0e5f"
		| "0x2320542ae933FbAdf8f5B97cA348c7CeDA90fAd7";
	Old_DepositManager_ADDRESS?:
		| "0x56E465f654393fa48f007Ed7346105c7195CEe43"
		| "0x0ad659558851f6ba8a8094614303F56d42f8f39A";
	Old_SeigManager_ADDRESS?:
		| "0x710936500aC59e8551331871Cbad3D33d5e0D909"
		| "0x446ece59ef429B774Ff116432bbB123f1915D9E3";
	DAO_Committiee_ADDRESS:
		| "0xDD9f0cCc044B0781289Ee318e5971b0139602C26"
		| "0xA2101482b28E3D99ff6ced517bA41EFf4971a386";
	L2Registry_ADDRESS:
		| "0x17Fa32DFf4c26cf0AC65Ff6700B57a4826513Fa0"
		| "0x3268e4D8276c58A806E83B3B080Cf29514A837cf";
	SequencerSeig_ADDRESS: "" | "0x444d593E592D52a9d41191BC0997112469D11c77";
	RollupConfig_ADDRESS:
		| "0xB8439E3939647746821dE85b0d3A50460147b292"
		| "0x6eF61974A3CDa7BbD0a4DD0A613f56d211c8AfDC";
	Layer2Manager_ADDRESS: "0x58B4C2FEf19f5CDdd944AadD8DC99cCC71bfeFDc" | "";
};

export const MAINNET: CONTRACT_ADDRESSES_TYPE = {
	TON_ADDRESS: "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5",
	WTON_ADDRESS: "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2",
	Layer2Registry_ADDRESS: "0x7846c2248a7b4de77e9c2bae7fbb93bfc286837b",
	DepositManager_ADDRESS: "0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e",
	SeigManager_ADDRESS: "0x0b55a0f463b6defb81c6063973763951712d0e5f",
	Old_DepositManager_ADDRESS: "0x56E465f654393fa48f007Ed7346105c7195CEe43",
	Old_SeigManager_ADDRESS: "0x710936500aC59e8551331871Cbad3D33d5e0D909",
	DAO_Committiee_ADDRESS: "0xDD9f0cCc044B0781289Ee318e5971b0139602C26",
	L2Registry_ADDRESS: "0x17Fa32DFf4c26cf0AC65Ff6700B57a4826513Fa0",
	SequencerSeig_ADDRESS: "",
	RollupConfig_ADDRESS: "0xB8439E3939647746821dE85b0d3A50460147b292",
	Layer2Manager_ADDRESS: "",
	// L1Messenger: "0xfd76ef26315Ea36136dC40Aeafb5D276d37944AE",
};

export const SEPOLIA: CONTRACT_ADDRESSES_TYPE = {
	TON_ADDRESS: "0xa30fe40285b8f5c0457dbc3b7c8a280373c40044",
	WTON_ADDRESS: "0x79e0d92670106c85e9067b56b8f674340dca0bbd",
	Layer2Registry_ADDRESS: "0xA0a9576b437E52114aDA8b0BC4149F2F5c604581",
	DepositManager_ADDRESS: "0x90ffcc7F168DceDBEF1Cb6c6eB00cA73F922956F",
	SeigManager_ADDRESS: "0x2320542ae933FbAdf8f5B97cA348c7CeDA90fAd7",
	Old_DepositManager_ADDRESS: "0x0ad659558851f6ba8a8094614303F56d42f8f39A",
	Old_SeigManager_ADDRESS: "0x446ece59ef429B774Ff116432bbB123f1915D9E3",
	DAO_Committiee_ADDRESS: "0xA2101482b28E3D99ff6ced517bA41EFf4971a386",
	L2Registry_ADDRESS: "0x3268e4D8276c58A806E83B3B080Cf29514A837cf",
	SequencerSeig_ADDRESS: "0x444d593E592D52a9d41191BC0997112469D11c77",
	RollupConfig_ADDRESS: "0x6eF61974A3CDa7BbD0a4DD0A613f56d211c8AfDC",
	Layer2Manager_ADDRESS: "0x58B4C2FEf19f5CDdd944AadD8DC99cCC71bfeFDc",
	// L1Messenger: "0x8ca593C92446104B4DA968786735dbd503886ed7",
	// L1Messenger_TITAN_SEPOLIA: "0x1D288952363B14B6BEEFA6A5fB2990203963F399",
};

export function getContractAddress(chainId: number): CONTRACT_ADDRESSES_TYPE {
	if (chainId === 1) return MAINNET;
	if (chainId === 11155111) return SEPOLIA;
	throw new Error("Unsupported network");
}

export function getRpcUrl(chainId: number): string {
	if (chainId === 1) return PUBLIC_MAINNET_RPC;
	if (chainId === 11155111) return PUBLIC_SEPOLIA_RPC;
	throw new Error("Unsupported network");
}
