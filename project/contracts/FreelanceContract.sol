// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FreelanceContract {
    struct Contract {
        address client;
        address freelancer;
        uint256 price;
        uint256 balance;
        bool isActive;
        bool isCompleted;
        bool hasDispute;
    }

    struct Milestone {
        bytes32 workHash;
        bool isSubmitted;
        bool isApproved;
        uint256 amount;
    }

    mapping(uint256 => Contract) public contracts;
    mapping(uint256 => Milestone[]) public milestones;
    uint256 public contractCount;

    event ContractCreated(uint256 contractId, address client, address freelancer, uint256 price);
    event MilestoneSubmitted(uint256 contractId, uint256 milestoneId, bytes32 workHash);
    event MilestoneApproved(uint256 contractId, uint256 milestoneId);
    event PaymentReleased(uint256 contractId, uint256 amount);
    event DisputeRaised(uint256 contractId);
    event DisputeResolved(uint256 contractId, bool clientWins);

    modifier onlyClient(uint256 _contractId) {
        require(contracts[_contractId].client == msg.sender, "Only client can call this function");
        _;
    }

    modifier onlyFreelancer(uint256 _contractId) {
        require(contracts[_contractId].freelancer == msg.sender, "Only freelancer can call this function");
        _;
    }

    modifier contractExists(uint256 _contractId) {
        require(_contractId < contractCount, "Contract does not exist");
        _;
    }

    modifier isActive(uint256 _contractId) {
        require(contracts[_contractId].isActive, "Contract is not active");
        _;
    }

    function createContract(address _freelancer, uint256 _price) external payable {
        require(_freelancer != address(0), "Invalid freelancer address");
        require(_price > 0, "Price must be greater than 0");
        require(msg.value == _price, "Incorrect payment amount");

        uint256 contractId = contractCount++;
        contracts[contractId] = Contract({
            client: msg.sender,
            freelancer: _freelancer,
            price: _price,
            balance: _price,
            isActive: true,
            isCompleted: false,
            hasDispute: false
        });

        emit ContractCreated(contractId, msg.sender, _freelancer, _price);
    }

    function submitMilestone(uint256 _contractId, bytes32 _workHash) external 
        contractExists(_contractId)
        onlyFreelancer(_contractId)
        isActive(_contractId) {
        
        milestones[_contractId].push(Milestone({
            workHash: _workHash,
            isSubmitted: true,
            isApproved: false,
            amount: 0
        }));

        emit MilestoneSubmitted(_contractId, milestones[_contractId].length - 1, _workHash);
    }

    function approveMilestone(uint256 _contractId, uint256 _milestoneId) external 
        contractExists(_contractId)
        onlyClient(_contractId)
        isActive(_contractId) {
        
        require(_milestoneId < milestones[_contractId].length, "Milestone does not exist");
        require(milestones[_contractId][_milestoneId].isSubmitted, "Milestone not submitted");
        require(!milestones[_contractId][_milestoneId].isApproved, "Milestone already approved");

        milestones[_contractId][_milestoneId].isApproved = true;
        emit MilestoneApproved(_contractId, _milestoneId);
    }

    function releasePayment(uint256 _contractId, uint256 _milestoneId, uint256 _amount) external 
        contractExists(_contractId)
        onlyClient(_contractId)
        isActive(_contractId) {
        
        require(_milestoneId < milestones[_contractId].length, "Milestone does not exist");
        require(milestones[_contractId][_milestoneId].isApproved, "Milestone not approved");
        require(_amount <= contracts[_contractId].balance, "Insufficient contract balance");

        contracts[_contractId].balance -= _amount;
        milestones[_contractId][_milestoneId].amount = _amount;

        (bool success, ) = contracts[_contractId].freelancer.call{value: _amount}("");
        require(success, "Payment transfer failed");

        emit PaymentReleased(_contractId, _amount);
    }

    function raiseDispute(uint256 _contractId) external 
        contractExists(_contractId)
        isActive(_contractId) {
        
        require(
            msg.sender == contracts[_contractId].client || 
            msg.sender == contracts[_contractId].freelancer,
            "Only contract parties can raise dispute"
        );

        contracts[_contractId].hasDispute = true;
        emit DisputeRaised(_contractId);
    }

    function resolveDispute(uint256 _contractId, bool _clientWins) external 
        contractExists(_contractId)
        isActive(_contractId) {
        
        require(contracts[_contractId].hasDispute, "No active dispute");
        
        if (_clientWins) {
            (bool success, ) = contracts[_contractId].client.call{value: contracts[_contractId].balance}("");
            require(success, "Refund transfer failed");
        } else {
            (bool success, ) = contracts[_contractId].freelancer.call{value: contracts[_contractId].balance}("");
            require(success, "Payment transfer failed");
        }

        contracts[_contractId].isActive = false;
        contracts[_contractId].isCompleted = true;
        contracts[_contractId].balance = 0;

        emit DisputeResolved(_contractId, _clientWins);
    }
} 