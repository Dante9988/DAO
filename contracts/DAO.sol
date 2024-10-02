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
        uint32 votes;
        bool finalized;
    }

    uint32 public proposalCount;
    mapping(uint32 => Proposal) public proposals;

    event Propose(
        uint32 id,
        uint amount,
        address recipient,
        address creator
    );

    modifier onlyInvestor {
        require(Token(token).balanceOf(msg.sender) > 0, 'Must be token HODLER.');
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
}
