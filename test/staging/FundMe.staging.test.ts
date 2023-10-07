import { deployments, ethers, network } from "hardhat"
import { Signer } from "ethers"
import { assert } from "chai"
import { FundMe } from "../../typechain-types"
import { developmentChains } from "../../helper-hardhad.config"

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
          const sendValue = ethers.parseEther("0.05") //"1000000000000000000" // 1 ETH

          let fundMe: FundMe
          let signer: Signer

          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              signer = accounts[0]

              const FundMeDeployment = await deployments.get("FundMe")
              fundMe = (await ethers.getContractAt(
                  FundMeDeployment.abi,
                  FundMeDeployment.address,
                  signer
              )) as any as FundMe
          })

          it("allows people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()
              const endingBalance = await ethers.provider.getBalance(
                  await fundMe.getAddress()
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
