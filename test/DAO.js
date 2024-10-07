const { expect } = require('chai');
const { ethers } = require('hardhat');
const { Wallet, Contract } = require('ethers');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('DAO', () => {

    /** @type {Contract} */
    let token
    /** @type {Contract} */
    let dao;
    /** @type {Wallet} */
    let deployer
    /** @type {Wallet} */
    let funder
    /** @type {Wallet} */
    let investor1
    /** @type {Wallet} */
    let recipient
    /** @type {Wallet} */
    let investor2, investor3, investor4, investor5, user
    /** @type {Array} */
    let investors;

    beforeEach(async () => {
        // Set accounts
        let accounts = await ethers.getSigners()
        deployer = accounts[0]
        funder = accounts[1]
        investor1 = accounts[2]
        investor2 = accounts[3]
        investor3 = accounts[4]
        investor4 = accounts[5]
        investor5 = accounts[6]
        recipient = accounts[7]
        user = accounts[8]

        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Dragon AI', 'DRGN', '1100000')

        // Creating list of investors
        investors = [
            investor1.address, 
            investor2.address, 
            investor3.address, 
            investor4.address, 
            investor5.address
        ]

        // Iterate through token distribution
        for (let i = 0; i < investors.length; i++) {
            transaction = await token.connect(deployer).transfer(investors[i], tokens(200000))
            await transaction.wait();
        }

        const DAO = await ethers.getContractFactory('DAO')

        // Quorun: Half of the total supply + 1 wei = 51%
        dao = await DAO.deploy(token.address, '500000000000000000000001')

        // 100 ether to DAO treasury for governance

        transaction = await token.connect(deployer).transfer(dao.address, tokens(1000))
        await transaction.wait()
        await funder.sendTransaction({ to: dao.address, value: ether(100) })
    })

    describe('Deployment', () => {

        it('sends ether to DAO treasury', async () => {
            expect(await ethers.provider.getBalance(dao.address)).to.eq(ether(100));
        })

        it('returns token address', async () => {
            expect(await dao.token()).to.eq(token.address)
        })

        it('returns quorum', async () => {
            expect(await dao.quorum()).to.eq('500000000000000000000001')
        })

        it('updates investors balances', async () => {
            expect(await token.balanceOf(investor1.address)).to.eq(tokens(200000))
            for (let i = 0; i < investors.length; i++) {
                expect(await token.balanceOf(investors[i])).to.eq(tokens(200000))
            }
        })
    })


    describe('Proposal creation', () => {

        let transaction, result;

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await dao.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address)
                result = await transaction.wait();
            })

            it('updates proposal count', async () => {
                expect(await dao.proposalCount()).to.eq(1);
            })

            it('updates proposal mapping', async () => {
                const proposal = await dao.proposals(1);
                expect(proposal.id).to.eq(1);
                expect(proposal.name).to.eq('Proposal 1')
                expect(proposal.amount).to.eq(ether(100))
                expect(proposal.recipient).to.eq(recipient.address)
            })

            it('emits proposal event', async () => {
                await expect(transaction).to.emit(dao, 'Propose')
                .withArgs(1, ether(100), recipient.address, investor1.address);
            })
        })

        describe('Failure', () => {
            it('rejects insufficient funds', async () => {
                await expect(dao.connect(investor1).createProposal('Proposal 1', ether(100000), recipient.address)).to.be.rejectedWith('Not enough balance in contract to fullfil the proposal.');
            })

            it('rejects non-investor account', async () => {
                await expect(dao.connect(user).createProposal('Proposal 2', ether(10), recipient.address)).to.be.rejectedWith('Must be token HODLER.');
            })
        })

    })

    describe('Voting', () => {

        let transaction, result;

        beforeEach(async () => {
            transaction = await dao.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address)
            result = await transaction.wait();
        })

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await dao.connect(investor1).vote(1)
                result = await transaction.wait();    
            })
            it('updates vote count', async () => {
                const proposal = await dao.proposals(1)
                expect(proposal.votes).to.eq(tokens(200000))
            })

            it('emits vote event', async () => {
                await expect(transaction).to.emit(dao, 'Vote').withArgs(1, investor1.address);
            })
        })

        describe('Failure', () => {
            it('rejects non-investor account', async () => {
                await expect(dao.connect(user).vote(1)).to.be.rejectedWith('Must be token HODLER.');
            })

            it('rejects duplicate voting', async () => {
                transaction = await dao.connect(investor1).vote(1)
                result = await transaction.wait();
                await expect(dao.connect(investor1).vote(1)).to.be.rejectedWith('Already voted.');
            })
        })

    })


    describe('Voting Against', () => {

        let transaction, result;

        beforeEach(async () => {
            transaction = await dao.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address)
            result = await transaction.wait();
        })

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await dao.connect(investor1).voteAgainst(1)
                result = await transaction.wait();    
            })
            it('updates vote against count', async () => {
                const proposal = await dao.proposals(1)
                expect(proposal.votesAgainst).to.eq(tokens(200000))
            })

            it('emits vote against event', async () => {
                await expect(transaction).to.emit(dao, 'VoteAgainst').withArgs(1, investor1.address);
            })
        })

        describe('Failure', () => {
            
        })

    })

    describe('Governance', () => {

        let transaction, result;

        describe('Success', () => {
            beforeEach(async () => {
                // create proposal 
                transaction = await dao.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address)
                result = await transaction.wait();

                // vote
                transaction = await dao.connect(investor1).vote(1)
                result = await transaction.wait();

                transaction = await dao.connect(investor2).vote(1)
                result = await transaction.wait();

                transaction = await dao.connect(investor3).vote(1)
                result = await transaction.wait();

                // Finalize proposal
                transaction = await dao.connect(investor1).finalizeProposal(1)
                result = await transaction.wait()
            })

            it('transfers funds to recipient', async () => {
                expect(await token.balanceOf(recipient.address)).to.eq(tokens(100))
            })

            it('updates the proposal to finalized', async () => {
                const proposal = await dao.proposals(1)
                expect(proposal.finalized).to.eq(true);
            })

            it('emits finalize event', async () => {
                await expect(transaction).to.emit(dao, 'Finalize').withArgs(1);
            })
        })

        describe('Failure', () => {
            beforeEach(async () => {
                // create proposal 
                transaction = await dao.connect(investor1).createProposal('Proposal 1', tokens(100), recipient.address)
                result = await transaction.wait();

                // vote
                transaction = await dao.connect(investor1).vote(1)
                result = await transaction.wait();

                transaction = await dao.connect(investor2).vote(1)
                result = await transaction.wait();
            })

            it('rejects proposal if already finalized', async () => {
                // Finalize proposal
                transaction = await dao.connect(investor3).vote(1)
                result = await transaction.wait()

                transaction = await dao.connect(investor1).finalizeProposal(1)
                result = await transaction.wait()
                await expect(dao.connect(investor1).finalizeProposal(1)).to.be.revertedWith('Proposal already finalized.');
            })

            it('rejects finalization if not enough votes', async () => {
                await expect(dao.connect(investor1).finalizeProposal(1)).to.be.revertedWith('Must reach quorum to finalize proposal.');
            })

            it('rejects finalization if non-investor', async () => {
                transaction = await dao.connect(investor3).vote(1)
                result = await transaction.wait()

                await expect(dao.connect(user).finalizeProposal(1)).to.be.revertedWith('Must be token HODLER.');
            })

            it('rejects if smart contract balance is low', async () => {
                transaction = await dao.connect(investor1).createProposal('Proposal 2', tokens(900), recipient.address)
                result = await transaction.wait();

                // vote
                transaction = await dao.connect(investor3).vote(1)
                result = await transaction.wait()

                transaction = await dao.connect(investor1).finalizeProposal(1)
                result = await transaction.wait()


                transaction = await dao.connect(investor1).vote(2)
                result = await transaction.wait();

                transaction = await dao.connect(investor2).vote(2)
                result = await transaction.wait();

                transaction = await dao.connect(investor3).vote(2)
                result = await transaction.wait()

                await expect(dao.connect(investor1).finalizeProposal(2)).to.be.revertedWith('Contract balance is running low.')
            })
        })

    })

})
