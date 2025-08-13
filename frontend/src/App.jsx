import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your page components
import Home from './pages/Home';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import TripList from './pages/TripList';
import TripDetail from './pages/TripDetail';
import { TripProvider } from './context/TripContext'; 
import NavigationBar from './components/NavigationBar' ;
import Chatbot from './components/chatbot/Chatbot';

function App() {
  // No need to pass user props anymore
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
        <Chatbot />
      </Router>
    </TripProvider>
  );
}

export default App;

