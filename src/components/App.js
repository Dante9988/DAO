import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

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

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          31337: 'http://127.0.0.1:8545', // Local Hardhat node
          102031: 'https://rpc.cc3-testnet.creditcoin.network' // CC3 Testnet
        }
      }
    }
  };
  
  const web3Modal = new Web3Modal({
    cacheProvider: true, // optional, true by default
    providerOptions, // required
  });

  const connectWallet = async () => {
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
  
    const { chainId } = await provider.getNetwork();
    if (chainId !== 31337 && chainId !== 102031) {
      await switchNetwork(provider);
    }
  
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setProvider(provider);
    setAccount(address);
  
    loadBlockchainData(provider);
  };

  // const loadBlockchainData = async () => {
  //   // Initiate provider
  //   let provider;
  //   if (typeof window.ethereum !== 'undefined') {
  //     provider = new ethers.providers.Web3Provider(window.ethereum);
  //     setProvider(provider);
  //   } else {
  //     console.error('Ethereum provider is not available. Check if MetaMask is installed.');
  //   }
  //   const { chainId } = await provider.getNetwork()
  //   block = await provider.getBlockNumber()

  //   // Initiate contracts
  //   const dao = new ethers.Contract(config[chainId].dao.address, DAO_ABI, provider)
  //   setDao(dao);
  //   const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider)

  //   setTreasuryBalance(
  //     ethers.utils.formatUnits(
  //       await token.balanceOf(dao.address), 18
  //     )
  //   );

  //   // Fetch accounts
  //   const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  //   const account = ethers.utils.getAddress(accounts[0])
  //   setAccount(account)

  //   const count = await dao.proposalCount()

  //   const items = []
  //   for (let i = 0; i < count; i++) {
  //     // fetch proposals
  //     const proposal = await dao.proposals(i + 1)
  //     items.push(proposal)
  //   }

  //   setProposals(items);

  //   setQuorum(await dao.quorum())

  //   setIsLoading(false)
  // }

  const loadBlockchainData = async (provider) => {
    const { chainId } = await provider.getNetwork();
    const dao = new ethers.Contract(config[chainId].dao.address, DAO_ABI, provider);
    setDao(dao);
    const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider);

    if (!dao || !token) {
      console.error('Unsupported network. Check the configuration.');
      return;
    }

    setTreasuryBalance(
      ethers.utils.formatUnits(
        await token.balanceOf(dao.address), 18
      )
    );

    const count = await dao.proposalCount();
    const items = [];
    for (let i = 0; i < count; i++) {
      const proposal = await dao.proposals(i + 1);
      items.push(proposal);
    }
    setProposals(items);
    setQuorum(await dao.quorum());
    setIsLoading(false);
  };

  const switchNetwork = async (provider) => {
    const targetChainId = '0x18E8F'; // Hex for 102031
  
    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId: targetChainId }]);
    } catch (switchError) {
      if (switchError.code === 4902) { // This error code indicates the network has not been added to MetaMask.
        try {
          // Try to add the CC3 Testnet if it's not available in the user's MetaMask
          await provider.send('wallet_addEthereumChain', [{
            chainId: targetChainId,
            chainName: 'CC3 Testnet',
            nativeCurrency: {
              name: 'Creditcoin',
              symbol: 'tCTC',
              decimals: 18
            },
            rpcUrls: ['https://rpc.cc3-testnet.creditcoin.network'],
            blockExplorerUrls: ['https://creditcoin-testnet.blockscout.com/'] 
          }]);
        } catch (addError) {
          console.error('Failed to add the CC3 Testnet:', addError);
        }
      }
    }
  };


  useEffect(() => {
    connectWallet().catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <>
      <WaveBackground />
      <InteractiveBackground />
      <Container>
        <Navigation account={account} connectWallet={connectWallet} />

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
