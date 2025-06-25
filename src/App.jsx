import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Import your page components
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Trips from './pages/Trips';

function App() {
  return (
    <Router>
      <div>
        {/* Navigation Menu */}
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/trips">Trips</Link></li>
          </ul>
        </nav>

        {/* Route Definitions */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/trips" element={<Trips />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
