// import { useState } from 'react'
// import Form from 'react-bootstrap/Form'
// import Button from 'react-bootstrap/Button'
// import Spinner from 'react-bootstrap/Spinner'
// import { ethers } from 'ethers'

// const Create = ({ provider, dao, setIsLoading }) => {

//     const [name, setName] = useState('')
//     const [amount, setAmount] = useState(0)
//     const [address, setAddress] = useState('')
//     const [isWaiting, setIsWaiting] = useState(false)

//     const createHandler = async (e) => {
//         e.preventDefault()
//         setIsWaiting(true)
//         try {
//             const signer = await provider.getSigner()
//             const formattedAmount = ethers.utils.parseUnits(amount.toString(), 'ether')
//             const transaction = await dao.connect(signer).createProposal(name, formattedAmount, address)
//             await transaction.wait()
//             console.log(`Proposal created at txn hash: ${transaction.hash}`)
//         } catch (error) {
//             window.alert('User rejected or error occured...', error)
//         }
//         setIsLoading(true)
//     }

//     return (
//         <Form onSubmit={createHandler}>
//             <Form.Group style={{ maxWidth: '450px', margin: '50px auto' }}>
//                 <Form.Control type='text' placeholder='Enter name' className='my-2'onChange={(e) => setName(e.target.value)} />
//                 <Form.Control type='number' placeholder='Enter amount' className='my-2'onChange={(e) => setAmount(e.target.value)} />
//                 <Form.Control type='text' placeholder='Enter address' className='my-2'onChange={(e) => setAddress(e.target.value)} />
//                 {isWaiting ? (
//                     <Spinner animation='border' style={{ display: 'block', margin: '0 auto' }}/>
//                 ) : (
//                     <Button variant='primary' type='submit' style={{ width: '100%' }}>Create Proposal</Button>
//                 )}
//             </Form.Group> 
//         </Form>
//     )
// }

// export default Create;

import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers';
import { FaEthereum, FaUserAlt } from 'react-icons/fa';
import { AiOutlineDollarCircle } from 'react-icons/ai';

const Create = ({ provider, dao, setIsLoading }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState(0);
    const [address, setAddress] = useState('');
    const [isWaiting, setIsWaiting] = useState(false);

    const createHandler = async (e) => {
        e.preventDefault();
        setIsWaiting(true);
        try {
            const signer = await provider.getSigner();
            const formattedAmount = ethers.utils.parseUnits(amount.toString(), 'ether');
            const transaction = await dao.connect(signer).createProposal(name, formattedAmount, address);
            await transaction.wait();
            console.log(`Proposal created at txn hash: ${transaction.hash}`);
        } catch (error) {
            window.alert('User rejected or error occurred...', error);
        }
        setIsLoading(true);
    }

    return (
        <Card className='my-4 shadow-sm proposal-card'>
            <Card.Body>
                <h3 className="text-center proposal-header">Create a New Proposal</h3>
                <Form onSubmit={createHandler}>
                    <Form.Group style={{ maxWidth: '450px', margin: '0 auto' }}>
                        <div className="input-group my-3">
                            <span className="input-group-text"><FaUserAlt /></span>
                            <Form.Control
                                type='text'
                                placeholder='Proposal Name'
                                className='form-control'
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group my-3">
                            <span className="input-group-text"><AiOutlineDollarCircle /></span>
                            <Form.Control
                                type='number'
                                placeholder='Amount (ETH)'
                                className='form-control'
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group my-3">
                            <span className="input-group-text"><FaEthereum /></span>
                            <Form.Control
                                type='text'
                                placeholder='Recipient Address'
                                className='form-control'
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>

                        {isWaiting ? (
                            <Spinner animation='border' style={{ display: 'block', margin: '0 auto' }} />
                        ) : (
                            <Button variant='primary' type='submit' style={{ width: '100%', fontWeight: 'bold' }}>Create Proposal</Button>
                        )}
                    </Form.Group>
                </Form>
            </Card.Body>
        </Card>
    )
}

export default Create;


