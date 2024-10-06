// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const config = require('../src/config.json');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens;

async function main() {
    console.log(`Fetching accounts & network...\n`)

    const { chainId } = await hre.ethers.provider.getNetwork();

    const accounts = await hre.ethers.getSigners();
    const funder = accounts[0]
    const investor1 = accounts[1]
    const investor2 = accounts[2]
    const investor3 = accounts[3]
    const recipient = accounts[4]

    let transaction;

    console.log(`Fetching token and transferring to accounts...\n`)

    const token = await hre.ethers.getContractAt('Token', config[chainId].token.address)
    console.log(`Token fetched: ${token.address}\n`)

    const investors = [
        investor1.address, 
        investor2.address, 
        investor3.address,
    ]

    // sending tokens to investors
    for (let i = 0; i < investors.length; i++) {
        transaction = await token.connect(funder).transfer(investors[i], tokens(200000))
        await transaction.wait();
    }
    console.log(`Tokens sent to investors: ${investors}`);

    const dao = await hre.ethers.getContractAt('DAO', config[chainId].dao.address)
    console.log(`DAO fetched: ${dao.address}\n`)

    const balanceFunder = await funder.getBalance();
    console.log(`Balance of Funder is: ${balanceFunder}`)

    transaction = await funder.sendTransaction({ to: dao.address, value: ether(1000), gasLimit: 30000000 })
    await transaction.wait();
    console.log(`Send funds to DAO treasury...\n`)

    for (let i = 0; i < 3; i++) {
        transaction = await dao.connect(investor1).createProposal(`Proposal ${i+1}`, ether(100), recipient.address)
        result = await transaction.wait();

        transaction = await dao.connect(investor1).vote(i + 1)
        result = await transaction.wait();
        transaction = await dao.connect(investor2).vote(i + 1)
        result = await transaction.wait();
        transaction = await dao.connect(investor3).vote(i + 1)
        result = await transaction.wait();

        transaction = await dao.connect(investor1).finalizeProposal(i + 1)
        result = await transaction.wait()

        console.log(`Created & Finalized Proposal ${i + 1}\n`) 
    }

    transaction = await dao.connect(investor1).createProposal(`Proposal 4`, ether(100), recipient.address)
    result = await transaction.wait();

    transaction = await dao.connect(investor2).vote(4)
    result = await transaction.wait();

    transaction = await dao.connect(investor3).vote(4)
    result = await transaction.wait()

    console.log(`Finished.\n`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
