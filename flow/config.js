import { config } from "@onflow/fcl";

config({
  "app.detail.title": "ChainShots on Flow",
  "accessNode.api": process.env.NEXT_PUBLIC_ACCESS_NODE_API,
  "discovery.wallet": process.env.NEXT_PUBLIC_DISCOVERY_WALLET,
  "0xProfile": process.env.NEXT_PUBLIC_CONTRACT_PROFILE, // The account address where the smart contract lives
})