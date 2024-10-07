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
        uint votesAgainst;
        bool finalized;
    }

    uint32 public proposalCount;
    mapping(uint32 => Proposal) public proposals;
    mapping(address => mapping(uint32 => bool)) public votes;
    mapping(address => mapping (uint32 => bool)) public votesAgainst;

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

    event VoteAgainst(
        uint32 id,
        address investor
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
        require(bytes(_name).length > 0, 'Description is required.');
        require(token.balanceOf(address(this)) >= _amount, 'Not enough balance in contract to fullfil the proposal.');
        
        proposalCount++;

        proposals[proposalCount] = Proposal(
            proposalCount,
             _name,
            _amount, 
            _recipient, 
            0,
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

    function voteAgainst(uint32 _id) external onlyInvestor {
        Proposal storage proposal = proposals[_id];
        require(!votesAgainst[msg.sender][_id], 'Already voted against.');

        proposal.votesAgainst += token.balanceOf(msg.sender);

        votesAgainst[msg.sender][_id] = true;

        emit VoteAgainst(_id, msg.sender);
    }

    function finalizeProposal(uint32 _id) external onlyInvestor {
        // fetch proposal
        Proposal storage proposal = proposals[_id];

        // Ensure not finalized
        require(!proposal.finalized, 'Proposal already finalized.');
        // check that proposal has enough votes
        require(proposal.votes >= quorum, 'Must reach quorum to finalize proposal.');
        require(proposal.votes > proposal.votesAgainst, 'This proposal in not approved');

        require(token.balanceOf(address(this)) >= proposal.amount, 'Contract balance is running low.');
        // mark as fanilized
        proposal.finalized = true;

        // transfer funds
        bool sent  = token.transfer(proposal.recipient, proposal.amount);
        require(sent);
        // emit events
        emit Finalize(_id);
    }

    function hasVoted(address _voter, uint32 _proposalId) public view returns (bool) {
        return votes[_voter][_proposalId];
    }
}
