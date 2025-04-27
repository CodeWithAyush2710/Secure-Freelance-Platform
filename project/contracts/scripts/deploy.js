const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const FreelanceContract = await hre.ethers.getContractFactory("FreelanceContract");
  
  // Deploy the contract
  const freelanceContract = await FreelanceContract.deploy();
  
  // Wait for deployment
  await freelanceContract.deployed();
  
  console.log("FreelanceContract deployed to:", freelanceContract.address);
  
  // Verify the contract on Etherscan
  if (hre.network.name !== "hardhat") {
    console.log("Waiting for 5 block confirmations...");
    await freelanceContract.deployTransaction.wait(5);
    
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: freelanceContract.address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.error("Contract verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 