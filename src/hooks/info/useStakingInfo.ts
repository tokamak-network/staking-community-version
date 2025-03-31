import { calculateRoiBasedonCompound } from 'utils/apy/calculateRoi';
import { useState, useEffect, useRef } from 'react';
import useCallSeigManager from '../contracts/useCallSeigManager';
import useCallOperators from '../staking/useCallOperators';
import { ethers } from 'ethers';
import commafy from '@/utils/trim/commafy';

export type SupplyValueProps = {
  title: string;
  tooltip: string;
  tooltip2?: string;
  unit: string;
  value: string | number;
  dollor?: number | string;
  width?: string;
}

export function useStakingInformation() {
  const [stakingInfo, setStakingInfo] = useState<SupplyValueProps[]>([
    {
      title: "Staking APY",
      tooltip: "Staking APY varies among DAO candidates. The rate depends on how frequently stakers update seigniorage for their chosen DAO candidate, since staking rewards compound with each update.",
      value: 0,
      dollor: 0,
      unit: '%',
      width: '325px'
    },
    {
      title: "Total staked",
      tooltip: "",
      value: 0,
      dollor: 0,
      unit: 'TON'
    },
    {
      title: "Seigniorage emission",
      tooltip: "3.92 TON is minted with each Ethereum block and distributed as follows: TON stakers (74%), DAO (20%), PowerTON holders (0%), and L2 operators (6%).",
      value: 0,
      dollor: 0,
      unit: 'TON per day',
      width: '470px'
    },
  ]);
  const [roi, setROI] = useState<number>(0);
  
  // Add refs to track previous values
  const prevTotalStakedRef = useRef<string>('0');
  const prevTotalSupplyRef = useRef<string>('0');

  const { totalStaked } = useCallOperators();
  const { result: totalSupplyResult } = useCallSeigManager('totalSupplyOfTon');
  
  useEffect(() => {
    async function fetch() {
      try {
        const totalStakedString = totalStaked ? ethers.utils.formatUnits(totalStaked, 27) : '0';
        const totalSupplyString = totalSupplyResult?.data ? 
          ethers.utils.formatUnits(totalSupplyResult.data.toString(), 27) : '0';

        // Check if values have changed
        const totalStakedChanged = totalStakedString !== prevTotalStakedRef.current;
        const totalSupplyChanged = totalSupplyString !== prevTotalSupplyRef.current;
        
        // Only recalculate and update if either value has changed
        if (totalStakedChanged || totalSupplyChanged) {
          // Update refs with new values
          prevTotalStakedRef.current = totalStakedString;
          prevTotalSupplyRef.current = totalSupplyString;
          
          const calculatedRoi = calculateRoiBasedonCompound({
            totalStakedAmount: Number(totalStakedString),
            totalSupply: Number(totalSupplyString),
            duration: '1-year'
          });
          
          // Only update state if ROI has changed
          if (calculatedRoi !== roi) {
            setROI(calculatedRoi);
            console.log("calculatedRoi", calculatedRoi);
            
            setStakingInfo([
              {
                title: "Staking APY",
                tooltip: "Staking APY varies among DAO candidates. The rate depends on how frequently stakers update seigniorage for their chosen DAO candidate, since staking rewards compound with each update.",
                tooltip2: "",
                value: calculatedRoi,
                unit: '%',
                width: '325px'
              },
              {
                title: "Total staked",
                tooltip: "",
                tooltip2: "",
                value: isNaN(Number(totalStakedString)) ? '0.00' : commafy(totalStakedString, 2),
                unit: 'TON'
              },
              {
                title: "Seigniorage emission",
                tooltip: "3.92 TON is minted with each Ethereum block and distributed as follows: TON stakers (74%), DAO (20%), PowerTON holders (0%), and L2 operators (6%).",
                tooltip2: "",
                value: `~28,224`,
                unit: 'TON per day',
                width: '470px'
              },
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching staking information:", error);
      }
    }
    
    fetch();
  }, [totalStaked, totalSupplyResult, roi]);
  
  return { 
    stakingInfo,
    roi
  };
}