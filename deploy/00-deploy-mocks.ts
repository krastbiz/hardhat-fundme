import { network } from "hardhat";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { DECIMALS, INITIAL_ANSWER, developmentChains } from "../helper-hardhad.config";

const deployMocks = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        log("--------------------------------------------------------------------------")
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
          })
        log("Mocks deployed!")
        log("--------------------------------------------------------------------------")
    }
}

export default deployMocks
deployMocks.tags = ["all", "mocks"]

