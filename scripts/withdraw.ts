import { ethers, getNamedAccounts } from "hardhat"

const main = async () => {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContractAt("FundMe", deployer)

    console.log("[LOG] Funding...")

    const txResponse = await fundMe.withdraw()
    await txResponse.wait(1)
    console.log("[LOG] Withdrawed!")
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
