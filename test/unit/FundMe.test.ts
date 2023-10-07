import { deployments, ethers, getNamedAccounts } from "hardhat"
import { assert, expect } from "chai"
import { FundMe, MockV3Aggregator } from "../../typechain-types"
import { Signer } from "ethers"

describe("FundMe", () => {

    const sendValue = ethers.parseEther("1")//"1000000000000000000" // 1 ETH

    let fundMe: FundMe
    let deployer: string
    let mockV3Aggregator: MockV3Aggregator
    let signer: Signer
    beforeEach(async () => {
        // deployer = (await getNamedAccounts()).deployer
        const accounts = await ethers.getSigners()
        signer = accounts[0]   

        await deployments.fixture(["all"])

        // fundMe = await ethers.getContractAt("FundMe", deployer)
        // mockV3Aggregator = await ethers.getContractAt("MockV3Aggregator", deployer)

        const FundMeDeployment = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt(
          FundMeDeployment.abi,
          FundMeDeployment.address,
          signer,
        ) as any as FundMe
        const MockV3AggregatorDeployment = await deployments.get(
          "MockV3Aggregator",
        )
        mockV3Aggregator = await ethers.getContractAt(
          MockV3AggregatorDeployment.abi,
          MockV3AggregatorDeployment.address,
          signer,
        ) as any as MockV3Aggregator
    
    })

    describe("constructor", () => {
        it("sets the aggregator addresses correctly", async () => {
            const fundMeAddress = await fundMe.priceFeed()
            const mockV3AggregatorTarget =  mockV3Aggregator.target
            assert.equal(fundMeAddress, mockV3AggregatorTarget)
        })
    })

    describe("fund", () => {
        it("fails if you don't send enough ETH ", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
        })

        it("updates the amount funded data structure",async () => {
           await fundMe.fund({ value: sendValue })
           const response = await fundMe.addressToAmountFunded(await signer.getAddress())
           assert.equal(response.toString(), sendValue.toString())
        })

        it("adds funders to array of funders",async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.funders(0)
            assert.equal(response, await signer.getAddress())
        })
    })
})