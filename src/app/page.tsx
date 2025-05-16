"use client";

import { Button, Flex } from "@chakra-ui/react";
import Staking from "./Staking/index";
import { useAccount } from "wagmi";
import Image from "next/image";
import VECTOR from "@/assets/images/Vector.svg" 

export default function Page() {
  const { address } = useAccount();
  
  return (
    <Flex alignItems={"center"} h={"100%"} justifyContent={"center"}>
      {
        address ? (
          <Staking />
        ) : (
          <Flex
            w={'338px'}
            h={'208px'}
            p={'20px'}
            alignItems={'center'}
            justifyContent={'center'}
            borderRadius={'10px'}
            bgColor={'#fff'}
            border={'1px solid #e7ebf2'}
            flexDir={'column'}
          >
            <Image src={VECTOR} alt="vector" />
            <Flex
              color={'#1c1c1c'}
              fontSize={'15px'}
              fontWeight={300}
              my={'20px'}
              fontFamily={'Open Sans'}
              textAlign={'center'}
            >
              Connect your wallet to start Tokamak staking service
            </Flex>
            <Button
              w={'298px'}
              h={'40px'}
              borderRadius={'4px'}
              bgColor={'#257eee'}
              color={'#fff'}
              fontSize={'14px'}
              fontFamily={'Roboto'}
              _hover={{
                bgColor: '#1a5cbf',
              }}
            >
              Connect Wallet
            </Button>
          </Flex>
        )
      }
    </Flex>
  );
}