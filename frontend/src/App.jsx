import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Home from './pages/Home';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
//import Trips from './pages/Trips';

import TripList from './pages/TripList';
import TripDetail from './pages/TripDetail'; 
import { TripProvider } from './context/TripContext'; 

function App() {
  return (
    <TripProvider>
      <Router>
        <div>
          <NavigationBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/trips" element={<TripList />} />
            <Route path="/trips/:tripId" element={<TripDetail />} />
          </Routes>
        </div>
      </Router>
    </TripProvider>
  );
}

