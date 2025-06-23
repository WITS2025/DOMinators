import React from 'react';
import { useHistory } from 'react-router-dom';
// Import a carousel component, e.g., from a library like 'react-responsive-carousel'
// import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import styles from '../styles/Home.module.css';

const Home = () => {
  const history = useHistory();

  const redirectToTrips = () => {
    history.push('/trips'); // Assumes '/trips' is the route for the Trips page
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Discover Your Next Adventure</h1>
      
      <div className={styles.carouselContainer}>
        {/* Insert the carousel component here */}
        {/* <Carousel>
          <div>
            <img src="path-to-venice-image.jpg" alt="Venice" />
            <p className="legend">Venice</p>
          </div>
          <div>
            <img src="path-to-switzerland-image.jpg" alt="Switzerland" />
            <p className="legend">Switzerland</p>
          </div>
          {/* Add more images as needed */}
        {/* </Carousel> */}
      </div>

      <button onClick={redirectToTrips} className={styles.startButton}>
        Start Planning
      </button>
    </div>
  );
};

export default Home;