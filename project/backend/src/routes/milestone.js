const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const Contract = require('../models/Contract');
const auth = require('../middleware/auth');

// Submit milestone work
router.post('/:contractId/submit', auth, async (req, res) => {
  try {
    const { milestoneId, workHash } = req.body;
    const contract = await Contract.findById(req.params.contractId);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check if user is the freelancer
    if (contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Initialize blockchain contract
    const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const blockchainContract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      require('../../contracts/artifacts/FreelanceContract.json').abi,
      wallet
    );

    // Submit milestone on blockchain
    const tx = await blockchainContract.submitMilestone(
      contract.blockchainContractId,
      workHash
    );
    await tx.wait();

    // Update milestone in database
    const milestone = contract.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    milestone.status = 'submitted';
    milestone.workHash = workHash;
    milestone.submittedAt = Date.now();
    await contract.save();

    res.json(milestone);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve milestone
router.post('/:contractId/approve', auth, async (req, res) => {
  try {
    const { milestoneId } = req.body;
    const contract = await Contract.findById(req.params.contractId);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check if user is the client
    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Initialize blockchain contract
    const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const blockchainContract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      require('../../contracts/artifacts/FreelanceContract.json').abi,
      wallet
    );

    // Approve milestone on blockchain
    const tx = await blockchainContract.approveMilestone(
      contract.blockchainContractId,
      milestoneId
    );
    await tx.wait();

    // Update milestone in database
    const milestone = contract.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    milestone.status = 'approved';
    milestone.approvedAt = Date.now();
    await contract.save();

    res.json(milestone);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Release payment for milestone
router.post('/:contractId/release', auth, async (req, res) => {
  try {
    const { milestoneId, amount } = req.body;
    const contract = await Contract.findById(req.params.contractId);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check if user is the client
    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Initialize blockchain contract
    const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const blockchainContract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      require('../../contracts/artifacts/FreelanceContract.json').abi,
      wallet
    );

    // Release payment on blockchain
    const tx = await blockchainContract.releasePayment(
      contract.blockchainContractId,
      milestoneId,
      ethers.utils.parseEther(amount.toString())
    );
    await tx.wait();

    // Update milestone in database
    const milestone = contract.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    milestone.status = 'paid';
    await contract.save();

    res.json(milestone);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 