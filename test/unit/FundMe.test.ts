import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { assert, expect } from "chai"
import { FundMe, MockV3Aggregator } from "../../typechain-types"
import { Signer } from "ethers"
import { developmentChains } from "../../helper-hardhad.config"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
          const sendValue = ethers.parseEther("1") //"1000000000000000000" // 1 ETH

          let fundMe: FundMe
          let mockV3Aggregator: MockV3Aggregator
          let signer: Signer
          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              signer = accounts[0]

              await deployments.fixture(["all"])

              const FundMeDeployment = await deployments.get("FundMe")
              fundMe = (await ethers.getContractAt(
                  FundMeDeployment.abi,
                  FundMeDeployment.address,
                  signer
              )) as any as FundMe
              const MockV3AggregatorDeployment = await deployments.get(
                  "MockV3Aggregator"
              )
              mockV3Aggregator = (await ethers.getContractAt(
                  MockV3AggregatorDeployment.abi,
                  MockV3AggregatorDeployment.address,
                  signer
              )) as any as MockV3Aggregator
          })

          describe("constructor", () => {
              it("sets the aggregator addresses correctly", async () => {
                  const fundMeAddress = await fundMe.getPriceFeed()
                  const mockV3AggregatorTarget = mockV3Aggregator.target
                  assert.equal(fundMeAddress, mockV3AggregatorTarget)
              })
          })

          describe("fund", () => {
              it("fails if you don't send enough ETH ", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })

              it("updates the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      await signer.getAddress()
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("adds funders to array of funders", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getFunder(0)
                  assert.equal(response, await signer.getAddress())
              })
          })

          describe("withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw ETH from a single funder", async () => {
                  const startingContractBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress()
                      )
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(
                          await signer.getAddress()
                      )

                  const txResponse = await fundMe.withdraw()
                  const txReceipt = await txResponse.wait(1)

                  const endingContractBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress()
                      )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(
                          await signer.getAddress()
                      )

                  const gasCost = txReceipt!.gasUsed * txReceipt!.gasPrice

                  assert.equal(endingContractBalance.toString(), "0")
                  assert.equal(
                      startingContractBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost
                  )
              })

              it("allows to withdrar ETH from a multiple funders", async () => {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingContractBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress()
                      )
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(
                          await signer.getAddress()
                      )

                  const txResponse = await fundMe.withdraw()
                  const txReceipt = await txResponse.wait()

                  const endingContractBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress()
                      )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(
                          await signer.getAddress()
                      )

                  const gasCost = txReceipt!.gasUsed * txReceipt!.gasPrice

                  assert.equal(endingContractBalance.toString(), "0")
                  assert.equal(
                      startingContractBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost
                  )

                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          (
                              await fundMe.getAddressToAmountFunded(
                                  accounts[i].address
                              )
                          ).toString(),
                          "0"
                      )
                  }
              })

              it("only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  )

                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FudMe__NotOwner")
              })

              it("cheaperWithdraw... signle", async () => {
                  const startingContractBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress()
                      )
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(
                          await signer.getAddress()
                      )

                  const txResponse = await fundMe.cheaperWithdraw()
                  const txReceipt = await txResponse.wait(1)

                  const endingContractBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress()
                      )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(
                          await signer.getAddress()
                      )

                  const gasCost = txReceipt!.gasUsed * txReceipt!.gasPrice

                  assert.equal(endingContractBalance.toString(), "0")
                  assert.equal(
                      startingContractBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost
                  )
              })

              it("cheaperWithdraw... multiple", async () => {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingContractBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress()
                      )
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(
                          await signer.getAddress()
                      )

                  const txResponse = await fundMe.cheaperWithdraw()
                  const txReceipt = await txResponse.wait()

                  const endingContractBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress()
                      )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(
                          await signer.getAddress()
                      )

                  const gasCost = txReceipt!.gasUsed * txReceipt!.gasPrice

                  assert.equal(endingContractBalance.toString(), "0")
                  assert.equal(
                      startingContractBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost
                  )

                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          (
                              await fundMe.getAddressToAmountFunded(
                                  accounts[i].address
                              )
                          ).toString(),
                          "0"
                      )
                  }
              })
          })
      })
