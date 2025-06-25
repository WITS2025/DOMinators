import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NavigationBar.module.css';

function NavigationBar() {
  return (
    <nav className={`navbar navbar-expand-lg ${styles.customNavbar}`}>
      <div className="container-fluid">
        <Link className={`navbar-brand ${styles.navbarBrand}`} to="/">Camp On The Go</Link>
        <button className={`navbar-toggler ${styles.navbarToggler}`} type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className={`nav-link ${styles.navLink}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${styles.navLink}`} to="/about">About Us</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${styles.navLink}`} to="/trips">Trips</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${styles.navLink}`} to="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;
