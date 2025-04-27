const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FreelanceContract", function () {
  let FreelanceContract;
  let contract;
  let owner;
  let client;
  let freelancer;
  let other;

  beforeEach(async function () {
    [owner, client, freelancer, other] = await ethers.getSigners();
    
    FreelanceContract = await ethers.getContractFactory("FreelanceContract");
    contract = await FreelanceContract.deploy();
    await contract.deployed();
  });

  describe("Contract Creation", function () {
    it("Should create a new contract", async function () {
      const price = ethers.utils.parseEther("1.0");
      
      await expect(contract.connect(client).createContract(freelancer.address, price, {
        value: price
      }))
        .to.emit(contract, "ContractCreated")
        .withArgs(0, client.address, freelancer.address, price);
      
      const contractData = await contract.contracts(0);
      expect(contractData.client).to.equal(client.address);
      expect(contractData.freelancer).to.equal(freelancer.address);
      expect(contractData.price).to.equal(price);
      expect(contractData.balance).to.equal(price);
      expect(contractData.isActive).to.be.true;
    });

    it("Should not create contract with zero price", async function () {
      await expect(contract.connect(client).createContract(freelancer.address, 0, {
        value: 0
      })).to.be.revertedWith("Price must be greater than 0");
    });

    it("Should not create contract with incorrect payment", async function () {
      const price = ethers.utils.parseEther("1.0");
      await expect(contract.connect(client).createContract(freelancer.address, price, {
        value: price.div(2)
      })).to.be.revertedWith("Incorrect payment amount");
    });
  });

  describe("Milestone Management", function () {
    beforeEach(async function () {
      const price = ethers.utils.parseEther("1.0");
      await contract.connect(client).createContract(freelancer.address, price, {
        value: price
      });
    });

    it("Should submit milestone", async function () {
      const workHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Work submission"));
      
      await expect(contract.connect(freelancer).submitMilestone(0, workHash))
        .to.emit(contract, "MilestoneSubmitted")
        .withArgs(0, 0, workHash);
      
      const milestone = await contract.milestones(0, 0);
      expect(milestone.workHash).to.equal(workHash);
      expect(milestone.isSubmitted).to.be.true;
    });

    it("Should not submit milestone if not freelancer", async function () {
      const workHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Work submission"));
      await expect(contract.connect(other).submitMilestone(0, workHash))
        .to.be.revertedWith("Only freelancer can call this function");
    });

    it("Should approve milestone", async function () {
      const workHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Work submission"));
      await contract.connect(freelancer).submitMilestone(0, workHash);
      
      await expect(contract.connect(client).approveMilestone(0, 0))
        .to.emit(contract, "MilestoneApproved")
        .withArgs(0, 0);
      
      const milestone = await contract.milestones(0, 0);
      expect(milestone.isApproved).to.be.true;
    });

    it("Should not approve milestone if not client", async function () {
      const workHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Work submission"));
      await contract.connect(freelancer).submitMilestone(0, workHash);
      
      await expect(contract.connect(other).approveMilestone(0, 0))
        .to.be.revertedWith("Only client can call this function");
    });
  });

  describe("Payment Management", function () {
    beforeEach(async function () {
      const price = ethers.utils.parseEther("1.0");
      await contract.connect(client).createContract(freelancer.address, price, {
        value: price
      });
      
      const workHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Work submission"));
      await contract.connect(freelancer).submitMilestone(0, workHash);
      await contract.connect(client).approveMilestone(0, 0);
    });

    it("Should release payment", async function () {
      const amount = ethers.utils.parseEther("0.5");
      
      await expect(contract.connect(client).releasePayment(0, 0, amount))
        .to.emit(contract, "PaymentReleased")
        .withArgs(0, amount);
      
      const contractData = await contract.contracts(0);
      expect(contractData.balance).to.equal(amount);
    });

    it("Should not release payment if not client", async function () {
      const amount = ethers.utils.parseEther("0.5");
      await expect(contract.connect(other).releasePayment(0, 0, amount))
        .to.be.revertedWith("Only client can call this function");
    });
  });

  describe("Dispute Resolution", function () {
    beforeEach(async function () {
      const price = ethers.utils.parseEther("1.0");
      await contract.connect(client).createContract(freelancer.address, price, {
        value: price
      });
    });

    it("Should raise dispute", async function () {
      await expect(contract.connect(client).raiseDispute(0))
        .to.emit(contract, "DisputeRaised")
        .withArgs(0);
      
      const contractData = await contract.contracts(0);
      expect(contractData.hasDispute).to.be.true;
    });

    it("Should resolve dispute", async function () {
      await contract.connect(client).raiseDispute(0);
      
      await expect(contract.connect(owner).resolveDispute(0, true))
        .to.emit(contract, "DisputeResolved")
        .withArgs(0, true);
      
      const contractData = await contract.contracts(0);
      expect(contractData.isActive).to.be.false;
      expect(contractData.isCompleted).to.be.true;
      expect(contractData.balance).to.equal(0);
    });
  });
}); 