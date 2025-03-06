import DepositManager from "@/abis/DepositManager.json";
import SeigManager from "@/abis/SeigManager.json";
import Layer2Registry from "@/abis/Layer2Registry.json";
import CONTRACT_ADDRESS from "@/constant/contracts";
import { useCallback } from "react";
import { useContractRead } from "wagmi";
import useCallL2Registry from "../contracts/useCallL2Registry";

export default function useCallOperators() {
  
    
  const operators = useCallback(async () => {
    const numLayer2 = useCallL2Registry("numLayer2s");
    console.log(await numLayer2);

  }, []);

  return { operators }
}