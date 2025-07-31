import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Home from './pages/Home';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
<<<<<<< HEAD
import Trips from './pages/Trips';
=======
import TripList from './pages/TripList';
import TripDetail from './pages/TripDetail'; 
import NavigationBar from './components/NavigationBar';

>>>>>>> origin/main

function App() {
  return (
    <Router>
      <div>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactUs />} />
<<<<<<< HEAD
          <Route path="/trips" element={<Trips />} />
=======
          <Route path="/trips" element={<TripList />} />
          <Route path="/trips/:tripId" element={<TripDetail />} />
        
>>>>>>> origin/main
        </Routes>
      </div>
    </Router>
  );
}

export default App;


