import { ethers } from 'hardhat'

async function main() {
    const ChainShotsContract = await ethers.getContractFactory('ChainShots')
    const DeployContract = await ChainShotsContract.deploy()

    await DeployContract.deployed()

    console.log('YouTube deployed to:', DeployContract.address)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
