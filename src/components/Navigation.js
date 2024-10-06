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
import logo from '../logo.png';

const Navigation = ({ account }) => {
  return (
    <Navbar expand="lg" className="shadow-sm navbar">
      <img
        alt="logo"
        src={logo}
        width="40"
        height="40"
        className="d-inline-block align-top mx-3"
      />
      <Navbar.Brand href="#" className="navbar-brand">Dragon AI DAO</Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          {account ? `Connected: ${account}` : <Button variant="light">Connect Wallet</Button>}
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;

