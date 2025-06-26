<<<<<<< trips-page-issue17
import { useState } from 'react'
import Trips from './pages/Trips'

function App() {
=======
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Import your page components
import Home from './pages/Home';
import About from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Trips from './pages/Trips';

import NavigationBar from './components/NavigationBar';

>>>>>>> main

function App() {
  return (
<<<<<<< trips-page-issue17
    <>

    </>
  )
=======
    <Router>
      <div>
        <NavigationBar />

        {/* Route Definitions */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/trips" element={<Trips />} />
        </Routes>
      </div>
    </Router>
  );
>>>>>>> main
}

export default App;
