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
import { useTx } from "../tx/useTx";


const {
  TON_ADDRESS,
  WTON_ADDRESS,
  DepositManager_ADDRESS,
  SeigManager_ADDRESS
} = CONTRACT_ADDRESS;

export default function useRestake(layer2: string) {
  const {
    data: reatakeData,
    write: restake
  } = useContractWrite({
    address: DepositManager_ADDRESS,
    abi: DepositManager,
    functionName: "redepositMulti",
  })
  
  const {} = useTx({ hash: reatakeData?.hash, layer2: layer2 as `0x${string}`  });

  return { restake, reatakeData }
}
