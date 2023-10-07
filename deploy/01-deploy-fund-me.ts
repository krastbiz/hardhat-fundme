import { network } from "hardhat"
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains, networkConfig } from "../helper-hardhad.config"
import verify from "../utils/verify"

const deployFundMe = async function (hre: HardhatRuntimeEnvironment) {
    console.log("[LOG] Hi!")

    const { deployments, getNamedAccounts } = hre

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId!

    // let ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // what happends when we want to change price feed oracle
    // when going for localhost or hardhat network we want to use mock
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args,
        log: true,
        waitConfirmations:
            networkConfig[network.config.chainId!].blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log(
        "--------------------------------------------------------------------------"
    )
}
export default deployFundMe
deployFundMe.tags = ["all", "fundme"]
