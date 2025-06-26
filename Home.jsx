
import React from 'react';
import { useHistory } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';


const Home = () => {
  const history = useHistory();

  const redirectToTrips = () => {
    history.push('/trips');
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Plan Your Next Adventure</h1>
      
      <div className="mb-4">
        <Carousel showThumbs={false} autoPlay={true} infiniteLoop={true}>
          <div>
            <img src="/images/venice.jpg" alt="Venice" />
            <p className="legend">Venice</p>
          </div>
          <div>
            <img src="/images/switzerland.jpg" alt="Switzerland" />
            <p className="legend">Switzerland</p>
          </div>
          <div>
            <img src="/images/banff.jpg" alt="Banff" />
            <p className="legend">Banff</p>
          </div>
      
        </Carousel>
      </div>

      <button className="btn btn-primary btn-block" onClick={redirectToTrips}>
         Plan Next Trip
      </button>
    </div>
  );
};

export default Home;

