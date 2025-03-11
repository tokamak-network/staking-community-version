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
  TON_ADDRESS,
  WTON_ADDRESS,
  DepositManager_ADDRESS,
  SeigManager_ADDRESS
} = CONTRACT_ADDRESS;

export default function useStakeTON() {
  
  const {
    data: stakeTonData,
    write: stakeTON
  } = useContractWrite({
    address: TON_ADDRESS,
    abi: TON,
    functionName: "approveAndCall",
  })

  const {
    data: stakeWtonData,
    write: stakeWTON
  } = useContractWrite({
    address: WTON_ADDRESS,
    abi: WTON,
    functionName: "approveAndCall",
  })

  const {
    data: unstakeData,
    write: unstake
  } = useContractWrite({
    address: DepositManager_ADDRESS,
    abi: DepositManager,
    functionName: "requestWithdrawal",
  })

  const {
    data: withdrawData,
    write: withdraw
  } = useContractWrite({
    address: DepositManager_ADDRESS,
    abi: DepositManager,
    functionName: "processRequests",
  })

  const {
    data: reatakeData,
    write: restake
  } = useContractWrite({
    address: DepositManager_ADDRESS,
    abi: DepositManager,
    functionName: "redepositMulti",
  })

  const {
    data: updateSeigData,
    write: updateSeig
  } = useContractWrite({
    address: SeigManager_ADDRESS,
    abi: SeigManager,
    functionName: "updateSeigniorageLayer"
  })


  return { stakeTON, stakeTonData, stakeWTON, stakeWtonData, unstake, unstakeData, withdraw, withdrawData, restake, reatakeData, updateSeig, updateSeigData }
}
