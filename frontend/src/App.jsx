import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Home from './pages/Home';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import TripList from './pages/TripList';
import TripDetail from './pages/TripDetail'; 
<<<<<<< HEAD
import { TripProvider } from './context/TripContext'; 
=======
import NavigationBar from './components/NavigationBar';

>>>>>>> origin/main

function App() {
  // No need to pass user props anymore
  return (
<<<<<<< HEAD
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
=======
    <Router>
      <div>
        <NavigationBar />

        {/* Route Definitions */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/trips" element={<TripList />} />
          <Route path="/trips/:tripId" element={<TripDetail />} />
        
        </Routes>
      </div>
    </Router>
>>>>>>> origin/main
  );
}

export default App;

