require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const API_KEY = process.env.ALCHEMY_API_KEY;
const DEFAULT_OWNER = process.env.PRIVATE_KEY;
const HARDHAT1 = process.env.HARDHAT1;
const HARDHAT2 = process.env.HARDHAT2;
const HARDHAT3 = process.env.HARDHAT3;
const HARDHAT4 = process.env.HARDHAT4;
const HARDHAT5 = process.env.HARDHAT5;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    localhost: {
    },
    hardhat: {
      allowUnlimitedContractSize: true,
      hostname: "0.0.0.0"
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${API_KEY}`,
      chainId: 11155111,
      accounts: [DEFAULT_OWNER]
    },
    cc3Testnet: {
      url: 'https://rpc.cc3-testnet.creditcoin.network',
      chainId: 102031,
      accounts: [DEFAULT_OWNER, HARDHAT1, HARDHAT2, HARDHAT3, HARDHAT4, HARDHAT5],
      gas: 5000000,
      gasPrice: 20000000000,
    }
  },
  etherscan: {
    //apiKey: process.env.ETHERSCAN_API_KEY,
    apiKey: {
      cc3Testnet: "ABC"
    },
    customChains: [
      {
        network: "cc3Testnet",
        chainId: 102031,
        urls: {
          apiURL: "https://creditcoin-testnet.blockscout.com/api/",
          browserURL: "https://creditcoin-testnet.blockscout.com/",
        },
      }
    ]
    // customChains: [
    //   {
    //     network: "sepolia",
    //     chainId: 11155111,
    //     urls: {
    //       apiURL: "https://api-sepolia.etherscan.io/api",
    //       browserURL: "https://sepolia.etherscan.io/",
    //     },
    //   }
    // ]
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  }
};
