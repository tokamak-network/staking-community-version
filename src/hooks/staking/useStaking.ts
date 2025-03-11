import CONTRACT_ADDRESS from "@/constant/contracts";
import TON from '@/abis/TON.json';
import WTON from '@/abis/WTON.json';
import DepositManager from '@/abis/DepositManager.json';
import { getContract } from "viem";
import { useAccount, usePublicClient, useContractWrite } from "wagmi";
import { useCallback } from "react";
import { marshalString, unmarshalString } from "@/utils/format/marshalString";
import { padLeft } from 'web3-utils';
import { convertToWei } from "@/utils/number/convert";


const {
  TON_ADDRESS,
  WTON_ADDRESS,
  DepositManager_ADDRESS,
} = CONTRACT_ADDRESS;

export default function useStakeTON() {
  // const { account } = useAccount();
  // const marshalData = getData(layer2);
  // const publicClient = usePublicClient();
  const {
    data: stakeTonData,
    write
  } = useContractWrite({
    address: TON_ADDRESS,
    abi: TON,
    functionName: "approveAndCall",
  })

  // const stakeTON = useCallback(async (
  //   amount: string,
  //   layer2: string
  // ) => {
  //   if (layer2) {
  //     const data = getData(layer2);
  //     const weiAmount = convertToWei(amount);
  //     stakeTONWrite({
  //       args: [CONTRACT_ADDRESS.DepositManager_ADDRESS, weiAmount, data]
  //     })
  //   }
  // }, [amount, layer2]);

  return { write, stakeTonData }
}
