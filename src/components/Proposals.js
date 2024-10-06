// import Table from 'react-bootstrap/Table'
// import Button from 'react-bootstrap/Button'
// import { ethers } from 'ethers'

// const Proposals = ({ provider, dao, proposals, quorum, setIsLoading }) => {
//     const voteHandler = async (id) => {

//         try {
//             const signer = await provider.getSigner()
//             const transaction = await dao.connect(signer).vote(id)
//             await transaction.wait()
//             console.log(transaction.hash)
//         } catch (error) {
//             console.log(error.message)
//         }
//         setIsLoading(true)
//     }

//     const finalizeHandler = async (id) => {
//         try {
//             const signer = await provider.getSigner()
//             const transaction = await dao.connect(signer).finalizeProposal(id)
//             await transaction.wait()
//             console.log(transaction.hash)
//         } catch (error) {
//             window.alert('User rejected or error occured...', error)
//         }
//         setIsLoading(true)
//     }

//     return (
//         <Table striped bordered hover responsive>
//             <thead>
//                 <tr>
//                     <th>#</th>
//                     <th>Proposal Name</th>
//                     <th>Recipient Address</th>
//                     <th>Amount</th>
//                     <th>Status</th>
//                     <th>Total Votes</th>
//                     <th>Cast Votes</th>
//                     <th>Finalize</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 {proposals.map((proposal, index) => (
//                     <tr key={index}>
//                         <td>{proposal.id.toString()}</td>
//                         <td>{proposal.name}</td>
//                         <td>{proposal.recipient}</td>
//                         <td>{ethers.utils.formatUnits(proposal.amount.toString())} ETH</td>
//                         <td>{proposal.finalized ? 'Approved' : 'In Progress'}</td>
//                         <td>{proposal.votes.toString()}</td>
//                         <td>
//                             {!proposal.finalized && (
//                                 <Button variant='primary' style={{ width: '100%' }} onClick={() => voteHandler(proposal.id)}>Vote</Button>
//                             )}
//                         </td>
//                         <td>
//                             {!proposal.finalized && proposal.votes > quorum && (
//                                 <Button variant='primary' style={{ width: '100%' }} onClick={() => finalizeHandler(proposal.id)}>Finalize</Button>
//                             )}
//                         </td>
//                     </tr>
//                 ))}

//             </tbody>

//         </Table>
//     )
// }

// export default Proposals;

import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { ethers } from 'ethers';
import { FaEthereum, FaUser, FaCheckCircle, FaVoteYea } from 'react-icons/fa';
import { MdPending } from 'react-icons/md';

const Proposals = ({ provider, dao, proposals, quorum, setIsLoading }) => {

    const [votedStatus, setVotedStatus] = useState({});

    const voteHandler = async (id) => {
        try {
            const signer = await provider.getSigner();
            const transaction = await dao.connect(signer).vote(id);
            await transaction.wait();
            console.log(transaction.hash);
        } catch (error) {
            console.log(error.message);
        }
        setIsLoading(true);

        setVotedStatus((prevStatus) => ({
            ...prevStatus,
            [id]: true,
        }));
    };

    const finalizeHandler = async (id) => {
        try {
            const signer = await provider.getSigner();
            const transaction = await dao.connect(signer).finalizeProposal(id);
            await transaction.wait();
            console.log(transaction.hash);
        } catch (error) {
            window.alert('User rejected or error occurred...', error);
        }
        setIsLoading(true);
    }

    useEffect(() => {
        const checkVotes = async () => {
            const signer = provider.getSigner();
            const address = await signer.getAddress();

            const status = {};
            for (let i = 0; i < proposals; i++) {
                const hasVoted = await dao.hasVoted(address, proposals[i].id);
                console.log('WTF',hasVoted)
                status[proposals[i].id] = hasVoted;
            }
            setVotedStatus(status);
        };

        if (provider && dao && proposals) {
            checkVotes();
        }
    }, [provider, dao, proposals]);

    return (
        <div className='my-4'>
            {proposals.map((proposal, index) => (
                <div key={index} className="proposal-card">
                    <div className="proposal-header">
                        Proposal {index + 1}: {proposal.name}
                    </div>
                    <div className="proposal-details">
                        <div className="proposal-detail-item">
                            <FaUser className="icon" />
                            <strong>Recipient Address:</strong> {proposal.recipient}
                        </div>
                        <div className="proposal-detail-item">
                            <FaEthereum className="icon" />
                            <strong>Amount:</strong> {ethers.utils.formatUnits(proposal.amount.toString())} DRGN
                        </div>
                        <div className="proposal-detail-item">
                            {proposal.finalized ? <FaCheckCircle className="icon" /> : <MdPending className="icon" />}
                            <strong>Status:</strong> {proposal.finalized ? 'Approved' : 'In Progress'}
                        </div>
                        <div className="proposal-detail-item">
                            <FaVoteYea className="icon" />
                            <strong>Total Votes:</strong> {proposal.votes.toString()}
                        </div>
                    </div>
                    <div className="proposal-actions">
                        {!proposal.finalized && !votedStatus[proposal.id] && (
                            <Button variant='primary' onClick={() => voteHandler(proposal.id)}>Vote</Button>
                        )}

                        {!proposal.finalized && proposal.votes > quorum && (
                            <Button variant='danger' onClick={() => finalizeHandler(proposal.id)}>Finalize</Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Proposals;

