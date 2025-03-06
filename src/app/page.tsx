"use client";

import { Flex } from "@chakra-ui/react";
import Staking from "./Staking/index";

export default function Page() {
  return (
    <Flex alignItems={"center"} h={"100%"} justifyContent={"center"}>
      <Staking />
    </Flex>
  );
}