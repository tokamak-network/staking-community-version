import CONTRACT_ADDRESS from "@/constant/contracts";
import TON from '@/abis/TON.json';
import WTON from '@/abis/WTON.json';
import DepositManager from '@/abis/DepositManager.json';
import SeigManager from '@/abis/SeigManager.json';
import { getContract } from "viem";
import { useAccount, usePublicClient, useContractWrite } from "wagmi";
import { useCallback } from "react";
import { marshalString, unmarshalString } from "@/utils/format/marshalString";
import { padLeft } from 'web3-utils';
import { convertToWei } from "@/utils/number/convert";


const {
  SeigManager_ADDRESS
} = CONTRACT_ADDRESS;

export default function useStakeTON() {

  const {
    data: updateSeigData,
    write: updateSeig
  } = useContractWrite({
    address: SeigManager_ADDRESS,
    abi: SeigManager,
    functionName: "updateSeigniorageLayer"
  })


  return { updateSeig, updateSeigData }
}
