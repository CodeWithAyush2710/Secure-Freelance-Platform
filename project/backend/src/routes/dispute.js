const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const Contract = require('../models/Contract');
const auth = require('../middleware/auth');

// Get all disputes
router.get('/', auth, async (req, res) => {
  try {
    const contracts = await Contract.find({
      'dispute.status': 'pending'
    }).populate('client freelancer dispute.raisedBy', 'name email');

    const disputes = contracts.map(contract => ({
      contractId: contract._id,
      title: contract.title,
      client: contract.client,
      freelancer: contract.freelancer,
      dispute: contract.dispute
    }));

    res.json(disputes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Resolve dispute
router.post('/:contractId/resolve', auth, async (req, res) => {
  try {
    const { resolution, clientWins } = req.body;
    const contract = await Contract.findById(req.params.contractId);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
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

    // Resolve dispute on blockchain
    const tx = await blockchainContract.resolveDispute(
      contract.blockchainContractId,
      clientWins
    );
    await tx.wait();

    // Update dispute in database
    contract.dispute.status = 'resolved';
    contract.dispute.resolution = resolution;
    contract.dispute.resolvedBy = req.user._id;
    contract.dispute.resolvedAt = Date.now();
    contract.status = 'completed';
    await contract.save();

    res.json(contract.dispute);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get dispute details
router.get('/:contractId', auth, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId)
      .populate('client freelancer dispute.raisedBy dispute.resolvedBy', 'name email');

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    if (!contract.dispute) {
      return res.status(404).json({ error: 'No dispute found' });
    }

    // Check if user is authorized to view this dispute
    if (contract.client.toString() !== req.user._id.toString() && 
        contract.freelancer.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({
      contractId: contract._id,
      title: contract.title,
      client: contract.client,
      freelancer: contract.freelancer,
      dispute: contract.dispute
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 