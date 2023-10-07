import { run } from "hardhat"

const verify = async (contractAddress: string, args: any[]) => {
  console.log("[LOG] Verifying contract...")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("[LOG] Already verified!")
    } else {
      console.log(e)
    }
  }
}

export default verify