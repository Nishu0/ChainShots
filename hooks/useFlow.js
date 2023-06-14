// useFlowContract.js

import { useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";

const useFlowContract = () => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const initializeContract = async () => {
      // Load the Flow contract
      try {
        const response = await fetch("../constants/contract.json");
        const contractData = await response.json();
        const contractSource = JSON.stringify(contractData);
        const loadedContract = await fcl.send([fcl.transaction`${contractSource}`]);
        setContract(loadedContract);
      } catch (error) {
        console.error("Failed to load the Flow contract:", error);
      }
    };

    // Initialize FCL
    fcl.config().put("accessNode.api", "https://access-testnet.onflow.org");

    initializeContract();
  }, []);

  return contract;
};

export default useFlowContract;
