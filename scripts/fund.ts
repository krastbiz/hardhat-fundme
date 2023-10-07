import { ethers, getNamedAccounts } from "hardhat"

const main = async () => {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContractAt("FundMe", deployer)

    console.log("[LOG] Funding Contract...")

    const txResponse = await fundMe.fund({ value: ethers.parseEther("0.05") })
    await txResponse.wait(1)
    console.log("[LOG] Funded!")
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
