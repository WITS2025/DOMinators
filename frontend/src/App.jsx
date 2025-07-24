import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

// Import your page components
import Home from './pages/Home';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import Trips from './pages/Trips';
import TripDetail from './pages/TripDetail'; 
import NavigationBar from './components/NavigationBar';


function App() {
  return (
    <>
      <Router>
        <div>
          <NavigationBar />

          {/* Route Definitions */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/trips/:tripId" element={<TripDetail />} />
          
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
