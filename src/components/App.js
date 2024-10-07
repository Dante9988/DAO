import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

// Components
import Navigation from './Navigation';
import Create from './Create';
import Loading from './Loading';
import Proposals from './Proposals';
import WaveBackground from './WaveBackground';
import InteractiveBackground from './MouseTrail';
// ABIs: Import your contract ABIs here
import DAO_ABI from '../abis/DAO.json'
import TOKEN_ABI from '../abis/Token.json'

// Config: Import your network config here
import config from '../config.json';
import '../styles/App.css'

function App() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [proposals, setProposals] = useState(null)
  const [dao, setDao] = useState(null)
  const [treasuryBalance, setTreasuryBalance] = useState(0)
  const [balance, setBalance] = useState(0)
  const [quorum, setQuorum] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  let block;

  const loadBlockchainData = async () => {
    // Initiate provider
    let provider;
    if (typeof window.ethereum !== 'undefined') {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
    } else {
      console.error('Ethereum provider is not available. Check if MetaMask is installed.');
    }
    const { chainId } = await provider.getNetwork()
    block = await provider.getBlockNumber()

    // Initiate contracts
    const dao = new ethers.Contract(config[chainId].dao.address, DAO_ABI, provider)
    setDao(dao);
    const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider)

    setTreasuryBalance(
      ethers.utils.formatUnits(
        await token.balanceOf(dao.address), 18
      )
    );

    // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    const count = await dao.proposalCount()

    const items = []
    for (let i = 0; i < count; i++) {
      // fetch proposals
      const proposal = await dao.proposals(i + 1)
      items.push(proposal)
    }

    setProposals(items);

    setQuorum(await dao.quorum())

    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <>
      <WaveBackground />
      <InteractiveBackground />
      <Container>
        <Navigation account={account} />

        <div className="hero-title text-center">
          <h1 className='my-4'>Welcome to Dragon DAO!</h1>
          <p className="sub-title">Empowering Decentralized Decision Making</p>
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <>
            <Create provider={provider} dao={dao} setIsLoading={setIsLoading} />
            <hr />
            <div className="treasury-card my-4">
              <div className="treasury-content">
                <h3 className="treasury-title">Treasury Balance</h3>
                <div className="treasury-amount">
                  <strong>{treasuryBalance} DRGN</strong>
                </div>
              </div>
            </div>

            <div className="quorum-card my-4">
              <div className="quorum-content">
                <h3 className="quorum-title">Quorum</h3>
                <div className="quorum-amount">
                  <strong>{quorum.toString()} votes</strong>
                </div>
              </div>
            </div>
            <hr />
            <Proposals provider={provider} dao={dao} proposals={proposals} quorum={quorum} setIsLoading={setIsLoading} />
          </>
        )}
      </Container>
    </>
  );
}

export default App;
