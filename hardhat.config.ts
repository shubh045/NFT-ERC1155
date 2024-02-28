import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv';
dotenv.config();

let TESTNET_PRIVATE_KEY = process.env.TESTNET_PRIVATE_KEY as string;
let SEPOLIA_TESTNET_RPC_URL = process.env.SEPOLIA_TESTNET_RPC_URL as string;

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 1337
    },
    sepolia: {
      url: SEPOLIA_TESTNET_RPC_URL,
      accounts: [TESTNET_PRIVATE_KEY]
    }
  },
};

export default config;
