import { useWriteContract } from 'wagmi';
import WTON_ABI from '@/abis/WTON.json'; 
import { useTx } from '../tx/useTx';
import CONTRACT_ADDRESS from '@/constant/contracts';

const {
  WTON_ADDRESS,
} = CONTRACT_ADDRESS;

export function useStakeWTON(layer2: string) {
  
  const { data: txData, error: writeError, writeContract } = useWriteContract();

  const stakeWTON = (args: any) => {
    return writeContract({
      address: WTON_ADDRESS,
      abi: WTON_ABI,
      functionName: 'approveAndCall',
      args: args
    });
  };

  const {} = useTx({ hash: txData, layer2: layer2 as `0x${string}`});
  
  return {
    stakeWTON,       
    writeError,
  };
}
