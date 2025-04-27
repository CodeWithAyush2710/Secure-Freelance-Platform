const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const Contract = require('../models/Contract');
const auth = require('../middleware/auth');

// Get all contracts for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const contracts = await Contract.find({
      $or: [
        { client: req.user._id },
        { freelancer: req.user._id }
      ]
    }).populate('client freelancer', 'name email walletAddress');

    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single contract
router.get('/:id', auth, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('client freelancer', 'name email walletAddress');

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check if user is authorized to view this contract
    if (contract.client.toString() !== req.user._id.toString() && 
        contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new contract
router.post('/', auth, async (req, res) => {
  try {
    const { freelancerId, title, description, price, milestones } = req.body;

    // Initialize blockchain contract
    const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      require('../../contracts/artifacts/FreelanceContract.json').abi,
      wallet
    );

    // Create contract on blockchain
    const tx = await contract.createContract(
      req.body.freelancerWalletAddress,
      ethers.utils.parseEther(price.toString())
    );
    await tx.wait();

    // Create contract in database
    const newContract = new Contract({
      client: req.user._id,
      freelancer: freelancerId,
      title,
      description,
      price,
      milestones,
      blockchainContractId: tx.hash,
      status: 'active'
    });

    await newContract.save();

    res.status(201).json(newContract);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update contract status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check if user is authorized to update this contract
    if (contract.client.toString() !== req.user._id.toString() && 
        contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    contract.status = status;
    await contract.save();

    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Raise a dispute
router.post('/:id/dispute', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check if user is authorized to raise dispute
    if (contract.client.toString() !== req.user._id.toString() && 
        contract.freelancer.toString() !== req.user._id.toString()) {
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

    // Raise dispute on blockchain
    const tx = await blockchainContract.raiseDispute(contract.blockchainContractId);
    await tx.wait();

    // Update contract status
    contract.status = 'disputed';
    contract.dispute = {
      raisedBy: req.user._id,
      reason,
      status: 'pending',
      raisedAt: Date.now()
    };

    await contract.save();

    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 