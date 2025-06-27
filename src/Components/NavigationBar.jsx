import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../assets/TripTrekLogo.png'

const NavigationBar = () => {
  return (
    <Navbar expand="lg" className="bg-light-sand shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center text-forest-green">
          <img
            src={logo}
            alt="TripTrek Logo"
            width="60"
            //height="60"
            className="d-inline-block align-top me-2"
          />
          {/* <span className="fw-bold">TripTrek</span> */}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="text-slate-gray">Home</Nav.Link>
            <Nav.Link as={Link} to="/trips" className="text-slate-gray">Trips</Nav.Link>
            <Nav.Link as={Link} to="/about" className="text-slate-gray">About</Nav.Link>
            <Nav.Link as={Link} to="/contact" className="text-slate-gray">Contact Us</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
