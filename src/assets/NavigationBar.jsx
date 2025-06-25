import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Custom styles

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand text-slate" to="/">Camp On The Go</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link text-slate" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-slate" to="/about">About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-slate" to="/trips">Trips</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-slate" to="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
