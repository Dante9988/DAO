//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract DAO {
    
    address owner;
    Token public token;
    uint public quorum;

    struct Proposal {
        uint32 id;
        string name;
        uint amount;
        address payable recipient;
        uint votes;
        bool finalized;
    }

    uint32 public proposalCount;
    mapping(uint32 => Proposal) public proposals;
    mapping(address => mapping(uint32 => bool)) votes;

    event Propose(
        uint32 id,
        uint amount,
        address recipient,
        address creator
    );

    event Vote(
        uint32 id,
        address investor
    );

    event Finalize(
        uint32 id
    );

    modifier onlyInvestor {
        require(token.balanceOf(msg.sender) > 0, 'Must be token HODLER.');
        _;
    }

    constructor(Token _token, uint _quorum) {
        owner = msg.sender;
        token = _token;
        quorum = _quorum;

    }
    
    // Allow contract to receive ether
    receive() external payable {}

    // Create proposal
    function createProposal(
        string memory _name, 
        uint _amount, 
        address payable _recipient    
    ) external onlyInvestor {
        require(address(this).balance >= _amount, 'Not enough balance in contract to fullfil the proposal.');

        proposalCount++;

        proposals[proposalCount] = Proposal(
            proposalCount,
             _name,
            _amount, 
            _recipient, 
            0, 
            false
        );
        
        emit Propose(proposalCount, _amount, _recipient, msg.sender);
    }

    function vote(uint32 _id) external onlyInvestor {
        // fetch proposal from mapping by id
        Proposal storage proposal = proposals[_id];
        require(!votes[msg.sender][_id], 'Already voted.');
        // update votes
        proposal.votes += token.balanceOf(msg.sender);

        // track that user voted
        votes[msg.sender][_id] = true;
        // emit event
        emit Vote(_id, msg.sender);
    }

    function finalizeProposal(uint32 _id) external onlyInvestor {
        // fetch proposal
        Proposal storage proposal = proposals[_id];

        // Ensure not finalized
        require(!proposal.finalized, 'Proposal already finalized.');

        // mark as fanilized
        proposal.finalized = true;

        // check that proposal has enough votes
        require(proposal.votes >= quorum, 'Must reach quorum to finalize proposal.');

        require(address(this).balance >= proposal.amount, 'Contract balance is running low.');

        // transfer funds
        (bool sent, ) = proposal.recipient.call{ value: proposal.amount }("");
        require(sent);
        // emit events
        emit Finalize(_id);
    }
}
