const hre = require("hardhat");

async function main() {
  // Get the contract instance
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const FreelanceContract = await hre.ethers.getContractFactory("FreelanceContract");
  const contract = await FreelanceContract.attach(contractAddress);

  // Example: Create a new contract
  const freelancerAddress = "0x..."; // Replace with actual freelancer address
  const price = hre.ethers.utils.parseEther("1.0"); // 1 ETH

  console.log("Creating new contract...");
  const tx = await contract.createContract(freelancerAddress, price, {
    value: price
  });
  await tx.wait();
  console.log("Contract created successfully!");

  // Example: Submit a milestone
  const contractId = 0; // Replace with actual contract ID
  const workHash = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("Work submission"));

  console.log("Submitting milestone...");
  const milestoneTx = await contract.submitMilestone(contractId, workHash);
  await milestoneTx.wait();
  console.log("Milestone submitted successfully!");

  // Example: Approve milestone
  const milestoneId = 0; // Replace with actual milestone ID

  console.log("Approving milestone...");
  const approveTx = await contract.approveMilestone(contractId, milestoneId);
  await approveTx.wait();
  console.log("Milestone approved successfully!");

  // Example: Release payment
  const amount = hre.ethers.utils.parseEther("0.5"); // 0.5 ETH

  console.log("Releasing payment...");
  const paymentTx = await contract.releasePayment(contractId, milestoneId, amount);
  await paymentTx.wait();
  console.log("Payment released successfully!");

  // Example: Raise dispute
  console.log("Raising dispute...");
  const disputeTx = await contract.raiseDispute(contractId);
  await disputeTx.wait();
  console.log("Dispute raised successfully!");

  // Example: Resolve dispute
  const clientWins = true;

  console.log("Resolving dispute...");
  const resolveTx = await contract.resolveDispute(contractId, clientWins);
  await resolveTx.wait();
  console.log("Dispute resolved successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 