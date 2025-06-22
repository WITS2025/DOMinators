import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; 
import Loading from '../components/Loading';
import Error from '../components/Error';
//import styles from '../styles/Home.module.css';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const location = useLocation();

  // Function to get query param from URL
  const getQueryParam = () => {
    const params = new URLSearchParams(location.search);
    return params.get('q') || '';
  };

  // Handle search and API call
  const handleSearch = async (query) => {
    setLoading(true);
    setError('');
    
  // Load previous query from URL when page loads
  useEffect(() => {
    const query = getQueryParam();
    if (query) {
      handleSearch(query);
    }
  }, []); // only on mount

  return (
    <div className={styles.container}>
      <SearchBar onSearch={handleSearch} />

      {loading && <div className={styles.centered}><Loading /></div>}
      {error && <div className={styles.centered}><Error errorMsg={error} /></div>}

      <div className={styles.sectionSpacing}>
  
      </div>
    </div>
  );
}};

export default Home;
