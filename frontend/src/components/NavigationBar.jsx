import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../assets/TripTrekLogo.png'
import { useAuth } from '../context/AuthContext';

const NavigationBar = () => {
  const { user, signOut } = useAuth();
  
  const username = user?.username || user?.signInDetails?.loginId || user?.attributes?.email || 'User';
  const firstLetter = username.charAt(0).toUpperCase();

  return (
    <Navbar expand="lg" className="bg-light-sand shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center text-forest-green">
          <img
            src={logo}
            alt="TripTrek"
            style={{ maxHeight: '80px' }}
            className="d-inline-block align-top me-2"
          />
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/" className="text-slate-gray">Home</Nav.Link>
            <Nav.Link as={Link} to="/trips" className="text-slate-gray">Trips</Nav.Link>
            <Nav.Link as={Link} to="/about" className="text-slate-gray">About</Nav.Link>
            <Nav.Link as={Link} to="/contact" className="text-slate-gray">Contact Us</Nav.Link>
            
            {/* User Avatar Dropdown */}
            <Dropdown align="end" className="ms-3">
              <Dropdown.Toggle 
                as="div" 
                id="user-dropdown"
                bsPrefix="none"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#1a5f1a', // forest green
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  border: '2px solid #e0e0e0'
                }}
              >
                {firstLetter}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Header>
                  <strong>{username}</strong>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item onClick={signOut}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sign Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
