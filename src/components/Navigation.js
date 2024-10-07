// import Navbar from 'react-bootstrap/Navbar';

// import logo from '../logo.png';

// const Navigation = ({ account }) => {
//   return (
//     <Navbar className='my-3'>
//       <img
//         alt="logo"
//         src={logo}
//         width="40"
//         height="40"
//         className="d-inline-block align-top mx-3"
//       />
//       <Navbar.Brand href="#">Dragon AI DAO</Navbar.Brand>
//       <Navbar.Collapse className="justify-content-end">
//         <Navbar.Text>
//           {account}
//         </Navbar.Text>
//       </Navbar.Collapse>
//     </Navbar>
//   );
// }

// export default Navigation;

import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { FaWallet } from 'react-icons/fa'; // Importing Font Awesome wallet icon
import logo from '../logo.png';
import '../styles/Navigation.css'; // Make sure to create or modify this CSS file as needed

const Navigation = ({ account, connectWallet }) => {
  // Function to shorten the account address for display
  const getShortAddress = (account) => {
    return `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
  };

  return (
    <Navbar expand="lg" className="shadow-sm navbar-custom">
      <img
        alt="Dragon AI DAO logo"
        src={logo}
        width="40"
        height="40"
        className="d-inline-block align-top mx-3"
      />
      <Navbar.Brand className="navbar-brand">Dragon AI DAO</Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          {account ? (
            <span className="wallet-info">
              <FaWallet className="wallet-icon" />
              Connected: {getShortAddress(account)}
            </span>
          ) : (
            <Button variant="light" onClick={connectWallet}>
              <FaWallet className="wallet-icon" />
              Connect Wallet
            </Button>
          )}
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;


